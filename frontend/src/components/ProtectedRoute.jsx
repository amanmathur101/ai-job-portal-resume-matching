import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps routes that need authentication.
 * @param {string[]} roles  Optional list of allowed roles. If omitted, any authenticated user passes.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/jobs" replace />;
  }

  return children;
}
