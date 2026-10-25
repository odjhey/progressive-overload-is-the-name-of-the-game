import { useRef, useState } from 'react'
import { RawSnapshot, useDbRaw } from '../hooks/useDbRaw'
import { identifyBackup, recoveryTargets, RecoveryTarget, validateBackup } from '../libs/backupValidation'
import { downloadFile } from './DownloadLifts'

type Preview = {
  target: RecoveryTarget
  value: unknown
  summary: string
  destination: RawSnapshot
}

export const UploadRaw = ({ onRestored }: { onRestored?: () => void }) => {
  const { getSnapshot, uploadRaw } = useDbRaw()
  const [file, setFile] = useState<File>()
  const [choice, setChoice] = useState<RecoveryTarget | 'auto'>('auto')
  const [preview, setPreview] = useState<Preview>()
  const [acknowledged, setAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [restored, setRestored] = useState(false)
  const running = useRef(false)

  return (
    <section className="flex flex-col gap-3 border border-secondary p-3" aria-labelledby="restore-heading">
      <h2 id="restore-heading" className="text-lg font-bold">Restore a JSON backup</h2>
      <p>
        Restore one file at a time: Workouts, then Tags, then Saved filters for a
        complete recovery. This replaces one stored item, not a merge or a dataset
        switch. Other items stay untouched. Legacy Settings JSON files are supported;
        you do not need to know their internal keys. CSV import is not supported.
      </p>
      <p>Close other app tabs and avoid editing data during recovery. Keep the source files and any destination backups until you have checked the restored values in the app.</p>
      <form onSubmit={async (event) => {
        event.preventDefault()
        if (running.current) return
        setError('')
        setMessage('')
        setPreview(undefined)
        setAcknowledged(false)
        setRestored(false)
        if (!file) {
          setError('Choose a legacy JSON backup file first.')
          return
        }
        running.current = true
        setBusy(true)
        try {
          let value: unknown
          try {
            value = JSON.parse(await file.text())
          } catch {
            throw new Error('Could not read valid JSON from this file. Choose a Settings JSON export, not CSV, and keep the original file unchanged.')
          }
          const target = choice === 'auto' ? identifyBackup(value) : choice
          const summary = validateBackup(target, value)
          let destination: RawSnapshot
          try {
            destination = await getSnapshot(recoveryTargets[target].key)
          } catch {
            throw new Error('Could not read the destination. Nothing was written. Retry preview before restoring.')
          }
          setPreview({ target, value, summary, destination })
          setMessage('Preview ready. No stored data has been changed.')
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Could not preview this backup. Nothing was written.')
        } finally {
          running.current = false
          setBusy(false)
        }
      }}>
        <fieldset disabled={busy} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1" htmlFor="restore-file">
            JSON backup file
            <input id="restore-file" type="file" accept=".json,application/json" className="file-input file-input-bordered w-full" onChange={(event) => {
              setFile(event.target.files?.[0])
              setPreview(undefined)
              setAcknowledged(false)
              setError('')
              setMessage('')
              setRestored(false)
            }} />
          </label>
          <label className="flex flex-col gap-1" htmlFor="restore-target">
            Restore destination
            <select id="restore-target" className="select select-bordered w-full" value={choice} onChange={(event) => {
              setChoice(event.target.value as RecoveryTarget | 'auto')
              setPreview(undefined)
              setAcknowledged(false)
              setError('')
              setMessage('')
              setRestored(false)
            }}>
              <option value="auto">Identify from file contents</option>
              {(Object.keys(recoveryTargets) as RecoveryTarget[]).map((target) => (
                <option key={target} value={target}>{recoveryTargets[target].label}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-sm btn-info self-start" disabled={!file}>Preview backup</button>
        </fieldset>
      </form>
      {preview && (
        <div className="flex flex-col gap-3 border-t pt-3">
          <h3 className="font-bold">{recoveryTargets[preview.target].label} restore preview</h3>
          <p>Source: {file?.name}. {preview.summary}.</p>
          <p>Dates, names, units, optional notes and additional fields are stored unchanged. No scores or missing fields are added.</p>
          <details>
            <summary className="cursor-pointer">Inspect complete source JSON</summary>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all text-sm">{JSON.stringify(preview.value, null, 2)}</pre>
          </details>
          {preview.destination.exists ? (
            <>
              <p className="font-bold">Existing {recoveryTargets[preview.target].label.toLowerCase()} data will be replaced in full, not merged.</p>
              <details>
                <summary className="cursor-pointer">Inspect existing destination JSON</summary>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all text-sm">{JSON.stringify(preview.destination.value, null, 2)}</pre>
              </details>
              <button type="button" className="btn btn-sm self-start" disabled={busy} onClick={() => {
                try {
                  downloadFile(`before-restore-${new Date().toISOString()}-${preview.destination.key}.json`, JSON.stringify(preview.destination.value))
                  setMessage('Existing destination backup download requested. Check that your browser saved it before replacing data.')
                } catch {
                  setError('Could not download the existing destination. Do not replace it until you have a usable backup.')
                }
              }}>Back up existing {recoveryTargets[preview.target].label.toLowerCase()} JSON</button>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="checkbox" checked={acknowledged} disabled={busy || restored} onChange={(event) => setAcknowledged(event.target.checked)} />
                <span>I understand this replaces all existing {recoveryTargets[preview.target].label.toLowerCase()} data, and I have had the opportunity to back it up.</span>
              </label>
            </>
          ) : <p>No existing {recoveryTargets[preview.target].label.toLowerCase()} item was found. This restore will create it.</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-sm btn-warning" disabled={busy || restored || (preview.destination.exists && !acknowledged)} onClick={async () => {
              if (running.current) return
              running.current = true
              setBusy(true)
              setError('')
              setMessage('Writing and verifying this item…')
              try {
                await uploadRaw(preview.target, preview.value, preview.destination, acknowledged)
                setRestored(true)
                setMessage(`${recoveryTargets[preview.target].label} restored and verified by reading it back. Other stored items were not changed. Check the data in the app and restore the remaining backup files before relying on this destination.`)
                onRestored?.()
              } catch (cause) {
                setMessage('')
                setError(cause instanceof Error ? cause.message : 'Restore could not be verified. Keep both backups and preview again before retrying.')
              } finally {
                running.current = false
                setBusy(false)
              }
            }}>Restore {recoveryTargets[preview.target].label.toLowerCase()}</button>
            <button type="button" className="btn btn-sm" disabled={busy} onClick={() => {
              setPreview(undefined)
              setAcknowledged(false)
              setError('')
              setMessage(restored ? 'Preview closed. The verified restore remains stored.' : 'Preview closed. Closing a preview does not change stored data. Keep your backups and check the destination after any unverified restore attempt.')
              setRestored(false)
            }}>{restored ? 'Close preview' : 'Cancel restore'}</button>
          </div>
        </div>
      )}
      {busy && <p role="status">Working… Keep this page open until the result appears.</p>}
      {error && <p role="alert">{error}</p>}
      <p role="status">{message}</p>
    </section>
  )
}
