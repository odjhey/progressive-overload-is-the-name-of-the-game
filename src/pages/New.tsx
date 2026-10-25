import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Link,
  useBeforeUnload,
  useBlocker,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { LiftForm } from '../components/LiftForm'
import { LiftRow } from '../components/LiftRow'
import { useTraining } from '../hooks/useTraining'
import { isTrainingDate, localDate, newId } from '../libs/trainingModel'
import type {
  EntryInput,
  TrainingDocument,
  TrainingEntry,
} from '../libs/trainingTypes'

export default function New() {
  const training = useTraining()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const edit = params.get('edit')
  const repeat = params.get('repeat')
  const source = training.document?.entries.find(
    (entry) => entry.id === (edit ?? repeat)
  )
  if (training.loading) return <p role="status">Loading training…</p>
  if (training.loadError)
    return (
      <p role="alert">
        Training could not be read: {training.loadError.message}
      </p>
    )
  if (!training.document)
    return (
      <p role="alert">
        Import or recover your training in Settings before logging.
      </p>
    )
  if (
    (edit !== null || repeat !== null) &&
    (!source || (edit !== null && repeat !== null))
  ) {
    return (
      <section className="form-page">
        <h1>Entry unavailable</h1>
        <p role="alert">
          The requested saved entry was not found, or the link selects both Edit
          and Repeat. Nothing has been created or overwritten.
        </p>
        <Link className="back-link" to="/?view=history">
          ← Back to history
        </Link>
      </section>
    )
  }
  const requestedDate = params.get('date')
  if (requestedDate !== null && !isTrainingDate(requestedDate))
    return (
      <section>
        <h1>Invalid training date</h1>
        <p role="alert">
          This link does not contain a real calendar date. Nothing has been
          saved.
        </p>
        <Link className="back-link" to="/calendar">
          Back to calendar
        </Link>
      </section>
    )
  return (
    <EntryEditor
      key={location.key}
      document={training.document}
      source={source}
      editing={edit !== null}
      params={params}
    />
  )
}

function EntryEditor({
  document,
  source,
  editing,
  params,
}: {
  document: TrainingDocument
  source?: TrainingEntry
  editing: boolean
  params: URLSearchParams
}) {
  const { saveEntry, deleteEntry, saving } = useTraining()
  const navigate = useNavigate()
  const view = params.get('view') === 'history' ? 'history' : 'latest'
  const calendarDate = params.get('date')
  const back = calendarDate
    ? `/calendar?${new URLSearchParams({ date: calendarDate, month: calendarDate.slice(0, 7) })}`
    : `/?${new URLSearchParams({ view })}`
  const [initial] = useState<EntryInput>(() => {
    const trainingDate =
      editing && source ? source.trainingDate : (calendarDate ?? localDate())
    const workout = document.workouts.find(
      (item) =>
        item.id === params.get('workout') && item.trainingDate === trainingDate
    )
    return {
      id: editing && source ? source.id : newId(),
      exerciseId: source?.exerciseId,
      exerciseName:
        document.exercises.find(
          (exercise) => exercise.id === source?.exerciseId
        )?.name ?? '',
      trainingDate,
      ...(editing && source?.performedAt !== undefined
        ? { performedAt: source.performedAt }
        : {}),
      groups: source
        ? source.groups.map((group) => ({
            ...group,
            id: editing ? group.id : newId(),
          }))
        : [{ id: newId(), sets: 3, reps: 8, weight: 0, unit: 'lbs' }],
      notes: source?.notes ?? '',
      workoutId: editing ? source?.workoutId : workout?.id,
    }
  })
  const [dirty, setDirty] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const navigationAllowed = useRef(false)
  const inFlight = useRef(false)
  const keepEditing = useRef<HTMLButtonElement>(null)
  const blocker = useBlocker(
    () => !navigationAllowed.current && (dirty || inFlight.current)
  )
  useEffect(() => {
    if (blocker.state === 'blocked') keepEditing.current?.focus()
  }, [blocker.state])
  useBeforeUnload(
    useCallback(
      (event) => {
        if (!navigationAllowed.current && (dirty || inFlight.current)) {
          event.preventDefault()
          event.returnValue = ''
        }
      },
      [dirty]
    )
  )
  const leave = (to: string) => {
    navigationAllowed.current = true
    navigate(to)
  }
  const save = async (input: EntryInput, tag: boolean) => {
    if (inFlight.current) return
    inFlight.current = true
    setPending(true)
    setError('')
    try {
      const exercise = document.exercises.find(
        (item) => item.name === input.exerciseName
      )
      const workout = document.workouts.find(
        (item) =>
          item.id === input.workoutId &&
          item.trainingDate === input.trainingDate
      )
      const saved = await saveEntry(
        { ...input, exerciseId: exercise?.id, workoutId: workout?.id },
        editing ? initial.id : undefined
      )
      if (tag) {
        leave(
          `/tags?${new URLSearchParams({ exercise: saved.exerciseId, selected: saved.id, view, ...(calendarDate ? { date: saved.trainingDate } : {}) })}`
        )
      } else if (calendarDate) {
        leave(
          `/calendar?${new URLSearchParams({ date: saved.trainingDate, month: saved.trainingDate.slice(0, 7) })}`
        )
      } else {
        leave(`/?${new URLSearchParams({ view, selected: saved.id })}`)
      }
    } catch (cause) {
      setError(
        `Could not confirm a durable save: ${cause instanceof Error ? cause.message : String(cause)} Your entered values are still here. Retry or check Settings; nothing is treated as saved until storage confirms it.`
      )
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }
  const remove = async () => {
    if (!editing || inFlight.current) return
    inFlight.current = true
    setPending(true)
    setError('')
    try {
      await deleteEntry(initial.id)
      leave(back)
    } catch (cause) {
      setError(
        `Deletion could not be confirmed: ${cause instanceof Error ? cause.message : String(cause)} Your form is still here.`
      )
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }
  const sourceExercise = document.exercises.find(
    (exercise) => exercise.id === source?.exerciseId
  )
  return (
    <div className="form-page training-page">
      {blocker.state === 'blocked' && (
        <section
          role="alert"
          aria-label="Unsaved entry"
          className="navigation-guard"
        >
          <p>
            {pending
              ? 'A save is still in progress. Stay here until its result is known.'
              : 'This entry has unsaved changes. Leave without saving?'}
          </p>
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
              disabled={pending}
              onClick={() => blocker.proceed()}
            >
              Discard changes
            </button>
          </div>
        </section>
      )}
      <Link className="back-link" to={back}>
        ← Back to {calendarDate ? 'calendar' : 'workouts'}
      </Link>
      <header className="page-heading">
        <h1>
          {editing ? 'Edit entry' : source ? 'Repeat entry' : 'New entry'}
        </h1>
        {source && !editing && (
          <p className="muted">
            A new draft. The source below is unchanged; only Save records
            training.
          </p>
        )}
      </header>
      {source && !editing && sourceExercise && (
        <section
          className="previous-effort"
          aria-label="Repeat source, read only"
        >
          <p className="muted">Source · reference only</p>
          <LiftRow entry={source} exercise={sourceExercise} reference />
        </section>
      )}
      {error && <p role="alert">{error}</p>}
      <LiftForm
        initial={initial}
        exercises={document.exercises}
        editing={editing}
        saving={saving || pending}
        onSubmit={save}
        onDelete={editing ? remove : undefined}
        onDirtyChange={setDirty}
      />
    </div>
  )
}
