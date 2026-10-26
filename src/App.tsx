import {
  createBrowserRouter,
  Link,
  Route,
  RouterProvider,
  Routes,
  useLocation,
} from 'react-router-dom'
import type { Location } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Nav from './layouts/Nav'
import New from './pages/New'
import Exercise from './pages/Exercise'
import { UpdatePrompt } from './components/UpdatePrompt'
import Calendar from './pages/Calendar'
import { TrainingProvider } from './components/TrainingProvider'
import { isTrainingDate } from './libs/trainingModel'
import './training.css'

function PageRoutes() {
  const location = useLocation()
  const entryOpen = location.pathname === '/new'
  const background = (
    location.state as { backgroundLocation?: Location } | null
  )?.backgroundLocation
  const date = new URLSearchParams(location.search).get('date')
  const fallback =
    date && isTrainingDate(date)
      ? {
          pathname: '/calendar',
          search: `?date=${date}&month=${date.slice(0, 7)}`,
          hash: '',
        }
      : { pathname: '/', search: '', hash: '' }
  // The sheet's route remains the real data-router location, so blockers and
  // beforeunload protect the draft while its originating surface stays mounted.
  return (
    <>
      <Routes
        location={
          entryOpen
            ? background?.pathname !== '/new'
              ? (background ?? fallback)
              : fallback
            : location
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/about" element={<About />} />
        <Route path="/exercise/:id" element={<Exercise />} />
        <Route
          path="*"
          element={
            <div className="page">
              <header className="top">
                <h1>Page not found</h1>
              </header>
              <Link className="btn" to="/">
                Back to log
              </Link>
            </div>
          }
        />
      </Routes>
      {entryOpen && <New />}
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '*',
    element: (
      <Nav>
        <PageRoutes />
      </Nav>
    ),
  },
])

export default function App() {
  return (
    <TrainingProvider>
      <UpdatePrompt />
      <RouterProvider router={router} />
    </TrainingProvider>
  )
}
