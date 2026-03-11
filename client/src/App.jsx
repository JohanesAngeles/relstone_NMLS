import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/landing_page/LandingPage';
import Dashboard from './pages/dashboard/Dashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import ViewStudents from './pages/dashboard/ViewStudents';
import Certificate from './pages/cert_page/Certificate';
import Courses from './pages/courses_page/Courses';
import Checkout from './pages/checkout_page/checkout';

// Redirects to the correct dashboard based on role
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'instructor'
    ? <Navigate to="/instructor/dashboard" replace />
    : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />

          {/* Test route */}
          <Route path="/certificate-test" element={<Certificate />} />

          {/* Auto-redirect /home → correct dashboard by role */}
          <Route path="/home" element={
            <PrivateRoute>
              <DashboardRedirect />
            </PrivateRoute>
          } />

          {/* Student dashboard */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* Instructor dashboard */}
          <Route path="/instructor/dashboard" element={
            <PrivateRoute>
              <InstructorDashboard />
            </PrivateRoute>
          } />

          {/* Instructor students page */}
          <Route path="/instructor/students" element={
            <PrivateRoute>
              <ViewStudents />
            </PrivateRoute>
          } />

          <Route path="/checkout" element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          } />

          {/* Shared protected routes */}
          <Route path="/courses" element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          } />
          <Route path="/certificate/:courseId" element={
            <PrivateRoute>
              <Certificate />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;