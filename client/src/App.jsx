import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/landing_page/LandingPage';
import AuthModal from './pages/auth_page/AuthModal';
import Dashboard from './pages/dashboard/Dashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import ViewStudents from './pages/dashboard/ViewStudents';
import Certificate from './pages/cert_page/Certificate';
import Courses from './pages/courses_page/Courses';
import Checkout from './pages/checkout_page/checkout';
import CourseDetails from './pages/courses_page/CoursesDetails';
import CoursePortal from './pages/courses_page/CoursePortal';
import StateRequirements from './pages/courses_page/StateRequirements';
import PricingPage from './pages/courses_page/PricingPage';
import HomePage from './pages/HomePage';
import ResourcesHub from './pages/resources_page/ResourcesHub';
import ResourceArticlePage from './pages/resources_page/ResourceArticlePage';

// ── Landing wrapper — if already logged in, skip to home ──────────
const LandingWrapper = () => {
  const { user, loading } = useAuth();
  const [authModal, setAuthModal] = useState(null);

  if (loading) return null;

  // Already logged in → go to HomePage
  if (user) return <Navigate to="/home" replace />;

  return (
    <>
      <LandingPage onOpenAuth={(mode) => setAuthModal(mode)} />
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public — Landing (redirects to /home if logged in) */}
          <Route path="/" element={<LandingWrapper />} />

          {/* Public resources */}
          <Route path="/resources" element={<ResourcesHub />} />
          <Route path="/resources/:slug" element={<ResourceArticlePage />} />

          {/* Certificate test (public) */}
          <Route path="/certificate-test" element={<Certificate />} />

          {/* /home → HomePage */}
          <Route path="/home" element={
            <PrivateRoute>
              <HomePage />
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

          {/* Instructor students */}
          <Route path="/instructor/students" element={
            <PrivateRoute>
              <ViewStudents />
            </PrivateRoute>
          } />

          {/* Checkout */}
          <Route path="/checkout" element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          } />

          {/* Courses */}
          <Route path="/courses" element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          } />

          {/* Discover pages */}
          <Route path="/state-requirements" element={
            <PrivateRoute>
              <StateRequirements />
            </PrivateRoute>
          } />

          <Route path="/pricing" element={
            <PrivateRoute>
              <PricingPage />
            </PrivateRoute>
          } />

          {/* Course detail */}
          <Route path="/courses/:id" element={
            <PrivateRoute>
              <CourseDetails />
            </PrivateRoute>
          } />

          {/* Course portal / LMS */}
          <Route path="/courses/:id/learn" element={
            <PrivateRoute>
              <CoursePortal />
            </PrivateRoute>
          } />

          {/* Certificate */}
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