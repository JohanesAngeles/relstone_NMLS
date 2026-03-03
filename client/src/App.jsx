import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/auth_page/Login';
import Register from './pages/auth_page/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Certificate from './pages/cert_page/Certificate';
import Courses from './pages/courses_page/Courses';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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