import React, { useState } from 'react';
import { ScreenId, CandidateProfile, JobRole, AssessmentResultData, MCQScoreSummary, InitialTaskEvaluation } from './types';
import { sampleJobs, defaultCandidate, defaultAssessmentResult } from './data/mockData';
import { Navigation } from './components/Navigation';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { CandidateProfileScreen } from './components/screens/CandidateProfileScreen';
import { JobMatchScreen } from './components/screens/JobMatchScreen';
import { PracticalAssessmentScreen } from './components/screens/PracticalAssessmentScreen';
import { AssessmentResultScreen } from './components/screens/AssessmentResultScreen';
import { WorkplaceReadinessScreen } from './components/screens/WorkplaceReadinessScreen';
import { BarrierDetectionScreen } from './components/screens/BarrierDetectionScreen';
import { AdaptationPlanScreen } from './components/screens/AdaptationPlanScreen';
import { DecisionMirrorScreen } from './components/screens/DecisionMirrorScreen';
import { SuccessMatchScreen } from './components/screens/SuccessMatchScreen';
import { SummaryModal } from './components/SummaryModal';
import { SupabaseConnectionBanner } from './components/SupabaseConnectionBanner';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('welcome');
  const [candidate, setCandidate] = useState<CandidateProfile>(defaultCandidate);
  const [selectedJob, setSelectedJob] = useState<JobRole>(sampleJobs[0]);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResultData>(defaultAssessmentResult);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState(false);

  // Workflow Handlers
  const handleStart = () => {
    setCurrentScreen('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProfile = (updated: CandidateProfile) => {
    setCandidate(updated);
    // If preferred role matches a sample job, align selected job
    const matchedJob = sampleJobs.find(
      (j) => j.title.toLowerCase() === updated.preferredJobRole.toLowerCase()
    );
    if (matchedJob) {
      setSelectedJob(matchedJob);
    }
  };

  const handleContinueFromProfile = (savedProfile?: CandidateProfile) => {
    const profileToUse = savedProfile || candidate;
    if (savedProfile) {
      setCandidate(savedProfile);
    }
    if (profileToUse.preferredJobRole) {
      const matchedJob = sampleJobs.find(
        (j) => j.title.toLowerCase() === profileToUse.preferredJobRole.toLowerCase()
      );
      if (matchedJob) {
        setSelectedJob(matchedJob);
      }
    }
    setCurrentScreen('job-match');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTakeAssessment = async () => {
    setCurrentScreen('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Generate personalized assessment based on candidate document & profile
    setIsGeneratingAssessment(true);
    try {
      const res = await fetch('/api/ai/generate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleTitle: selectedJob.title,
          candidateProfile: candidate,
          extractedDetails: {
            skillsFound: candidate.skills,
            projects: candidate.projects,
          },
          documentClassification: candidate.documentClassification,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.task1 && data.task2 && data.learningSupport) {
          setSelectedJob((prev) => ({
            ...prev,
            assessmentTask: {
              title: data.task1.title || prev.assessmentTask.title,
              scenario: data.task1.scenario || prev.assessmentTask.scenario,
              question: data.task1.question || prev.assessmentTask.question,
              dataset: data.task1.dataset || prev.assessmentTask.dataset,
              sampleAnswer: data.task1.sampleAnswer || prev.assessmentTask.sampleAnswer,
              learningSupport: data.learningSupport || prev.assessmentTask.learningSupport,
              mcqs: data.mcqs || prev.assessmentTask.mcqs || [],
              task2: {
                title: data.task2.title || prev.assessmentTask.task2?.title || '',
                scenario: data.task2.scenario || prev.assessmentTask.task2?.scenario || '',
                question: data.task2.question || prev.assessmentTask.task2?.question || '',
                dataset: data.task2.dataset || prev.assessmentTask.task2?.dataset || [],
                sampleAnswer: data.task2.sampleAnswer || prev.assessmentTask.task2?.sampleAnswer || '',
              },
            },
          }));
        }
      }
    } catch (err) {
      console.warn('Personalized assessment generation fallback:', err);
    } finally {
      setIsGeneratingAssessment(false);
    }
  };

  const handleSubmitAssessment = async (
    mcqSummary: MCQScoreSummary,
    task1Answer: string,
    task2Answer: string,
    initialTaskEvaluation?: InitialTaskEvaluation
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/evaluate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleTitle: selectedJob.title,
          mcqResults: mcqSummary,
          initialTaskEvaluation,
          task1Scenario: selectedJob.assessmentTask.scenario,
          task1Question: selectedJob.assessmentTask.question,
          task1Answer,
          task2Scenario: selectedJob.assessmentTask.task2?.scenario || selectedJob.assessmentTask.scenario,
          task2Question: selectedJob.assessmentTask.task2?.question || selectedJob.assessmentTask.question,
          task2Answer,
          learningGuidance: selectedJob.assessmentTask.learningSupport?.keyConcepts?.join('; '),
          candidateProfile: candidate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAssessmentResult(data);
        if (data.futureFitComponents) {
          setSelectedJob((prev) => ({
            ...prev,
            futureFitComponents: data.futureFitComponents,
          }));
        }
      } else {
        setAssessmentResult({
          ...defaultAssessmentResult,
          mcqSummary,
          initialTaskEvaluation,
        });
      }
    } catch (err) {
      console.warn('Evaluation fallback engaged:', err);
      setAssessmentResult({
        ...defaultAssessmentResult,
        mcqSummary,
        initialTaskEvaluation,
      });
    } finally {
      setIsLoading(false);
      setCurrentScreen('assessment-result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContinueToWorkplace = () => {
    setCurrentScreen('workplace-readiness');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFindBarriers = () => {
    setCurrentScreen('barrier-detection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateAdaptation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/adaptation-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleTitle: selectedJob.title,
          barrierDescription: selectedJob.workplaceProfile.primaryBarrier.description,
          currentReadiness: selectedJob.workplaceProfile.adaptation.initialReadiness,
          candidateProfile: candidate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.improvedReadiness) {
          // Update selected job adaptation dynamically
          setSelectedJob((prev) => ({
            ...prev,
            workplaceProfile: {
              ...prev.workplaceProfile,
              adaptation: {
                ...prev.workplaceProfile.adaptation,
                problem: data.problem || prev.workplaceProfile.adaptation.problem,
                recommendedAction:
                  data.recommendedAction || prev.workplaceProfile.adaptation.recommendedAction,
                improvedReadiness:
                  data.improvedReadiness || prev.workplaceProfile.adaptation.improvedReadiness,
                explanation: data.explanation || prev.workplaceProfile.adaptation.explanation,
              },
            },
          }));
        }
      }
    } catch (err) {
      console.warn('Adaptation fallback engaged:', err);
    } finally {
      setIsLoading(false);
      setCurrentScreen('adaptation-plan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContinueToDecisionMirror = () => {
    setCurrentScreen('decision-mirror');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToSuccessMatch = () => {
    setCurrentScreen('success-match');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setCandidate(defaultCandidate);
    setSelectedJob(sampleJobs[0]);
    setAssessmentResult(defaultAssessmentResult);
    setCurrentScreen('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-stone-200">
      {/* Top Header */}
      <Navigation
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
        {currentScreen === 'welcome' && <WelcomeScreen onStart={handleStart} />}

        {currentScreen === 'profile' && (
          <CandidateProfileScreen
            profile={candidate}
            onUpdateProfile={handleUpdateProfile}
            onContinue={handleContinueFromProfile}
          />
        )}

        {currentScreen === 'job-match' && (
          <JobMatchScreen
            job={selectedJob}
            candidate={candidate}
            onTakeAssessment={handleTakeAssessment}
            onChangeJob={() => setCurrentScreen('profile')}
          />
        )}

        {currentScreen === 'assessment' && (
          <PracticalAssessmentScreen
            job={selectedJob}
            candidate={candidate}
            onSubmitAssessment={handleSubmitAssessment}
            isLoading={isLoading}
            isGenerating={isGeneratingAssessment}
          />
        )}

        {currentScreen === 'assessment-result' && (
          <AssessmentResultScreen
            result={assessmentResult}
            job={selectedJob}
            candidate={candidate}
            onContinue={handleContinueToWorkplace}
          />
        )}

        {currentScreen === 'workplace-readiness' && (
          <WorkplaceReadinessScreen
            job={selectedJob}
            candidate={candidate}
            onFindBarriers={handleFindBarriers}
          />
        )}

        {currentScreen === 'barrier-detection' && (
          <BarrierDetectionScreen
            job={selectedJob}
            candidate={candidate}
            onGenerateAdaptation={handleGenerateAdaptation}
            isLoading={isLoading}
          />
        )}

        {currentScreen === 'adaptation-plan' && (
          <AdaptationPlanScreen
            job={selectedJob}
            onContinue={handleContinueToDecisionMirror}
          />
        )}

        {currentScreen === 'decision-mirror' && (
          <DecisionMirrorScreen
            job={selectedJob}
            candidate={candidate}
            onContinue={handleContinueToSuccessMatch}
          />
        )}

        {currentScreen === 'success-match' && (
          <SuccessMatchScreen
            job={selectedJob}
            candidate={candidate}
            assessmentResult={assessmentResult}
            onOpenSummary={() => setSummaryModalOpen(true)}
            onStartAgain={handleReset}
          />
        )}
      </main>

      {/* Executive Summary Report Modal */}
      <SummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        job={selectedJob}
        candidate={candidate}
        assessmentResult={assessmentResult}
      />

      {/* Subtle Footer */}
      <footer className="py-6 border-t border-stone-200/80 text-center text-xs text-stone-700">
        <p className="max-w-md mx-auto px-4">
          AccessPotential AI • From Job Matching to Success Matching • Candidate Potential + Job Fit + Workplace Readiness
        </p>
      </footer>

      {/* Supabase Connection Status (Development Test) */}
      <SupabaseConnectionBanner />
    </div>
  );
}
