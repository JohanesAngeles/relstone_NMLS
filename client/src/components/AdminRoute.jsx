import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) return null;

  const isAuthenticated = user && token;

  if (!isAuthenticated) return <Navigate to="/" replace />;

  // TODO: Re-enable admin role check after testing
  // const isAdmin = user?.role === 'admin';
  // if (!isAdmin) return <Navigate to="/home" replace />;

  return children;
};

export default AdminRoute;
