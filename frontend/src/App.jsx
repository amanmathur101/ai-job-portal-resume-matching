import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import PostJobPage from './pages/PostJobPage';
import CandidateMatchingPage from './pages/CandidateMatchingPage';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast />
      <Navbar />
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/jobs" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/jobs" replace /> : <RegisterPage />}
        />

        {/* Protected — any authenticated user */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected — RECRUITER or ADMIN only */}
        <Route
          path="/post-job"
          element={
            <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
              <PostJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate-matching"
          element={
            <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
              <CandidateMatchingPage />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/jobs' : '/register'} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
