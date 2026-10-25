import { useCallback, useEffect, useRef, useState } from 'react'
import { Lift, useLifts } from '../hooks/useLifts'
import { LiftForm } from '../components/LiftForm'
import {
  Link,
  To,
  useBeforeUnload,
  useBlocker,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'
import { defaultStringifySearch } from '../libs/searchParams'

export default function New() {
  const [liftInSearch] = useUrlSearchParams()
  const view = liftInSearch.view === 'history' ? 'history' : 'latest'
  const { data, error, loadError, loading, saving, upsertLift, deleteLift } =
    useLifts()
  const navigate = useNavigate()
  const location = useLocation()
  const [dirty, setDirty] = useState(false)
  const navigationAllowed = useRef(false)
  const keepEditing = useRef<HTMLButtonElement>(null)
  const blocker = useBlocker(() => dirty && !navigationAllowed.current)
  useEffect(() => {
    if (blocker.state === 'blocked') keepEditing.current?.focus()
  }, [blocker.state])
  useBeforeUnload(
    useCallback(
      (event) => {
        if (dirty && !navigationAllowed.current) {
          event.preventDefault()
          event.returnValue = ''
        }
      },
      [dirty]
    )
  )
  const navigateAfterSave = (to: To) => {
    navigationAllowed.current = true
    navigate(to)
  }

  if (loading) {
    return <div role="status">Loading workouts...</div>
  }
  if (loadError) {
    return (
      <div role="alert">
        Workouts could not be loaded: {loadError.message} Saving is unavailable
        until history can be read. Your stored history has not been replaced.
      </div>
    )
  }

  const supplied = liftInSearch.lift as Lift | undefined
  const title =
    supplied && liftInSearch.title === 'Edit'
      ? 'Edit'
      : supplied && liftInSearch.title === 'Copy'
        ? 'Copy'
        : 'New'
  const original =
    title === 'Edit' && supplied
      ? { name: supplied.name, date: supplied.date }
      : undefined
  const existing = original
    ? data.find(
        (lift) => lift.name === original.name && lift.date === original.date
      )
    : undefined
  const defaults = supplied ?? {
    date: new Date().toISOString().substring(0, 16),
    name: '',
    rep: 0,
    set: 0,
    uom: 'lbs',
    weight: 0,
    comment: '',
  }
  const missingOriginal = title === 'Edit' && !existing
  const previous =
    title === 'Copy'
      ? (liftInSearch.previousLift as Lift | undefined)
      : undefined

  return (
    <div className="form-page">
      {blocker.state === 'blocked' && (
        <section
          role="alert"
          aria-label="Unsaved workout"
          className="navigation-guard"
        >
          <p>This workout has unsaved changes. Leave without saving?</p>
          <div className="guard-actions">
            <button
              ref={keepEditing}
              className="btn btn-primary"
              onClick={() => blocker.reset()}
            >
              Keep editing
            </button>
            <button
              className="btn btn-outline"
              onClick={() => blocker.proceed()}
            >
              Discard changes
            </button>
          </div>
        </section>
      )}
      <Link
        to={{ pathname: '/', search: defaultStringifySearch({ view }) }}
        className="back-link"
      >
        ← Back to lifts
      </Link>
      <header className="page-heading form-heading">
        <div>
          <p className="eyebrow">
            {title === 'Edit' ? 'Update a saved session' : 'Record an effort'}
          </p>
          <h1>{title === 'Copy' ? 'Repeat' : title} workout</h1>
          <p className="muted">
            {title === 'Copy'
              ? 'Start from this effort. Adjust the numbers and save a separate session.'
              : title === 'Edit'
                ? 'Editing only this session. Changing its name does not rename other workouts or move name-based tags.'
                : 'Keep a record to come back to next time.'}
          </p>
        </div>
      </header>
      {previous && (
        <section className="previous-effort" aria-labelledby="previous-heading">
          <div className="previous-heading">
            <h2 id="previous-heading">Previous effort</h2>
            <span className="context-label">Reference only</span>
          </div>
          <p className="previous-name">{previous.name}</p>
          <time className="muted" dateTime={previous.date}>
            {new Date(previous.date).toLocaleString()}
          </time>
          <dl className="effort-numbers">
            <div className="effort-weight">
              <dt className="sr-only">Previous weight</dt>
              <dd>
                <strong>{previous.weight}</strong> <span>{previous.uom}</span>
              </dd>
            </div>
            <div className="effort-reps">
              <dt>Sets × reps</dt>
              <dd>
                <strong>{previous.set}</strong> ×{' '}
                <strong>{previous.rep}</strong>
              </dd>
            </div>
          </dl>
          {previous.comment && <p className="lift-notes">{previous.comment}</p>}
        </section>
      )}
      {error && (
        <p role="alert">
          Could not save this change: {error.message} Your form values are still
          here. Correct the problem and try again.
        </p>
      )}
      {missingOriginal && (
        <p role="alert">
          This workout is no longer in saved history. Return Home and choose an
          existing workout to edit.
        </p>
      )}
      <LiftForm
        key={location.key}
        title={title}
        lift={{ ...defaults, comment: defaults.comment ?? '' }}
        saving={saving}
        disabled={missingOriginal}
        onDirtyChange={setDirty}
        onDelete={
          existing && original
            ? () =>
                deleteLift(original, {
                  onSuccess: () =>
                    navigateAfterSave({
                      pathname: '/',
                      search: defaultStringifySearch({ view }),
                    }),
                })
            : undefined
        }
        onSubmit={(lift) =>
          upsertLift(lift, {
            original,
            onSuccess: (saved) =>
              navigateAfterSave({
                pathname: '/',
                search: defaultStringifySearch({
                  selected: saved.date,
                  selectedName: saved.name,
                  view,
                }),
              }),
          })
        }
        onSaveAndTag={(lift) =>
          upsertLift(lift, {
            original,
            onSuccess: (saved) =>
              navigateAfterSave({
                pathname: '/tags',
                search: defaultStringifySearch({ liftName: saved.name, view }),
              }),
          })
        }
      />
    </div>
  )
}
