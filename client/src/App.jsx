import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
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
import HomePage from './pages/HomePage';
import MyCourses from './pages/my_courses/MyCourses';
import Profile from './pages/profile/Profile';
import MyCertificates from './pages/certificates/MyCertificates';
import NotificationsCenter from './pages/notifications/NotificationsCenter';
import ReceiptPage from './pages/checkout_page/ReceiptPage';
import OrdersBilling from './pages/OrdersBilling';
import AdminRefunds from './pages/AdminRefunds';


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
      <NotificationProvider>
        <Router>
          <Routes>
          {/* Public — Landing (redirects to /home if logged in) */}
          <Route path="/" element={<LandingWrapper />} />

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

          <Route path="/receipt/:orderId" element={
            <PrivateRoute>
              <ReceiptPage />
            </PrivateRoute>
          } />

          {/* Certificate */}
          <Route path="/certificate/:courseId" element={
            <PrivateRoute>
              <Certificate />
            </PrivateRoute>
          } />
          <Route path="/my-courses" element={
            <PrivateRoute>
              <MyCourses />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/certificates" element={
            <PrivateRoute>
              <MyCertificates />
            </PrivateRoute>
          } />
          <Route path="/notifications" element={
            <PrivateRoute>
              <NotificationsCenter />
            </PrivateRoute>
          } />
          <Route path="/orders" element={<PrivateRoute><OrdersBilling /></PrivateRoute>} />
          <Route path="/admin/refunds" element={<AdminRoute><AdminRefunds /></AdminRoute>} />
        </Routes>
      </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;