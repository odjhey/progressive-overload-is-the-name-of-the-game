import { DownloadLifts } from '../components/DownloadLifts'
import { UploadLifts } from '../components/UploadLifts'

export default function About() {
  return (
    <>
      <div>About</div>
      <div>Goals</div>
      <div>
        Track progress of overloads, may be increase in lifted weight overtime,
        or increase in reps/sets
      </div>
      <div>
        <div className="text-lg font-bold">Settings</div>
        <div className="flex flex-col gap-4">
          <DownloadLifts></DownloadLifts>
          <UploadLifts></UploadLifts>
        </div>
      </div>
    </>
  )
}
