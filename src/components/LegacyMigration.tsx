import { IconDatabase, IconUpload } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import { useTraining } from '../hooks/useTraining'
import { useFeedback } from '../hooks/useFeedback'
import {
  assertRecoveryDestination,
  legacyTargets,
  makeTrainingBackup,
  previewLegacy,
  recoveryError,
  recoveryTargets,
} from '../libs/backupValidation'
import type { RecoveryPreview } from '../libs/backupValidation'
import { downloadFile } from '../libs/downloadFile'
import {
  readLegacySnapshot,
  restoreSavedFilters,
  validateSavedFilters,
} from '../libs/trainingModel'
import type { LegacyDatePolicy, LegacySnapshot } from '../libs/trainingTypes'

export function LegacyDateChoice({
  value,
  onChange,
  disabled = false,
}: {
  value: LegacyDatePolicy | ''
  onChange: (value: LegacyDatePolicy | '') => void
  disabled?: boolean
}) {
  return (
    <label className="recovery-stack">
      Interpret old dates
      <select
        className="field"
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value as LegacyDatePolicy | '')
        }
      >
        <option value="">Choose a date interpretation</option>
        <option value="written">
          Written date — keep the calendar date in the original text
        </option>
        <option value="local">
          Local date — match the old app on this device
        </option>
      </select>
      <span>
        Written keeps the source date before any timezone conversion. Local uses
        this device’s current timezone. Review every mapped date below; original
        date text is retained.
      </span>
    </label>
  )
}

