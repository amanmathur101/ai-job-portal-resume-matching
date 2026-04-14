import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllJobs, getAppliedJobs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import JobCard from '../components/JobCard';
import ResumeSummary from '../components/ResumeSummary';
import { PageSpinner } from '../components/Spinner';

export default function JobsPage() {
  const { user, hasRole } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resumeRefresh, setResumeRefresh] = useState(0);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllJobs();
      if (res.ok) {
        setJobs(await res.json());
      } else {
        showToast('Failed to load jobs.', 'error');
      }

      if (hasRole('USER')) {
        const appRes = await getAppliedJobs();
        if (appRes.ok) {
          const appliedArr = await appRes.json();
          setAppliedJobs(new Set(appliedArr));
        }
      }
    } catch {
      showToast('Network error loading jobs.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    return (
      j.postProfile?.toLowerCase().includes(q) ||
      j.postDesc?.toLowerCase().includes(q) ||
      j.postTechStack?.some(t => t.toLowerCase().includes(q))
    );
  });

  function handleDeleted(id) {
    setJobs(prev => prev.filter(j => j.postId !== id));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Welcome banner */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, <span className="text-blue-600">{user?.username}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {hasRole('RECRUITER', 'ADMIN')
              ? 'Manage your job postings and find the best candidates.'
              : 'Explore opportunities and showcase your skills.'}
          </p>
        </div>
        {hasRole('RECRUITER', 'ADMIN') && (
          <Link to="/post-job" className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post a Job
          </Link>
        )}
      </div>

      {/* Resume section */}
      <ResumeSummary refreshTrigger={resumeRefresh} />

      {/* Jobs section */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            All Job Listings
            {!loading && (
              <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
            )}
          </h2>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search jobs, skills…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>

        {loading ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                {search ? `No jobs match "${search}"` : 'No job listings yet'}
              </p>
              {!search && hasRole('RECRUITER', 'ADMIN') && (
                <Link to="/post-job" className="text-xs text-blue-600 mt-1 inline-block hover:underline">
                  Post the first one →
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(job => (
              <JobCard 
                key={job.postId} 
                job={job} 
                onDeleted={handleDeleted} 
                isApplied={appliedJobs.has(job.postId)}
                onApply={() => setAppliedJobs(prev => {
                  const newSet = new Set(prev);
                  newSet.add(job.postId);
                  return newSet;
                })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
