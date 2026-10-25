import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LiftRow } from '../components/LiftRow'
import { useTraining } from '../hooks/useTraining'
import { isTrainingDate, localDate } from '../libs/trainingModel'

function knownTime(value: string | null | undefined): number {
  const time = Date.parse(value ?? '')
  return Number.isFinite(time) ? time : -Infinity
}

export default function Calendar() {
  const { document, loading, loadError, saving, setAttendance } = useTraining()
  const [params, setParams] = useSearchParams()
  const today = localDate()
  const suppliedDate = params.get('date')
  const selected = isTrainingDate(suppliedDate) ? suppliedDate : today
  const suppliedMonth = params.get('month')
  const month =
    suppliedMonth &&
    /^\d{4}-\d{2}$/.test(suppliedMonth) &&
    isTrainingDate(`${suppliedMonth}-01`)
      ? suppliedMonth
      : selected.slice(0, 7)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const inFlight = useRef(false)
  const selectedDetails = useRef<HTMLHeadingElement>(null)
  if (loading) return <p role="status">Loading calendar…</p>
  if (loadError)
    return <p role="alert">Training could not be read: {loadError.message}</p>
  if (!document)
    return (
      <p role="alert">
        Import or recover training in Settings before using Calendar.
      </p>
    )
  const exercises = new Map(
    document.exercises.map((exercise) => [exercise.id, exercise])
  )
  const filled = new Set([
    ...document.entries.map((entry) => entry.trainingDate),
    ...document.workouts
      .filter((workout) => workout.attendanceConfirmed)
      .map((workout) => workout.trainingDate),
  ])
  const entries = document.entries
    .filter((entry) => entry.trainingDate === selected)
    .sort(
      (a, b) =>
        knownTime(a.recordedAt ?? a.performedAt) -
          knownTime(b.recordedAt ?? b.performedAt) || a.id.localeCompare(b.id)
    )
  const attendance = document.workouts.filter(
    (workout) =>
      workout.trainingDate === selected && workout.attendanceConfirmed
  )
  const workout = document.workouts.find(
    (item) => item.trainingDate === selected
  )
  // UTC is only a formatting frame here, never a conversion of the selected civil date.
  const first = new Date(`${month}-01T12:00:00Z`)
  const monthLabel = first.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const days = Array.from(
    { length: 31 },
    (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`
  ).filter(isTrainingDate)
  const move = (offset: number) => {
    const [year, number] = month.split('-').map(Number)
    const next = year * 12 + number - 1 + offset
    const nextMonth = `${String(Math.floor(next / 12)).padStart(4, '0')}-${String((next % 12) + 1).padStart(2, '0')}`
    setParams(
      { month: nextMonth, date: `${nextMonth}-01` },
      { preventScrollReset: true }
    )
    setStatus('')
  }
  const select = (date: string) => {
    setParams({ date, month: date.slice(0, 7) }, { preventScrollReset: true })
    setStatus('')
    requestAnimationFrame(() => {
      selectedDetails.current?.scrollIntoView({ block: 'start' })
      selectedDetails.current?.focus({ preventScroll: true })
    })
  }
  const confirmAttendance = async (confirmed: boolean) => {
    if (inFlight.current) return
    if (
      !confirmed &&
      !confirm(
        `Remove the explicit trained confirmation for ${selected}? Saved entries will remain.`
      )
    )
      return
    inFlight.current = true
    setPending(true)
    setError('')
    setStatus('')
    try {
      await setAttendance(selected, confirmed)
      setStatus(
        confirmed
          ? `Trained confirmation saved for ${selected}. Details can be added later.`
          : `Explicit confirmation removed for ${selected}. Any saved entries still mark the day.`
      )
    } catch (cause) {
      setError(
        `Could not confirm this calendar change for ${selected}: ${cause instanceof Error ? cause.message : String(cause)} Retry after checking storage; no success is assumed.`
      )
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }
  const busy = pending || saving
  return (
    <div className="calendar-page training-page">
      <header className="page-heading">
        <div className="calendar-heading">
          <h1>Calendar</h1>
          <h2 id="calendar-month">{monthLabel}</h2>
        </div>
        <p className="muted">✓ training · blank: nothing recorded.</p>
      </header>
      {suppliedDate !== null && !isTrainingDate(suppliedDate) && (
        <p role="alert">The linked date is invalid. Showing today instead.</p>
      )}
      <section aria-labelledby="calendar-month">
        <div className="calendar-navigation">
          <button
            type="button"
            className="btn btn-outline"
            aria-label="Previous month"
            disabled={busy || month === '0001-01'}
            onClick={() => move(-1)}
          >
            ← Previous
          </button>
          <button
            className="btn btn-outline"
            type="button"
            disabled={busy}
            onClick={() => select(today)}
          >
            Today
          </button>
          <button
            type="button"
            className="btn btn-outline"
            aria-label="Next month"
            disabled={busy || month === '9999-12'}
            onClick={() => move(1)}
          >
            Next →
          </button>
        </div>
        <table className="calendar-month" aria-label={monthLabel}>
          <thead>
            <tr>
              {[
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ].map((day) => (
                <th scope="col" key={day}>
                  <abbr title={day}>{day.slice(0, 2)}</abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(
              { length: Math.ceil((first.getUTCDay() + days.length) / 7) },
              (_, week) => (
                <tr key={week}>
                  {Array.from({ length: 7 }, (_, weekday) => {
                    const date = days[week * 7 + weekday - first.getUTCDay()]
                    if (!date) return <td key={weekday} />
                    const recorded = filled.has(date)
                    const label = new Date(
                      `${date}T12:00:00Z`
                    ).toLocaleDateString(undefined, {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })
                    return (
                      <td key={weekday}>
                        <button
                          type="button"
                          className={`calendar-day${recorded ? ' is-recorded' : ''}`}
                          disabled={busy}
                          aria-pressed={date === selected}
                          aria-current={date === today ? 'date' : undefined}
                          aria-label={`${label}: ${recorded ? 'Training recorded' : 'Nothing recorded'}${date === today ? ', today' : ''}`}
                          onClick={() => select(date)}
                        >
                          <span>{Number(date.slice(-2))}</span>
                          <span className="day-marker" aria-hidden="true">
                            {recorded ? '✓' : '\u00a0'}
                          </span>
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            )}
          </tbody>
        </table>
      </section>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      <section className="calendar-details" aria-labelledby="selected-date">
        <h2 id="selected-date" ref={selectedDetails} tabIndex={-1}>
          <time dateTime={selected}>{selected}</time>
          {selected === today ? ' · Today' : ''}
        </h2>
        <p className="muted">
          {filled.has(selected) ? 'Training recorded' : 'Nothing recorded'} ·{' '}
          {entries.length} saved {entries.length === 1 ? 'entry' : 'entries'}
        </p>
        {attendance.length > 0 && (
          <div className="attendance-confirmation">
            <p>
              <strong>Trained — details later</strong> · explicit confirmation
            </p>
            {attendance.map((item) =>
              item.notes ? (
                <p className="lift-notes" key={item.id}>
                  {item.notes}
                </p>
              ) : null
            )}
          </div>
        )}
        <div className="training-actions">
          <Link
            className="btn btn-primary"
            to={`/new?${new URLSearchParams({ date: selected, ...(workout ? { workout: workout.id } : {}) })}`}
          >
            Add workout details
          </Link>
          {attendance.length > 0 ? (
            <button
              type="button"
              className="btn btn-outline"
              disabled={busy}
              onClick={() => {
                void confirmAttendance(false)
              }}
            >
              Remove trained confirmation
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline"
              disabled={busy}
              onClick={() => {
                void confirmAttendance(true)
              }}
            >
              Trained — details later
            </button>
          )}
        </div>
        <p className="field-hint">
          A saved entry and an attendance confirmation on the same date mark
          just one day. Removing a confirmation never deletes entries.
        </p>
        <div className="lift-list">
          {entries.map((entry) => (
            <section className="lift-entry" key={entry.id}>
              <LiftRow
                entry={entry}
                exercise={exercises.get(entry.exerciseId)!}
                calendar
              />
            </section>
          ))}
        </div>
      </section>
    </div>
  )
}
