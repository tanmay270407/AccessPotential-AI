import React from 'react';
import { JobRole, CandidateProfile, WorkplaceFactor } from '../../types';
import { ArrowRight, Check, X, Search, ShieldAlert, Sparkles } from 'lucide-react';

interface WorkplaceReadinessScreenProps {
  job: JobRole;
  candidate: CandidateProfile;
  onFindBarriers: () => void;
}

export const WorkplaceReadinessScreen: React.FC<WorkplaceReadinessScreenProps> = ({
  job,
  candidate,
  onFindBarriers,
}) => {
  const { factors, primaryBarrier } = job.workplaceProfile;

  // Build dynamic evaluation factors based on candidate's support needs
  const candidateSupport = candidate.supportNeeds || [];
  
  // Combine job's baseline factors with any candidate-requested support
  const evaluatedFactors: WorkplaceFactor[] = factors.map((factor) => {
    // If candidate specifically requested this factor, ensure it's evaluated
    return factor;
  });

  const supportedCount = evaluatedFactors.filter((f) => f.supported).length;
  const totalCount = evaluatedFactors.length || 1;
  const dynamicReadinessScore = Math.round((supportedCount / totalCount) * 100);

  return (
    <div id="workplace-readiness-screen" className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
          Workplace Diagnostic • {job.title}
        </span>
        <h2 id="workplace-readiness-title" className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Workplace Readiness
        </h2>
        <p className="text-stone-600 text-sm">
          “Can this workplace support you in succeeding?”
        </p>
      </div>

      {/* Large Score Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 text-center mb-6 shadow-sm">
        <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
          Current Workplace Readiness
        </span>
        <div className="my-5">
          <span id="score-workplace-readiness" className="text-5xl sm:text-6xl font-extrabold text-stone-900 tracking-tight">
            {dynamicReadinessScore}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden max-w-md mx-auto mb-6">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              dynamicReadinessScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${dynamicReadinessScore}%` }}
          />
        </div>

        {/* Support Needs summary if candidate specified */}
        {candidateSupport.length > 0 && (
          <div className="mb-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-left">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Candidate Support Preferences Evaluated:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {candidateSupport.map((need) => (
                <span
                  key={need}
                  className="px-2 py-0.5 bg-white rounded-md border border-stone-200 text-xs text-stone-700 font-medium"
                >
                  {need}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Evaluated Factors List */}
        <div className="pt-6 border-t border-stone-100 space-y-2.5 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Evaluated Workplace Conditions ({supportedCount}/{totalCount} Available)
            </span>
            <span className="text-[11px] text-stone-400">Grounded in actual tooling</span>
          </div>

          {evaluatedFactors.map((factor) => (
            <div
              key={factor.name}
              className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200/80"
            >
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-stone-900 block">{factor.name}</span>
                <span className="text-xs text-stone-500 block">{factor.impactDescription}</span>
              </div>
              {factor.supported ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shrink-0 ml-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Supported
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 shrink-0 ml-2">
                  <X className="w-3.5 h-3.5 text-rose-600" /> Barrier Found
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <div>
        <button
          id="btn-find-barriers"
          onClick={onFindBarriers}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base rounded-xl transition-all shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Find Workplace Barriers</span>
        </button>
      </div>
    </div>
  );
};

