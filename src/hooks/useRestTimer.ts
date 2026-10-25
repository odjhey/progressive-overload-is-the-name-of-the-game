import { useSyncExternalStore } from 'react'

export const REST_TIMER_KEY = 'progressive-overload:rest-timer:v1'

export type RestTimerState = {
  version: 1
  durationSeconds: number
  deadline: number | null
}

type TimerSnapshot = {
  timer: RestTimerState
  now: number
  ready: boolean
  error: string | null
}

const defaultTimer = (): RestTimerState => ({
  version: 1,
  durationSeconds: 90,
  deadline: null,
})

let snapshot: TimerSnapshot = {
  timer: defaultTimer(),
  now: Date.now(),
  ready: false,
  error: null,
}
const listeners = new Set<() => void>()
let ticker: number | undefined

function readTimer(): RestTimerState {
  const raw = window.localStorage.getItem(REST_TIMER_KEY)
  if (raw === null) return defaultTimer()
  const value: unknown = JSON.parse(raw)
  if (
    !value ||
    typeof value !== 'object' ||
    !('version' in value) ||
    value.version !== 1 ||
    !('durationSeconds' in value) ||
    typeof value.durationSeconds !== 'number' ||
    !Number.isSafeInteger(value.durationSeconds) ||
    value.durationSeconds <= 0 ||
    !('deadline' in value) ||
    (value.deadline !== null &&
      (typeof value.deadline !== 'number' ||
        !Number.isSafeInteger(value.deadline) ||
        value.deadline < 0))
  ) {
    throw new Error('The saved timer has an unreadable format.')
  }
  return {
    version: 1,
    durationSeconds: value.durationSeconds,
    deadline: value.deadline,
  }
}

function syncTicker() {
  const shouldTick =
    listeners.size > 0 &&
    snapshot.timer.deadline !== null &&
    document.visibilityState === 'visible'
  if (shouldTick && ticker === undefined) {
    ticker = window.setInterval(
      () => publish({ ...snapshot, now: Date.now() }),
      1000
    )
  } else if (!shouldTick && ticker !== undefined) {
    clearInterval(ticker)
    ticker = undefined
  }
}

function publish(next: TimerSnapshot) {
  snapshot = next
  syncTicker()
  listeners.forEach((listener) => listener())
}

function fail(message: string, cause: unknown) {
  const detail = cause instanceof Error ? cause.message : String(cause)
  publish({
    ...snapshot,
    now: Date.now(),
    ready: false,
    error: `${message} ${detail}`,
  })
}

function reload() {
  try {
    publish({ timer: readTimer(), now: Date.now(), ready: true, error: null })
  } catch (cause) {
    fail('Saved timer unavailable. No replacement was written.', cause)
  }
}

function writeTimer(next: RestTimerState) {
  const serialized = JSON.stringify(next)
  window.localStorage.setItem(REST_TIMER_KEY, serialized)
  if (window.localStorage.getItem(REST_TIMER_KEY) !== serialized) {
    throw new Error('The saved timer did not match the requested change.')
  }
  publish({ timer: next, now: Date.now(), ready: true, error: null })
}

function changeTimer(change: (current: RestTimerState) => RestTimerState) {
  if (!snapshot.ready) return
  try {
    // Read the shared deadline again: another tab may have changed it since render.
    writeTimer(change(readTimer()))
  } catch (cause) {
    // A write may have succeeded before read-back failed; do not retry it blindly.
    fail('Timer change could not be verified. Reload the saved timer.', cause)
  }
}

function setDuration(durationSeconds: number) {
  changeTimer((current) => {
    if (!Number.isSafeInteger(durationSeconds) || durationSeconds <= 0) {
      throw new Error('Choose a positive whole number of seconds.')
    }
    return { ...current, durationSeconds }
  })
}
function start() {
  changeTimer((current) => {
    const deadline = Date.now() + current.durationSeconds * 1000
    if (!Number.isSafeInteger(deadline)) {
      throw new Error('That duration is too large. Choose fewer seconds.')
    }
    return { ...current, deadline }
  })
}

function extend() {
  changeTimer((current) => {
    if (current.deadline === null) return current
    const deadline = current.deadline + 30000
    if (!Number.isSafeInteger(deadline)) {
      throw new Error('The timer deadline cannot be extended further.')
    }
    return { ...current, deadline }
  })
}

function stop() {
  changeTimer((current) => ({ ...current, deadline: null }))
}

function reset() {
  try {
    writeTimer(defaultTimer())
  } catch (cause) {
    fail('Timer reset could not be verified. Reload the saved timer.', cause)
  }
}

function onStorage(event: StorageEvent) {
  if (event.key === REST_TIMER_KEY || event.key === null) reload()
}

function onResume() {
  if (document.visibilityState === 'visible') reload()
  else syncTicker()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onResume)
    window.addEventListener('pageshow', onResume)
    document.addEventListener('visibilitychange', onResume)
    reload()
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onResume)
      window.removeEventListener('pageshow', onResume)
      document.removeEventListener('visibilitychange', onResume)
      syncTicker()
    }
  }
}

const getSnapshot = () => snapshot

/** Signed minutes:seconds; expiry never stops the timer or emits an alert. */
export function formatRestTime(milliseconds: number) {
  const seconds = Math.ceil(Math.abs(milliseconds) / 1000)
  const minutes = Math.floor(seconds / 60)
  return `${milliseconds < 0 ? '−' : ''}${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

export function useRestTimer() {
  const current = useSyncExternalStore(subscribe, getSnapshot)
  return {
    ...current,
    remainingMs:
      current.timer.deadline === null
        ? null
        : current.timer.deadline - current.now,
    setDuration,
    start,
    extend,
    stop,
    reload,
    reset,
  }
}
