import { useState } from 'react';
import { deleteJob } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import JobApplicationModal from './JobApplicationModal';

function StackBadge({ tech }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                     bg-blue-50 text-blue-700 border border-blue-100">
      {tech}
    </span>
  );
}

export default function JobCard({ job, onDeleted, isApplied, onApply }) {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${job.postProfile}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await deleteJob(job.postId);
      if (res.ok || res.status === 204) {
        showToast('Job deleted successfully.', 'success');
        onDeleted?.(job.postId);
      } else {
        showToast('Failed to delete job.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{job.postProfile}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-500">{job.reqExperience} yr{job.reqExperience !== 1 ? 's' : ''} exp.</span>
          </div>
        </div>
        <span className="shrink-0 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
          #{job.postId}
        </span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{job.postDesc}</p>

      <div className="flex flex-wrap gap-1.5">
        {Array.isArray(job.postTechStack) && job.postTechStack.map((tech, i) => (
          <StackBadge key={i} tech={tech} />
        ))}
      </div>

      {hasRole('ADMIN') && (
        <div className="mt-auto pt-3 border-t border-gray-50">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger text-xs px-3 py-1.5 w-full"
          >
            {deleting ? 'Deleting…' : 'Delete job'}
          </button>
        </div>
      )}

      {hasRole('USER') && (
        <div className="mt-auto pt-3 border-t border-gray-50 flex gap-2">
          {isApplied ? (
            <button disabled className="btn-secondary text-xs px-3 py-1.5 w-full bg-green-50 text-green-700 border-green-200 opacity-100 cursor-default flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Applied
            </button>
          ) : (
              <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary text-xs px-3 py-1.5 w-full"
            >
              Apply Now
            </button>
          )}
        </div>
      )}

      <JobApplicationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={job}
        onApplySuccess={() => onApply?.()}
      />
    </div>
  );
}
