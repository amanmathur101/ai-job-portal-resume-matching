import { useState, useRef } from 'react';
import { uploadResume } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from './Spinner';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB (frontend limit; backend enforces 5 MB)

export default function ResumeUpload({ onUploaded }) {
  const { showToast } = useToast();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  function validateAndSet(f) {
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      showToast('Only PDF and DOCX files are supported.', 'error');
      return;
    }
    if (f.size > MAX_BYTES) {
      showToast('File must be smaller than 10 MB.', 'error');
      return;
    }
    setFile(f);
  }

  function onInputChange(e) {
    validateAndSet(e.target.files?.[0]);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadResume(fd);

      if (res.ok) {
        const data = await res.json();
        showToast('Resume uploaded and parsed successfully!', 'success');
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
        onUploaded?.(data);
      } else {
        const text = await res.text();
        showToast(`Upload failed: ${text || res.statusText}`, 'error');
      }
    } catch (err) {
      showToast(`Upload error: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed
                    rounded-xl p-8 cursor-pointer transition-colors text-center
                    ${dragging
                      ? 'border-blue-400 bg-blue-50'
                      : file
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                    }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="sr-only"
          onChange={onInputChange}
        />

        {file ? (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-700">{file.name}</p>
              <p className="text-xs text-green-600 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setFile(null); if (inputRef.current) inputRef.current.value = ''; }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                <span className="text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PDF or DOCX up to 10 MB</p>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn-primary flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Spinner size="sm" className="w-4 h-4" />
              Uploading…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload & Parse
            </>
          )}
        </button>
      </div>
    </div>
  );
}
