import React from 'react';
import { ScreenId } from '../types';
import { Sparkles, ArrowLeft, RotateCcw } from 'lucide-react';

interface NavigationProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onReset: () => void;
}

const STEPS: { id: ScreenId; label: string; group: string }[] = [
  { id: 'profile', label: 'Candidate', group: 'Candidate' },
  { id: 'job-match', label: 'Fit Analysis', group: 'Job' },
  { id: 'assessment', label: 'Assessment', group: 'Assessment' },
  { id: 'workplace-readiness', label: 'Workplace', group: 'Workplace' },
  { id: 'adaptation-plan', label: 'Adaptation', group: 'Workplace' },
  { id: 'success-match', label: 'Results', group: 'Results' },
];

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, onNavigate, onReset }) => {
  if (currentScreen === 'welcome') {
    return null;
  }

  const getStepStatus = (stepId: ScreenId) => {
    const screenOrder: ScreenId[] = [
      'welcome',
      'profile',
      'job-match',
      'assessment',
      'assessment-result',
      'workplace-readiness',
      'barrier-detection',
      'adaptation-plan',
      'decision-mirror',
      'success-match',
    ];
    const currentIndex = screenOrder.indexOf(currentScreen);
    const stepIndex = screenOrder.indexOf(stepId);

    if (currentScreen === stepId) return 'current';
    if (currentIndex > stepIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <header id="app-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            id="brand-home-btn"
            onClick={() => onNavigate('welcome')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
              AP
            </div>
            <div>
              <span className="font-semibold text-stone-900 text-base tracking-tight block leading-tight">
                AccessPotential AI
              </span>
              <span className="text-xs text-stone-700 hidden sm:block">
                From Job Matching to Success Matching
              </span>
            </div>
          </button>
        </div>

        {/* Minimal Progress Breadcrumb for desktop */}
        <nav id="top-nav-steps" aria-label="Workflow Steps" className="hidden md:flex items-center gap-1 text-xs">
          {STEPS.map((step, idx) => {
            const status = getStepStatus(step.id);
            return (
              <React.Fragment key={step.id}>
                {idx > 0 && <span className="text-stone-300 px-1">›</span>}
                <button
                  id={`nav-step-${step.id}`}
                  onClick={() => onNavigate(step.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                    status === 'current'
                      ? 'bg-stone-900 text-white'
                      : status === 'completed'
                      ? 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {step.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-reset-demo"
            onClick={onReset}
            title="Reset to default demo data"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors border border-stone-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
