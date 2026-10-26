import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import { LiftForm } from '../components/LiftForm'
import { Sheet } from '../components/Sheet'
import { DiscardConfirm } from '../components/DraftProtection'
import { useDraftProtection } from '../components/useDraftProtection'
import { matchingExercises, newestFirst } from '../components/dailyFlow'
import { useTraining } from '../hooks/useTraining'
import { usePreferences } from '../hooks/usePreferences'
import { useFeedback } from '../hooks/useFeedback'
import {
  isTrainingDate,
  localDate,
  newId,
  readTrainingDocument,
  sameValue,
} from '../libs/trainingModel'
import type {
  EntryInput,
  TrainingDocument,
  TrainingEntry,
} from '../libs/trainingTypes'

export default function New() {
  const training = useTraining()
  const location = useLocation()
  const navigate = useNavigate()
  const [retained, setRetained] = useState<{
    key: string
    document: TrainingDocument
  } | null>(null)
  const retainedDocument =
    retained?.key === location.key ? retained.document : null
  const params = new URLSearchParams(location.search)
  const edit = params.get('edit')
  const repeat = params.get('repeat')
  const source = training.document?.entries.find(
    (entry) => entry.id === (edit ?? repeat)
  )
  const date = params.get('date')
  const invalid =
    (edit !== null && repeat !== null) ||
    ((edit !== null || repeat !== null) && !source)
  const failure = training.loadError
    ? `Training could not be read: ${training.loadError.message}`
    : !training.document
      ? 'Import or recover your training in Settings before logging.'
      : invalid
        ? 'The requested entry was not found, or this link selects both Edit and Repeat. Nothing has been changed.'
        : date !== null && !isTrainingDate(date)
          ? 'This link does not contain a real calendar date. Nothing has been saved.'
          : ''
  if (!retainedDocument && (training.loading || failure))
    return (
      <Sheet
        title="Entry unavailable"
        onClose={() =>
          navigate(
            date && isTrainingDate(date)
              ? `/calendar?date=${date}&month=${date.slice(0, 7)}`
              : '/'
          )
        }
      >
        <div className="small-sheet-body">
          {training.loading ? (
            <p role="status">Loading training…</p>
          ) : (
            <p role="alert">{failure}</p>
          )}
          <Link className="btn" to="/">
            Back to log
          </Link>
        </div>
      </Sheet>
    )
  return (
    <EntryEditor
      key={location.key}
      document={training.document ?? retainedDocument!}
      source={source}
      editing={edit !== null}
      params={params}
      onRetainDraft={(document) => setRetained({ key: location.key, document })}
    />
  )
}

