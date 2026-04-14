import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Parse a JWT and return user info, or null if invalid/expired.
// JWT payload from this backend: { sub: email, role: "USER"|"RECRUITER"|"ADMIN", iat, exp }
function parseToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    const email = payload.sub || '';
    return {
      email,
      // Display name: prefer part before @ so we don't show the full email everywhere
      username: email.split('@')[0] || 'User',
      role: payload.role
        || (payload.authorities && payload.authorities[0])
        || (payload.roles && payload.roles[0])
        || 'USER',
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('jwt'));
  const [user, setUser] = useState(() => parseToken(localStorage.getItem('jwt')));

  const login = useCallback((newToken) => {
    localStorage.setItem('jwt', newToken);
    setToken(newToken);
    setUser(parseToken(newToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    setToken(null);
    setUser(null);
    // Hard redirect so all state is cleared
    window.location.href = '/login';
  }, []);

  const isAuthenticated = !!user;

  const hasRole = useCallback(
    (...roles) => !!user && roles.some(r => r === user.role),
    [user]
  );

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
