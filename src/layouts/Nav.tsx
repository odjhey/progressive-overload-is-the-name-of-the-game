import { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import {
  IconHome,
  IconNewSection,
  IconTags,
  IconInfoCircle,
} from '@tabler/icons-react'

export default function Nav({ children }: PropsWithChildren) {
  return (
    <>
      <header className="navbar bg-primary">Progressive Overload</header>
      <main className="pb-24">{children}</main>
      <nav className="btm-nav bg-primary" aria-label="Main navigation">
        <NavLink
          className={({ isActive }) => (isActive ? 'active' : '')}
          to="/"
          end
        >
          <IconHome aria-hidden="true" />
          <span className="btm-nav-label">Home</span>
        </NavLink>
        <NavLink
          to="/new"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconNewSection aria-hidden="true" />
          <span className="btm-nav-label">New</span>
        </NavLink>
        <NavLink
          to="/tags"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconTags aria-hidden="true" />
          <span className="btm-nav-label">Tags</span>
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconInfoCircle aria-hidden="true" />
          <span className="btm-nav-label">Settings</span>
        </NavLink>
      </nav>
    </>
  )
}
