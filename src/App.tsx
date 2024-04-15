import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Nav from './layouts/Nav'
import New from './pages/New'
import Tags from './pages/Tags'
import V2 from './pages/V2'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Nav>
        <Home></Home>
      </Nav>
    ),
  },
  {
    path: '/about',
    element: (
      <Nav>
        <About></About>
      </Nav>
    ),
  },
  {
    path: '/new',
    element: (
      <Nav>
        <New></New>
      </Nav>
    ),
  },
  {
    path: '/tags',
    element: (
      <Nav>
        <Tags></Tags>
      </Nav>
    ),
  },
  {
    path: '/aaa',
    element: (
      <Nav>
        <V2></V2>
      </Nav>
    ),
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
