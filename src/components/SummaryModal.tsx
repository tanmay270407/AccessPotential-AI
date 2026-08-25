import React from 'react';
import { JobRole, CandidateProfile, AssessmentResultData } from '../types';
import { calculateFutureFit } from '../data/mockData';
import { X, Printer, CheckCircle2, AlertTriangle, Sparkles, Building2, User } from 'lucide-react';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobRole;
  candidate: CandidateProfile;
  assessmentResult: AssessmentResultData;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  job,
  candidate,
  assessmentResult,
}) => {
  if (!isOpen) return null;

  const futureFit =
    assessmentResult.finalFutureFit && assessmentResult.finalFutureFit > 0
      ? assessmentResult.finalFutureFit
      : calculateFutureFit(assessmentResult.futureFitComponents || job.futureFitComponents);
  const { adaptation, primaryBarrier } = job.workplaceProfile;

  const jobFitScore = assessmentResult.overallPerformance || 85;
  const currentFitScore = candidate.atsScore ?? candidate.currentFit ?? job.currentFit;

  let recommendationLabel = 'Hire + Adapt';
  if (jobFitScore < 60 && futureFit < 65) {
    recommendationLabel = 'Not Currently Recommended';
  } else if (jobFitScore < 72 || futureFit < 75) {
    recommendationLabel = 'Consider with Development Plan';
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider block">
              Executive Success Report
            </span>
            <h3 className="text-xl font-bold text-stone-900">
              AccessPotential AI Evaluation Briefing
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Candidate & Role Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
          <div>
            <span className="text-stone-700 block font-medium">Candidate Profile</span>
            <p className="text-sm font-bold text-stone-900 mt-0.5">{candidate.name || 'Candidate'}</p>
            <p className="text-stone-600">
              {[candidate.education, candidate.experience].filter(Boolean).join(' • ') || 'Verified Profile'}
            </p>
            {candidate.skills && candidate.skills.length > 0 && (
              <p className="text-stone-700 mt-1">Skills: {candidate.skills.slice(0, 6).join(', ')}</p>
            )}
            {candidate.projects && candidate.projects.length > 0 && (
              <p className="text-stone-600 mt-0.5">Projects: {candidate.projects.slice(0, 2).join(', ')}</p>
            )}
            {candidate.resumeFileName && (
              <p className="text-stone-500 mt-0.5 text-[11px]">Source: {candidate.resumeFileName}</p>
            )}
          </div>
          <div>
            <span className="text-stone-700 block font-medium">Target Role</span>
            <p className="text-sm font-bold text-stone-900 mt-0.5">{job.title}</p>
            <p className="text-stone-600">{job.category}</p>
            <p className="text-stone-900 font-semibold mt-1">
              Decision Outcome: <span className="text-emerald-700 font-bold">{recommendationLabel}</span>
            </p>
          </div>
        </div>

        {/* Score Summary Matrix */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
            Readiness & Fit Synthesis
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-700 block">Current Fit</span>
              <span className="text-lg font-bold text-stone-900">{currentFitScore}%</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-700 block">Future Fit</span>
              <span className="text-lg font-bold text-emerald-800">{futureFit}%</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-700 block">Practical Execution</span>
              <span className="text-lg font-bold text-stone-900">{jobFitScore}%</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 block">Adapted Workplace</span>
              <span className="text-lg font-bold text-emerald-800">{adaptation.improvedReadiness}%</span>
            </div>
          </div>
        </div>

        {/* Learning Velocity Summary */}
        {assessmentResult.learningVelocity && (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-stone-900">Learning Velocity Evaluation</span>
              <span className="text-emerald-700 font-bold">{assessmentResult.learningVelocity.label}</span>
            </div>
            <p className="text-stone-700">{assessmentResult.learningVelocity.explanation}</p>
          </div>
        )}

        {/* Barrier & Adaptation Roadmap */}
        <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
          <span className="font-bold text-stone-900 uppercase tracking-wider block">
            Environmental Adaptation Plan
          </span>
          <div className="space-y-1.5">
            <span className="font-semibold text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Barrier Identified: {primaryBarrier.title}
            </span>
            <p className="text-stone-700">{primaryBarrier.description}</p>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-stone-200">
            <span className="font-semibold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Prescribed Workplace Modification:
            </span>
            <p className="text-stone-800">{adaptation.recommendedAction}</p>
          </div>
          <div className="pt-2 text-stone-700 flex justify-between border-t border-stone-200 text-[11px]">
            <span>Timeline: <strong>{adaptation.implementationTime}</strong></span>
            <span>Cost: <strong>{adaptation.costEstimate}</strong></span>
            <span>Impact: <strong>{adaptation.initialReadiness}% → {adaptation.improvedReadiness}%</strong></span>
          </div>
        </div>

        {/* Conclusion Box */}
        <div className="p-4 bg-stone-900 text-white rounded-2xl text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Success Match Paradigm Conclusion</span>
          </div>
          <p className="text-stone-300 leading-relaxed">
            By shifting from conventional static matching to holistic success matching, this candidate can excel immediately upon standard accessibility adaptation.
          </p>
        </div>

        {/* Close */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold text-sm rounded-xl transition-colors border border-stone-200 cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

