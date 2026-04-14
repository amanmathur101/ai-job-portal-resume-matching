import { useState, useEffect, useCallback } from 'react';
import { getMyResumeSummary } from '../services/api';
import Spinner from './Spinner';
import ResumeUpload from './ResumeUpload';

function SkillBadge({ skill }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                     bg-green-50 text-green-700 border border-green-100">
      {skill}
    </span>
  );
}

function InfoBox({ color, icon, title, children }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-100',  title: 'text-blue-700'   },
    green:  { bg: 'bg-green-50',  border: 'border-green-100', title: 'text-green-700'  },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100',title: 'text-purple-700' },
    yellow: { bg: 'bg-amber-50',  border: 'border-amber-100', title: 'text-amber-700'  },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`rounded-xl p-4 border ${c.bg} ${c.border}`}>
      <h4 className={`text-sm font-semibold ${c.title} mb-2 flex items-center gap-1.5`}>
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}

export default function ResumeSummary({ refreshTrigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyResumeSummary();
      if (res.ok) {
        const json = await res.json();
        setData(json.success && json.aiSummary ? json : null);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshTrigger]);

  function handleUploaded() {
    setShowUpload(false);
    setTimeout(load, 1000);
  }

  return (
    <div className="card p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Your Resume Summary
        </h3>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary text-xs flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setShowUpload(o => !o)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {showUpload ? 'Hide Upload' : 'Upload Resume'}
          </button>
        </div>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <ResumeUpload onUploaded={handleUploaded} />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Spinner className="py-8" />
      ) : data ? (
        <div className="space-y-4">
          <InfoBox color="blue"
            icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
            title="AI Analysis Summary"
          >
            <p className="text-sm text-gray-700 leading-relaxed">{data.aiSummary}</p>
          </InfoBox>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoBox color="green"
              icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
              title="Extracted Skills"
            >
              <div className="flex flex-wrap gap-1.5">
                {data.extractedSkills
                  ? data.extractedSkills.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                      <SkillBadge key={i} skill={s} />
                    ))
                  : <span className="text-xs text-gray-400">No skills extracted</span>
                }
              </div>
            </InfoBox>

            <InfoBox color="purple"
              icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>}
              title="Experience"
            >
              <p className="text-sm text-gray-700">{data.experience || 'Not available'}</p>
            </InfoBox>
          </div>

          <InfoBox color="yellow"
            icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" /></svg>}
            title="Education"
          >
            <p className="text-sm text-gray-700">{data.education || 'Not available'}</p>
          </InfoBox>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">No resume uploaded yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Upload your resume to get AI-powered analysis</p>
          </div>
        </div>
      )}
    </div>
  );
}
