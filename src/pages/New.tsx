import { useCallback, useEffect, useRef, useState } from 'react'
import { Lift, useLifts } from '../hooks/useLifts'
import { LiftForm } from '../components/LiftForm'
import {
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

  return (
    <>
      {blocker.state === 'blocked' && (
        <section
          role="alert"
          aria-label="Unsaved workout"
          className="fixed top-20 left-2 right-2 z-50 mx-auto max-w-lg rounded border border-warning bg-base-100 p-3 shadow-lg"
        >
          <p>This workout has unsaved changes. Leave without saving?</p>
          <div className="mt-2 flex gap-2">
            <button
              ref={keepEditing}
              className="btn btn-sm btn-primary"
              onClick={() => blocker.reset()}
            >
              Keep editing
            </button>
            <button className="btn btn-sm" onClick={() => blocker.proceed()}>
              Discard changes
            </button>
          </div>
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
                  onSuccess: () => navigateAfterSave('/'),
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
                search: defaultStringifySearch({ liftName: saved.name }),
              }),
          })
        }
      />
    </>
  )
}
