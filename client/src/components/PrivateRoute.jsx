import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  // Wait until storage is restored before deciding to redirect
  if (loading) return null; // or a spinner if you prefer

  const isAuthenticated = user && token;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;