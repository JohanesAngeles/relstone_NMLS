import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/landing_page/LandingPage';
import Dashboard from './pages/dashboard/Dashboard';
import Certificate from './pages/cert_page/Certificate';
import Courses from './pages/courses_page/Courses';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public — landing page with auth modal built-in */}
          <Route path="/" element={<LandingPage />} />

          {/* Test route */}
          <Route path="/certificate-test" element={<Certificate />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/certificate/:courseId" element={
            <PrivateRoute>
              <Certificate />
            </PrivateRoute>
          } />
          <Route path="/courses" element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;