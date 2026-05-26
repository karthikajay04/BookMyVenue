import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './page/Home';
import Venues from './page/Venues';
import Contact from './page/Contact';
import Login from './page/Login';
import Signup from './page/Signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
