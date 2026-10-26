import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  IconBellOff,
  IconPencil,
  IconPlayerStop,
  IconRefresh,
  IconClock,
  IconX,
} from '@tabler/icons-react'
import { formatRestTime, useRestTimer } from '../hooks/useRestTimer'
import './RestTimer.css'

export function RestTimer() {
  const timer = useRestTimer()
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  const [customError, setCustomError] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLElement>(null)
  const popoverId = useId()
  const durationId = useId()
  const location = useLocation()
  const active = timer.remainingMs !== null
  const overtime = timer.remainingMs !== null && timer.remainingMs < 0
  const duration = formatRestTime(timer.timer.durationSeconds * 1000)
  const time =
    timer.remainingMs === null ? duration : formatRestTime(timer.remainingMs)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search])
  useEffect(() => {
    if (!open) return
    popoverRef.current?.focus({ preventScroll: true })
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !popoverRef.current?.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      )
        setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onFocus = (event: FocusEvent) => {
      if (
        event.target instanceof Node &&
        !popoverRef.current?.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      )
        setOpen(false)
    }
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('pointerdown', outside, true)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocus)
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`nav-timer${open || active ? ' on' : ''}${overtime || timer.error ? ' over' : ''}`}
        aria-label={`Rest timer${timer.error ? ', storage error' : active ? `, ${time} ${overtime ? 'past deadline' : 'remaining'}` : ''}, open options`}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-haspopup="dialog"
        onClick={() => setOpen(!open)}
      >
        {timer.error ? (
          <span aria-hidden="true">!</span>
        ) : active ? (
          <span role="timer" aria-live="off">
            {time}
          </span>
        ) : (
          <IconClock size={24} aria-hidden="true" />
        )}
      </button>
      {open && (
        <section
          ref={popoverRef}
          id={popoverId}
          className="pop rest-timer-popover"
          role="dialog"
          aria-label="Rest timer"
          tabIndex={-1}
        >
          <div className="rest-timer-heading">
            <IconBellOff size={20} role="img" aria-label="Silent" />
            <output
              className={`rest-timer-clock${overtime ? ' over' : ''}`}
              aria-live="off"
            >
              {active ? time : 'Rest timer'}
            </output>
            <button
              className="ib ib-36 ghost"
              type="button"
              aria-label="Close rest timer"
              onClick={() => {
                setOpen(false)
                buttonRef.current?.focus()
              }}
            >
              <IconX size={20} aria-hidden="true" />
            </button>
          </div>
          <div
            className="rest-timer-presets"
            role="group"
            aria-label="Rest length; choosing a preset starts the timer"
          >
            {[60, 90, 120, 180].map((seconds) => (
              <button
                key={seconds}
                type="button"
                className={`chip${timer.timer.durationSeconds === seconds ? ' on' : ''}`}
                aria-pressed={timer.timer.durationSeconds === seconds}
                aria-label={`Start ${formatRestTime(seconds * 1000)} rest timer`}
                disabled={!timer.ready}
                onClick={() => {
                  timer.setDuration(seconds)
                  timer.start()
                }}
              >
                {formatRestTime(seconds * 1000)}
              </button>
            ))}
            <button
              className={`chip${custom ? ' on' : ''}`}
              type="button"
              aria-label="Custom rest length"
              aria-expanded={custom}
              onClick={() => setCustom(!custom)}
            >
              <IconPencil size={16} aria-hidden="true" />
            </button>
          </div>
          {custom && (
            <form
              className="rest-timer-custom"
              onSubmit={(event) => {
                event.preventDefault()
                const seconds = Number(
                  new FormData(event.currentTarget).get('duration')
                )
                if (
                  !Number.isSafeInteger(seconds) ||
                  seconds <= 0 ||
                  !Number.isSafeInteger(Date.now() + seconds * 1000)
                ) {
                  setCustomError(
                    'Choose a positive whole number of seconds within timer range.'
                  )
                  return
                }
                setCustomError('')
                timer.setDuration(seconds)
                timer.start()
              }}
            >
              <label className="lbl" htmlFor={durationId}>
                Custom seconds
              </label>
              <div className="rest-timer-custom-controls">
                <input
                  className="field"
                  key={timer.timer.durationSeconds}
                  id={durationId}
                  name="duration"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  required
                  defaultValue={timer.timer.durationSeconds}
                  disabled={!timer.ready}
                />
                <button className="btn y" type="submit" disabled={!timer.ready}>
                  Start
                </button>
              </div>
              {customError && (
                <p className="recovery-error" role="alert">
                  {customError}
                </p>
              )}
            </form>
          )}
          <div className="rest-timer-actions">
            <button
              type="button"
              className="btn y"
              aria-label={`${active ? 'Restart' : 'Start'} rest timer, ${duration}`}
              disabled={!timer.ready}
              onClick={timer.start}
            >
              <IconRefresh size={18} aria-hidden="true" />
              {duration}
            </button>
            <button
              type="button"
              className="btn"
              disabled={!timer.ready || !active}
              onClick={timer.extend}
              aria-label="Add 30 seconds"
            >
              +30 s
            </button>
            <button
              type="button"
              className="btn"
              disabled={!timer.ready || !active}
              onClick={timer.stop}
              aria-label="Stop rest timer"
            >
              <IconPlayerStop size={20} aria-hidden="true" />
            </button>
          </div>
          {timer.error && (
            <div className="rest-timer-error" role="alert">
              <p>{timer.error}</p>
              <p>
                {active
                  ? 'Showing the last confirmed deadline; it may be out of date.'
                  : 'Controls are paused until saved state is verified.'}
              </p>
              <div className="recovery-actions">
                <button type="button" className="btn sm" onClick={timer.reload}>
                  Reload saved timer
                </button>
                <button
                  type="button"
                  className="btn sm danger"
                  onClick={() => setConfirmReset(true)}
                >
                  Reset timer…
                </button>
              </div>
              {confirmReset && (
                <div className="confirm">
                  <p>
                    <b>Replace saved timer?</b>Only the timer is replaced with a
                    stopped 1:30 preset. Training history is unchanged.
                  </p>
                  <div className="recovery-actions">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setConfirmReset(false)}
                    >
                      Keep
                    </button>
                    <button
                      type="button"
                      className="btn danger"
                      onClick={() => {
                        timer.reset()
                        setConfirmReset(false)
                      }}
                    >
                      Reset timer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {!timer.ready && !timer.error && (
            <p role="status">Reading saved timer…</p>
          )}
        </section>
      )}
    </>
  )
}
