import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from "./pages/Home";
import About from './pages/About';

export default function App() {

  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/">
          <Home></Home>
        </Route>
        <Route path="/about">
          <About></About>
        </Route>
      </Routes>
    </Router>

  );
}
