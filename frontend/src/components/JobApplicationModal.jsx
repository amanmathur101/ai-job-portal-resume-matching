import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { uploadResume, applyToJob } from '../services/api';
import Spinner from './Spinner';

export default function JobApplicationModal({ isOpen, onClose, job, onApplySuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.username || '',
    email: user?.email || '',
    mobile: '',
    location: '',
    noticePeriod: 'Immediate',
    currentCtc: '',
    expectedCtc: '',
    skills: '',
    declaration: false,
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showToast('Profile image must be JPG or PNG', 'error');
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      showToast('Please upload your resume (PDF).', 'error');
      return;
    }
    if (!formData.declaration) {
      showToast('You must confirm the declaration.', 'error');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Resume
      const resFormData = new FormData();
      resFormData.append('file', resumeFile);
      const resUpload = await uploadResume(resFormData);
      
      if (!resUpload.ok) {
        throw new Error('Failed to upload resume. Please try again.');
      }

      // 2. Prepare payload and Apply to Job API
      const imageBase64 = await fileToBase64(profileImage);
      const extraDetails = {
        ...formData,
        profileImageBase64: imageBase64
      };

      const resApply = await applyToJob(job.postId, extraDetails);
      if (!resApply.ok) {
        const body = await resApply.json().catch(() => ({}));
        if (body.error && body.error.includes("Already applied")) {
           throw new Error(body.error);
        }
        throw new Error('Failed to apply to the job backend.');
      }

      showToast('Application submitted successfully!', 'success');
      onApplySuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'An error occurred during application.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply for {job.postProfile}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Please provide your details below</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="applyForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Image Preview */}
              <div className="flex flex-col items-center space-y-3 sm:w-1/3">
                <div 
                  className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors group relative"
                  onClick={() => imageInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-1 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-500 font-medium">Upload Photo</span>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">Change</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={imageInputRef} 
                  onChange={handleImageChange}
                  accept="image/jpeg, image/png" 
                  className="hidden" 
                />
                <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider font-semibold">JPG/PNG only</p>
              </div>

              {/* Basic Details */}
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" className="input-field" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal ml-1">(Cannot be changed)</span></label>
                  <input readOnly disabled value={formData.email} type="email" className="input-field bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input required name="mobile" value={formData.mobile} onChange={handleInputChange} type="tel" className="input-field" placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                <input required name="location" value={formData.location} onChange={handleInputChange} type="text" className="input-field" placeholder="City, Country" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
                <select name="noticePeriod" value={formData.noticePeriod} onChange={handleInputChange} className="input-field">
                  <option value="Immediate">Immediate</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90+ Days">90+ Days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
                <input name="skills" value={formData.skills} onChange={handleInputChange} type="text" className="input-field" placeholder="React, Node.js, AWS" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current CTC</label>
                <input name="currentCtc" value={formData.currentCtc} onChange={handleInputChange} type="text" className="input-field" placeholder="e.g. $80,000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected CTC</label>
                <input name="expectedCtc" value={formData.expectedCtc} onChange={handleInputChange} type="text" className="input-field" placeholder="e.g. $100,000" />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
               <label className="block text-sm font-medium text-gray-700 mb-2">Resume Document (PDF)</label>
               <div 
                 className={`border-2 border-dashed rounded-xl p-6 text-center ${resumeFile ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-gray-300'} transition-colors cursor-pointer`}
                 onClick={() => fileInputRef.current?.click()}
               >
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={(e) => setResumeFile(e.target.files[0])}
                   accept="application/pdf" 
                   className="hidden" 
                   required
                 />
                 {resumeFile ? (
                   <div className="flex flex-col items-center space-y-2">
                     <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                     <div>
                       <p className="text-sm font-medium text-blue-700">{resumeFile.name}</p>
                       <p className="text-xs text-blue-500 mt-0.5">Click to change file</p>
                     </div>
                   </div>
                 ) : (
                    <div className="space-y-2">
                      <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Click to upload your resume</p>
                        <p className="text-xs text-gray-400 mt-1">Only PDF format is supported and required.</p>
                      </div>
                    </div>
                 )}
               </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center h-5 mt-0.5">
                  <input 
                    type="checkbox" 
                    name="declaration"
                    required
                    checked={formData.declaration} 
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer"
                  />
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900 block mb-0.5">Applicant Declaration</span>
                  <p className="text-gray-500 text-xs">I confirm that all the information provided above is correct and true to the best of my knowledge.</p>
                </div>
              </label>
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            form="applyForm"
            type="submit"
            disabled={loading}
            className="btn-primary min-w-[120px] shadow-sm flex items-center justify-center gap-2 py-2.5 cursor-pointer"
          >
            {loading ? (
              <><Spinner size="sm" color="text-white" /> Submitting...</>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
