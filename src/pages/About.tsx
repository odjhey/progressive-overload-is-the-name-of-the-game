import { useState } from 'react'
import { DownloadLifts } from '../components/DownloadLifts'
import { UploadRaw } from '../components/UploadRaw'

export default function About() {
  const [revision, setRevision] = useState(0)

  return (
    <div className="settings-page">
      <h1>Settings and recovery</h1>
      <p>
        Progressive Overload is an offline workout log. Your workouts, tags and
        saved filters live in this browser, not in a remote account.
      </p>
      <p>
        Use JSON backups to move or recover your history. Each restore is a
        separate operation; success for one file does not mean the other files
        have been restored.
      </p>
      <DownloadLifts revision={revision} />
      <UploadRaw onRestored={() => setRevision((value) => value + 1)} />
    </div>
  )
}
