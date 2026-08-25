import React, { useState, useEffect, useRef } from 'react';
import { CandidateProfile, DocumentClassification, CandidateProject } from '../../types';
import { ArrowRight, UploadCloud, FileText, Check, AlertCircle, X, Loader2, Info, FolderGit2, ChevronDown } from 'lucide-react';

interface CandidateProfileScreenProps {
  profile: CandidateProfile;
  onUpdateProfile: (profile: CandidateProfile) => void;
  onContinue: (savedProfile?: CandidateProfile) => void;
}

type AnalysisProgressState =
  | 'idle'
  | 'analyzing'
  | 'extracting'
  | 'complete'
  | 'partial'
  | 'unrecognized'
  | 'unreadable';

const COMMON_SUPPORT_OPTIONS = [
  'Screen Reader Support',
  'Accessible Documentation / Text Formats',
  'Flexible Hours & Async Collaboration',
  'Remote / Hybrid Setup',
  'Assistive Keyboard / Input Tools',
  'Captions & Transcripts',
  'Low-Distraction Focus Environment',
];

export const CandidateProfileScreen: React.FC<CandidateProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  onContinue,
}) => {
  const [formData, setFormData] = useState<CandidateProfile>(profile);
  const [skillInput, setSkillInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisProgressState>(
    profile.resumeFileName ? 'complete' : 'idle'
  );
  const [unrecognizedInfo, setUnrecognizedInfo] = useState<{
    title: string;
    message: string;
    subMessage?: string;
  } | null>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // Click outside to close role dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field: keyof CandidateProfile, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdateProfile(updated);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      const updated = { ...formData, skills: [...formData.skills, trimmed] };
      setFormData(updated);
      onUpdateProfile(updated);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = {
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    };
    setFormData(updated);
    onUpdateProfile(updated);
  };

  const handleToggleSupport = (supportOption: string) => {
    const current = formData.supportNeeds || [];
    const exists = current.includes(supportOption);
    const next = exists
      ? current.filter((s) => s !== supportOption)
      : [...current, supportOption];
    handleChange('supportNeeds', next);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    // Step 1: Start analysis
    setAnalysisState('analyzing');
    setErrorMessage(null);
    setUnrecognizedInfo(null);

    try {
      // Read file content
      const reader = new FileReader();
      const isTextFile = file.name.endsWith('.txt') || file.type.includes('text');

      reader.onload = async () => {
        let fileText = '';
        let base64Data = '';

        if (isTextFile) {
          fileText = (reader.result as string) || '';
          try {
            base64Data = btoa(unescape(encodeURIComponent(fileText)));
          } catch {
            base64Data = '';
          }
        } else {
          const dataUrl = reader.result as string;
          base64Data = dataUrl.split(',')[1] || '';
        }

        // Step 2: Transition to extracting
        setAnalysisState('extracting');

        try {
          const res = await fetch('/api/ai/analyze-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileText,
              base64Data,
              mimeType: file.type || 'application/pdf',
            }),
          });

          if (res.ok) {
            const data = await res.json();

            // Case A: Unreadable, Empty, or Corrupt Document
            if (!data.isReadable || data.extractionStatus === 'unreadable') {
              setAnalysisState('unreadable');
              setUnrecognizedInfo({
                title: data.title || 'Unable to Read Document',
                message:
                  data.message ||
                  "We couldn't read this document. Please upload a clear, readable PDF, DOCX, PPTX, or TXT file.",
              });
              return;
            }

            // Case B: Readable but Not a Resume (e.g. syllabus, invoice, unrelated)
            if (!data.isResume || data.extractionStatus === 'unrecognized') {
              setAnalysisState('unrecognized');
              setUnrecognizedInfo({
                title: data.title || 'Not a Resume or CV',
                message:
                  data.message ||
                  'This document does not appear to be a resume or CV. Please upload a valid resume.',
              });
              return;
            }

            // Case C: Valid Resume (Complete or Partial)
            const extracted = data.extractedCandidate;
            const isPartial = data.extractionStatus === 'partial';

            const suggestedRoles: string[] = Array.isArray(extracted?.suggestedJobRoles) && extracted.suggestedJobRoles.length > 0
              ? extracted.suggestedJobRoles.filter((r: any) => typeof r === 'string' && r.trim() && r.toLowerCase() !== 'null')
              : (extracted?.targetJobRole && extracted.targetJobRole.toLowerCase() !== 'null' ? [extracted.targetJobRole] : []);

            const selectedRole =
              (extracted?.targetJobRole && extracted.targetJobRole.toLowerCase() !== 'null' ? extracted.targetJobRole : '') ||
              (extracted?.preferredJobRole && extracted.preferredJobRole.toLowerCase() !== 'null' ? extracted.preferredJobRole : '') ||
              suggestedRoles[0] ||
              '';

            const updated: CandidateProfile = {
              ...formData,
              resumeFileName: file.name,
              resumeFileBase64: base64Data,
              resumeFileMimeType: file.type || (isTextFile ? 'text/plain' : 'application/pdf'),
              name: extracted?.fullName || extracted?.name || '',
              education: extracted?.education || '',
              experience: extracted?.experience || '',
              isFresher: extracted?.isFresher,
              preferredJobRole: selectedRole,
              suggestedJobRole: selectedRole,
              suggestedJobRoles: suggestedRoles,
              skills: Array.isArray(extracted?.skills) ? extracted.skills : [],
              projects: Array.isArray(extracted?.projects) ? extracted.projects : [],
              structuredProjects: Array.isArray(extracted?.structuredProjects)
                ? extracted.structuredProjects
                : [],
              certifications: Array.isArray(extracted?.certifications)
                ? extracted.certifications
                : [],
              documentClassification: data.documentClassification,
              atsScore: data.atsScore,
            };

            setFormData(updated);
            onUpdateProfile(updated);
            setAnalysisState(isPartial ? 'partial' : 'complete');
          } else {
            setAnalysisState('unreadable');
            setUnrecognizedInfo({
              title: 'Unable to Read Document',
              message:
                "We couldn't read this document. Please upload a clear, readable PDF, DOCX, PPTX, or TXT file.",
            });
          }
        } catch (apiErr) {
          console.error('Document analysis error:', apiErr);
          setAnalysisState('unreadable');
          setUnrecognizedInfo({
            title: 'Unable to Read Document',
            message:
              "We couldn't read this document. Please upload a clear, readable PDF, DOCX, PPTX, or TXT file.",
          });
        }
      };

      if (isTextFile) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('File reading failed:', err);
      setAnalysisState('unreadable');
      setUnrecognizedInfo({
        title: 'Unable to Read Document',
        message:
          "We couldn't read this document. Please upload a clear, readable PDF, DOCX, PPTX, or TXT file.",
      });
    }
  };

  const handleRemoveResume = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated: CandidateProfile = {
      ...formData,
      resumeFileName: '',
      resumeFileBase64: undefined,
      resumeFileMimeType: undefined,
      resumeFilePath: undefined,
      resumeStorageUrl: undefined,
      atsScore: undefined,
      projectRelevanceScore: undefined,
      documentClassification: undefined,
    };
    setFormData(updated);
    onUpdateProfile(updated);
    setAnalysisState('idle');
    setUnrecognizedInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.education.trim() ||
      !formData.experience.trim() ||
      !formData.preferredJobRole.trim()
    ) {
      setErrorMessage('Please complete the required fields before continuing.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch('/api/candidates/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: formData.candidateId || formData.id,
          full_name: formData.name.trim(),
          education: formData.education.trim(),
          experience: formData.experience.trim(),
          skills: formData.skills || [],
          projects:
            formData.projects && formData.projects.length > 0
              ? formData.projects
              : (formData.structuredProjects || [])
                  .map((p) => (typeof p === 'string' ? p : p.title))
                  .filter(Boolean),
          certifications: formData.certifications || [],
          target_job_role: formData.preferredJobRole.trim(),
          resumeFile: formData.resumeFileBase64
            ? {
                fileName: formData.resumeFileName,
                base64Data: formData.resumeFileBase64,
                mimeType: formData.resumeFileMimeType || 'application/pdf',
              }
            : undefined,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        console.error('[Supabase Save Error]', result?.details || result?.error || response.statusText);
        setErrorMessage("We couldn't save your profile. Please try again.");
        setIsSaving(false);
        return;
      }

      console.log('[Supabase Save Success] Candidate saved with id:', result.candidateId);

      const savedProfile: CandidateProfile = {
        ...formData,
        id: result.candidateId,
        candidateId: result.candidateId,
        resumeFilePath: result.resumeFilePath || formData.resumeFilePath,
        resumeStorageUrl: result.resumeStorageUrl || formData.resumeStorageUrl,
      };

      setFormData(savedProfile);
      onUpdateProfile(savedProfile);
      setIsSaving(false);
      onContinue(savedProfile);
    } catch (err) {
      console.error('[Supabase Save Technical Error]', err);
      setErrorMessage("We couldn't save your profile. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <div id="candidate-profile-screen" className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h2 id="profile-screen-title" className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Candidate Profile
        </h2>
        <p className="text-stone-600 text-sm mt-1">
          Upload your resume to automatically extract your background, technical skills, and projects, or enter your details manually.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Document Upload & Intelligent Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Upload Resume / CV
            </h3>
            <span className="text-[11px] text-stone-400">PDF, DOC, DOCX, PPT, TXT</span>
          </div>

          <label
            htmlFor="resume-upload-input"
            className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              analysisState === 'analyzing' || analysisState === 'extracting'
                ? 'border-stone-400 bg-stone-50'
                : formData.resumeFileName
                ? 'border-stone-300 bg-stone-50/60'
                : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
            }`}
          >
            <input
              id="resume-upload-input"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={analysisState === 'analyzing' || analysisState === 'extracting'}
            />

            {/* Analysis Progress States */}
            {analysisState === 'analyzing' ? (
              <div className="flex items-center gap-3 text-stone-700 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-stone-900" />
                <span className="text-sm font-medium">Analyzing resume...</span>
              </div>
            ) : analysisState === 'extracting' ? (
              <div className="flex items-center gap-3 text-stone-700 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-stone-900" />
                <span className="text-sm font-medium">Extracting candidate information...</span>
              </div>
            ) : formData.resumeFileName && (analysisState === 'complete' || analysisState === 'partial') ? (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-900 truncate">
                    <FileText className="w-4 h-4 text-stone-700 shrink-0" />
                    <span className="text-sm font-medium truncate">{formData.resumeFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-stone-200/50 cursor-pointer"
                    title="Remove resume"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* State Banner: Complete or Partial */}
                {analysisState === 'complete' ? (
                  <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-950">Profile extracted ✓</p>
                      <p className="text-emerald-800 text-[11.5px] mt-0.5">
                        Candidate information was successfully extracted from your resume. Review and edit the fields below if needed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-950">Profile partially extracted</p>
                      <p className="text-amber-800 text-[11.5px] mt-0.5">
                        We filled the information we could identify from your resume. Please review and complete any missing details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-1 py-3 text-stone-500">
                <UploadCloud className="w-6 h-6 mx-auto text-stone-400" />
                <p className="text-sm font-medium text-stone-800">Upload your resume</p>
                <p className="text-xs text-stone-400">PDF, DOCX, PPTX, or TXT</p>
              </div>
            )}
          </label>

          {/* Alert State: Unrecognized Document */}
          {analysisState === 'unrecognized' && unrecognizedInfo && (
            <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-950">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <h4 className="font-bold text-amber-950 text-sm">{unrecognizedInfo.title}</h4>
              </div>
              <p className="text-amber-800 text-xs leading-relaxed">
                {unrecognizedInfo.message}
              </p>
              {unrecognizedInfo.subMessage && (
                <p className="text-amber-700 text-[11.5px] leading-relaxed">
                  {unrecognizedInfo.subMessage}
                </p>
              )}
            </div>
          )}

          {/* Alert State: Unreadable Document */}
          {analysisState === 'unreadable' && unrecognizedInfo && (
            <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-xl space-y-1.5 text-xs text-rose-950">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <h4 className="font-bold text-rose-950 text-sm">{unrecognizedInfo.title}</h4>
              </div>
              <p className="text-rose-800 text-xs leading-relaxed">
                {unrecognizedInfo.message}
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
          <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-candidate-name" className="block text-xs font-medium text-stone-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-candidate-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
            <div>
              <label htmlFor="input-candidate-education" className="block text-xs font-medium text-stone-700 mb-1.5">
                Education <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-candidate-education"
                type="text"
                value={formData.education}
                onChange={(e) => handleChange('education', e.target.value)}
                placeholder="e.g. B.Tech Computer Science, BCA, B.Sc"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-candidate-experience" className="block text-xs font-medium text-stone-700 mb-1.5">
                Experience <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-candidate-experience"
                type="text"
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                placeholder="e.g. Software Developer Intern — 6 months, Fresher"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-candidate-role" className="block text-xs font-medium text-stone-700">
                  Target Job Role <span className="text-rose-500">*</span>
                </label>
                {formData.suggestedJobRoles && formData.suggestedJobRoles.length > 0 && (
                  <span className="text-[11px] text-stone-500 font-medium">
                    {formData.suggestedJobRoles.length} resume-matched {formData.suggestedJobRoles.length === 1 ? 'role' : 'roles'}
                  </span>
                )}
              </div>
              <div ref={roleDropdownRef} className="relative">
                <input
                  id="input-candidate-role"
                  type="text"
                  value={formData.preferredJobRole}
                  onChange={(e) => handleChange('preferredJobRole', e.target.value)}
                  placeholder="e.g. Data Analyst, Full Stack Developer..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 placeholder:text-stone-400 [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <button
                  type="button"
                  id="btn-toggle-role-dropdown"
                  onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
                  title="Show suggested job roles"
                  aria-label="Toggle suggested job roles dropdown"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-150 ${
                      isRoleDropdownOpen ? 'rotate-180 text-stone-800' : ''
                    }`}
                  />
                </button>

                {/* Interactive Dynamic Dropdown Menu */}
                {isRoleDropdownOpen && (
                  <div
                    id="role-suggestions-dropdown"
                    className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden py-1 divide-y divide-stone-100"
                  >
                    {formData.suggestedJobRoles && formData.suggestedJobRoles.length > 0 ? (
                      <div>
                        <div className="px-3 py-1.5 bg-stone-50/80 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                          Resume-Matched Suggestions
                        </div>
                        <div className="max-h-56 overflow-y-auto py-1">
                          {formData.suggestedJobRoles.map((role) => {
                            const isSelected = formData.preferredJobRole.trim().toLowerCase() === role.toLowerCase();
                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => {
                                  handleChange('preferredJobRole', role);
                                  setIsRoleDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-stone-100/80 transition-colors cursor-pointer ${
                                  isSelected ? 'bg-stone-100 font-semibold text-stone-900' : 'text-stone-700'
                                }`}
                              >
                                <span>{role}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-stone-900 shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="px-3.5 py-3 text-xs text-stone-500 text-center">
                        Upload your resume above to automatically generate personalized job role options based on your skills and experience.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Skills & Extracted Projects */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Skills & Capabilities</h3>
            <span className="text-[11px] text-stone-400">Extracted from resume or added manually</span>
          </div>

          {formData.skills && formData.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 text-xs font-medium rounded-lg border border-stone-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-stone-400 hover:text-stone-700 ml-0.5 font-bold cursor-pointer"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400">No skills added yet. Upload your resume or add below.</p>
          )}

          <div className="flex gap-2">
            <input
              id="input-add-skill"
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add a skill (e.g. Java, Python, SQL, HTML)..."
              className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            <button
              id="btn-add-skill"
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors border border-stone-200 cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Extracted Projects Preview (if available in resume) */}
          {formData.structuredProjects && formData.structuredProjects.length > 0 && (
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <h4 className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-stone-600" />
                <span>Extracted Projects ({formData.structuredProjects.length})</span>
              </h4>
              <div className="space-y-2">
                {formData.structuredProjects.map((project, idx) => (
                  <div key={idx} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                    <p className="font-semibold text-stone-900">{project.title}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-white text-stone-700 text-[10.5px] rounded border border-stone-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.description && (
                      <p className="text-stone-600 text-[11px] leading-relaxed">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Workplace Support & Accessibility Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Workplace Support Preferences (Optional)
            </h3>
            <span className="text-[11px] text-stone-400">Enables adaptation modeling</span>
          </div>
          <p className="text-xs text-stone-500">
            Select any accommodations or workplace practices that empower your best work:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {COMMON_SUPPORT_OPTIONS.map((opt) => {
              const isSelected = (formData.supportNeeds || []).includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggleSupport(opt)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {isSelected ? `✓ ${opt}` : `+ ${opt}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline Validation Alert */}
        {errorMessage && (
          <div
            id="profile-validation-error"
            className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Action */}
        <div className="pt-2">
          <button
            id="btn-profile-continue"
            type="submit"
            disabled={isSaving}
            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                <span>Saving Profile to Supabase...</span>
              </>
            ) : (
              <>
                <span>Continue to Job Matching</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};


