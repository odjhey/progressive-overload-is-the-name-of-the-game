import { DownloadLifts } from '../components/DownloadLifts'

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
        <DownloadLifts></DownloadLifts>
      </div>
    </>
  )
}
