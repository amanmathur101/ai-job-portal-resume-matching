import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllJobs, getCandidatesForJob, downloadResumeFile } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner, { PageSpinner } from '../components/Spinner';

function ScoreBadge({ score }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? 'bg-green-100 text-green-700 border-green-200'
    : pct >= 60 ? 'bg-blue-100 text-blue-700 border-blue-200'
    : pct >= 40 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-gray-100 text-gray-500 border-gray-200';

  return (
    <div className={`inline-flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 ${color} shrink-0`}>
      <span className="text-lg font-bold leading-none">{pct}</span>
      <span className="text-[9px] uppercase tracking-wide leading-none mt-0.5">match</span>
    </div>
  );
}

function SkillTag({ skill }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                     bg-blue-50 text-blue-700 border border-blue-100">
      {skill}
    </span>
  );
}

function CandidateCard({ candidate, rank, jobId }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useToast();

  const skills = candidate.extractedSkills
    ? candidate.extractedSkills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const handleDownload = async () => {
    if (!candidate.resumeId) return;
    setDownloading(true);
    try {
      const res = await downloadResumeFile(candidate.resumeId);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = candidate.resumeFileName || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Error downloading resume.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Rank + avatar */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold text-gray-400">#{rank}</span>
          {candidate.candidateImageUrl ? (
            <img src={candidate.candidateImageUrl} alt="profile" className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-200" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold uppercase text-sm shrink-0 shadow-sm border border-purple-200">
              {candidate.candidateName?.[0] || '?'}
            </div>
          )}
        </div>

         {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{candidate.candidateName}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{candidate.candidateEmail}</p>
            </div>
            <ScoreBadge score={candidate.matchScore} />
          </div>

          {/* Skills preview */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {skills.slice(0, 5).map((s, i) => <SkillTag key={i} skill={s} />)}
              {skills.length > 5 && (
                <span className="text-xs text-gray-400 self-center">+{skills.length - 5} more</span>
              )}
            </div>
          )}

           {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => setOpen(o => !o)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              {open ? 'Hide details' : 'View details'}
              <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="text-xs text-gray-700 hover:text-blue-600 flex items-center gap-1.5 font-medium border border-gray-200 hover:border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
            >
              {downloading ? (
                 <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span> Downloading...</span>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Resume
                </>
              )}
            </button>
          </div>

          {open && (
            <div className="mt-4 space-y-4 pt-4 border-t border-gray-100">
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                  Candidate Details
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-3 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Email</p>
                    <p className="text-sm font-medium text-gray-800 break-all">{candidate.candidateEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Phone</p>
                    <p className="text-sm font-medium text-gray-800">{candidate.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Location</p>
                    <p className="text-sm font-medium text-gray-800">{candidate.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Notice Period</p>
                    <p className="text-sm font-medium text-gray-800">{candidate.noticePeriod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Current CTC</p>
                    <p className="text-sm font-medium text-gray-800">{candidate.currentCtc ? `${candidate.currentCtc}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Expected CTC</p>
                    <p className="text-sm font-medium text-gray-800">{candidate.expectedCtc ? `${candidate.expectedCtc}` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {candidate.aiSummary && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">AI Summary</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{candidate.aiSummary}</p>
                </div>
              )}
              {candidate.matchReason && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Match Analysis</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{candidate.matchReason}</p>
                </div>
              )}
              {skills.length > 5 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">All Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((s, i) => <SkillTag key={i} skill={s} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CandidateMatchingPage() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [matching, setMatching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllJobs();
        if (res.ok) setJobs(await res.json());
        else showToast('Failed to load job positions.', 'error');
      } catch {
        showToast('Network error loading jobs.', 'error');
      } finally {
        setJobsLoading(false);
      }
    })();
  }, [showToast]);

  async function handleMatch() {
    if (!selectedJob) { showToast('Please select a job position.', 'error'); return; }
    setMatching(true);
    setCandidates([]);
    try {
      const res = await getCandidatesForJob(selectedJob);
      if (res.ok) {
        const data = await res.json();
        
        // API response already includes mobile, location, ctc etc.
        const uniqueCandidates = [];
        const seen = new Set();
        for (const c of data) {
           const uniqueKey = `${c.candidateEmail}-${c.mobile || ''}`;
           if (!seen.has(uniqueKey)) {
             seen.add(uniqueKey);
             uniqueCandidates.push(c);
           }
        }

        setCandidates(uniqueCandidates);
        setHasSearched(true);
        if (uniqueCandidates.length === 0) showToast('No candidates found for this position.', 'info');
      } else {
        showToast('Failed to fetch candidates.', 'error');
      }
    } catch {
      showToast('An error occurred while fetching candidates.', 'error');
    } finally {
      setMatching(false);
    }
  }

  const selectedJobObj = jobs.find(j => String(j.postId) === String(selectedJob));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">AI Candidate Matching</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select a job position to see AI-ranked candidates based on resume analysis.
        </p>
      </div>

      {/* Selector card */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Select a job position</h2>
        {jobsLoading ? (
          <Spinner className="py-4" />
        ) : (
          <div className="flex gap-3 flex-col sm:flex-row">
            <select
              value={selectedJob}
              onChange={e => { setSelectedJob(e.target.value); setHasSearched(false); setCandidates([]); }}
              className="input-field flex-1"
            >
              <option value="">Choose a position…</option>
              {jobs.map(j => (
                <option key={j.postId} value={j.postId}>
                  {j.postProfile} — {j.reqExperience} yr exp (ID: {j.postId})
                </option>
              ))}
            </select>
            <button
              onClick={handleMatch}
              disabled={!selectedJob || matching}
              className="btn-primary flex items-center justify-center gap-2 sm:w-48"
            >
              {matching ? (
                <><Spinner size="sm" />Analyzing…</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                  </svg>
                  Find Matches
                </>
              )}
            </button>
          </div>
        )}

        {/* Selected job summary */}
        {selectedJobObj && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm space-y-1">
            <p className="font-medium text-gray-800">{selectedJobObj.postProfile}</p>
            <p className="text-gray-500 text-xs line-clamp-2">{selectedJobObj.postDesc}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {selectedJobObj.postTechStack?.map((t, i) => (
                <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs border border-blue-100">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {matching && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <Spinner size="lg" />
          <p className="text-sm">Analyzing candidates with AI…</p>
        </div>
      )}

      {!matching && hasSearched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Ranked Candidates
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({candidates.length} found)
              </span>
            </h2>
            {candidates.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300" /> ≥80%
                <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300" /> ≥60%
                <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300" /> ≥40%
              </div>
            )}
          </div>

          {candidates.length === 0 ? (
            <div className="card flex flex-col items-center py-16 gap-3 text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">No candidates yet</p>
                <p className="text-xs mt-0.5">Candidates appear once they upload their resumes.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((c, i) => (
                <CandidateCard key={c.resumeId} candidate={c} rank={i + 1} jobId={selectedJob} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
