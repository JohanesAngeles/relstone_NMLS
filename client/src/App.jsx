import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/landing_page/LandingPage';
import AuthModal from './pages/auth_page/AuthModal';
import Dashboard from './pages/dashboard/Dashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import ViewStudents from './pages/dashboard/ViewStudents';
import CETracker from './pages/dashboard/CETracker';
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
import MyCourses from './pages/my_courses/MyCourses';
import Profile from './pages/profile/Profile';
import MyCertificates from './pages/certificates/MyCertificates';
import OrdersBilling from './pages/OrdersBilling';
import AccountSetup from './pages/auth_page/AccountSetupStep';
import Testimonials from './pages/testimonials/Testimonial';
import TestimonialApproval from './pages/instructor_page/TestimonialApproval';
import CourseDetail from './pages/instructor_page/CourseDetail';
import StudentDetail from './pages/instructor_page/StudentDetail';
import ContactSupport from './pages/dashboard/ContactSupport';
import SupportInbox   from './pages/instructor_page/SupportInbox';
import EditCourseModal from './pages/dashboard/EditCourseModal';
// FIX: Removed the .JSX extension to avoid casing conflicts and circular errors

/* ─── Role helpers ───────────────────────────────────────────────── */
const isInstructor = (user) =>
  user?.role === 'instructor' || user?.role === 'admin';

/* ─── Landing wrapper ──────────────────────────────────────────────── */
const LandingWrapper = () => {
  const { user, loading } = useAuth();
  const [authModal, setAuthModal] = useState(null);

  if (loading) return null;

  if (user) {
    return <Navigate to={isInstructor(user) ? '/instructor/dashboard' : '/home'} replace />;
  }

  return (
    <>
      <LandingPage onOpenAuth={(mode) => setAuthModal(mode)} />
      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />
      )}
    </>
  );
};

/* ─── StudentRoute ─────────────────────────────────────────────────── */
const StudentRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (isInstructor(user)) return <Navigate to="/instructor/dashboard" replace />;
  return children;
};

/* ─── InstructorRoute ──────────────────────────────────────────────── */
const InstructorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (!isInstructor(user)) return <Navigate to="/dashboard" replace />;
  return children;
};

/* ─── App ─────────────────────────────────────────────────────────── */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"                   element={<LandingWrapper />} />
          <Route path="/certificate-test"   element={<Certificate />} />

          {/* Public resources */}
          <Route path="/resources" element={<ResourcesHub />} />
          <Route path="/resources/:slug" element={<ResourceArticlePage />} />

          {/* ── /home — role-aware entry point ── */}
          <Route path="/home" element={
            <PrivateRoute>
              <RoleHomeRedirect />
            </PrivateRoute>
          } />

          {/* ── Student-only pages ── */}
          <Route path="/dashboard" element={<StudentRoute><Dashboard /></StudentRoute>} />
          <Route path="/my-courses" element={<StudentRoute><MyCourses /></StudentRoute>} />
          <Route path="/account-setup" element={<StudentRoute><AccountSetup /></StudentRoute>} />
          <Route path="/testimonials" element={<StudentRoute><Testimonials /></StudentRoute>} />
          <Route path="/profile" element={<StudentRoute><Profile /></StudentRoute>} />
          <Route path="/certificates" element={<StudentRoute><MyCertificates /></StudentRoute>} />
          <Route path="/orders" element={<StudentRoute><OrdersBilling /></StudentRoute>} />
          <Route path="/support" element={<StudentRoute><ContactSupport /></StudentRoute>} />

          {/* CE Tracker */}
          <Route path="/ce-tracker" element={
            <PrivateRoute>
              <CETracker />
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
          <Route path="/orders" element={<PrivateRoute><OrdersBilling /></PrivateRoute>} />
=======
          {/* ── Instructor-only pages ── */}
          <Route path="/instructor/dashboard" element={<InstructorRoute><InstructorDashboard /></InstructorRoute>} />
          <Route path="/instructor/students" element={<InstructorRoute><ViewStudents /></InstructorRoute>} />
          <Route path="/instructor/testimonials" element={<InstructorRoute><TestimonialApproval /></InstructorRoute>} />
          <Route path="/instructor/course/:courseId" element={<InstructorRoute><CourseDetail /></InstructorRoute>} />
          <Route path="/instructor/students/:studentId" element={<InstructorRoute><StudentDetail /></InstructorRoute>} />
          <Route path="/instructor/support" element={<InstructorRoute><SupportInbox /></InstructorRoute>} />
          <Route path="/instructor/course/:courseId/edit" element={<InstructorRoute><EditCourseModal /></InstructorRoute>} />

          {/* ── Shared private pages ── */}
          <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
          <Route path="/courses/:id" element={<PrivateRoute><CourseDetails /></PrivateRoute>} />
          <Route path="/courses/:id/learn" element={<PrivateRoute><CoursePortal /></PrivateRoute>} />
          <Route path="/certificate/:courseId" element={<PrivateRoute><Certificate /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
>>>>>>> main
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const RoleHomeRedirect = () => {
  const { user } = useAuth();
  if (isInstructor(user)) return <Navigate to="/instructor/dashboard" replace />;
  return <HomePage />;
};

export default App;