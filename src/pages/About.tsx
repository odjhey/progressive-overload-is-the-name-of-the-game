import { Link } from 'react-router-dom'
import { DownloadLifts } from '../components/DownloadLifts'
import { UploadRaw } from '../components/UploadRaw'

export default function About() {
  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <p>
        Progressive Overload is an offline training log. Your training and saved
        filters live in this browser, not in a remote account. Keep your own
        JSON backups; clearing browser storage can remove your only copy.
      </p>
      <Link to="/tags">Manage exercises and tags</Link>
      <DownloadLifts />
      <UploadRaw />
      <details>
        <summary>Recovery and date choices</summary>
        <p>
          Old history is never converted automatically. Export its original
          Workouts, Tags and Saved filters first. Review one complete staged
          set, choose written or local dates, inspect the original source and
          converted records, then confirm. Original keys and unknown source
          fields are retained; no old workout sessions, exact recording times or
          individual sets are invented.
        </p>
        <p>
          A version 2 backup is one file with training and current saved
          filters. It does not include the timer. Restore replaces rather than
          merges. The current destination must be backed up and its replacement
          explicitly confirmed. Stale previews are rejected. History and filters
          are separate writes: a partial or unverified outcome is not success
          and does not mean rollback. Keep both files and inspect the stored
          result before retrying.
        </p>
        <p>
          A malformed existing version 2 document is not treated as absent or
          silently cleared. Download its raw JSON safety copy above. Restore a
          known-valid backup in a fresh browser profile if necessary, keeping
          the original browser data intact for recovery.
        </p>
      </details>
    </div>
  )
}
