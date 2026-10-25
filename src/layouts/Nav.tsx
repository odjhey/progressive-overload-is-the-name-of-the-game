import { PropsWithChildren, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { IconHome, IconCalendar, IconInfoCircle } from '@tabler/icons-react'
import { useTraining } from '../hooks/useTraining'
import { isTrainingDate } from '../libs/trainingModel'
import { LegacyMigration } from '../components/LegacyMigration'
import { RestTimer } from '../components/RestTimer'

export default function Nav({ children }: PropsWithChildren) {
  const training = useTraining()
  const location = useLocation()
  const [retryError, setRetryError] = useState('')
  const search = new URLSearchParams(location.search)
  const history = search.get('view') === 'history'
  const selectedDate = search.get('date')
  const settings = location.pathname === '/about'
  const retry = async () => {
    setRetryError('')
    try {
      await training.reload()
    } catch (cause) {
      setRetryError(
        cause instanceof Error ? cause.message : 'Storage could not be read.'
      )
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="app-header">
        <p className="app-brand">Progressive Overload</p>
      </header>
      <RestTimer />
      <main id="main-content" className="app-main" tabIndex={-1}>
        {training.loading ? (
          <p role="status">Loading training history…</p>
        ) : !settings && training.loadError ? (
          <section role="alert">
            <h1>Training history could not be read</h1>
            <p>
              {training.loadError.message} Saving is unavailable; stored data
              has not been replaced.
            </p>
            {retryError && <p>{retryError}</p>}
            <button className="btn" onClick={retry}>
              Retry reading storage
            </button>
            <NavLink to="/about" className="btn">
              Settings and recovery
            </NavLink>
          </section>
        ) : (
          <>
            {training.legacy && <LegacyMigration />}
            {(settings || !training.legacy) && children}
          </>
        )}
      </main>
      <nav className="app-navigation" aria-label="Main navigation">
        <NavLink
          to={history ? '/?view=history' : '/'}
          end
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconHome size={22} aria-hidden="true" />
          <span>Workouts</span>
        </NavLink>
        <NavLink
          to={
            isTrainingDate(selectedDate)
              ? `/calendar?date=${selectedDate}`
              : '/calendar'
          }
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconCalendar size={22} aria-hidden="true" />
          <span>Calendar</span>
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive || location.pathname === '/tags' ? 'active' : ''
          }
        >
          <IconInfoCircle size={22} aria-hidden="true" />
          <span>Settings</span>
        </NavLink>
      </nav>
    </>
  )
}
