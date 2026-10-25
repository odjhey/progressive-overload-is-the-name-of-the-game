import localforage from 'localforage'
import { useEffect, useRef, useState } from 'react'
import { useTraining } from '../hooks/useTraining'
import {
  assertRecoveryDestination,
  makeTrainingBackup,
  readRecoveryDestination,
  recoveryError,
  legacyTargets,
  recoveryTargets,
} from '../libs/backupValidation'
import { downloadFile } from '../libs/downloadFile'
import { readLegacySnapshot, validateSavedFilters } from '../libs/trainingModel'
import type { LegacySnapshot } from '../libs/trainingTypes'
import { LegacySourceDownloads } from './LegacyMigration'

export const DownloadLifts = () => {
  const { document, legacy, loading, saving, storedRevision } = useTraining()
  const [originals, setOriginals] = useState<LegacySnapshot>()
  const [rawKeys, setRawKeys] = useState<string[]>([])
  const [refresh, setRefresh] = useState(0)
  const [reading, setReading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const running = useRef(false)

  useEffect(() => {
    let active = true
    setReading(true)
    Promise.all([readLegacySnapshot(), localforage.keys()]).then(([snapshot, keys]) => {
      if (active) {
        setOriginals(snapshot)
        setRawKeys(keys.filter((key) => !key.startsWith('progressive-overload:rest-timer:')))
      }
    }).catch((cause: unknown) => {
      if (active) setError(`Stored exports could not be read: ${recoveryError(cause)}`)
    }).finally(() => { if (active) setReading(false) })
    return () => { active = false }
  }, [storedRevision, refresh])

  return <section className="flex flex-col gap-3 border border-secondary p-3" aria-labelledby="backup-heading">
    <h2 id="backup-heading" className="text-lg font-bold">Back up your data</h2>
    <p>One complete version 2 JSON file contains exercises, tags, entries, set groups, workouts, dates, notes, metadata and current saved filters. The rest timer is never included. Keep the file outside this browser before clearing storage or moving devices.</p>
    <button type="button" className="btn btn-sm self-start" disabled={loading || saving || busy || !document || !!legacy} onClick={async () => {
      if (running.current || !document) return
      running.current = true
      setBusy(true)
      setMessage('')
      setError('')
      try {
        const destination = await readRecoveryDestination()
        if (destination.legacy.keys.length > 0 && !destination.training) {
          throw new Error('Original data must be reviewed and converted first. Download the original files below now.')
        }
        const backup = makeTrainingBackup(destination.training ?? document, destination.filtersExist ? validateSavedFilters(destination.filters) : { term: '', tags: [] })
        await assertRecoveryDestination(destination)
        downloadFile(`progressive-overload-v2-${backup.exportedAt}.json`, JSON.stringify(backup, null, 2))
        setMessage('Complete version 2 backup download requested. Check your browser saved it; the app cannot confirm where it was saved.')
      } catch (cause) { setError(recoveryError(cause)) }
      finally { running.current = false; setBusy(false) }
    }}>Download complete version 2 JSON</button>
    {legacy && <p>Original history is awaiting conversion. Use the original downloads below first.</p>}
    {originals && legacyTargets.some((target) => originals.keys.includes(recoveryTargets[target].key)) && <details>
      <summary>Original legacy JSON downloads</summary>
      <LegacySourceDownloads snapshot={originals} />
      <details><summary>Inspect original legacy source JSON</summary><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all text-sm">{JSON.stringify(originals, null, 2)}</pre></details>
    </details>}
    <details>
      <summary>Raw stored JSON — including unreadable current history</summary>
      <p>These are unmodified per-key safety copies, not complete version 2 backups. No raw file is written back directly. A malformed current history cannot be overwritten here; keep its raw copy and restore a valid complete backup in a fresh browser profile instead. Unrelated keys are never modified. Timer storage is excluded.</p>
      <button type="button" className="btn btn-sm" disabled={busy || reading} onClick={() => setRefresh((value) => value + 1)}>Refresh stored items</button>
      {reading && <p role="status">Reading stored item names…</p>}
      {rawKeys.map((key) => <div key={key} className="flex flex-col gap-1">
        <span className="break-all">{key}</span>
        <button type="button" className="btn btn-sm self-start" disabled={busy || reading} onClick={async () => {
          if (running.current) return
          running.current = true
          setBusy(true)
          setError('')
          try {
            if (!(await localforage.keys()).includes(key)) throw new Error('This item is no longer stored. Refresh the stored items.')
            const text = JSON.stringify(await localforage.getItem(key))
            if (text === undefined) throw new Error('This value cannot be represented as JSON.')
            downloadFile(`raw-${encodeURIComponent(key)}-${new Date().toISOString()}.json`, text)
            setMessage('Raw JSON download requested. Check the browser saved it. This file alone is not a complete history backup.')
          } catch (cause) { setError(recoveryError(cause)) }
          finally { running.current = false; setBusy(false) }
        }}>Download raw JSON: {key}</button>
      </div>)}
    </details>
    <p>Unrelated browser data is left untouched. JSON is the restorable backup format; no partial spreadsheet export is presented as a backup.</p>
    {error && <p role="alert">{error}</p>}
    <p role="status">{message}</p>
  </section>
}
