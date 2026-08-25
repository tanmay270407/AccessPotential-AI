import React, { useState } from 'react';
import { AssessmentResultData, CandidateProfile, JobRole } from '../../types';
import { ArrowRight, CheckCircle2, Zap, TrendingUp, ChevronDown, ChevronUp, UserCheck, Calculator, BarChart3 } from 'lucide-react';
import { calculateFutureFit } from '../../data/mockData';

interface AssessmentResultScreenProps {
  result: AssessmentResultData;
  job: JobRole;
  candidate: CandidateProfile;
  onContinue: () => void;
}

export const AssessmentResultScreen: React.FC<AssessmentResultScreenProps> = ({
  result,
  job,
  candidate,
  onContinue,
}) => {
  const [showTransparency, setShowTransparency] = useState(true);

  const { scores, learningVelocity, aiFeedbackSummary } = result;
  
  const futureFitComponents = result.futureFitComponents || job.futureFitComponents;
  const finalFutureFit = result.finalFutureFit ?? calculateFutureFit(futureFitComponents);
  const effectiveCurrentFit = candidate.atsScore ?? candidate.currentFit ?? job.currentFit;

  const { problemSolving, learningSpeed, adaptability, feedbackResponse, transferableSkills } = futureFitComponents;

  return (
    <div id="assessment-result-screen" className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Evaluation Complete</span>
        </div>
        <h2 id="result-screen-title" className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Your Fit Analysis
        </h2>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          Your current skills show a good match for this role, and your practical performance indicates strong potential to grow into it.
        </p>
      </div>

      {/* Dual Fit Comparison (Current Fit vs Final Future Fit) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Current Fit */}
        <div
          id="card-current-fit-result"
          className="bg-white p-6 rounded-2xl border border-stone-200 text-center flex flex-col items-center justify-between shadow-xs"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-stone-700" /> Current Fit
            </span>
            <p className="text-xs text-stone-500">Based on verified profile & skills</p>
          </div>
          <div className="my-4">
            <span id="score-current-fit-final" className="text-5xl font-extrabold text-stone-900 tracking-tight">
              {effectiveCurrentFit}%
            </span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-stone-700 h-full rounded-full transition-all duration-700"
              style={{ width: `${effectiveCurrentFit}%` }}
            />
          </div>
        </div>

        {/* Final Future Fit */}
        <div
          id="card-future-fit-result"
          className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-900 text-center flex flex-col items-center justify-between shadow-md"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Future Fit
            </span>
            <p className="text-xs text-stone-400">Measured through practical performance</p>
          </div>
          <div className="my-4">
            <span id="final-future-fit-score" className="text-5xl font-extrabold text-emerald-400 tracking-tight">
              {finalFutureFit}%
            </span>
          </div>
          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${finalFutureFit}%` }}
            />
          </div>
        </div>
      </div>

      {/* Learning Velocity Card */}
      <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-900 mb-6 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Learning Velocity
            </span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-lg">
            {learningVelocity.label || 'High Learning Velocity'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center my-4 py-3 bg-stone-800/60 rounded-xl border border-stone-700">
          <div>
            <span className="text-[11px] text-stone-400 block">Task 1</span>
            <span className="text-xl font-bold text-stone-200">{learningVelocity.firstTask}%</span>
          </div>
          <div className="border-x border-stone-700">
            <span className="text-[11px] text-stone-400 block">Task 2 (Post-Feedback)</span>
            <span className="text-xl font-bold text-stone-100">{learningVelocity.secondTask}%</span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400 block">Improvement</span>
            <span className="text-xl font-extrabold text-emerald-400">+{learningVelocity.improvement} points</span>
          </div>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed text-center font-sans">
          “{learningVelocity.explanation}”
        </p>
      </div>

      {/* 4-Part Assessment Journey Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 mb-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              4-Part Assessment Journey
            </h3>
          </div>
          {result.mcqSummary && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              MCQ Score: {result.mcqSummary.totalScore}/{result.mcqSummary.maxScore} pts
            </span>
          )}
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Step 1: MCQs */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-900">1. Resume MCQs (15 Qs)</span>
              <span className="font-extrabold text-stone-900">
                {result.mcqSummary ? `${result.mcqSummary.totalScore}/${result.mcqSummary.maxScore} pts` : '70/75 pts'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Skills: {result.mcqSummary?.skillsScore?.correct ?? 5}/5 • Projects: {result.mcqSummary?.projectsScore?.correct ?? 4}/5 • Certs: {result.mcqSummary?.certificationsScore?.correct ?? 5}/5
            </p>
          </div>

          {/* Step 2: Initial Task (3 Questions • 50 Points Total) */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-900">2. Initial Tasks (3 Qs)</span>
              <span className="font-extrabold text-stone-900">
                {result.initialTaskEvaluation
                  ? `${result.initialTaskEvaluation.totalScore}/${result.initialTaskEvaluation.maxScore} pts`
                  : `${result.task1Score ?? result.learningVelocity?.firstTask ?? 65}%`}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              {result.initialTaskEvaluation ? (
                <>
                  Easy: {result.initialTaskEvaluation.easyScore?.earned ?? 9}/10 • Mod:{' '}
                  {result.initialTaskEvaluation.moderateScore?.earned ?? 13}/15 • Hard:{' '}
                  {result.initialTaskEvaluation.hardScore?.earned ?? 21}/25 pts
                </>
              ) : (
                'Easy (10 pts), Moderate (15 pts), Hard (25 pts) project diagnostics'
              )}
            </p>
          </div>

          {/* Step 3: Learning Support */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-900">3. Learning Guidance</span>
              <span className="font-extrabold text-emerald-700">Completed</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Absorbed 3 core architectural & analytical concepts
            </p>
          </div>

          {/* Step 4: Applied Task */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-900">4. Applied Task</span>
              <span className="font-extrabold text-emerald-700">
                {result.task2Score ?? result.learningVelocity?.secondTask ?? 82}%
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Growth: +{result.learningVelocity?.improvement ?? 17} pts post-feedback
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Evaluation Breakdown (Section 5) */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 mb-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Assessment Evaluation
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
            <span className="text-stone-700 font-medium">Problem Solving</span>
            <span className="font-bold text-stone-900">{scores.problemSolving}%</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
            <span className="text-stone-700 font-medium">Reasoning</span>
            <span className="font-bold text-stone-900">{scores.reasoning}%</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
            <span className="text-stone-700 font-medium">Decision Making</span>
            <span className="font-bold text-stone-900">{scores.decisionMaking}%</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
            <span className="text-stone-700 font-medium">Communication</span>
            <span className="font-bold text-stone-900">{scores.communication}%</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center sm:col-span-2">
            <span className="text-stone-700 font-medium">Technical Approach</span>
            <span className="font-bold text-stone-900">{scores.technicalApproach}%</span>
          </div>
        </div>
      </div>

      {/* Score Transparency Card (Section 9) */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 mb-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-stone-700" />
            <h3 className="text-sm font-bold text-stone-900">How was my Future Fit calculated?</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowTransparency(!showTransparency)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors border border-stone-200 cursor-pointer"
          >
            <span>{showTransparency ? 'Collapse' : 'Expand'}</span>
            {showTransparency ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showTransparency && (
          <div className="pt-1 space-y-3">
            <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
              <div className="flex justify-between items-center text-stone-800">
                <span className="font-medium">Problem Solving</span>
                <span className="font-bold text-stone-900">{problemSolving}%</span>
              </div>
              <div className="flex justify-between items-center text-stone-800">
                <span className="font-medium">Learning Speed</span>
                <span className="font-bold text-stone-900">{learningSpeed}%</span>
              </div>
              <div className="flex justify-between items-center text-stone-800">
                <span className="font-medium">Adaptability</span>
                <span className="font-bold text-stone-900">{adaptability}%</span>
              </div>
              <div className="flex justify-between items-center text-stone-800">
                <span className="font-medium">Feedback Response</span>
                <span className="font-bold text-stone-900">{feedbackResponse}%</span>
              </div>
              <div className="flex justify-between items-center text-stone-800">
                <span className="font-medium">Transferable Skills</span>
                <span className="font-bold text-stone-900">{transferableSkills}%</span>
              </div>

              {/* Exact Formula Display */}
              <div className="pt-3 mt-1 border-t border-stone-200 text-center space-y-1">
                <span className="text-[11px] text-stone-500 font-semibold block uppercase tracking-wider">
                  Formula: Average of the five Future Fit factors
                </span>
                <div className="text-xs font-mono text-stone-900 font-bold bg-white p-2 rounded-lg border border-stone-200">
                  ({problemSolving} + {learningSpeed} + {adaptability} + {feedbackResponse} + {transferableSkills}) / 5 = {finalFutureFit}%
                </div>
              </div>
            </div>
          </div>
        )}

        {aiFeedbackSummary && (
          <div className="p-3.5 bg-stone-50 rounded-xl text-left border border-stone-200 text-xs text-stone-700 leading-relaxed font-sans">
            <span className="font-semibold text-stone-900 block mb-0.5">AI Synthesis:</span>
            {aiFeedbackSummary}
          </div>
        )}
      </div>

      {/* Continue CTA */}
      <div>
        <button
          id="btn-continue-workplace-check"
          onClick={onContinue}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base rounded-xl transition-all shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer"
        >
          <span>Check Workplace Readiness</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

