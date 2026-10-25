import { useCallback, useRef, useState } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import { useTraining } from '../hooks/useTraining'
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
    <label className="flex flex-col gap-1">
      Interpret old dates
      <select
        className="select select-bordered w-full"
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
    <div className="flex flex-col gap-2">
      <p>
        Download every stored original before conversion. “Not stored” is
        different from a stored null. Old and unrelated browser keys are never
        changed or removed.
      </p>
      {legacyTargets.map((target) => {
        const { key, label } = recoveryTargets[target]
        const exists = snapshot.keys.includes(key)
        return (
          <div
            key={target}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <span>
              {label}
              {exists ? '' : ' — not stored'}
            </span>
            <button
              type="button"
              className="btn btn-sm"
              disabled={!exists}
              onClick={() => {
                setError('')
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
      {error && <p role="alert">{error}</p>}
      <p role="status">{message}</p>
    </div>
  )
}

export function RecoveryReview({
  preview,
  onCancel,
  onBusyChange,
}: {
  preview: RecoveryPreview
  onCancel: () => void
  onBusyChange?: (busy: boolean) => void
}) {
  const { replaceDocument, reload, saving } = useTraining()
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

  return (
    <section
      className="flex flex-col gap-3 border border-secondary p-3"
      aria-label="Recovery preview"
    >
      <h3 className="font-bold">Review before writing</h3>
      <p>
        Source: {preview.sourceLabel}. {training.exercises.length} exercises,{' '}
        {training.entries.length} entries,{' '}
        {training.entries.reduce(
          (count, entry) => count + entry.groups.length,
          0
        )}{' '}
        set groups, {training.workouts.length} workouts.{' '}
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
        <ul className="break-all text-sm">
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
              recorded at {entry.recordedAt ?? 'unknown in legacy data'}; entry{' '}
              {entry.id}
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
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all text-sm">
          {JSON.stringify(preview.source, null, 2)}
        </pre>
      </details>
      <details>
        <summary>Inspect converted training and filters</summary>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all text-sm">
          {JSON.stringify({ training, filters: preview.filters }, null, 2)}
        </pre>
      </details>
      <p>
        {hasDestination
          ? 'This replaces the current new-format history and saved filters in full, not a merge. Original legacy data stays untouched.'
          : 'No stored history or filters were found. This creates new-format history and saved filters.'}{' '}
        Timer state is never included or restored.
      </p>
      <p>
        Close other app tabs and do not edit during recovery. The destination is
        rechecked before writing; this is not a cross-tab transaction. History
        and preferences are separate writes. Keep both backups until you inspect
        the result.
      </p>
      <button
        type="button"
        className="btn btn-sm self-start"
        disabled={busy || attempted}
        onClick={() => {
          setError('')
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
        Download current data before restore
      </button>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={consent}
          disabled={busy || attempted || !backupRequested}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>
          I saved the current-data backup, reviewed the source and date mapping,
          and confirm replacing history and saved filters with this preview.
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-sm btn-warning"
          disabled={busy || saving || attempted || !consent || !backupRequested}
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
              setMessage(
                'History and saved filters restored and verified by read-back. Inspect Workouts, Calendar and your filters. Original legacy keys and timer were not changed.'
              )
            } catch (cause) {
              setMessage('')
              setError(
                documentVerified
                  ? `Partial restore: history was written and verified, but saved filters were not confirmed. ${recoveryError(cause)} Keep both backups. Inspect the destination before making a new preview; do not assume rollback.`
                  : `${recoveryError(cause)} This attempt is finished; no success is claimed. If a write was attempted its outcome may be unverified. Keep both backups and inspect/reload before a new preview.`
              )
            } finally {
              running.current = false
              setBusy(false)
              onBusyChange?.(false)
            }
          }}
        >
          Confirm restore
        </button>
        <button
          type="button"
          className="btn btn-sm"
          disabled={busy}
          onClick={onCancel}
        >
          {attempted ? 'Close preview' : 'Cancel preview — no writes'}
        </button>
        {attempted && !busy && (
          <button
            type="button"
            className="btn btn-sm"
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
      {error && <p role="alert">{error}</p>}
      <p role="status">{message}</p>
    </section>
  )
}

export function LegacyMigration() {
  const { legacy, loading, loadError } = useTraining()
  const [policy, setPolicy] = useState<LegacyDatePolicy | ''>('')
  const [preview, setPreview] = useState<RecoveryPreview>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const running = useRef(false)
  if (loading) return <p role="status">Reading legacy history…</p>
  if (!legacy) return loadError ? <p role="alert">{loadError.message}</p> : null
  return (
    <section
      className="flex flex-col gap-3 border border-secondary p-3"
      aria-label="Legacy migration"
    >
      <h2 className="text-lg font-bold">Recover your original history</h2>
      <p>
        Your old data was found. Recording is blocked until you review and
        confirm conversion; an empty new history will not replace it
        automatically.
      </p>
      <LegacySourceDownloads snapshot={legacy} />
      {!preview && (
        <>
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
            className="btn btn-sm self-start"
            disabled={!policy || busy}
            onClick={async () => {
              if (!policy || running.current) return
              running.current = true
              setBusy(true)
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
              }
            }}
          >
            Preview legacy conversion
          </button>
        </>
      )}
      {preview && (
        <RecoveryReview
          preview={preview}
          onCancel={() => setPreview(undefined)}
        />
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  )
}
