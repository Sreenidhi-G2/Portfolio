import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing3D from './components/landing3D';
import Projects3D from './components/Projects3D';
import ContactPage from './components/Contact';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing3D />} />
        <Route path="/projects" element={<Projects3D />} />
        <Route path="/contact" element={<ContactPage/>} />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;