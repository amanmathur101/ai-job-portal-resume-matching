import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const ROLES = [
  { value: 'USER',      label: 'Job Seeker',  desc: 'Browse jobs and upload your resume' },
  { value: 'RECRUITER', label: 'Recruiter',   desc: 'Post jobs and view AI-matched candidates' },
];

function validate(name, email, password, role) {
  if (!name.trim() || name.trim().length < 3) return 'Name must be at least 3 characters.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Enter a valid email address.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  if (!role) return 'Please select a role.';
  return null;
}

export default function RegisterPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coldStart, setColdStart] = useState(false);
  const coldRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate(name, email, password, role);
    if (err) { showToast(err, 'error'); return; }

    setLoading(true);
    coldRef.current = setTimeout(() => setColdStart(true), 4000);

    try {
      const res = await registerUser(name.trim(), email.trim(), password, role);
      clearTimeout(coldRef.current);
      setColdStart(false);

      if (res.status === 409) {
        showToast('An account with this email already exists.', 'error');
        return;
      }
      if (res.ok) {
        showToast('Account created! Redirecting to login…', 'success');
        setTimeout(() => { window.location.href = '/login'; }, 1500);
      } else {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || 'Registration failed. Please try again.', 'error');
      }
    } catch {
      clearTimeout(coldRef.current);
      setColdStart(false);
      showToast('Could not reach the server. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => () => clearTimeout(coldRef.current), []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join the Job Portal today</p>
        </div>

        <div className="card p-8">
          {coldStart && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Server is waking up (free tier — up to 60 s). Please wait…
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input
                id="name" type="text" required autoComplete="name"
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                className="input-field"
                minLength={3}
              />
            </div>

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email" type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPass ? 'text' : 'password'} required
                  autoComplete="new-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-field pr-10"
                />
                <button
                  type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-red-500 mt-1">At least 6 characters required</p>
              )}
            </div>

            {/* Role picker */}
            <div>
              <label className="label">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <button
                    key={r.value} type="button"
                    onClick={() => setRole(r.value)}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all
                      ${role === r.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <p className={`text-sm font-semibold ${role === r.value ? 'text-blue-700' : 'text-gray-800'}`}>
                      {r.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <><Spinner size="sm" />Creating account…</> : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
