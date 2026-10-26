import { useSyncExternalStore } from 'react'

const PREFERENCES_KEY = 'progressive-overload:preferences:v1'
type Preferences = { version: 1; unit: 'kg' | 'lbs'; weightStep: 1 | 2.5 | 5 }
type Snapshot = {
  preferences: Preferences
  error: string | null
  ready: boolean
}
const defaults: Preferences = { version: 1, unit: 'kg', weightStep: 2.5 }
let initialized = false
let snapshot: Snapshot = { preferences: defaults, error: null, ready: false }
const listeners = new Set<() => void>()

function readPreferences(): Preferences {
  const raw = window.localStorage.getItem(PREFERENCES_KEY)
  if (raw === null) return defaults
  const value: unknown = JSON.parse(raw)
  if (
    !value ||
    typeof value !== 'object' ||
    !('version' in value) ||
    value.version !== 1 ||
    !('unit' in value) ||
    (value.unit !== 'kg' && value.unit !== 'lbs') ||
    !('weightStep' in value) ||
    (value.weightStep !== 1 &&
      value.weightStep !== 2.5 &&
      value.weightStep !== 5)
  ) {
    throw new Error('The saved preferences have an unreadable format.')
  }
  return { version: 1, unit: value.unit, weightStep: value.weightStep }
}

function publish(next: Snapshot) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

function fail(cause: unknown) {
  const detail = cause instanceof Error ? cause.message : String(cause)
  publish({
    ...snapshot,
    ready: false,
    error: `Preferences unavailable. Reload before changing them. ${detail}`,
  })
}

function reload() {
  initialized = true
  try {
    publish({ preferences: readPreferences(), ready: true, error: null })
  } catch (cause) {
    fail(cause)
  }
}

function change(update: (current: Preferences) => Preferences) {
  if (!snapshot.ready) return
  try {
    // Re-read first so malformed data or another tab's changes are never ignored.
    const next = update(readPreferences())
    const serialized = JSON.stringify(next)
    window.localStorage.setItem(PREFERENCES_KEY, serialized)
    if (window.localStorage.getItem(PREFERENCES_KEY) !== serialized) {
      throw new Error('The preference write could not be verified.')
    }
    publish({ preferences: next, ready: true, error: null })
  } catch (cause) {
    fail(cause)
  }
}

function setUnit(unit: 'kg' | 'lbs') {
  change((current) => {
    if (unit !== 'kg' && unit !== 'lbs') throw new Error('Choose kg or lb.')
    return { ...current, unit }
  })
}

function setWeightStep(weightStep: 1 | 2.5 | 5) {
  change((current) => {
    if (weightStep !== 1 && weightStep !== 2.5 && weightStep !== 5) {
      throw new Error('Choose a weight step of 1, 2.5 or 5.')
    }
    return { ...current, weightStep }
  })
}

function onStorage(event: StorageEvent) {
  if (event.key === PREFERENCES_KEY || event.key === null) reload()
}
function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', reload)
    window.addEventListener('pageshow', reload)
    reload()
  }
  return () => {
    listeners.delete(listener)
    if (!listeners.size) {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', reload)
      window.removeEventListener('pageshow', reload)
    }
  }
}
const getSnapshot = () => {
  if (!initialized) reload()
  return snapshot
}

export function usePreferences() {
  const current = useSyncExternalStore(subscribe, getSnapshot)
  return {
    unit: current.preferences.unit,
    weightStep: current.preferences.weightStep,
    setUnit,
    setWeightStep,
    error: current.error,
    reload,
  }
}
