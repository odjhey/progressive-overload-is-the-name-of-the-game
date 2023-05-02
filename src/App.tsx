import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from "./pages/Home";
import About from './pages/About';
import Nav from './layouts/Nav';
import Search from './pages/Search';
import Latest from './pages/Latest';
import New from './pages/New';

const router = createBrowserRouter([
  {
    path: '/', element: <Nav><Home></Home></Nav>
  },
  {
    path: '/about', element: <Nav><About></About></Nav>,
  },
  {
    path: '/search', element: <Nav><Search></Search></Nav>,
  },
  {
    path: '/latest', element: <Nav><Latest></Latest></Nav>,
  },
  {
    path: '/new', element: <Nav><New></New></Nav>,
  }
])

export default function App() {

  return (
    <RouterProvider router={router} />

  );
}
