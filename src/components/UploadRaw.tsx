import {
  IconArrowsExchange,
  IconChevronRight,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
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
import {
  LegacyDateChoice,
  LegacyMigration,
  RecoveryReview,
} from './LegacyMigration'
import { Sheet } from './Sheet'

export const UploadRaw = () => {
  const [panel, setPanel] = useState<'legacy' | 'review' | 'error' | null>(null)
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
  const picker = useRef<HTMLInputElement>(null)
  const launcher = useRef<HTMLButtonElement | null>(null)
  const blocker = useBlocker(busy)
  const stayButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (!busy) blocker.reset()
      else stayButton.current?.focus()
    }
  }, [blocker, busy])

  const close = () => {
    if (busy) return
    setPanel(null)
    setPreview(undefined)
    setError('')
  }
  const title =
    panel === 'legacy'
      ? 'Migrate old history'
      : panel === 'error'
        ? 'Cannot import backup'
        : 'Replace current data?'

  return (
    <>
      <button
        type="button"
        className={`srow${panel === 'review' ? ' active' : ''}`}
        disabled={busy}
        onClick={(event) => {
          launcher.current = event.currentTarget
          picker.current?.click()
        }}
      >
        <IconUpload className="ic" aria-hidden="true" />
        <span className="t">
          {busy && !panel ? 'Reading backup…' : 'Import backup'}
          <span className="s warn">
            Replaces training and filters. Asks first.
          </span>
        </span>
        <IconChevronRight className="ic" aria-hidden="true" />
      </button>
      <input
        ref={picker}
        type="file"
        hidden
        accept=".json,application/json"
        aria-label="Choose complete version 2 backup"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file || running.current) return
          running.current = true
          setBusy(true)
          setError('')
          try {
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
            setPanel('review')
          } catch (cause) {
            setError(recoveryError(cause))
            setPanel('error')
          } finally {
            running.current = false
            setBusy(false)
          }
        }}
      />
      <button
        type="button"
        className={`srow${panel === 'legacy' ? ' active' : ''}`}
        disabled={busy}
        onClick={(event) => {
          launcher.current = event.currentTarget
          setError('')
          setPanel('legacy')
        }}
      >
        <IconArrowsExchange className="ic" aria-hidden="true" />
        <span className="t">
          Migrate old history
          <span className="s">Review before replacement</span>
        </span>
        <IconChevronRight className="ic" aria-hidden="true" />
      </button>
      {panel && (
        <Sheet
          title={title}
          onClose={close}
          className="recovery-sheet"
          returnFocus={launcher.current}
        >
          <header className="sh-h">
            <h2>{title}</h2>
            <button
              className="ib ghost"
              type="button"
              aria-label="Close import"
              disabled={busy}
              onClick={close}
            >
              <IconX className="ic" aria-hidden="true" />
            </button>
          </header>
          {blocker.state === 'blocked' && (
            <section
              className="confirm"
              role="alert"
              aria-label="Recovery in progress"
            >
              <p>
                Recovery is still in progress. Stay here until its outcome is
                known; leaving cannot cancel an accepted write.
              </p>
              <button
                ref={stayButton}
                type="button"
                className="btn"
                onClick={() => blocker.reset()}
              >
                Stay for recovery result
              </button>
            </section>
          )}
          {panel === 'review' && preview && (
            <RecoveryReview
              preview={preview}
              onCancel={close}
              onComplete={close}
              onBusyChange={setBusy}
            />
          )}
          {panel === 'legacy' && (
            <div className="recovery-stack">
              <LegacyMigration
                reviewStored
                onBusyChange={setBusy}
                onComplete={close}
              />
              <details>
                <summary>Import original JSON files</summary>
                <form
                  className="recovery-stack"
                  onSubmit={async (event) => {
                    event.preventDefault()
                    if (running.current) return
                    running.current = true
                    setBusy(true)
                    setError('')
                    try {
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
                      setPanel('review')
                    } catch (cause) {
                      setError(recoveryError(cause))
                    } finally {
                      running.current = false
                      setBusy(false)
                    }
                  }}
                >
                  <p>
                    Select each original export, even an empty list. Only choose
                    “not stored” if that key really was absent in the old app.
                    Stored null or invalid data is not absent and will not be
                    silently discarded. One old file is not a complete backup.
                    Nothing is written by previewing.
                  </p>
                  <fieldset disabled={busy} className="recovery-stack">
                    {legacyTargets.map((target) => (
                      <fieldset key={target} className="recovery-stack">
                        <legend>{recoveryTargets[target].label}</legend>
                        <label>
                          Original {recoveryTargets[target].label.toLowerCase()}{' '}
                          JSON
                          <input
                            type="file"
                            accept=".json,application/json"
                            disabled={stage[target].absent}
                            onChange={(event) => {
                              const file = event.target.files?.[0]
                              setStage((current) => ({
                                ...current,
                                [target]: { file, absent: false },
                              }))
                              setError('')
                            }}
                          />
                        </label>
                        {!stage[target].absent && stage[target].file && (
                          <p>Staged file: {stage[target].file?.name}</p>
                        )}
                        <label className="recovery-check">
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
                            {recoveryTargets[target].label} was not stored in
                            the original app
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
                    <button type="submit" className="btn">
                      {busy ? 'Reading preview…' : 'Preview old files'}
                    </button>
                  </fieldset>
                </form>
              </details>
            </div>
          )}
          {error && (
            <div className="recovery-stack">
              <p className="recovery-error" role="alert">
                {error}
              </p>
              {panel === 'error' && (
                <>
                  <p>
                    Nothing was written. Keep the source file and any raw
                    recovery copies. Original per-key exports can be reviewed
                    under Migrate old history.
                  </p>
                  <button type="button" className="btn" onClick={close}>
                    Done
                  </button>
                </>
              )}
            </div>
          )}
        </Sheet>
      )}
      {!panel && blocker.state === 'blocked' && (
        <div className="confirm" role="alert">
          <p>
            Reading the recovery preview. Stay here until it finishes; nothing
            is written by previewing.
          </p>
          <button
            ref={stayButton}
            type="button"
            className="btn"
            onClick={() => blocker.reset()}
          >
            Stay here
          </button>
        </div>
      )}
    </>
  )
}
