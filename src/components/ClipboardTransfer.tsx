import {
  IconChevronRight,
  IconClipboardCopy,
  IconClipboardText,
  IconX,
} from '@tabler/icons-react'
import { useMemo, useRef, useState } from 'react'
import { useFeedback } from '../hooks/useFeedback'
import { useTraining } from '../hooks/useTraining'
import { recoveryError } from '../libs/backupValidation'
import { makeTransfer, mergeTransfer, parseTransfer } from '../libs/transfer'
import type { MergeSummary } from '../libs/transfer'
import type { TrainingDocument } from '../libs/trainingTypes'
import { dateLabel, normalizedName } from './dailyFlow'
import { Sheet } from './Sheet'

const plural = (count: number, word: string, many = `${word}s`) =>
  `${count} ${count === 1 ? word : many}`
const entries = (count: number) => plural(count, 'entry', 'entries')

export function ClipboardTransfer() {
  const { document, legacy, loading, saving } = useTraining()
  const [panel, setPanel] = useState<'copy' | 'paste' | null>(null)
  const launcher = useRef<HTMLButtonElement | null>(null)
  const disabled = loading || saving || !document || !!legacy
  const close = () => setPanel(null)
  return (
    <>
      <button
        type="button"
        className={`srow${panel === 'copy' ? ' active' : ''}`}
        disabled={disabled || !document?.exercises.length}
        onClick={(event) => {
          launcher.current = event.currentTarget
          setPanel('copy')
        }}
      >
        <IconClipboardCopy className="ic" aria-hidden="true" />
        <span className="t">
          Copy to clipboard
          <span className="s">Choose exercises to move to another phone</span>
        </span>
        <IconChevronRight className="ic" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`srow${panel === 'paste' ? ' active' : ''}`}
        disabled={disabled}
        onClick={(event) => {
          launcher.current = event.currentTarget
          setPanel('paste')
        }}
      >
        <IconClipboardText className="ic" aria-hidden="true" />
        <span className="t">
          Paste import
          <span className="s">Adds to this phone. Nothing is deleted.</span>
        </span>
        <IconChevronRight className="ic" aria-hidden="true" />
      </button>
      {panel && document && (
        <Sheet
          title={panel === 'copy' ? 'Copy to clipboard' : 'Paste import'}
          onClose={close}
          className="recovery-sheet"
          returnFocus={launcher.current}
        >
          <header className="sh-h">
            <h2>{panel === 'copy' ? 'Copy to clipboard' : 'Paste import'}</h2>
            <button
              className="ib ghost"
              type="button"
              aria-label="Close"
              onClick={close}
            >
              <IconX className="ic" aria-hidden="true" />
            </button>
          </header>
          {panel === 'copy' ? (
            <CopyPanel document={document} />
          ) : (
            <PastePanel document={document} onDone={close} />
          )}
        </Sheet>
      )}
    </>
  )
}