export function LegacySourceDownloads({
  snapshot,
}: {
  snapshot: LegacySnapshot
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  return (
    <div className="recovery-stack">
      <p>
        Download every stored original before conversion. “Not stored” is
        different from a stored null. Old and unrelated browser keys are never
        changed or removed.
      </p>
      {legacyTargets.map((target) => {
        const { key, label } = recoveryTargets[target]
        const exists = snapshot.keys.includes(key)
        return (
          <div key={target} className="recovery-stack">
            <span>
              {label}
              {exists ? '' : ' — not stored'}
            </span>
            <button
              type="button"
              className="btn sm"
              disabled={!exists}
              onClick={() => {
                setError('')
                setMessage('')
                try {
                  const text = JSON.stringify(snapshot[target])
                  if (text === undefined)
                    throw new Error(
                      'The original value cannot be represented as JSON.'
                    )
                  downloadFile(`original-${target}-${key}.json`, text)
                  setMessage(
                    `${label} download requested. Check your browser saved the file; the app cannot confirm that.`
                  )
                } catch (cause) {
                  setError(recoveryError(cause))
                }
              }}
            >
              Download original {label.toLowerCase()} JSON
            </button>
          </div>
        )
      })}
      {error && (
        <p className="recovery-error" role="alert">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  )
}

export function RecoveryReview({
  preview,
  onCancel,
  onBusyChange,
  onComplete,
}: {
  preview: RecoveryPreview
  onCancel: () => void
  onBusyChange?: (busy: boolean) => void
  onComplete?: () => void
}) {
  const { replaceDocument, reload, saving } = useTraining()
  const { showFeedback } = useFeedback()
  const [backupRequested, setBackupRequested] = useState(false)
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const running = useRef(false)
  useBeforeUnload(
    useCallback((event) => {
      if (running.current) {
        event.preventDefault()
        event.returnValue = ''
      }
    }, [])
  )
  const { training, destination } = preview
  const hasDestination =
    destination.trainingExists ||
    destination.filtersExist ||
    destination.legacy.keys.length > 0
  const dates = [
    ...new Set(
      training.entries
        .map((entry) => entry.trainingDate)
        .concat(training.workouts.map((workout) => workout.trainingDate))
    ),
  ].sort()
  const currentEntries = destination.training?.entries.length ?? 0
  const currentExercises = destination.training?.exercises.length ?? 0
  const extraEntries = currentEntries - training.entries.length
  const extraExercises = currentExercises - training.exercises.length
  const fewerRecords = extraEntries > 0 || extraExercises > 0
  const source = preview.source
  const exportedAt =
    !preview.policy &&
    source &&
    typeof source === 'object' &&
    'exportedAt' in source &&
    typeof source.exportedAt === 'string'
      ? source.exportedAt
      : null

  return (
    <section className="recovery-review" aria-label="Recovery preview">
      <div className="srow">
        <IconUpload className="ic" aria-hidden="true" />
        <span className="t">
          <b className="recovery-filename">{preview.sourceLabel}</b>
          <span className="s">
            {training.entries.length}{' '}
            {training.entries.length === 1 ? 'entry' : 'entries'} ·{' '}
            {training.exercises.length}{' '}
            {training.exercises.length === 1 ? 'exercise' : 'exercises'}
            {exportedAt &&
              ` · saved ${new Date(exportedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </span>
        </span>
      </div>
      <div className="srow">
        <IconDatabase className="ic" aria-hidden="true" />
        <span className="t">
          <b>On this device now</b>
          <span className={`s${fewerRecords ? ' warn' : ''}`}>
            {currentEntries} {currentEntries === 1 ? 'entry' : 'entries'} ·{' '}
            {currentExercises}{' '}
            {currentExercises === 1 ? 'exercise' : 'exercises'}
            {extraEntries > 0 &&
              ` · ${extraEntries} more ${extraEntries === 1 ? 'entry' : 'entries'} than the file`}
            {extraExercises > 0 &&
              ` · ${extraExercises} more ${extraExercises === 1 ? 'exercise' : 'exercises'} than the file`}
          </span>
          {!destination.training && destination.legacy.keys.length > 0 && (
            <span className="s">
              No new-format history. Original legacy data is also stored and
              will be kept.
            </span>
          )}
        </span>
      </div>
      <details
        className="recovery-stack"
        open={preview.policy ? true : undefined}
      >
        <summary>Review source and dates</summary>
        <p>
          {training.entries.reduce(
            (count, entry) => count + entry.groups.length,
            0
          )}{' '}
          set groups · {training.workouts.length} workouts / marked days ·{' '}
          {preview.filters.tags.length} selected filter tags; search{' '}
          {JSON.stringify(preview.filters.term)}.
        </p>
        <p>
          Training dates:{' '}
          {dates.length ? `${dates[0]} to ${dates[dates.length - 1]}` : 'none'}.{' '}
          {preview.policy
            ? `Date interpretation: ${preview.policy}.`
            : 'Dates are preserved as saved in the version 2 backup.'}{' '}
          Preview IDs are fixed; saving does not reconvert the source.
        </p>
        <details>
          <summary>Inspect all date mappings and stable IDs</summary>
          <ul className="recovery-records">
            {training.entries.map((entry) => (
              <li key={entry.id}>
                {
                  training.exercises.find(
                    (exercise) => exercise.id === entry.exerciseId
                  )?.name
                }
                : training date {entry.trainingDate};
                {entry.performedAt
                  ? ` source timestamp ${entry.performedAt};`
                  : ' exact training time not recorded;'}{' '}
                recorded at {entry.recordedAt ?? 'unknown in legacy data'};
                entry {entry.id}
              </li>
            ))}
            {training.workouts.map((workout) => (
              <li key={workout.id}>
                Workout {workout.id}: {workout.trainingDate}; attendance{' '}
                {workout.attendanceConfirmed ? 'confirmed' : 'not confirmed'}
              </li>
            ))}
          </ul>
        </details>
        <details>
          <summary>Inspect complete source JSON</summary>
          <pre className="recovery-json">
            {JSON.stringify(preview.source, null, 2)}
          </pre>
        </details>
        <details>
          <summary>Inspect converted training and filters</summary>
          <pre className="recovery-json">
            {JSON.stringify({ training, filters: preview.filters }, null, 2)}
          </pre>
        </details>
      </details>
      <div className="confirm">
        <p>
          <b>Replace training and saved filters?</b>Entries, exercises, tags,
          set groups, workouts and marked days are replaced, not merged. This
          cannot be undone here; keep both backups.
        </p>
        <p>
          {hasDestination
            ? 'Current new-format history and saved filters will be replaced in full. Original legacy data stays untouched.'
            : 'No stored history or filters were found. This creates new-format history and saved filters.'}{' '}
          Timer, default unit and weight step, and unrelated browser data are
          not changed.
        </p>
        <p>
          Close other app tabs and do not edit during recovery. The destination
          is rechecked before writing; this is not a cross-tab transaction.
          History and saved filters are separate writes. Keep both backups until
          you inspect the result.
        </p>
        <button
          type="button"
          className="btn"
          disabled={busy || attempted}
          onClick={() => {
            setError('')
            setMessage('')
            try {
              let current: unknown = {
                format: 'progressive-overload-before-restore',
                exportedAt: new Date().toISOString(),
                recoveryDestination: destination,
              }
              let complete = false
              if (destination.training) {
                try {
                  current = {
                    ...makeTrainingBackup(
                      destination.training,
                      destination.filtersExist
                        ? validateSavedFilters(destination.filters)
                        : { term: '', tags: [] }
                    ),
                    recoveryDestination: destination,
                  }
                  complete = true
                } catch {
                  // Invalid preferences still need an unmodified safety copy, not defaults.
                }
              }
              downloadFile(
                `before-restore-${new Date().toISOString()}.json`,
                JSON.stringify(current, null, 2)
              )
              setBackupRequested(true)
              setMessage(
                complete
                  ? 'Complete current-data backup download requested. Check it saved before confirming replacement.'
                  : 'Raw destination safety archive download requested. Check it saved. This archive preserves all original values and missing-key distinctions, but is not a directly restorable version 2 backup. Keep the original per-key downloads too; malformed preferences remain unmodified in the archive.'
              )
            } catch (cause) {
              setError(recoveryError(cause))
            }
          }}
        >
          Export a backup first
        </button>
        <label className="recovery-check">
          <input
            type="checkbox"
            checked={consent}
            disabled={busy || attempted || !backupRequested}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            I saved the current-data backup, reviewed the source and date
            mapping, and confirm replacing history and saved filters with this
            preview.
          </span>
        </label>
        <div className="recovery-actions">
          <button
            type="button"
            className="btn lg"
            disabled={busy}
            onClick={onCancel}
          >
            {attempted ? 'Close result' : 'Cancel'}
          </button>
          <button
            type="button"
            className="btn lg danger fill"
            disabled={
              busy || saving || attempted || !consent || !backupRequested
            }
            onClick={async () => {
              if (running.current) return
              running.current = true
              setBusy(true)
              onBusyChange?.(true)
              setAttempted(true)
              setError('')
              setMessage(
                'Checking destination, then writing and reading back history…'
              )
              let documentVerified = false
              let fullyVerified = false
              let completed = false
              try {
                await assertRecoveryDestination(destination)
                if (
                  preview.localSource &&
                  JSON.stringify(await readLegacySnapshot()) !==
                    JSON.stringify(preview.localSource)
                ) {
                  throw new Error(
                    'Original legacy storage changed after preview. Nothing was written. Cancel and preview again.'
                  )
                }
                await replaceDocument(training, destination.revision)
                documentVerified = true
                setMessage(
                  'History read-back verified. Restoring and checking saved filters…'
                )
                await restoreSavedFilters(preview.filters)
                fullyVerified = true
                setMessage(
                  'History and saved filters restored and verified by read-back. Inspect the Log, Calendar and your filters. Original legacy keys and timer were not changed.'
                )
                if (onComplete) await reload()
                completed = true
              } catch (cause) {
                setMessage('')
                setError(
                  fullyVerified
                    ? `History and saved filters were restored and verified, but the app could not reload them. ${recoveryError(cause)} Keep both backups and use Reload saved data.`
                    : documentVerified
                      ? `Partial restore: history was written and verified, but saved filters were not confirmed. ${recoveryError(cause)} Keep both backups. Inspect the destination before making a new preview; do not assume rollback.`
                      : `${recoveryError(cause)} This attempt is finished; no success is claimed. If a write was attempted its outcome may be unverified. Keep both backups and inspect/reload before a new preview.`
                )
              } finally {
                running.current = false
                setBusy(false)
                onBusyChange?.(false)
              }
              if (completed) {
                showFeedback({ kind: 'imported' })
                onComplete?.()
              }
            }}
          >
            {busy ? 'Replacing…' : 'Replace'}
          </button>
          {attempted && !busy && (
            <button
              type="button"
              className="btn"
              onClick={async () => {
                try {
                  await reload()
                } catch (cause) {
                  setError(recoveryError(cause))
                }
              }}
            >
              Reload saved data
            </button>
          )}
        </div>
        {error && (
          <p className="recovery-error" role="alert">
            {error}
          </p>
        )}
        {message && <p role="status">{message}</p>}
      </div>
    </section>
  )
}

export function LegacyMigration({
  reviewStored = false,
  onBusyChange,
  onComplete,
}: {
  reviewStored?: boolean
  onBusyChange?: (busy: boolean) => void
  onComplete?: () => void
} = {}) {
  const { legacy, loading, loadError } = useTraining()
  const [originals, setOriginals] = useState<LegacySnapshot>()
  const [reading, setReading] = useState(reviewStored)
  const [policy, setPolicy] = useState<LegacyDatePolicy | ''>('')
  const [preview, setPreview] = useState<RecoveryPreview>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const running = useRef(false)
  useEffect(() => {
    if (!reviewStored) return
    let active = true
    setReading(true)
    readLegacySnapshot()
      .then((snapshot) => {
        if (active) setOriginals(snapshot)
      })
      .catch((cause: unknown) => {
        if (active) setError(recoveryError(cause))
      })
      .finally(() => {
        if (active) setReading(false)
      })
    return () => {
      active = false
    }
  }, [reviewStored])
  const source = legacy ?? originals
  const hasOriginals =
    source &&
    legacyTargets.some((target) =>
      source.keys.includes(recoveryTargets[target].key)
    )
  if (loading || reading) return <p role="status">Reading old history…</p>
  if (!hasOriginals || !source)
    return (
      <>
        {loadError && (
          <p className="recovery-error" role="alert">
            {loadError.message}
          </p>
        )}
        {error && (
          <p className="recovery-error" role="alert">
            {error}
          </p>
        )}
        {reviewStored && (
          <p>
            No original history found here. Review files from another device
            below.
          </p>
        )}
      </>
    )
  return (
    <section className="recovery-stack" aria-label="Legacy migration">
      <h3 className="lbl">Original history on this device</h3>
      <p>
        {legacy
          ? 'Your old data was found. Recording is blocked until you review and confirm conversion; an empty new history will not replace it automatically.'
          : 'Original data is still stored. Review its conversion before replacing current new-format history and saved filters; this does not merge them.'}
      </p>
      {!preview && (
        <>
          <LegacySourceDownloads snapshot={source} />
          <LegacyDateChoice
            value={policy}
            disabled={busy}
            onChange={(value) => {
              setPolicy(value)
              setError('')
            }}
          />
          <button
            type="button"
            className="btn"
            disabled={!policy || busy}
            onClick={async () => {
              if (!policy || running.current) return
              running.current = true
              setBusy(true)
              onBusyChange?.(true)
              setError('')
              try {
                setPreview(
                  await previewLegacy(
                    await readLegacySnapshot(),
                    policy,
                    'Original default browser store',
                    true
                  )
                )
              } catch (cause) {
                setError(recoveryError(cause))
              } finally {
                running.current = false
                setBusy(false)
                onBusyChange?.(false)
              }
            }}
          >
            {busy ? 'Reading preview…' : 'Review old history'}
          </button>
        </>
      )}
      {preview && (
        <RecoveryReview
          preview={preview}
          onCancel={() => setPreview(undefined)}
          onBusyChange={(value) => {
            setBusy(value)
            onBusyChange?.(value)
          }}
          onComplete={onComplete}
        />
      )}
      {error && (
        <p className="recovery-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
