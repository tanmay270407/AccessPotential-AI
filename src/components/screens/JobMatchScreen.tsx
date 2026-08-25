import React, { useState } from 'react';
import { JobRole, CandidateProfile } from '../../types';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  UserCheck,
  Clock,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FolderGit2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface JobMatchScreenProps {
  job: JobRole;
  candidate: CandidateProfile;
  onTakeAssessment: () => void;
  onChangeJob: () => void;
}

export const JobMatchScreen: React.FC<JobMatchScreenProps> = ({
  job,
  candidate,
  onTakeAssessment,
  onChangeJob,
}) => {
  const [showAtsBreakdown, setShowAtsBreakdown] = useState(true);

  const classification = candidate.documentClassification;
  const isResume = classification?.isResume ?? Boolean(candidate.atsScore);
  const isPortfolio = classification?.isPortfolio ?? Boolean(candidate.projectRelevanceScore);
  const whyAts = classification?.whyAts;

  // Calculate matched and missing skills between candidate and job
  const candidateSkills = candidate.skills || [];
  const matchedSkillsList =
    whyAts?.matchedSkills && whyAts.matchedSkills.length > 0
      ? whyAts.matchedSkills
      : (job.skills || []).filter((req) =>
          candidateSkills.some(
            (s) => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase())
          )
        );

  const missingSkillsList =
    whyAts?.missingSkills && whyAts.missingSkills.length > 0
      ? whyAts.missingSkills
      : (job.skills || []).filter(
          (req) =>
            !candidateSkills.some(
              (s) => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase())
            )
        );

  // Dynamic Current Fit calculation
  let effectiveCurrentFit: number;
  let fitSourceLabel: string;
  let fitStatus: 'calculated' | 'pending' = 'calculated';

  if (isResume && typeof candidate.atsScore === 'number') {
    effectiveCurrentFit = candidate.atsScore;
    fitSourceLabel = `Calculated from verified resume (${candidate.resumeFileName || 'Uploaded Resume'})`;
  } else if (isPortfolio && typeof candidate.projectRelevanceScore === 'number') {
    effectiveCurrentFit = candidate.projectRelevanceScore;
    fitSourceLabel = `Calculated from technical project portfolio`;
  } else if (typeof candidate.currentFit === 'number') {
    effectiveCurrentFit = candidate.currentFit;
    fitSourceLabel = 'Calculated from candidate profile & skill match';
  } else if (candidateSkills.length > 0) {
    const matchedCount = matchedSkillsList.length;
    const baseFit = Math.min(88, Math.max(50, Math.round(50 + (matchedCount / Math.max(1, (job.skills || []).length)) * 40)));
    effectiveCurrentFit = baseFit;
    fitSourceLabel = `Matched ${matchedCount} of ${(job.skills || []).length} key role requirements`;
  } else {
    effectiveCurrentFit = 0;
    fitStatus = 'pending';
    fitSourceLabel = 'Pending more candidate evidence';
  }

  return (
    <div id="job-match-screen" className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Selected Role Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
            Target Role Selected
          </span>
          <h3 id="target-role-title" className="text-lg font-bold text-stone-900">{job.title}</h3>
          <span className="text-xs text-stone-500">{job.category}</span>
        </div>
        <button
          id="btn-change-job"
          onClick={onChangeJob}
          className="text-xs text-stone-600 hover:text-stone-900 font-medium underline underline-offset-2 cursor-pointer"
        >
          Change Role
        </button>
      </div>

      <div className="text-center space-y-2 mb-8">
        <h2 id="job-match-title" className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Current Fit vs. Future Potential
        </h2>
        <p className="text-stone-600 text-sm max-w-lg mx-auto">
          Comparing {candidate.name ? `${candidate.name}'s` : 'your'} current verified background with practical adaptive potential.
        </p>
      </div>

      {/* Two Major Score Cards: Current Fit vs Future Fit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Current Fit */}
        <div
          id="card-current-fit"
          className="bg-white p-6 rounded-2xl border border-stone-200 text-center flex flex-col items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-stone-700" /> Current Fit
            </span>
            <p className="text-xs text-stone-600 leading-tight">
              {fitSourceLabel}
            </p>
          </div>
          <div className="my-5">
            {fitStatus === 'calculated' ? (
              <span id="score-current-fit" className="text-5xl font-extrabold text-stone-900 tracking-tight">
                {effectiveCurrentFit}%
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Pending More Evidence
              </span>
            )}
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-stone-800 h-full rounded-full transition-all duration-700"
              style={{ width: `${effectiveCurrentFit}%` }}
            />
          </div>
        </div>

        {/* Future Fit (Explicitly Pending Assessment) */}
        <div
          id="card-future-fit"
          className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-900 text-center flex flex-col items-center justify-between shadow-sm"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Future Fit
            </span>
            <p className="text-xs text-stone-400">
              Pending Assessment
            </p>
          </div>
          <div className="my-5 py-1">
            <span
              id="score-future-fit-pending"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-800 border border-stone-700 text-stone-200 text-sm font-semibold tracking-normal"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pending Assessment</span>
            </span>
          </div>
          <p className="text-[11px] text-stone-400 leading-tight">
            Measured through practical performance, learning speed, adaptability, and feedback response.
          </p>
        </div>
      </div>

      {/* ATS & Skill Evidence Breakdown Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 mb-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              {isResume ? 'Resume & Skill Match Diagnostic' : isPortfolio ? 'Portfolio Relevance' : 'Profile Match Diagnostic'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAtsBreakdown(!showAtsBreakdown)}
            className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900"
          >
            <span>{showAtsBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}</span>
            {showAtsBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showAtsBreakdown && (
          <div className="space-y-4 pt-1 text-xs">
            {/* Matched Skills */}
            <div>
              <span className="font-semibold text-stone-700 block mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matched Skills ({matchedSkillsList.length}):
              </span>
              {matchedSkillsList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-stone-400 italic">No direct overlap detected with listed requirements.</p>
              )}
            </div>

            {/* Missing / Target Skills */}
            {missingSkillsList.length > 0 && (
              <div>
                <span className="font-semibold text-stone-700 block mb-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Target Role Growth Areas ({missingSkillsList.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium border border-stone-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Relevant Projects or Experience */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between text-stone-700">
                <span className="font-medium">Experience Level:</span>
                <span className="font-semibold text-stone-900">
                  {candidate.experience || whyAts?.relevantExperience || '0 years / Fresher'}
                </span>
              </div>
              {candidate.projects && candidate.projects.length > 0 && (
                <div className="pt-1.5 border-t border-stone-200">
                  <span className="font-medium text-stone-700 block mb-1">
                    Projects Evaluated ({candidate.projects.length}):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-stone-800">
                    {candidate.projects.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Narrative Message Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2 mb-6 text-center sm:text-left">
        <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-stone-700" />
          <span>Next: Personalized Practical Assessment</span>
        </div>
        <p className="text-stone-700 text-sm leading-relaxed">
          “Your resume tells us about your current experience. Future Fit is measured through practical performance, learning speed, adaptability, and feedback response.”
        </p>
      </div>

      {/* Next CTA */}
      <div className="pt-2">
        <button
          id="btn-take-assessment"
          onClick={onTakeAssessment}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base rounded-xl transition-all shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer"
        >
          <span>Measure My Future Potential</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


