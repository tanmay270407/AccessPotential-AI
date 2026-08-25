import React from 'react';
import { JobRole, CandidateProfile } from '../../types';
import { ArrowRight, HelpCircle, AlertCircle, Scale, Shield, UserCheck } from 'lucide-react';

interface DecisionMirrorScreenProps {
  job: JobRole;
  candidate: CandidateProfile;
  onContinue: () => void;
}

export const DecisionMirrorScreen: React.FC<DecisionMirrorScreenProps> = ({
  job,
  candidate,
  onContinue,
}) => {
  const weights = [
    { label: 'Skills & Foundational Knowledge', weight: 30, desc: 'Verified technical concepts and domain baseline' },
    { label: 'Practical Performance', weight: 25, desc: 'Hands-on problem solving in real-world simulation' },
    { label: 'Future Potential', weight: 25, desc: 'Learning velocity, feedback absorption, and adaptability' },
    { label: 'Experience', weight: 10, desc: 'Prior background and tenure context' },
    { label: 'Workplace Fit & Readiness', weight: 10, desc: 'Tooling compatibility after reasonable adaptation' },
  ];

  // Dynamic human review text
  const primarySupportNeed = candidate.supportNeeds && candidate.supportNeeds.length > 0
    ? candidate.supportNeeds.join(', ')
    : 'assistive software and tooling updates';

  const humanReviewText = `Ensure IT and hiring managers review accommodation readiness (${primarySupportNeed}) for ${candidate.name || 'the candidate'} and confirm the recommended action: "${job.workplaceProfile.adaptation.recommendedAction}" is scheduled prior to day one.`;

  return (
    <div id="decision-mirror-screen" className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
          <Scale className="w-3.5 h-3.5 text-stone-700" />
          <span>Transparent Decision Mirror</span>
        </div>
        <h2 id="decision-mirror-title" className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Why this recommendation?
        </h2>
        <p className="text-stone-600 text-sm">
          A clear breakdown of decision factors and weights behind the recommendation.
        </p>
      </div>

      {/* Breakdown Weights Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-5 mb-6">
        <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
          Recommendation Weighting Model
        </span>

        <div className="space-y-3">
          {weights.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                <span>{item.label}</span>
                <span className="text-stone-900 font-bold">{item.weight}%</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-stone-900 h-full rounded-full"
                  style={{ width: `${item.weight * 3.33}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Human Review Banner */}
      <div className="p-5 bg-amber-50/80 rounded-2xl border border-amber-200/90 space-y-2 mb-6">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Possible factor requiring human review</span>
        </div>
        <p className="text-amber-800 text-xs sm:text-sm leading-relaxed">
          {humanReviewText}
        </p>
      </div>

      {/* Ethical Transparency Statement */}
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-700 leading-relaxed mb-8 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
        <p id="decision-mirror-disclaimer">
          “The system highlights factors that influenced the recommendation and can flag potential concerns for human review.”
        </p>
      </div>

      {/* Continue CTA */}
      <div>
        <button
          id="btn-view-final-match"
          onClick={onContinue}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base rounded-xl transition-all shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-stone-900"
        >
          <span>View Final Success Match</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