function CopyPanel({ document }: { document: TrainingDocument }) {
  const [chosen, setChosen] = useState<Set<string>>(() => new Set())
  const [term, setTerm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fallback, setFallback] = useState('')
  const rows = useMemo(() => {
    const stats = new Map<string, { count: number; last: string }>()
    for (const entry of document.entries) {
      const item = stats.get(entry.exerciseId) ?? { count: 0, last: '' }
      item.count += 1
      if (entry.trainingDate > item.last) item.last = entry.trainingDate
      stats.set(entry.exerciseId, item)
    }
    return document.exercises
      .map((exercise) => ({
        exercise,
        ...(stats.get(exercise.id) ?? { count: 0, last: '' }),
      }))
      .sort(
        (a, b) =>
          b.last.localeCompare(a.last) ||
          a.exercise.name.localeCompare(b.exercise.name)
      )
  }, [document])
  const tags = [...new Set(document.exercises.flatMap((e) => e.tags))].sort()
  const visible = rows.filter(({ exercise }) =>
    normalizedName(exercise.name).includes(normalizedName(term))
  )
  const entryCount = rows
    .filter(({ exercise }) => chosen.has(exercise.id))
    .reduce((sum, row) => sum + row.count, 0)
  const toggle = (ids: string[], on: boolean) => {
    setChosen((current) => {
      const next = new Set(current)
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)))
      return next
    })
    setMessage('')
    setFallback('')
  }
  const allVisible =
    visible.length > 0 &&
    visible.every(({ exercise }) => chosen.has(exercise.id))

  return (
    <div className="recovery-stack transfer">
      <input
        className="field"
        type="search"
        aria-label="Filter exercises"
        placeholder="Filter exercises"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
      />
      <div className="chips" role="group" aria-label="Select by tag">
        <button
          type="button"
          className={`chip${allVisible ? ' on' : ''}`}
          aria-pressed={allVisible}
          onClick={() =>
            toggle(
              visible.map(({ exercise }) => exercise.id),
              !allVisible
            )
          }
        >
          {term ? 'All shown' : 'All'}
        </button>
        {tags.map((tag) => {
          const ids = document.exercises
            .filter((exercise) => exercise.tags.includes(tag))
            .map((exercise) => exercise.id)
          const on = ids.every((id) => chosen.has(id))
          return (
            <button
              key={tag}
              type="button"
              className={`chip${on ? ' on' : ''}`}
              aria-pressed={on}
              onClick={() => toggle(ids, !on)}
            >
              #{tag}
            </button>
          )
        })}
      </div>
      <ul className="transfer-list" aria-label="Exercises">
        {visible.map(({ exercise, count, last }) => (
          <li key={exercise.id}>
            <label>
              <input
                type="checkbox"
                checked={chosen.has(exercise.id)}
                onChange={(event) =>
                  toggle([exercise.id], event.target.checked)
                }
              />
              <span className="t">
                {exercise.name}
                <span className="s">
                  {entries(count)}
                  {last && ` · ${dateLabel(last)}`}
                </span>
              </span>
            </label>
          </li>
        ))}
        {!visible.length && <li className="s">No exercise matches.</li>}
      </ul>
      {error && (
        <p className="recovery-error" role="alert">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {fallback && (
        <>
          <p>
            Clipboard access was refused. Select all of the text below and copy
            it yourself.
          </p>
          <textarea
            className="field transfer-text"
            readOnly
            aria-label="Transfer text to copy"
            value={fallback}
            onFocus={(event) => event.target.select()}
          />
        </>
      )}
      <button
        type="button"
        className="btn y lg"
        disabled={!chosen.size}
        onClick={async () => {
          setError('')
          setMessage('')
          setFallback('')
          let text = ''
          try {
            text = JSON.stringify(makeTransfer(document, chosen))
            await navigator.clipboard.writeText(text)
            setMessage(
              `Copied ${plural(chosen.size, 'exercise')} with ${entries(entryCount)}. On the other phone open Settings → Paste import.`
            )
          } catch (cause) {
            if (text) setFallback(text)
            else setError(recoveryError(cause))
          }
        }}
      >
        {chosen.size
          ? `Copy ${plural(chosen.size, 'exercise')} · ${entries(entryCount)}`
          : 'Choose exercises to copy'}
      </button>
    </div>
  )
}

function PastePanel({
  document,
  onDone,
}: {
  document: TrainingDocument
  onDone: () => void
}) {
  const { mergeTraining } = useTraining()
  const { showFeedback } = useFeedback()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const preview = useMemo(():
    | { incoming: TrainingDocument; summary: MergeSummary }
    | { error: string }
    | null => {
    if (!text.trim()) return null
    try {
      const incoming = parseTransfer(text)
      return { incoming, summary: mergeTransfer(document, incoming).summary }
    } catch (cause) {
      return { error: recoveryError(cause) }
    }
  }, [text, document])
  const canRead =
    typeof navigator !== 'undefined' && !!navigator.clipboard?.readText

  return (
    <div className="recovery-stack transfer">
      <p>
        Paste text copied with <b>Copy to clipboard</b> on another phone. A
        complete JSON backup also works. Entries already on this phone are
        skipped; nothing here is changed or deleted.
      </p>
      {canRead && (
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={async () => {
            setError('')
            try {
              setText(await navigator.clipboard.readText())
            } catch {
              setError(
                'Clipboard access was refused. Long-press the box below and choose Paste.'
              )
            }
          }}
        >
          Paste from clipboard
        </button>
      )}
      <textarea
        className="field transfer-text"
        aria-label="Pasted transfer text"
        placeholder="Or long-press here and paste"
        value={text}
        disabled={busy}
        onChange={(event) => {
          setText(event.target.value)
          setError('')
        }}
      />
      {preview && 'error' in preview && (
        <p className="recovery-error" role="alert">
          {preview.error}
        </p>
      )}
      {preview && 'summary' in preview && (
        <section aria-label="Import preview" className="transfer-preview">
          <p>
            <b>Adds {entries(preview.summary.added)}</b>
            {preview.summary.added > 0 &&
              ` · ${plural(preview.summary.newExercises, 'new exercise')}, ${plural(preview.summary.matchedExercises, 'matched exercise')}`}
          </p>
          {preview.summary.skipped > 0 && (
            <p>
              {entries(preview.summary.skipped)} already on this phone will be
              skipped
              {preview.summary.differing > 0 &&
                ` (${preview.summary.differing} differ; this phone's version is kept)`}
              .
            </p>
          )}
        </section>
      )}
      {error && (
        <p className="recovery-error" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        className="btn y lg"
        disabled={
          busy || !preview || !('summary' in preview) || !preview.summary.added
        }
        onClick={async () => {
          if (!preview || !('incoming' in preview)) return
          setBusy(true)
          setError('')
          try {
            await mergeTraining(preview.incoming)
            showFeedback({ kind: 'imported' })
            onDone()
          } catch (cause) {
            setError(
              `${recoveryError(cause)} Your pasted text is still here; nothing was reported as imported.`
            )
          } finally {
            setBusy(false)
          }
        }}
      >
        {busy
          ? 'Adding…'
          : preview && 'summary' in preview && preview.summary.added
            ? `Add ${entries(preview.summary.added)}`
            : 'Nothing to add'}
      </button>
    </div>
  )
}
