import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Nav from './layouts/Nav'
import New from './pages/New'
import Tags from './pages/Tags'
import { UpdatePrompt } from './components/UpdatePrompt'
import Calendar from './pages/Calendar'
import { TrainingProvider } from './components/TrainingProvider'
import './training.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Nav>
        <Outlet />
      </Nav>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'about', element: <About /> },
      { path: 'new', element: <New /> },
      { path: 'tags', element: <Tags /> },
    ],
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
