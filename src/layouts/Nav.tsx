import { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import {
  IconHome,
  IconNewSection,
  IconTags,
  IconInfoCircle,
} from '@tabler/icons-react'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'
import { defaultStringifySearch } from '../libs/searchParams'

export default function Nav({ children }: PropsWithChildren) {
  const [search] = useUrlSearchParams()
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="app-header">
        <span className="brand-mark" aria-hidden="true">
          PO
        </span>
        <p className="app-brand">Progressive Overload</p>
        <span className="brand-caption">A workout notebook</span>
      </header>
      <main id="main-content" className="app-main" tabIndex={-1}>
        {children}
      </main>
      <nav className="app-navigation" aria-label="Main navigation">
        <NavLink
          className={({ isActive }) => (isActive ? 'active' : '')}
          to={{
            pathname: '/',
            search:
              search.view === 'history'
                ? defaultStringifySearch({ view: 'history' })
                : '',
          }}
          end
        >
          <IconHome size={22} aria-hidden="true" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/new"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconNewSection size={22} aria-hidden="true" />
          <span>New</span>
        </NavLink>
        <NavLink
          to="/tags"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconTags size={22} aria-hidden="true" />
          <span>Tags</span>
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconInfoCircle size={22} aria-hidden="true" />
          <span>Settings</span>
        </NavLink>
      </nav>
    </>
  )
}
