import {
  IconArrowLeft,
  IconHash,
  IconPencil,
  IconPlus,
  IconX,
} from '@tabler/icons-react'
import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LiftRow } from '../components/LiftRow'
import { Sheet } from '../components/Sheet'
import { TagPicker } from '../components/TagPicker'
import { DiscardConfirm } from '../components/DraftProtection'
import { useDraftProtection } from '../components/useDraftProtection'
import {
  newestFirst,
  normalizedName,
  withTypedTag,
} from '../components/dailyFlow'
import { useTraining } from '../hooks/useTraining'
import type { Exercise as ExerciseRecord } from '../libs/trainingTypes'

export default function Exercise() {
  const training = useTraining()
  const { id } = useParams()
  const [editor, setEditor] = useState<'rename' | 'tags' | null>(null)
  if (training.loading) return <p role="status">Loading exercise…</p>
  if (training.loadError)
    return (
      <p role="alert">
        Training could not be read: {training.loadError.message}
      </p>
    )
  const exercise = training.document?.exercises.find((item) => item.id === id)
  if (!exercise || !training.document)
    return (
      <div className="page">
        <header className="top">
          <Link className="ib" aria-label="Back to log" to="/">
            <IconArrowLeft size={20} />
          </Link>
          <h1>Exercise unavailable</h1>
        </header>
        <p className="form-error" role="alert">
          This exercise was not found. No history has been changed.
        </p>
      </div>
    )
  const entries = training.document.entries
    .filter((entry) => entry.exerciseId === exercise.id)
    .sort(newestFirst)
  return (
    <div className="page exercise-page">
      <header className="top">
        <Link className="ib" aria-label="Back to log" to="/">
          <IconArrowLeft size={20} aria-hidden="true" />
        </Link>
        <h1>{exercise.name}</h1>
        <button
          type="button"
          className={`ib${editor === 'rename' ? ' on' : ''}`}
          aria-label="Rename exercise"
          onClick={() => setEditor('rename')}
        >
          <IconPencil size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`ib${editor === 'tags' ? ' on' : ''}`}
          aria-label="Tags"
          onClick={() => setEditor('tags')}
        >
          <IconHash size={20} aria-hidden="true" />
        </button>
      </header>
      <div className="chips" aria-label="Exercise tags">
        {exercise.tags.map((tag) => (
          <span className="chip" key={tag}>
            {tag}
          </span>
        ))}
        <button
          type="button"
          className="chip"
          aria-label="Add tag"
          onClick={() => setEditor('tags')}
        >
          <IconPlus size={16} aria-hidden="true" />
        </button>
        <span className="entry-count">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>
      <div className="list">
        {entries.map((entry) => (
          <LiftRow key={entry.id} entry={entry} exercise={exercise} history />
        ))}
        {!entries.length && <p className="form-error">No saved entries</p>}
      </div>
      {editor && (
        <ExerciseEditor
          key={`${exercise.id}:${editor}`}
          exercise={exercise}
          mode={editor}
          count={entries.length}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  )
}

function ExerciseEditor({
  exercise,
  mode,
  count,
  onClose,
}: {
  exercise: ExerciseRecord
  mode: 'rename' | 'tags'
  count: number
  onClose: () => void
}) {
  const { document, renameExercise, setExerciseTags } = useTraining()
  const [name, setName] = useState(exercise.name)
  const [tags, setTags] = useState(exercise.tags)
  const [tagDraft, setTagDraft] = useState('')
  const [confirmedTags, setConfirmedTags] = useState(
    JSON.stringify(exercise.tags)
  )
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)
  const dirty =
    mode === 'rename'
      ? name !== exercise.name
      : !!tagDraft.trim() || JSON.stringify(tags) !== confirmedTags
  const guard = useDraftProtection(dirty, pending)
  const close = () => guard.close(onClose)
  const saveTags = async (next: string[]) => {
    if (inFlight.current) return false
    setTags(next)
    inFlight.current = true
    setPending(true)
    setError('')
    try {
      await setExerciseTags(exercise.id, next)
      setConfirmedTags(JSON.stringify(next))
      return true
    } catch (cause) {
      setError(
        `Tags could not be confirmed: ${cause instanceof Error ? cause.message : String(cause)} Your selected tags remain here; Done retries the change.`
      )
      return false
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }
  const rename = async () => {
    if (inFlight.current) return
    const trimmed = name.trim()
    if (!trimmed) return
    if (
      document?.exercises.some(
        (item) =>
          item.id !== exercise.id &&
          normalizedName(item.name) === normalizedName(trimmed)
      )
    ) {
      setError(
        'Another exercise already uses that name ignoring case or spaces. Choose a different name; histories will not be merged.'
      )
      return
    }
    inFlight.current = true
    setPending(true)
    setError('')
    try {
      await renameExercise(exercise.id, trimmed)
      guard.allow()
      onClose()
    } catch (cause) {
      setError(
        `Rename could not be confirmed: ${cause instanceof Error ? cause.message : String(cause)} Your name remains here.`
      )
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }
  return (
    <Sheet title={mode === 'rename' ? 'Rename' : 'Tags'} onClose={close}>
      <div className="sh-h">
        <h2>{mode === 'rename' ? 'Rename' : 'Tags'}</h2>
        <button
          type="button"
          className="ib ib-36 ghost"
          aria-label="Close"
          disabled={pending}
          onClick={close}
        >
          <IconX size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="small-sheet-body">
        {mode === 'rename' ? (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void rename()
            }}
          >
            <label className="lbl" htmlFor="rename-name">
              Name
            </label>
            <input
              className="field"
              id="rename-name"
              value={name}
              disabled={pending}
              onChange={(event) => setName(event.target.value)}
            />
            <p className="rename-note">
              {count} {count === 1 ? 'entry' : 'entries'} and{' '}
              {exercise.tags.length}{' '}
              {exercise.tags.length === 1 ? 'tag' : 'tags'} keep the new name.
            </p>
            {error && <p role="alert">{error}</p>}
            <div className="counter-grid">
              <button
                type="button"
                className="btn lg"
                disabled={pending}
                onClick={close}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn y lg"
                disabled={pending || !name.trim()}
              >
                Rename
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="sub">{exercise.name}</p>
            <TagPicker
              tags={tags}
              knownTags={document?.exercises.flatMap((item) => item.tags) ?? []}
              value={tagDraft}
              onValueChange={setTagDraft}
              disabled={pending}
              onChange={saveTags}
            />
            {error && <p role="alert">{error}</p>}
            <button
              type="button"
              className="btn y lg"
              disabled={pending}
              onClick={async () => {
                if (
                  dirty &&
                  !(await saveTags(
                    withTypedTag(
                      tags,
                      document?.exercises.flatMap((item) => item.tags) ?? [],
                      tagDraft
                    )
                  ))
                )
                  return
                guard.allow()
                onClose()
              }}
            >
              Done
            </button>
          </>
        )}
      </div>
      <DiscardConfirm guard={guard} />
    </Sheet>
  )
}
