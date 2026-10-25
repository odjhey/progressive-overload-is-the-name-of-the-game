import { useEffect, useState } from 'react'
import { useDbRaw } from '../hooks/useDbRaw'
import { recoveryTargets, RecoveryTarget, validateBackup } from '../libs/backupValidation'

export function downloadFile(filename: string, text: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }))
  const element = document.createElement('a')
  element.href = url
  element.download = filename
  document.body.appendChild(element)
  element.click()
  element.remove()
  // Allow the browser to start consuming the object URL before releasing it.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const DownloadLifts = ({ revision = 0 }: { revision?: number }) => {
  const { getKeys, keys, loading, error, getValues } = useDbRaw()
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    void getKeys()
  }, [getKeys, revision])

  const exportKey = async (key: string, label: string) => {
    setBusy(true)
    setFeedback('')
    setDownloadError('')
    try {
      const text = await getValues(key)
      downloadFile(`values-${new Date().toISOString()}-${key}.json`, text)
      setFeedback(`${label} download requested. Keep the downloaded file; this app cannot confirm where your browser saved it.`)
    } catch {
      setDownloadError(`Could not download ${label.toLowerCase()}. Stored data was not changed. Refresh and retry.`)
    } finally {
      setBusy(false)
    }
  }

  const extraKeys = keys.filter((key) =>
    !Object.values(recoveryTargets).some((target) => target.key === key)
  )

  return (
    <section className="flex flex-col gap-3 border border-secondary p-3" aria-labelledby="backup-heading">
      <h2 id="backup-heading" className="text-lg font-bold">Back up your data</h2>
      <p>
        A complete backup is three separate JSON files: Workouts (including units,
        dates and notes), Tags (workout-name associations), and Saved filters
        (search text and selected tags). Download every stored item below before
        migrating. An item marked not stored has no saved data to export.
      </p>
      <p>Keep the old app and these files until you have restored and checked all three items. Do not clear browser storage or uninstall the old app first.</p>
      <button className="btn btn-sm self-start" type="button" disabled={loading || busy} onClick={() => void getKeys()}>
        Refresh stored items
      </button>
      {loading && <p role="status">Reading stored items…</p>}
      {error && <p role="alert">{error.message}</p>}
      {(Object.keys(recoveryTargets) as RecoveryTarget[]).map((target) => {
        const { key, label } = recoveryTargets[target]
        const exists = keys.includes(key)
        return (
          <div key={key} className="flex flex-wrap items-center justify-between gap-2">
            <span>{label}{!loading && !error && !exists ? ' — not stored' : ''}</span>
            <button className="btn btn-sm btn-info" type="button" disabled={loading || busy || !!error || !exists} onClick={() => void exportKey(key, label)}>
              Download {label.toLowerCase()} JSON
            </button>
          </div>
        )
      })}
      {extraKeys.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">Other stored data (raw JSON)</h3>
          <p>Keep these files too if you need them. This restore tool only handles workouts, tags and saved filters; other keys are never overwritten.</p>
          {extraKeys.map((key) => (
            <div key={key} className="flex flex-wrap items-center justify-between gap-2">
              <span className="break-all">{key}</span>
              <button className="btn btn-sm" type="button" disabled={loading || busy || !!error} onClick={() => void exportKey(key, key)}>
                Download raw JSON: {key}
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="border-t pt-3">
        <h3 className="font-bold">Partial CSV export</h3>
        <p>For spreadsheets only: names, weights, reps, sets and dates. It omits units, notes, tags, filters and other fields. Not a backup; CSV cannot be restored here.</p>
        <button
          className="btn btn-sm mt-2"
          type="button"
          disabled={loading || busy || !!error || !keys.includes(recoveryTargets.workouts.key)}
          onClick={async () => {
            setBusy(true)
            setFeedback('')
            setDownloadError('')
            try {
              const value: unknown = JSON.parse(await getValues(recoveryTargets.workouts.key))
              validateBackup('workouts', value)
              const { lifts } = value as { lifts: Record<string, unknown>[] }
              const rows = lifts.map((lift) => ['name', 'weight', 'rep', 'set', 'date']
                .map((field) => `"${String(lift[field]).replaceAll('"', '""')}"`).join(','))
              downloadFile('export-lifts-partial.csv', ['name,weight,rep,set,date', ...rows].join('\n'), 'text/csv')
              setFeedback('Partial CSV download requested. Use JSON files for recovery.')
            } catch {
              setDownloadError('Could not export workout CSV. Try the unmodified workouts JSON backup instead.')
            } finally {
              setBusy(false)
            }
          }}
        >Download partial workout CSV</button>
      </div>
      {downloadError && <p role="alert">{downloadError}</p>}
      <p role="status">{feedback}</p>
    </section>
  )
}
