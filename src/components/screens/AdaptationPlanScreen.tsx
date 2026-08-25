import React from 'react';
import { JobRole } from '../../types';
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles, Wrench, ShieldCheck } from 'lucide-react';

interface AdaptationPlanScreenProps {
  job: JobRole;
  onContinue: () => void;
}

export const AdaptationPlanScreen: React.FC<AdaptationPlanScreenProps> = ({
  job,
  onContinue,
}) => {
  const { adaptation } = job.workplaceProfile;

  return (
    <div id="adaptation-plan-screen" className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Adaptation Plan</span>
        </div>
        <h2 id="adaptation-title" className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Recommended Adaptation
        </h2>
        <p className="text-stone-600 text-sm">
          Targeted workplace modification to eliminate environmental barriers.
        </p>
      </div>

      {/* Main Adaptation Content Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6 mb-6">
        {/* Problem Section */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
            Identified Problem
          </span>
          <p id="adaptation-problem-text" className="text-stone-900 font-semibold text-base">
            {adaptation.problem}
          </p>
        </div>

        {/* Recommended Action Section */}
        <div className="space-y-1.5 p-4 bg-stone-50 rounded-xl border border-stone-200">
          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-stone-700" /> Recommended Action
          </span>
          <p id="adaptation-action-text" className="text-stone-800 text-sm leading-relaxed">
            {adaptation.recommendedAction}
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-700 border-t border-stone-200/80 mt-2">
            <span><strong>Est. Timeline:</strong> {adaptation.implementationTime || '1-2 weeks'}</span>
            <span><strong>Cost Impact:</strong> {adaptation.costEstimate || 'Low'}</span>
          </div>
        </div>

        {/* Expected Impact Transformation */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
            Expected Impact
          </span>

          <div className="bg-stone-900 text-white p-5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 block">Workplace Readiness</span>
              <span className="text-sm text-stone-300 font-medium">Environmental capability leap</span>
            </div>
            <div className="flex items-center gap-3">
              <span id="initial-readiness-val" className="text-xl font-bold text-stone-400 line-through">
                {adaptation.initialReadiness}%
              </span>
              <span className="text-emerald-400 font-bold text-lg">→</span>
              <span id="improved-readiness-val" className="text-3xl font-extrabold text-emerald-400">
                {adaptation.improvedReadiness}%
              </span>
            </div>
          </div>
        </div>

        {/* Simple Green Success Message Banner */}
        <div id="hire-adapt-badge" className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Hire + Adapt</span>
          </div>
          <p id="hire-adapt-explanation" className="text-emerald-800 text-xs sm:text-sm leading-relaxed">
            “{adaptation.explanation}”
          </p>
        </div>
      </div>

      {/* Button */}
      <div>
        <button
          id="btn-view-decision-mirror"
          onClick={onContinue}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base rounded-xl transition-all shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-stone-900"
        >
          <span>Why this recommendation? (Decision Mirror)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
