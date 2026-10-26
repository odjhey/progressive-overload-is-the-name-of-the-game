import { PropsWithChildren, useState } from 'react'
import { NavLink, ScrollRestoration, useLocation } from 'react-router-dom'
import { IconBarbell, IconCalendar, IconSettings } from '@tabler/icons-react'
import { useTraining } from '../hooks/useTraining'
import { isTrainingDate } from '../libs/trainingModel'
import { LegacyMigration } from '../components/LegacyMigration'
import { RestTimer } from '../components/RestTimer'
import { FeedbackProvider } from '../components/FeedbackProvider'

export default function Nav({ children }: PropsWithChildren) {
  const training = useTraining()
  const location = useLocation()
  const [retryError, setRetryError] = useState('')
  const search = new URLSearchParams(location.search)
  const selectedDate = search.get('date')
  const selectedEntry = search.get('selected')
  const workoutParams = new URLSearchParams()
  if (
    selectedEntry &&
    training.document?.entries.some((entry) => entry.id === selectedEntry)
  )
    workoutParams.set('selected', selectedEntry)
  const workoutSearch = workoutParams.toString()
  const settings = location.pathname === '/about'
  const entryOpen = location.pathname === '/new'
  const backgroundPath = (
    location.state as { backgroundLocation?: { pathname?: string } } | null
  )?.backgroundLocation?.pathname
  const calendarDraft =
    entryOpen &&
    (backgroundPath === '/calendar' ||
      (!backgroundPath && isTrainingDate(selectedDate)))
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
    <FeedbackProvider>
      <div className="app">
        {!training.loading && <ScrollRestoration />}
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <main id="main-content" className="app-main" tabIndex={-1}>
          {training.loading && !entryOpen ? (
            <div className="shell-message">
              <p role="status">Loading training history…</p>
            </div>
          ) : !settings && !entryOpen && training.loadError ? (
            <section className="shell-message" role="alert">
              <h1>Training history could not be read</h1>
              <p>
                {training.loadError.message} Saving is unavailable; stored data
                has not been replaced.
              </p>
              {retryError && <p>{retryError}</p>}
              <div className="recovery-actions">
                <button className="btn" onClick={retry}>
                  Retry reading storage
                </button>
                <NavLink to="/about" className="btn">
                  Settings and recovery
                </NavLink>
              </div>
            </section>
          ) : !settings && training.legacy ? (
            <div className="list recovery-stack">
              <LegacyMigration />
            </div>
          ) : (
            children
          )}
        </main>
        <nav className="nav" aria-label="Main navigation">
          <NavLink
            to={workoutSearch ? `/?${workoutSearch}` : '/'}
            end
            title="Log"
            aria-label="Log"
            className={({ isActive }) =>
              isActive ||
              location.pathname.startsWith('/exercise/') ||
              (entryOpen && !calendarDraft)
                ? 'on'
                : ''
            }
          >
            <IconBarbell size={24} aria-hidden="true" />
          </NavLink>
          <NavLink
            to={
              isTrainingDate(selectedDate)
                ? `/calendar?date=${selectedDate}`
                : '/calendar'
            }
            title="Calendar"
            aria-label="Calendar"
            className={({ isActive }) =>
              isActive || calendarDraft ? 'on' : ''
            }
          >
            <IconCalendar size={24} aria-hidden="true" />
          </NavLink>
          <RestTimer />
          <NavLink
            to="/about"
            title="Settings"
            aria-label="Settings"
            className={({ isActive }) =>
              isActive || location.pathname === '/tags' ? 'on' : ''
            }
          >
            <IconSettings size={24} aria-hidden="true" />
          </NavLink>
        </nav>
      </div>
    </FeedbackProvider>
  )
}
