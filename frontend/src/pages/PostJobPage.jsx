import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postJob } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const SUGGESTED_STACKS = [
  ['Java', 'Spring Boot', 'PostgreSQL'],
  ['React', 'TypeScript', 'Node.js'],
  ['Python', 'Django', 'PostgreSQL'],
  ['Go', 'Docker', 'Kubernetes'],
];

export default function PostJobPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    experience: '',
    stack: '',
  });
  const [errors, setErrors] = useState({});

  function set(field) {
    return e => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
    };
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Job title is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (form.experience === '' || isNaN(Number(form.experience)) || Number(form.experience) < 0)
      e.experience = 'Enter a valid experience (0 or more years).';
    if (!form.stack.trim()) e.stack = 'At least one technology is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function addSuggestion(tag) {
    const current = form.stack.split(',').map(s => s.trim()).filter(Boolean);
    if (!current.includes(tag)) {
      setForm(f => ({
        ...f,
        stack: current.length ? current.join(', ') + ', ' + tag : tag,
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      postProfile: form.title.trim(),
      postDesc: form.description.trim(),
      reqExperience: parseInt(form.experience, 10),
      postTechStack: form.stack.split(',').map(s => s.trim()).filter(Boolean),
    };

    setLoading(true);
    try {
      const res = await postJob(payload);
      if (res.status === 201) {
        showToast('Job posted successfully!', 'success');
        setTimeout(() => navigate('/jobs'), 1200);
      } else {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || 'Failed to post job.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to jobs
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post a new job</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details and publish to find great candidates.</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label htmlFor="title" className="label">
              Job title <span className="text-red-500">*</span>
            </label>
            <input
              id="title" type="text" value={form.title} onChange={set('title')}
              placeholder="e.g. Senior Backend Engineer"
              className={`input-field ${errors.title ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Job description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description" rows={5} value={form.description} onChange={set('description')}
              placeholder="Describe the role, responsibilities, and what you're looking for…"
              className={`input-field resize-none ${errors.description ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Experience */}
          <div>
            <label htmlFor="experience" className="label">
              Required experience (years) <span className="text-red-500">*</span>
            </label>
            <input
              id="experience" type="number" min="0" max="30" value={form.experience}
              onChange={set('experience')}
              placeholder="e.g. 3"
              className={`input-field w-32 ${errors.experience ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            />
            {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
          </div>

          {/* Tech stack */}
          <div>
            <label htmlFor="stack" className="label">
              Tech stack <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(comma-separated)</span>
            </label>
            <input
              id="stack" type="text" value={form.stack} onChange={set('stack')}
              placeholder="e.g. Java, Spring Boot, PostgreSQL, Docker"
              className={`input-field ${errors.stack ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            />
            {errors.stack && <p className="text-xs text-red-500 mt-1">{errors.stack}</p>}

            {/* Quick-add chips */}
            <div className="mt-2.5 space-y-2">
              <p className="text-xs text-gray-400">Quick add:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_STACKS.flat().map(tag => (
                  <button
                    key={tag} type="button"
                    onClick={() => addSuggestion(tag)}
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600
                               hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {(form.title || form.stack) && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm space-y-1">
              <p className="font-medium text-gray-700">{form.title || 'Job title'}</p>
              {form.experience !== '' && (
                <p className="text-gray-500">{form.experience} yr{form.experience !== '1' ? 's' : ''} experience</p>
              )}
              <div className="flex flex-wrap gap-1 mt-1">
                {form.stack.split(',').map(s => s.trim()).filter(Boolean).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
              {loading ? <><Spinner size="sm" />Publishing…</> : 'Publish job'}
            </button>
            <Link to="/jobs" className="btn-secondary py-3 px-6">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
