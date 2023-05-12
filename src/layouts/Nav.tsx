import {
  PropsWithChildren,
} from 'react'
import { Link } from 'react-router-dom'

export default function Nav(_props: PropsWithChildren) {
  return (
    <>
      <div>
        <nav>
          <ol className="flex gap-4 p-2 bg-primary">
            <li className="text-primary-content">
              <Link to="/">Home</Link>
            </li>
            <li className="text-primary-content">
              <Link to="/latest">Lasts</Link>
            </li>
            <li className="text-primary-content">
              <Link to="/search">Search</Link>
            </li>
            <li className="text-primary-content">
              <Link to="/new">New</Link>
            </li>
            <li className="text-primary-content">
              <Link to="/tags">Tags</Link>
            </li>
            <li className="text-primary-content">
              <Link to="/about">About</Link>
            </li>
          </ol>
        </nav>
      </div>

    </>
  )
}
