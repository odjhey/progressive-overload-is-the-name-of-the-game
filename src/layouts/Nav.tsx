import { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import {
  IconHome,
  IconNewSection,
  IconTags,
  IconInfoCircle,
  IconCpu2,
} from '@tabler/icons-react'

export default function Nav({ children }: PropsWithChildren) {
  return (
    <>
      <nav className="navbar bg-primary"></nav>
      <div className="pb-14">{children}</div>
      <nav className="btm-nav bg-primary">
        <NavLink
          className={({ isActive }) => (isActive ? 'active' : '')}
          to="/"
        >
          <IconHome></IconHome>
        </NavLink>
        <NavLink
          to="/new"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconNewSection></IconNewSection>
        </NavLink>
        <NavLink
          to="/tags"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconTags></IconTags>
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconInfoCircle></IconInfoCircle>
        </NavLink>
        <NavLink
          to="/aaa"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <IconCpu2></IconCpu2>
        </NavLink>
      </nav>
    </>
  )
}
