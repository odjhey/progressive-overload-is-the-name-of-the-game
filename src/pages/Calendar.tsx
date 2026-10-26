import {
  IconCalendarEvent,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from '@tabler/icons-react'
import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { LiftRow } from '../components/LiftRow'
import { useTraining } from '../hooks/useTraining'
import { isTrainingDate, localDate } from '../libs/trainingModel'

function knownTime(value: string | null | undefined): number {
  const time = Date.parse(value ?? '')
  return Number.isFinite(time) ? time : -Infinity
}

// UTC is a formatting/arithmetic frame, never a conversion of a civil date.
function civilDate(date: string): Date {
  return new Date(`${date}T12:00:00Z`)
}

function dateLabel(date: string, long = false): string {
  return civilDate(date).toLocaleDateString(undefined, {
    weekday: long ? 'long' : 'short',
    day: 'numeric',
    month: long ? 'long' : 'short',
    ...(long || date.slice(0, 4) !== localDate().slice(0, 4)
      ? { year: 'numeric' as const }
      : {}),
    timeZone: 'UTC',
  })
}

function shiftedMonth(month: string, offset: number): string | null {
  const [year, number] = month.split('-').map(Number)
  const next = year * 12 + number - 1 + offset
  if (next < 12 || next > 9999 * 12 + 11) return null
  return `${String(Math.floor(next / 12)).padStart(4, '0')}-${String((next % 12) + 1).padStart(2, '0')}`
}

export default function Calendar() {
  const { document, loading, loadError, saving, setAttendance, reload } =
    useTraining()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const today = localDate()
  const suppliedDate = params.get('date')
  const selected = isTrainingDate(suppliedDate) ? suppliedDate : today
  const suppliedMonth = params.get('month')
  const validMonth =
    suppliedMonth !== null &&
    /^\d{4}-\d{2}$/.test(suppliedMonth) &&
    isTrainingDate(`${suppliedMonth}-01`)
  const month = validMonth ? suppliedMonth : selected.slice(0, 7)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const inFlight = useRef(false)
  const dayButtons = useRef(new Map<string, HTMLButtonElement>())
  const focusDate = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (!focusDate.current) return
    dayButtons.current.get(focusDate.current)?.focus()
    focusDate.current = null
  }, [selected, month, loading])

  const busy = pending || saving
  const select = (date: string, focus = false) => {
    const button = focus ? dayButtons.current.get(date) : null
    focusDate.current = focus && !button ? date : null
    button?.focus()
    setParams({ date, month: date.slice(0, 7) }, { preventScrollReset: true })
    setStatus('')
  }
  const move = (offset: number) => {
    const nextMonth = shiftedMonth(month, offset)
    if (nextMonth) select(`${nextMonth}-01`)
  }
  const navigateDay = (
    event: KeyboardEvent<HTMLButtonElement>,
    date: string
  ) => {
    if (busy || event.altKey || event.ctrlKey || event.metaKey) return
    const current = civilDate(date)
    let next: string
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      const offset =
        (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1)
      const nextMonth = shiftedMonth(date.slice(0, 7), offset)
      if (!nextMonth) {
        event.preventDefault()
        return
      }
      let day = current.getUTCDate()
      while (!isTrainingDate(`${nextMonth}-${String(day).padStart(2, '0')}`))
        day -= 1
      next = `${nextMonth}-${String(day).padStart(2, '0')}`
    } else {
      const offsets: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
        Home: -current.getUTCDay(),
        End: 6 - current.getUTCDay(),
      }
      const offset = offsets[event.key]
      if (offset === undefined || event.shiftKey) return
      current.setUTCDate(current.getUTCDate() + offset)
      next = current.toISOString().slice(0, 10)
    }
    event.preventDefault()
    if (isTrainingDate(next)) select(next, true)
  }
  const confirmAttendance = async (confirmed: boolean) => {
    if (inFlight.current || saving) return
    inFlight.current = true
    setPending(true)
    setError('')
    setStatus('')
    const date = selected
    try {
      // The provider publishes only after the persisted document is read back.
      await setAttendance(date, confirmed)
      setStatus(
        confirmed
          ? `Trained saved for ${dateLabel(date)}.`
          : `Trained removed for ${dateLabel(date)}. Saved entries remain.`
      )
    } catch (cause) {
      setError(
        `Could not confirm the attendance change for ${date}: ${cause instanceof Error ? cause.message : String(cause)} Reload training to check the saved state before retrying.`
      )
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }
  const reloadTraining = async () => {
    if (inFlight.current || saving) return
    inFlight.current = true
    setPending(true)
    setError('')
    setStatus('')
    try {
      await reload()
      setStatus('Training reloaded.')
    } catch (cause) {
      setError(
        `Could not reload training: ${cause instanceof Error ? cause.message : String(cause)}`
      )
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }

  if (loading || loadError || !document)
    return (
      <div className="page calendar-page">
        <header className="top">
          <h1>Calendar</h1>
        </header>
        <div className="list">
          {loading ? (
            <p className="calendar-notice" role="status">
              Loading calendar…
            </p>
          ) : (
            <div className="calendar-notice">
              <p role="alert">
                {loadError
                  ? `Training could not be read: ${loadError.message}`
                  : 'Import or recover training in Settings before using Calendar.'}
              </p>
              <Link className="btn" to="/about">
                Settings
              </Link>
              <button
                className="btn"
                type="button"
                disabled={busy}
                onClick={() => void reloadTraining()}
              >
                Reload training
              </button>
              {error && <p role="alert">{error}</p>}
            </div>
          )}
        </div>
      </div>
    )

  const exercises = new Map(
    document.exercises.map((exercise) => [exercise.id, exercise])
  )
  const entryCounts = new Map<string, number>()
  for (const entry of document.entries)
    entryCounts.set(
      entry.trainingDate,
      (entryCounts.get(entry.trainingDate) ?? 0) + 1
    )
  const attendanceDates = new Set(
    document.workouts
      .filter((workout) => workout.attendanceConfirmed)
      .map((workout) => workout.trainingDate)
  )
  const entries = document.entries
    .filter((entry) => entry.trainingDate === selected)
    .sort(
      (a, b) =>
        knownTime(a.recordedAt ?? a.performedAt) -
          knownTime(b.recordedAt ?? b.performedAt) || a.id.localeCompare(b.id)
    )
  const attendance = attendanceDates.has(selected)
  const attendanceNotes = document.workouts.filter(
    (workout) =>
      workout.trainingDate === selected &&
      workout.attendanceConfirmed &&
      workout.notes
  )
  const first = civilDate(`${month}-01`)
  const monthLabel = first.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const days = Array.from(
    { length: 31 },
    (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`
  ).filter(isTrainingDate)
  const tabDate = selected.slice(0, 7) === month ? selected : days[0]

  return (
    <div className="page calendar-page">
      <header className="top calendar-top">
        <button
          type="button"
          className="ib"
          aria-label="Previous month"
          title="Previous month"
          disabled={busy || month === '0001-01'}
          onClick={() => move(-1)}
        >
          <IconChevronLeft size={20} aria-hidden="true" />
        </button>
        <h1 id="calendar-month" aria-live="polite">
          {monthLabel}
        </h1>
        <button
          type="button"
          className="ib"
          aria-label="Next month"
          title="Next month"
          disabled={busy || month === '9999-12'}
          onClick={() => move(1)}
        >
          <IconChevronRight size={20} aria-hidden="true" />
        </button>
        <button
          className="ib"
          type="button"
          aria-label="Go to today"
          title="Go to today"
          disabled={busy}
          onClick={() => select(today, true)}
        >
          <IconCalendarEvent size={20} aria-hidden="true" />
        </button>
      </header>
      <div className="list calendar-body">
        {suppliedDate !== null && !isTrainingDate(suppliedDate) && (
          <p className="calendar-notice" role="alert">
            The linked date is invalid. Showing today instead.
          </p>
        )}
        {suppliedMonth !== null && !validMonth && (
          <p className="calendar-notice" role="alert">
            The linked month is invalid. Showing the selected day’s month.
          </p>
        )}
        <div
          className="cal"
          role="grid"
          aria-labelledby="calendar-month"
          aria-busy={busy}
        >
          <div className="calendar-week" role="row">
            {[
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
            ].map((day) => (
              <div
                className="dow"
                role="columnheader"
                aria-label={day}
                key={day}
              >
                {day.slice(0, 2)}
              </div>
            ))}
          </div>
          {Array.from(
            { length: Math.ceil((first.getUTCDay() + days.length) / 7) },
            (_, week) => (
              <div className="calendar-week" role="row" key={week}>
                {Array.from({ length: 7 }, (_, weekday) => {
                  const date = days[week * 7 + weekday - first.getUTCDay()]
                  if (!date)
                    return (
                      <div
                        className="calendar-cell off"
                        role="gridcell"
                        key={weekday}
                      />
                    )
                  const count = entryCounts.get(date) ?? 0
                  const trained = attendanceDates.has(date)
                  const chosen = date === selected
                  return (
                    <div
                      className="calendar-cell"
                      role="gridcell"
                      aria-selected={chosen}
                      key={weekday}
                    >
                      <button
                        ref={(button) => {
                          if (button) dayButtons.current.set(date, button)
                          else dayButtons.current.delete(date)
                        }}
                        type="button"
                        className={`d${count ? ' has' : ''}${trained ? ' att' : ''}${chosen ? ' sel' : ''}${date === today ? ' today' : ''}`}
                        disabled={busy}
                        tabIndex={date === tabDate ? 0 : -1}
                        aria-pressed={chosen}
                        aria-current={date === today ? 'date' : undefined}
                        aria-label={`${dateLabel(date, true)}: ${count ? `${count} recorded ${count === 1 ? 'entry' : 'entries'}` : 'no entries'}, ${trained ? 'trained confirmed' : 'no attendance confirmation'}, ${chosen ? 'selected' : 'not selected'}${date === today ? ', today' : ''}`}
                        onClick={() => select(date)}
                        onKeyDown={(event) => navigateDay(event, date)}
                      >
                        <span>{Number(date.slice(-2))}</span>
                        {trained && (
                          <IconCheck
                            className="calendar-attendance-check"
                            size={14}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
        <div className="calendar-legend">
          <span className="calendar-key">
            <span className="calendar-swatch entries" aria-hidden="true" />
            Entries
          </span>
          <span className="calendar-key">
            <span className="calendar-swatch attendance" aria-hidden="true">
              <IconCheck size={12} />
            </span>
            Trained
          </span>
        </div>
        <section aria-labelledby="selected-date">
          <header className="srow calendar-day-header">
            <div className="t">
              <h2 id="selected-date">
                <time dateTime={selected}>{dateLabel(selected)}</time>
              </h2>
              <span className="s">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            <Link
              className="btn sm y"
              aria-label={`Add entry for ${dateLabel(selected, true)}`}
              to={`/new?${new URLSearchParams({ date: selected })}`}
              state={{ backgroundLocation: location }}
            >
              <IconPlus size={16} aria-hidden="true" />
              Entry
            </Link>
            <button
              type="button"
              className={`btn sm${attendance ? ' on' : ''}`}
              aria-pressed={attendance}
              aria-label={`Trained on ${dateLabel(selected, true)}`}
              disabled={busy}
              onClick={() => void confirmAttendance(!attendance)}
            >
              <IconCheck size={16} aria-hidden="true" />
              Trained
            </button>
          </header>
          {error && (
            <div className="calendar-notice">
              <p role="alert">{error}</p>
              <button
                className="btn sm"
                type="button"
                disabled={busy}
                onClick={() => void reloadTraining()}
              >
                Reload training
              </button>
            </div>
          )}
          {status && (
            <p className="calendar-notice" role="status">
              {status}
            </p>
          )}
          {attendanceNotes.map((workout) => (
            <p className="calendar-attendance-notes" key={workout.id}>
              {workout.notes}
            </p>
          ))}
          {entries.length === 0 && (
            <p className="calendar-notice">
              {attendance ? 'Trained · no entries' : 'Nothing recorded'}
            </p>
          )}
          {entries.map((entry) => (
            <article className="calendar-entry" key={entry.id}>
              <LiftRow
                entry={entry}
                exercise={exercises.get(entry.exerciseId)!}
                calendar
              />
              {entry.notes && <p className="calendar-notes">{entry.notes}</p>}
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
