import React from 'react';
import { ArrowRight, Sparkles, Target, Building2, CheckCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div id="welcome-screen" className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center space-y-10">
        {/* Brand Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-stone-900" />
          <span>Next-Generation Workplace Readiness</span>
        </div>

        {/* Header Block */}
        <div className="space-y-4">
          <h1 id="app-main-title" className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
            AccessPotential AI
          </h1>
          <p id="app-tagline" className="text-xl sm:text-2xl font-medium text-stone-600">
            From Job Matching to Success Matching
          </p>
        </div>

        {/* Clean concise explanation */}
        <p id="app-welcome-desc" className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          Discover jobs based not only on your current skills, but also on your potential and the workplace conditions you need to succeed.
        </p>

        {/* Simple 3-step paradigm visualization */}
        <div className="pt-2 pb-4">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs sm:text-sm font-medium text-stone-700">
            <span className="flex items-center gap-1.5 text-stone-900">
              <span className="w-2 h-2 rounded-full bg-stone-900"></span> Candidate Potential
            </span>
            <span className="text-stone-300">→</span>
            <span className="flex items-center gap-1.5 text-stone-900">
              <span className="w-2 h-2 rounded-full bg-stone-700"></span> Job Fit
            </span>
            <span className="text-stone-300">→</span>
            <span className="flex items-center gap-1.5 text-stone-900">
              <span className="w-2 h-2 rounded-full bg-stone-600"></span> Workplace Readiness
            </span>
            <span className="text-stone-300">→</span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Barrier Removal
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <div>
          <button
            id="btn-welcome-get-started"
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
