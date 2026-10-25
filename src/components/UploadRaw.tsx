import { useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import {
  legacyTargets,
  previewLegacy,
  readLegacyStage,
  readRecoveryDestination,
  recoveryError,
  recoveryTargets,
  validateTrainingBackup,
} from '../libs/backupValidation'
import type { LegacyStage, RecoveryPreview } from '../libs/backupValidation'
import type { LegacyDatePolicy } from '../libs/trainingTypes'
import { LegacyDateChoice, RecoveryReview } from './LegacyMigration'

export const UploadRaw = () => {
  const [mode, setMode] = useState<'v2' | 'legacy'>('v2')
  const [file, setFile] = useState<File>()
  const [stage, setStage] = useState<LegacyStage>({
    workouts: { absent: false },
    tags: { absent: false },
    filters: { absent: false },
  })
  const [policy, setPolicy] = useState<LegacyDatePolicy | ''>('')
  const [preview, setPreview] = useState<RecoveryPreview>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const running = useRef(false)
  const blocker = useBlocker(busy)
  const stayButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (!busy) blocker.reset()
      else stayButton.current?.focus()
    }
  }, [blocker, busy])

  return (
    <section
      className="flex flex-col gap-3 border border-secondary p-3"
      aria-labelledby="restore-heading"
    >
      <h2 id="restore-heading" className="text-lg font-bold">
        Restore a JSON backup
      </h2>
      {blocker.state === 'blocked' && (
        <section
          className="navigation-guard border p-3"
          role="alert"
          aria-label="Recovery in progress"
        >
          <p>
            Recovery is still in progress. Stay here until its outcome is known;
            leaving cannot cancel an accepted write.
          </p>
          <button
            ref={stayButton}
            type="button"
            className="btn btn-sm"
            onClick={() => blocker.reset()}
          >
            Stay for recovery result
          </button>
        </section>
      )}
      <p>
        A complete version 2 backup restores training relationships and saved
        filters together. For old exports, collect Workouts, Tags and Saved
        filters as one staged set. One old file is not a complete history.
        Nothing is written by selecting files or previewing.
      </p>
      {!preview && (
        <form
          onSubmit={async (event) => {
            event.preventDefault()
            if (running.current) return
            running.current = true
            setBusy(true)
            setError('')
            try {
              if (mode === 'legacy') {
                if (!policy)
                  throw new Error(
                    'Choose how to interpret old dates before previewing.'
                  )
                const snapshot = await readLegacyStage(stage)
                const names = legacyTargets
                  .map(
                    (target) =>
                      `${recoveryTargets[target].label}: ${stage[target].absent ? 'explicitly not stored' : stage[target].file?.name}`
                  )
                  .join('; ')
                setPreview(
                  await previewLegacy(
                    snapshot,
                    policy,
                    `Uploaded old files — ${names}`
                  )
                )
              } else {
                if (!file)
                  throw new Error(
                    'Choose a complete version 2 JSON file first.'
                  )
                let source: unknown
                try {
                  source = JSON.parse(await file.text()) as unknown
                } catch {
                  throw new Error(
                    'Could not read valid JSON. Choose a JSON backup, not CSV, and keep the source unchanged.'
                  )
                }
                const backup = validateTrainingBackup(source)
                setPreview({
                  training: backup.training,
                  filters: backup.filters,
                  source,
                  sourceLabel: file.name,
                  destination: await readRecoveryDestination(),
                })
              }
            } catch (cause) {
              setError(recoveryError(cause))
            } finally {
              running.current = false
              setBusy(false)
            }
          }}
        >
          <fieldset disabled={busy} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              Backup format
              <select
                className="select select-bordered w-full"
                value={mode}
                onChange={(event) => {
                  setMode(event.target.value as 'v2' | 'legacy')
                  setError('')
                }}
              >
                <option value="v2">Complete version 2 backup</option>
                <option value="legacy">
                  Three original per-key JSON files
                </option>
              </select>
            </label>
            {mode === 'v2' ? (
              <label className="flex flex-col gap-1">
                Version 2 JSON backup
                <input
                  className="w-full"
                  type="file"
                  accept=".json,application/json"
                  onChange={(event) => {
                    setFile(event.target.files?.[0])
                    setError('')
                  }}
                />
                {file && (
                  <span className="break-all text-sm">
                    Staged file: {file.name}. Choose another file to replace it.
                  </span>
                )}
              </label>
            ) : (
              <>
                <p>
                  Select each original export, even an empty list. Only choose
                  “not stored” if that key really was absent in the old app.
                  Stored null or invalid data is not the same as absent, and
                  will not be silently discarded.
                </p>
                {legacyTargets.map((target) => (
                  <fieldset
                    key={target}
                    className="flex flex-col gap-2 border p-2"
                  >
                    <legend>{recoveryTargets[target].label}</legend>
                    <label className="flex flex-col gap-1">
                      Original {recoveryTargets[target].label.toLowerCase()}{' '}
                      JSON
                      <input
                        className="w-full"
                        type="file"
                        accept=".json,application/json"
                        disabled={stage[target].absent}
                        onChange={(event) => {
                          const chosen = event.target.files?.[0]
                          setStage((current) => ({
                            ...current,
                            [target]: { file: chosen, absent: false },
                          }))
                          setError('')
                        }}
                      />
                    </label>
                    {!stage[target].absent && stage[target].file && (
                      <p className="break-all text-sm">
                        Staged file: {stage[target].file?.name}
                      </p>
                    )}
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={stage[target].absent}
                        onChange={(event) => {
                          const absent = event.target.checked
                          setStage((current) => ({
                            ...current,
                            [target]: { ...current[target], absent },
                          }))
                          setError('')
                        }}
                      />
                      <span>
                        {recoveryTargets[target].label} was not stored in the
                        original app
                      </span>
                    </label>
                  </fieldset>
                ))}
                <LegacyDateChoice
                  value={policy}
                  onChange={(value) => {
                    setPolicy(value)
                    setError('')
                  }}
                />
              </>
            )}
            <button type="submit" className="btn btn-sm self-start">
              {busy ? 'Reading preview…' : 'Preview backup'}
            </button>
          </fieldset>
        </form>
      )}
      {preview && (
        <RecoveryReview
          preview={preview}
          onCancel={() => setPreview(undefined)}
          onBusyChange={setBusy}
        />
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  )
}
