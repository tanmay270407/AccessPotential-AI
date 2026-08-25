import React from 'react';
import { JobRole, CandidateProfile } from '../../types';
import { ArrowRight, AlertTriangle, XCircle, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface BarrierDetectionScreenProps {
  job: JobRole;
  candidate: CandidateProfile;
  onGenerateAdaptation: () => void;
  isLoading: boolean;
}

export const BarrierDetectionScreen: React.FC<BarrierDetectionScreenProps> = ({
  job,
  candidate,
  onGenerateAdaptation,
  isLoading,
}) => {
  const { primaryBarrier } = job.workplaceProfile;

  return (
    <div id="barrier-detection-screen" className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Workplace Barrier Diagnostic</span>
        </div>
        <h2 id="barrier-screen-title" className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Barrier Found
        </h2>
        <p className="text-stone-600 text-sm">
          An environmental constraint was identified in the workplace setup for {job.title}.
        </p>
      </div>

      {/* Primary Barrier Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-200 shadow-sm space-y-5 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {primaryBarrier.severity} Priority
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-700 font-medium">{primaryBarrier.category}</span>
            </div>
            <h3 id="barrier-title-text" className="text-xl font-bold text-stone-900 tracking-tight">
              {primaryBarrier.title}
            </h3>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200/80 flex items-start gap-2.5 text-rose-900 font-medium text-sm">
          <span className="text-rose-600 font-bold shrink-0">❌</span>
          <div>
            <span className="font-semibold block">{primaryBarrier.description}</span>
            <span className="text-xs text-rose-800/90 mt-0.5 block">
              {primaryBarrier.impact || "The candidate may have difficulty using this workflow efficiently without configuration."}
            </span>
          </div>
        </div>

        {/* Core Environmental Clarification */}
        <div className="pt-2 text-stone-700 text-sm leading-relaxed border-t border-stone-100 space-y-2">
          <p id="barrier-explanation-text">
            <strong>Impact:</strong> {primaryBarrier.impact || "May reduce speed and autonomy if unaddressed."}
          </p>
          <p className="text-xs text-stone-600">
            <strong>Root Cause:</strong> This is purely an environmental constraint—not candidate capability. Applying a targeted adaptation removes this barrier completely.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div>
        <button
          id="btn-generate-adaptation-plan"
          onClick={onGenerateAdaptation}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base rounded-xl transition-all shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer disabled:opacity-70"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{isLoading ? 'Synthesizing Plan...' : 'Generate Adaptation Plan'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

