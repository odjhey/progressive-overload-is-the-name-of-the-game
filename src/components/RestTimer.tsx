import { useId } from 'react'
import { IconPlayerStop, IconRefresh, IconSettings } from '@tabler/icons-react'
import { formatRestTime, useRestTimer } from '../hooks/useRestTimer'
import './RestTimer.css'

export function RestTimer() {
  const {
    timer,
    remainingMs,
    ready,
    error,
    setDuration,
    start,
    extend,
    stop,
    reload,
    reset,
  } = useRestTimer()
  const durationId = useId()
  const hintId = useId()
  const active = remainingMs !== null
  const chosenDuration = formatRestTime(timer.durationSeconds * 1000)

  return (
    <section className="rest-timer" aria-label="Rest timer">
      {active && (
        <div className="rest-timer-strip">
          <span>Rest</span>
          <span
            className="rest-timer-clock"
            role="timer"
            aria-live="off"
            aria-label={`${formatRestTime(remainingMs)} ${remainingMs < 0 ? 'past rest deadline' : 'remaining'}`}
          >
            {formatRestTime(remainingMs)}
          </span>
          <button
            type="button"
            className="rest-timer-icon"
            onClick={start}
            disabled={!ready}
            aria-label={`Restart rest timer · ${chosenDuration}`}
            title={`Restart rest timer · ${chosenDuration}`}
          >
            <IconRefresh size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={extend}
            disabled={!ready}
            aria-label="Extend rest timer by 30 seconds (+30s)"
            title="Extend rest timer by 30 seconds (+30s)"
          >
            +30s
          </button>
          <button
            type="button"
            className="rest-timer-icon"
            onClick={stop}
            disabled={!ready}
            aria-label="Stop rest timer"
            title="Stop rest timer"
          >
            <IconPlayerStop size={20} aria-hidden="true" />
          </button>
        </div>
      )}
      <details
        className={`rest-timer-settings${active ? ' rest-timer-settings-active' : ''}`}
      >
        <summary
          aria-label={active ? 'Rest timer options' : undefined}
          title="Rest timer options"
        >
          <IconSettings size={20} aria-hidden="true" />
          {!active && <span>Rest timer · {chosenDuration} · optional</span>}
        </summary>
        <div className="rest-timer-options">
          <div className="rest-timer-presets" aria-label="Duration presets">
            {[60, 90, 120, 180].map((seconds) => (
              <button
                key={seconds}
                type="button"
                aria-pressed={timer.durationSeconds === seconds}
                disabled={!ready}
                onClick={() => setDuration(seconds)}
              >
                {seconds}s
              </button>
            ))}
          </div>
          <form
            className="rest-timer-custom"
            onSubmit={(event) => {
              event.preventDefault()
              const values = new FormData(event.currentTarget)
              setDuration(Number(values.get('duration')))
            }}
          >
            <label htmlFor={durationId}>Custom seconds</label>
            <div className="rest-timer-custom-controls">
              <input
                key={timer.durationSeconds}
                id={durationId}
                name="duration"
                type="number"
                inputMode="numeric"
                min="1"
                max={Number.MAX_SAFE_INTEGER}
                step="1"
                required
                defaultValue={timer.durationSeconds}
                aria-describedby={hintId}
                disabled={!ready}
              />
              <button type="submit" disabled={!ready}>
                Use duration
              </button>
            </div>
          </form>
          <p id={hintId} className="rest-timer-hint">
            Changing duration does not start or restart the timer. +30s extends
            the current deadline, including overtime.
          </p>
          <button
            type="button"
            className="rest-timer-start"
            onClick={start}
            disabled={!ready}
          >
            {active ? 'Restart' : 'Start'} · {chosenDuration}
          </button>
          <p className="rest-timer-hint">
            Silent, using this device’s clock. Keeps counting below zero; no
            alerts. Separate from training history and backups.
          </p>
        </div>
      </details>
      {error && (
        <div className="rest-timer-error" role="status">
          <p>{error}</p>
          <p>
            {active
              ? 'Showing the last confirmed deadline; it may be out of date.'
              : 'Timer controls are paused until saved state can be verified.'}{' '}
            Nothing here changes your training history.
          </p>
          <div className="rest-timer-recovery">
            <button type="button" onClick={reload}>
              Reload saved timer
            </button>
            <button type="button" onClick={reset}>
              Reset saved timer
            </button>
          </div>
          <p className="rest-timer-hint">
            Reset replaces only the saved timer with a stopped 90-second timer.
            If storage is blocked, allow site storage and reload the saved
            timer.
          </p>
        </div>
      )}
      {!ready && !error && (
        <p className="rest-timer-hint">Reading saved timer…</p>
      )}
    </section>
  )
}
