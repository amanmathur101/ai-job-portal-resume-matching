// All endpoints match the existing backend exactly — do not modify.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081';

function getToken() {
  return localStorage.getItem('jwt');
}

function authHeaders(isFormData = false) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
}

async function request(method, path, body = null, isFormData = false) {
  const options = {
    method,
    headers: authHeaders(isFormData),
  };
  if (body) options.body = isFormData ? body : JSON.stringify(body);
  return fetch(`${API_BASE}${path}`, options);
}

// ── Auth ─────────────────────────────────────────────────────────────────────
// POST /api/users/register  — body: { username, email, password, role }
export const registerUser = (username, email, password, role) =>
  request('POST', '/api/users/register', { username, email, password, role });

// POST /api/users/login  — body: { username, password }
// LoginDto accepts both email and username fields; sending email is cleanest.
export const loginUser = (email, password) =>
  request('POST', '/api/users/login', { username: email, password });

// ── Jobs ─────────────────────────────────────────────────────────────────────
// GET  /api/jobs/all                    — public
export const getAllJobs = () => request('GET', '/api/jobs/all');

// GET  /api/jobs/post/{id}              — authenticated
export const getJob = (id) => request('GET', `/api/jobs/post/${id}`);

// POST /api/jobs/post                   — RECRUITER or ADMIN
// body: { postProfile, postDesc, reqExperience, postTechStack[] }
export const postJob = (data) => request('POST', '/api/jobs/post', data);

// PUT  /api/jobs/post                   — ADMIN
export const updateJob = (data) => request('PUT', '/api/jobs/post', data);

// DELETE /api/jobs/post/{id}            — ADMIN
export const deleteJob = (id) => request('DELETE', `/api/jobs/post/${id}`);

// GET  /api/jobs/load                   — ADMIN (seed data)
export const loadJobs = () => request('GET', '/api/jobs/load');

// POST /api/jobs/{jobId}/apply          — USER
export const applyToJob = (jobId, details = null) => request('POST', `/api/jobs/${jobId}/apply`, details);

// GET /api/jobs/applied                 — USER
export const getAppliedJobs = () => request('GET', '/api/jobs/applied');

// ── Resumes ───────────────────────────────────────────────────────────────────
// POST /api/resumes/upload              — authenticated, multipart/form-data
export const uploadResume = (formData) =>
  request('POST', '/api/resumes/upload', formData, true);

// GET  /api/resumes/my-summary          — authenticated
export const getMyResumeSummary = () => request('GET', '/api/resumes/my-summary');

// GET  /api/resumes/jobs/{jobId}/candidates  — RECRUITER or ADMIN
export const getCandidatesForJob = (jobId) =>
  request('GET', `/api/resumes/jobs/${jobId}/candidates`);

// GET /api/resumes/{resumeId}/download      — RECRUITER or ADMIN
export const downloadResumeFile = async (resumeId) => {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API_BASE}/api/resumes/${resumeId}/download`, {
    method: 'GET',
    headers
  });
};
