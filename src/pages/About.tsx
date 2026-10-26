import { IconDatabase } from '@tabler/icons-react'
import { DownloadLifts } from '../components/DownloadLifts'
import { UploadRaw } from '../components/UploadRaw'
import { usePreferences } from '../hooks/usePreferences'
import { formatRestTime, useRestTimer } from '../hooks/useRestTimer'

export default function About() {
  const preferences = usePreferences()
  const rest = useRestTimer()
  const restPresets = [60, 90, 120]
  if (!restPresets.includes(rest.timer.durationSeconds))
    restPresets.push(rest.timer.durationSeconds)

  return (
    <div className="page settings-page">
      <header className="top">
        <h1>Settings</h1>
      </header>
      <div className="list">
        <div className="srow">
          <span className="t">Unit</span>
          <div
            className="seg"
            role="group"
            aria-label="Default unit for new exercises"
          >
            {(['kg', 'lbs'] as const).map((unit) => (
              <button
                key={unit}
                type="button"
                className={preferences.unit === unit ? 'on' : ''}
                aria-pressed={preferences.unit === unit}
                disabled={!!preferences.error}
                onClick={() => preferences.setUnit(unit)}
              >
                {unit === 'lbs' ? 'lb' : unit}
              </button>
            ))}
          </div>
        </div>
        <div className="srow">
          <span className="t">
            Weight step<span className="s">Buttons use ×1, ×2, ×4</span>
          </span>
          <div className="seg" role="group" aria-label="Weight step">
            {([1, 2.5, 5] as const).map((step) => (
              <button
                key={step}
                type="button"
                className={preferences.weightStep === step ? 'on' : ''}
                aria-pressed={preferences.weightStep === step}
                disabled={!!preferences.error}
                onClick={() => preferences.setWeightStep(step)}
              >
                {step}
              </button>
            ))}
          </div>
        </div>
        {preferences.error && (
          <div className="recovery-stack">
            <p className="recovery-error" role="alert">
              {preferences.error}
            </p>
            <button className="btn" type="button" onClick={preferences.reload}>
              Reload preferences
            </button>
          </div>
        )}
        <div className="srow">
          <span className="t">Rest timer</span>
          <div className="seg" role="group" aria-label="Default rest length">
            {restPresets.map((seconds) => (
              <button
                key={seconds}
                type="button"
                className={rest.timer.durationSeconds === seconds ? 'on' : ''}
                aria-pressed={rest.timer.durationSeconds === seconds}
                disabled={!rest.ready || !!rest.error}
                onClick={() => rest.setDuration(seconds)}
              >
                {formatRestTime(seconds * 1000)}
              </button>
            ))}
          </div>
        </div>
        {rest.error && (
          <div className="recovery-stack">
            <p className="recovery-error" role="alert">
              {rest.error}
            </p>
            <button className="btn" type="button" onClick={rest.reload}>
              Reload timer
            </button>
          </div>
        )}
        <h2 className="lbl settings-label">Data</h2>
        <DownloadLifts />
        <UploadRaw />
        <div className="srow">
          <IconDatabase className="ic" aria-hidden="true" />
          <span className="t">
            On this device only
            <span className="s">
              No account, no sync · keep backups elsewhere
            </span>
          </span>
        </div>
        <h2 className="lbl settings-label">About</h2>
        <div className="srow">
          <span className="t">
            Progressive Overload
            <span className="s">Installable · works offline</span>
          </span>
        </div>
        <details className="recovery-stack">
          <summary>Recovery and date choices</summary>
          <p>
            Clearing browser storage can remove your only copy. Keep JSON
            backups outside this browser.
          </p>
          <p>
            Old history is never converted automatically. Export its original
            Workouts, Tags and Saved filters first. Review one complete staged
            set, choose written or local dates, inspect the original source and
            converted records, then confirm. Original keys and unknown source
            fields are retained; no old workout sessions, exact recording times
            or individual sets are invented.
          </p>
          <p>
            A version 2 backup contains training and saved filters, not the rest
            timer or default unit and weight step. Import replaces rather than
            merges. Back up the current destination and explicitly confirm
            replacement. Stale previews are rejected. History and filters are
            separate writes: a partial or unverified outcome is not success and
            does not mean rollback. Keep both files and inspect the stored
            result before retrying.
          </p>
          <p>
            A malformed existing version 2 document is not treated as absent or
            silently cleared. Download its raw JSON safety copy under Export
            recovery files. Restore a known-valid backup in a fresh browser
            profile if necessary, keeping the original browser data intact for
            recovery.
          </p>
        </details>
      </div>
    </div>
  )
}
