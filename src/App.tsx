import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from "./pages/Home";
import About from './pages/About';
import Nav from './layouts/Nav';


const router = createBrowserRouter([
  {
    path: '/', element: <Nav><Home></Home></Nav>
  },
  {
    path: '/about', element: <Nav><About></About></Nav>,
  }
])

export default function App() {

  return (
    <RouterProvider router={router} />

  );
}