function EntryEditor({
  document,
  source,
  editing,
  params,
  onRetainDraft,
}: {
  document: TrainingDocument
  source?: TrainingEntry
  editing: boolean
  params: URLSearchParams
  onRetainDraft: (document: TrainingDocument) => void
}) {
  const { saveEntry, deleteEntry, setExerciseTags, reload } = useTraining()
  const preferences = usePreferences()
  const { showFeedback } = useFeedback()
  const navigate = useNavigate()
  const location = useLocation()
  const background = (
    location.state as { backgroundLocation?: Location } | null
  )?.backgroundLocation
  const calendarDate = params.get('date')
  const [resolvedSource] = useState(() => {
    if (source) return source
    const matches = matchingExercises(
      document.exercises,
      params.get('name') ?? ''
    )
    return matches.length === 1
      ? document.entries
          .filter((entry) => entry.exerciseId === matches[0].id)
          .sort(newestFirst)[0]
      : undefined
  })
  const [initial] = useState<EntryInput>(() => {
    const matches = matchingExercises(
      document.exercises,
      params.get('name') ?? ''
    )
    const exercise =
      document.exercises.find(
        (item) => item.id === resolvedSource?.exerciseId
      ) ?? (matches.length === 1 ? matches[0] : undefined)
    const trainingDate =
      editing && resolvedSource
        ? resolvedSource.trainingDate
        : (calendarDate ?? localDate())
    const workout = document.workouts.find(
      (item) =>
        item.id === params.get('workout') && item.trainingDate === trainingDate
    )
    return {
      id: editing && resolvedSource ? resolvedSource.id : newId(),
      exerciseId: exercise?.id,
      exerciseName: exercise?.name ?? params.get('name')?.trim() ?? '',
      trainingDate,
      ...(editing && resolvedSource?.performedAt !== undefined
        ? { performedAt: resolvedSource.performedAt }
        : {}),
      groups: resolvedSource
        ? resolvedSource.groups.map((group) => ({
            ...group,
            id: editing ? group.id : newId(),
          }))
        : [
            {
              id: newId(),
              sets: 3,
              reps: 8,
              weight: 0,
              unit: preferences.unit,
            },
          ],
      notes: editing ? (resolvedSource?.notes ?? '') : '',
      workoutId: editing ? resolvedSource?.workoutId : workout?.id,
    }
  })
  const [sheetTitle, setSheetTitle] = useState(
    editing ? 'Edit entry' : initial.exerciseId ? 'New entry' : 'New exercise'
  )
  const [dirty, setDirty] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)
  const confirmedEntry = useRef<{
    input: EntryInput
    entry: TrainingEntry
  } | null>(null)
  const tagAttempt = useRef<{
    before: string[]
    requested: string[]
  } | null>(null)
  const guard = useDraftProtection(dirty, pending)
  const destination = (savedDate?: string, selectedId?: string) => {
    if (calendarDate)
      return `/calendar?${new URLSearchParams({ date: savedDate ?? calendarDate, month: (savedDate ?? calendarDate).slice(0, 7) })}#selected-date`
    const pathname = background?.pathname ?? '/'
    const search = new URLSearchParams(background?.search)
    if (pathname === '/' && selectedId) search.set('selected', selectedId)
    const query = search.toString()
    return `${pathname}${query ? `?${query}` : ''}${background?.hash ?? ''}`
  }
  const leave = (date?: string, selectedId?: string) => {
    guard.allow()
    navigate(destination(date, selectedId), { replace: true })
  }
  const close = () => guard.close(() => leave())
  const save = async (input: EntryInput, tags: string[]) => {
    if (inFlight.current) return
    inFlight.current = true
    setPending(true)
    setError('')
    let entrySaved = confirmedEntry.current !== null
    try {
      let currentDocument = document
      const confirmed = confirmedEntry.current
      if (confirmed) {
        // Reload may temporarily clear the provider document. Keep this editor
        // mounted so both a successful reconciliation and another read failure
        // retain the exact draft and its IDs.
        onRetainDraft(document)
        await reload()
        const stored = await readTrainingDocument()
        if (!stored)
          throw new Error(
            'Saved training is unavailable. No retry write was attempted.'
          )
        const persisted = stored.entries.find(
          (entry) => entry.id === confirmed.entry.id
        )
        const persistedExercise = stored.exercises.find(
          (exercise) => exercise.id === confirmed.entry.exerciseId
        )
        if (
          !persistedExercise ||
          !sameValue(persisted, confirmed.entry) ||
          persistedExercise.name !== confirmed.input.exerciseName
        )
          throw new Error(
            'The confirmed entry or its exercise changed since this save. Review saved history before overwriting it; no retry write was attempted.'
          )
        const priorTags = tagAttempt.current
        if (
          priorTags &&
          !sameValue(persistedExercise.tags, priorTags.before) &&
          !sameValue(persistedExercise.tags, priorTags.requested)
        )
          throw new Error(
            'Exercise tags changed beyond this save attempt. Review them before overwriting; no retry write was attempted.'
          )
        currentDocument = stored
      }
      const matches = input.exerciseId
        ? currentDocument.exercises.filter(
            (item) => item.id === input.exerciseId
          )
        : matchingExercises(currentDocument.exercises, input.exerciseName)
      if (matches.length > 1)
        throw new Error(
          'Several imported exercises share this name ignoring case or spaces. Open the intended exercise from the log; histories have not been merged.'
        )
      const exercise = matches[0]
      const workout = currentDocument.workouts.find(
        (item) =>
          item.id === input.workoutId &&
          item.trainingDate === input.trainingDate
      )
      const candidate: EntryInput = {
        ...input,
        exerciseId: exercise?.id,
        exerciseName: exercise?.name ?? input.exerciseName.trim(),
        workoutId: workout?.id,
      }
      const changed = confirmed && !sameValue(candidate, confirmed.input)
      if (changed && !editing)
        throw new Error(
          'This new entry is already confirmed saved. Its changed values were not written over that entry. Restore the saved values to finish its tags, or close and explicitly Edit the saved entry.'
        )
      // An unchanged confirmed Edit is not replayed merely to retry its tags.
      // A deliberate subsequent Edit is safe only after the reconciliation above.
      let saved: TrainingEntry
      if (confirmed && !changed) saved = confirmed.entry
      else {
        entrySaved = false
        saved = await saveEntry(candidate, editing ? initial.id : undefined)
      }
      confirmedEntry.current = {
        input: { ...candidate, exerciseId: saved.exerciseId },
        entry: saved,
      }
      entrySaved = true
      const currentTags = exercise?.tags ?? []
      if (!sameValue(tags, currentTags)) {
        tagAttempt.current = {
          before: [...currentTags],
          requested: [...tags],
        }
        await setExerciseTags(saved.exerciseId, tags)
        tagAttempt.current = null
      }
      showFeedback({ kind: 'saved', entryId: saved.id })
      leave(saved.trainingDate, saved.id)
    } catch (cause) {
      setError(
        `${entrySaved ? 'The entry is saved, but its tags could not be confirmed.' : 'Could not confirm a durable save.'} ${cause instanceof Error ? cause.message : String(cause)} Your values remain here. Retry uses this same entry ID; no success is assumed before storage confirms it.`
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
      showFeedback({ kind: 'deleted' })
      leave()
    } catch (cause) {
      setError(
        `Deletion could not be confirmed: ${cause instanceof Error ? cause.message : String(cause)} Your form is still here. Review saved history before another deletion if storage could not verify the write.`
      )
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }
  return (
    <Sheet
      title={sheetTitle}
      className="entry-sheet"
      initialFocus={
        !editing && !resolvedSource && !initial.exerciseId
          ? '#entry-name'
          : undefined
      }
      onClose={close}
    >
      <LiftForm
        initial={initial}
        exercises={document.exercises}
        entries={document.entries}
        source={resolvedSource}
        editing={editing}
        saving={pending}
        error={error}
        confirmation={<DiscardConfirm guard={guard} />}
        onSubmit={save}
        onDelete={editing ? remove : undefined}
        onClose={close}
        onExerciseRecognized={() => setSheetTitle('New entry')}
        onEditReference={(id) =>
          navigate(
            `/new?${new URLSearchParams({ edit: id, ...(calendarDate ? { date: calendarDate } : {}) })}`,
            {
              state: background
                ? { backgroundLocation: background }
                : undefined,
              replace: true,
            }
          )
        }
        onDirtyChange={setDirty}
      />
    </Sheet>
  )
}
