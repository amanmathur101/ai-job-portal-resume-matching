import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { registerUser } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const ROLES = [
  { value: 'USER', label: 'Job Seeker', desc: 'Browse jobs and upload your resume' },
  { value: 'RECRUITER', label: 'Recruiter', desc: 'Post jobs and view AI-matched candidates' },
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
  const navigate = useNavigate(); // ✅ ADD THIS

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

      
        setTimeout(() => {
          navigate('/login');  
        }, 1500);

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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />

            <button type="submit">
              {loading ? <Spinner /> : 'Create account'}
            </button>
          </form>
        </div>

        <Link to="/login">Go to Login</Link>
      </div>
    </div>
  );
}
