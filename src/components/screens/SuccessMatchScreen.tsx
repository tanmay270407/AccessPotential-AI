import React from 'react';
import { JobRole, CandidateProfile, AssessmentResultData } from '../../types';
import { calculateFutureFit } from '../../data/mockData';
import { CheckCircle2, RotateCcw, FileText, ArrowRight, UserCheck, Briefcase, Building2, AlertCircle, HelpCircle } from 'lucide-react';

interface SuccessMatchScreenProps {
  job: JobRole;
  candidate: CandidateProfile;
  assessmentResult: AssessmentResultData;
  onOpenSummary: () => void;
  onStartAgain: () => void;
}

export const SuccessMatchScreen: React.FC<SuccessMatchScreenProps> = ({
  job,
  candidate,
  assessmentResult,
  onOpenSummary,
  onStartAgain,
}) => {
  const futureFit =
    assessmentResult.finalFutureFit && assessmentResult.finalFutureFit > 0
      ? assessmentResult.finalFutureFit
      : calculateFutureFit(assessmentResult.futureFitComponents || job.futureFitComponents);
  const { adaptation } = job.workplaceProfile;

  const jobFitScore = assessmentResult.overallPerformance || 85;
  const workplaceScore = adaptation.improvedReadiness || 95;

  // Dynamic recommendation based on actual scores
  let recommendationLabel = 'Hire + Adapt';
  let recommendationTagline = 'Strong Match with Actionable Adaptation';
  let recommendationColor = 'text-emerald-400';
  let recommendationBg = 'bg-emerald-500/20';
  let recommendationExplanation = `“${candidate.name || 'This candidate'} demonstrates strong practical performance and high learning velocity for the ${job.title} role. Removing the identified workplace barrier enables immediate operational impact.”`;

  if (jobFitScore < 60 && futureFit < 65) {
    recommendationLabel = 'Not Currently Recommended';
    recommendationTagline = 'Prerequisite Skill Gap Identified';
    recommendationColor = 'text-rose-400';
    recommendationBg = 'bg-rose-500/20';
    recommendationExplanation = `“While ${candidate.name || 'the candidate'} shows foundational interest, current technical execution and assessment responses indicate significant prerequisite domain gaps for this specific ${job.title} position at this time.”`;
  } else if (jobFitScore < 72 || futureFit < 75) {
    recommendationLabel = 'Consider with Development Plan';
    recommendationTagline = 'Developing Match with Targeted Support';
    recommendationColor = 'text-amber-400';
    recommendationBg = 'bg-amber-500/20';
    recommendationExplanation = `“${candidate.name || 'This candidate'} shows solid baseline potential and positive learning growth. Recommend extending a conditional offer with a structured 60-day development milestone alongside workplace accommodations.”`;
  }

  return (
    <div id="success-match-screen" className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Success Match Verified</span>
        </div>
        <h2 id="success-match-title" className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Success Match
        </h2>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          Comprehensive synthesis of candidate capability, role fit, and adapted workplace readiness.
        </p>
      </div>

      {/* Chain Indicator: Candidate -> Job -> Workplace */}
      <div className="mb-8">
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs sm:text-sm font-semibold text-stone-800">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-stone-700" />
            <span>{candidate.name || 'Candidate'}</span>
          </div>
          <span className="text-stone-300 font-bold">→</span>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-stone-700" />
            <span>{job.title}</span>
          </div>
          <span className="text-stone-300 font-bold">→</span>
          <div className="flex items-center gap-1.5 text-emerald-800">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Adapted Workplace</span>
          </div>
        </div>
      </div>

      {/* Main Triad Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6 text-center">
        {/* Candidate Potential */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col justify-between">
          <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
            Candidate Potential
          </span>
          <div className="my-3">
            <span id="final-candidate-potential" className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {futureFit}%
            </span>
          </div>
          <span className="text-[11px] text-stone-700">Future Fit trajectory</span>
        </div>

        {/* Job Fit */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col justify-between">
          <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
            Job Fit
          </span>
          <div className="my-3">
            <span id="final-job-fit" className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {jobFitScore}%
            </span>
          </div>
          <span className="text-[11px] text-stone-700">Practical execution</span>
        </div>

        {/* Workplace Readiness */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-300 bg-emerald-50/30 flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Workplace Readiness
          </span>
          <div className="my-3">
            <span id="final-workplace-readiness" className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
              {workplaceScore}%
            </span>
          </div>
          <span className="text-[11px] text-emerald-800 font-medium">After adaptation</span>
        </div>
      </div>

      {/* Final Recommendation Status Box */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-2xl border border-stone-900 shadow-md space-y-4 mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${recommendationBg} ${recommendationColor} flex items-center justify-center font-bold text-xl`}>
            ✓
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
              Final Decision Status • {recommendationTagline}
            </span>
            <h3 id="final-status-label" className={`text-2xl font-extrabold ${recommendationColor} tracking-tight`}>
              {recommendationLabel}
            </h3>
          </div>
        </div>

        <p id="final-explanation-text" className="text-sm text-stone-300 leading-relaxed pt-2 border-t border-stone-800">
          {recommendationExplanation}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          id="btn-view-summary"
          onClick={onOpenSummary}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base rounded-xl transition-all shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>View Executive Summary Report</span>
        </button>

        <button
          id="btn-start-again"
          onClick={onStartAgain}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm rounded-xl transition-colors border border-stone-200 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start Again</span>
        </button>
      </div>
    </div>
  );
};

