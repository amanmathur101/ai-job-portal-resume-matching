import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function BriefcaseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
    </svg>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = 'text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors';
  const activeLink = 'text-sm font-medium text-blue-600';

  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}&backgroundColor=dbeafe&textColor=1d4ed8`;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-lg shrink-0">
            <BriefcaseIcon />
            <span>Job Portal</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <NavLink to="/jobs" className={({ isActive }) => isActive ? activeLink : navLink}>
                  Jobs
                </NavLink>

                {hasRole('RECRUITER', 'ADMIN') && (
                  <>
                    <NavLink to="/post-job" className={({ isActive }) => isActive ? activeLink : navLink}>
                      Post a Job
                    </NavLink>
                    <NavLink to="/candidate-matching" className={({ isActive }) => isActive ? activeLink : navLink}>
                      AI Matching
                    </NavLink>
                  </>
                )}

                {/* User badge */}
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-100">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-gray-900">{user?.username}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">{user?.role}</span>
                  </div>

                  {/* DP Avatar */}
                  <img
                    src={avatarUrl}
                    alt={user?.username}
                    className="w-9 h-9 rounded-full border-2 border-blue-200 shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${user?.username}&background=dbeafe&color=1d4ed8`;
                    }}
                  />

                  <button
                    onClick={logout}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={navLink}>Sign in</Link>
                <Link to="/register"
                  className="btn-primary text-sm px-4 py-2">
                  Get started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-gray-50 rounded-lg">

                {/* DP Avatar - Mobile */}
                <img
                  src={avatarUrl}
                  alt={user?.username}
                  className="w-10 h-10 rounded-full border-2 border-blue-200 shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${user?.username}&background=dbeafe&color=1d4ed8`;
                  }}
                />

                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-400 uppercase">{user?.role}</p>
                </div>
              </div>

              <NavLink to="/jobs" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Jobs
              </NavLink>

              {hasRole('RECRUITER', 'ADMIN') && (
                <>
                  <NavLink to="/post-job" onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                    Post a Job
                  </NavLink>
                  <NavLink to="/candidate-matching" onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                    AI Matching
                  </NavLink>
                </>
              )}

              <button onClick={() => { setMenuOpen(false); logout(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 font-medium mt-1">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Sign in
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-blue-600 font-medium hover:bg-blue-50">
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
