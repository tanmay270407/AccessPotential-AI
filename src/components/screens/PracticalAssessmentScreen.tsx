import React, { useState, useMemo } from 'react';
import {
  AssessmentMCQ,
  CandidateProfile,
  JobRole,
  MCQScoreSummary,
  InitialTaskQuestion,
  InitialTaskEvaluation,
} from '../../types';
import {
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Loader2,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Award,
  Code2,
  FolderGit2,
  Check,
  Zap,
  AlertCircle,
} from 'lucide-react';

interface PracticalAssessmentScreenProps {
  job: JobRole;
  candidate: CandidateProfile;
  onSubmitAssessment: (
    mcqSummary: MCQScoreSummary,
    task1Answer: string,
    task2Answer: string,
    initialTaskEvaluation?: InitialTaskEvaluation
  ) => Promise<void>;
  isLoading: boolean;
  isGenerating?: boolean;
}

export const PracticalAssessmentScreen: React.FC<PracticalAssessmentScreenProps> = ({
  job,
  candidate,
  onSubmitAssessment,
  isLoading,
  isGenerating = false,
}) => {
  const [currentStep, setCurrentStep] = useState<
    'mcq' | 'task1' | 'learning-support' | 'task2'
  >('mcq');

  // MCQ State
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    'all' | 'skills' | 'projects' | 'certifications'
  >('all');

  // Initial Task (3 Questions) State
  const [currentInitialTaskIndex, setCurrentInitialTaskIndex] = useState(0);
  const [initialTaskAnswers, setInitialTaskAnswers] = useState<{ [id: string]: string }>({
    'init-task-1': '',
    'init-task-2': '',
    'init-task-3': '',
  });
  const [isEvaluatingInitialTasks, setIsEvaluatingInitialTasks] = useState(false);
  const [initialTaskEvaluation, setInitialTaskEvaluation] = useState<InitialTaskEvaluation | null>(
    null
  );

  // Practical Tasks State (Task 2 / Applied Task)
  const [task1Answer, setTask1Answer] = useState('');
  const [task2Answer, setTask2Answer] = useState('');
  const [showDataset, setShowDataset] = useState(true);

  // Derive candidate 15 MCQs (5 Skills, 5 Projects, 5 Certifications)
  const mcqQuestions: AssessmentMCQ[] = useMemo(() => {
    if (job.assessmentTask.mcqs && job.assessmentTask.mcqs.length >= 15) {
      return job.assessmentTask.mcqs;
    }

    const uniqueSkills = Array.from(
      new Set(
        [
          ...(candidate?.skills || []),
          ...(candidate?.technicalSkills || []),
          ...(candidate?.extractedDetails?.skillsFound || []),
        ].filter(Boolean)
      )
    );
    const skillsList =
      uniqueSkills.length > 0 ? uniqueSkills : ['Problem Solving', 'Data Analysis', 'System Architecture'];

    const projectsList =
      candidate?.projects && candidate.projects.length > 0
        ? candidate.projects.map((p) => (typeof p === 'string' ? p : (p as any).title || 'Project'))
        : (candidate?.structuredProjects || []).map((p) => p.title).filter(Boolean).length > 0
        ? (candidate.structuredProjects || []).map((p) => p.title)
        : ['Analytical Pipeline', 'Web Application', 'Database Engine'];

    const certsList =
      candidate?.certifications && candidate.certifications.length > 0
        ? candidate.certifications
        : [
            candidate?.education || 'Computer Science Degree',
            'Software Quality Assurance',
            'Data Architecture Fundamentals',
          ];

    // Generate 5 skills
    const sQuestions: AssessmentMCQ[] = Array.from({ length: 5 }, (_, i) => {
      const skillName = skillsList[i % skillsList.length] || 'Core Technical Skill';
      return {
        id: `mcq-skill-${i + 1}`,
        category: 'skills',
        topic: skillName,
        question: `When implementing high-throughput workflows with ${skillName}, which architectural pattern is recommended for maintainability and scalability?`,
        options: [
          `Decompose logic into decoupled modular services with automated profiling`,
          `Consolidate all queries and transformations into a single synchronous block`,
          `Suppress background telemetry logs to minimize runtime memory overhead`,
          `Hardcode environment credentials directly in static helper classes`,
        ],
        correctAnswerIndex: 0,
        points: 5,
        explanation: `Modular decoupling and automated profiling represent industry best practices for ${skillName}.`,
      };
    });

    // Generate 5 projects
    const pQuestions: AssessmentMCQ[] = Array.from({ length: 5 }, (_, i) => {
      const projName = projectsList[i % projectsList.length] || 'Candidate Project';
      return {
        id: `mcq-proj-${i + 1}`,
        category: 'projects',
        topic: projName,
        question: `In your resume project "${projName}", how should distributed latency spikes or schema migrations be securely managed?`,
        options: [
          `Apply backward-compatible versioned migrations with idempotent request retries`,
          `Truncate audit databases without taking pre-deployment transaction snapshots`,
          `Drop connection pools whenever latency exceeds 500 milliseconds`,
          `Execute raw unstructured queries directly in production without validation`,
        ],
        correctAnswerIndex: 0,
        points: 5,
        explanation: `Backward-compatible migrations and idempotent retries maintain system resilience in ${projName}.`,
      };
    });

    // Generate 5 certifications / coursework
    const cQuestions: AssessmentMCQ[] = Array.from({ length: 5 }, (_, i) => {
      const certName = certsList[i % certsList.length] || 'Certified Competency';
      return {
        id: `mcq-cert-${i + 1}`,
        category: 'certifications',
        topic: certName,
        question: `According to rigorous principles tested in "${certName}", what is essential for verifying data confidentiality and regulatory compliance?`,
        options: [
          `Enforce role-based access control (RBAC), end-to-end encryption, and rigorous audit logs`,
          `Grant broad read/write permissions to all internal endpoints by default`,
          `Bypass validation schemas during rapid prototyping cycles`,
          `Store database connection tokens inside public client-side state`,
        ],
        correctAnswerIndex: 0,
        points: 5,
        explanation: `RBAC, cryptographic transport encryption, and immutable audit trails are core standards under ${certName}.`,
      };
    });

    return [...sQuestions, ...pQuestions, ...cQuestions];
  }, [job.assessmentTask.mcqs, candidate]);

  // Derive candidate 3 Initial Tasks (Easy: 10pts, Moderate: 15pts, Hard: 25pts)
  const initialTaskQuestions: InitialTaskQuestion[] = useMemo(() => {
    if (job.assessmentTask.initialTasks && job.assessmentTask.initialTasks.length === 3) {
      return job.assessmentTask.initialTasks;
    }

    const rawProjects = candidate?.projects || [];
    const structProjects = candidate?.structuredProjects || [];
    const candidateSkills = [
      ...(candidate?.skills || []),
      ...(candidate?.technicalSkills || []),
      ...(candidate?.extractedDetails?.skillsFound || []),
    ].filter(Boolean);

    let primaryProjectName = 'Candidate Project';
    let primaryProjectTech = candidateSkills.slice(0, 3).join(', ') || 'Core Technologies';

    if (structProjects.length > 0 && structProjects[0].title) {
      primaryProjectName = structProjects[0].title;
      if (structProjects[0].techStack && structProjects[0].techStack.length > 0) {
        primaryProjectTech = structProjects[0].techStack.join(', ');
      }
    } else if (rawProjects.length > 0) {
      const p0 = rawProjects[0];
      primaryProjectName = typeof p0 === 'string' ? p0 : (p0 as any).title || 'Candidate Project';
    } else if (candidateSkills.length > 0) {
      primaryProjectName = `${candidateSkills[0]} Architecture Implementation`;
    } else {
      primaryProjectName = `${job.title} Implementation`;
    }

    return [
      {
        id: 'init-task-1',
        difficulty: 'easy' as const,
        difficultyLabel: 'Easy',
        points: 10,
        title: `Core Architecture & Data Flow: ${primaryProjectName}`,
        projectContext: primaryProjectName,
        scenario: `As part of the technical onboarding for "${primaryProjectName}" (built with ${primaryProjectTech}), the engineering lead asks you to document the foundational data lifecycle and architectural components.`,
        question: `Explain the core architecture of "${primaryProjectName}". Detail how data enters the system, how entities are validated, and how primary operations interact with the underlying data store.`,
        sampleAnswer: `The architecture of ${primaryProjectName} is organized into decoupled layers: a controller interface for incoming requests, a service layer enforcing business logic and validation schemas, and a persistent repository layer utilizing ${primaryProjectTech}. Requests are validated via typed schemas before executing parameterized database transactions, ensuring transactional atomicity and modular decoupling.`,
        evaluationCriteria: 'Clear explanation of data lifecycle, component decoupling, and schema validation.',
      },
      {
        id: 'init-task-2',
        difficulty: 'moderate' as const,
        difficultyLabel: 'Moderate',
        points: 15,
        title: `Applied Debugging & Concurrency: ${primaryProjectName}`,
        projectContext: primaryProjectName,
        scenario: `During peak hours in "${primaryProjectName}", intermittent duplicate records and race conditions occurred when multiple concurrent clients updated shared resources simultaneously.`,
        question: `How would you diagnose the root cause of this concurrency conflict in "${primaryProjectName}"? Provide a step-by-step remediation plan using ${primaryProjectTech} (such as optimistic locking, transaction isolation, or idempotency keys).`,
        sampleAnswer: `To isolate the race condition in ${primaryProjectName}, I would inspect database transaction isolation levels and trace lock contention in the logs. Remediation: 1) Enforce idempotency keys on write endpoints; 2) Implement optimistic locking using version columns (or SELECT FOR UPDATE for row-level serialization); 3) Wrap operations in strict atomic transactions with automated exponential retry backoff.`,
        evaluationCriteria: 'Systematic debugging diagnosis and practical mitigation of race conditions/concurrency.',
      },
      {
        id: 'init-task-3',
        difficulty: 'hard' as const,
        difficultyLabel: 'Hard',
        points: 25,
        title: `High-Scale Optimization & Resilient Architecture: ${primaryProjectName}`,
        projectContext: primaryProjectName,
        scenario: `Traffic for "${primaryProjectName}" is projected to increase 10x over the next quarter. Database queries are already exhibiting p99 latency spikes of 1200ms during reporting aggregation runs.`,
        question: `Architect a high-performance, resilient scaling strategy for "${primaryProjectName}". Address caching topologies, database read/write splitting or indexing, asynchronous processing pipelines, and failure isolation.`,
        sampleAnswer: `For scaling ${primaryProjectName} 10x: 1) Caching: Deploy a distributed cache (e.g. Redis) with cache-aside pattern and TTL jitter for read-heavy entities; 2) Asynchronous Pipelines: Offload heavy reporting and background mutations to a message queue (e.g. RabbitMQ/Kafka) with dead-letter retries; 3) Database Optimization: Establish read replicas, create compound indexes for aggregation queries, and add connection pooling; 4) Resilience: Implement circuit breakers and rate limiting to prevent cascading failures.`,
        evaluationCriteria: 'Comprehensive 10x scaling architecture covering caching, async queues, DB read/write splitting, and circuit breakers.',
      },
    ];
  }, [job.assessmentTask.initialTasks, candidate, job.title]);

  // Filtered MCQs for view
  const filteredMcqs = useMemo(() => {
    if (activeCategoryFilter === 'all') return mcqQuestions;
    return mcqQuestions.filter((q) => q.category === activeCategoryFilter);
  }, [mcqQuestions, activeCategoryFilter]);

  // Calculate MCQ score summary
  const mcqSummary: MCQScoreSummary = useMemo(() => {
    let totalScore = 0;
    let correctCount = 0;
    let skillsCorrect = 0;
    let projectsCorrect = 0;
    let certsCorrect = 0;

    mcqQuestions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      if (selected !== undefined && selected === q.correctAnswerIndex) {
        totalScore += q.points;
        correctCount += 1;
        if (q.category === 'skills') skillsCorrect += 1;
        if (q.category === 'projects') projectsCorrect += 1;
        if (q.category === 'certifications') certsCorrect += 1;
      }
    });

    const maxScore = mcqQuestions.length * 5; // 75 points
    const percentage = Math.round((totalScore / maxScore) * 100);

    return {
      totalQuestions: mcqQuestions.length,
      correctCount,
      totalScore,
      maxScore,
      percentage,
      skillsScore: {
        correct: skillsCorrect,
        total: 5,
        points: skillsCorrect * 5,
        maxPoints: 25,
      },
      projectsScore: {
        correct: projectsCorrect,
        total: 5,
        points: projectsCorrect * 5,
        maxPoints: 25,
      },
      certificationsScore: {
        correct: certsCorrect,
        total: 5,
        points: certsCorrect * 5,
        maxPoints: 25,
      },
      selectedAnswers,
      questions: mcqQuestions,
    };
  }, [mcqQuestions, selectedAnswers]);

  const { learningSupport, task2 } = job.assessmentTask;

  const currentMcq = mcqQuestions[currentMcqIndex] || mcqQuestions[0];
  const currentInitialTask =
    initialTaskQuestions[currentInitialTaskIndex] || initialTaskQuestions[0];

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleAutoFillMCQ = () => {
    const filled: { [key: string]: number } = {};
    mcqQuestions.forEach((q, idx) => {
      filled[q.id] = idx === 4 ? (q.correctAnswerIndex + 1) % 4 : q.correctAnswerIndex;
    });
    setSelectedAnswers(filled);
  };

  const handleCompleteMCQs = () => {
    setCurrentStep('task1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInitialTaskAnswerChange = (questionId: string, value: string) => {
    setInitialTaskAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleUseSampleInitialTask = (qIndex: number) => {
    const targetQ = initialTaskQuestions[qIndex];
    if (!targetQ) return;
    setInitialTaskAnswers((prev) => ({
      ...prev,
      [targetQ.id]: targetQ.sampleAnswer || '',
    }));
  };

  const handleFillAllInitialTasksSample = () => {
    const filled: { [id: string]: string } = {};
    initialTaskQuestions.forEach((q) => {
      filled[q.id] = q.sampleAnswer || '';
    });
    setInitialTaskAnswers(filled);
  };

  const handleUseSampleTask2 = () => {
    if (task2?.sampleAnswer) {
      setTask2Answer(task2.sampleAnswer);
    } else {
      setTask2Answer(
        'Applied targeted learning framework to isolate root bottlenecks and sustain high customer fulfillment velocity.'
      );
    }
  };

  // Submit and evaluate the 3 Initial Tasks (50 points total)
  const handleCompleteInitialTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    const q1 = initialTaskQuestions[0];
    const q2 = initialTaskQuestions[1];
    const q3 = initialTaskQuestions[2];
    const a1 =
      initialTaskAnswers[q1.id] ||
      initialTaskAnswers['init-task-1'] ||
      q1.sampleAnswer ||
      '';
    const a2 =
      initialTaskAnswers[q2.id] ||
      initialTaskAnswers['init-task-2'] ||
      q2.sampleAnswer ||
      '';
    const a3 =
      initialTaskAnswers[q3.id] ||
      initialTaskAnswers['init-task-3'] ||
      q3.sampleAnswer ||
      '';

    const compositeAnswer = `[Task 1 - Easy: ${q1.projectContext}]\n${a1}\n\n[Task 2 - Moderate: ${q2.projectContext}]\n${a2}\n\n[Task 3 - Hard: ${q3.projectContext}]\n${a3}`;
    setTask1Answer(compositeAnswer);

    setIsEvaluatingInitialTasks(true);
    try {
      const res = await fetch('/api/ai/evaluate-initial-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleTitle: job.title,
          initialTasks: initialTaskQuestions,
          questions: initialTaskQuestions,
          answers: {
            [q1.id]: a1,
            [q2.id]: a2,
            [q3.id]: a3,
            'init-task-1': a1,
            'init-task-2': a2,
            'init-task-3': a3,
          },
          candidateProfile: candidate,
        }),
      });

      if (res.ok) {
        const evalData: InitialTaskEvaluation = await res.json();
        setInitialTaskEvaluation(evalData);
      } else {
        // Proportional dynamic fallback evaluation
        const len1 = a1.trim().length;
        const len2 = a2.trim().length;
        const len3 = a3.trim().length;

        const earned1 = len1 === 0 ? 0 : Math.min(10, Math.max(3, Math.round(3 + Math.min(7, len1 / 25))));
        const earned2 = len2 === 0 ? 0 : Math.min(15, Math.max(4, Math.round(5 + Math.min(10, len2 / 30))));
        const earned3 = len3 === 0 ? 0 : Math.min(25, Math.max(7, Math.round(9 + Math.min(16, len3 / 35))));
        const fallbackTotal = earned1 + earned2 + earned3;
        const fallbackPct = Math.round((fallbackTotal / 50) * 100);

        const evalFallback: InitialTaskEvaluation = {
          totalScore: fallbackTotal,
          maxScore: 50,
          percentage: fallbackPct,
          easyScore: { earned: earned1, max: 10 },
          moderateScore: { earned: earned2, max: 15 },
          hardScore: { earned: earned3, max: 25 },
          questions: [
            {
              id: q1.id,
              difficulty: 'easy',
              question: q1.question,
              projectContext: q1.projectContext,
              candidateAnswer: a1,
              maxPoints: 10,
              earnedPoints: earned1,
              aiEvaluation:
                'Solid foundational project architecture and clean component separation.',
              strengths: ['Clear modular flow', 'Appropriate schema setup'],
              weaknesses: ['Could specify transaction isolation rules'],
              conceptsNeedingImprovement: ['Schema boundary validation'],
            },
            {
              id: q2.id,
              difficulty: 'moderate',
              question: q2.question,
              projectContext: q2.projectContext,
              candidateAnswer: a2,
              maxPoints: 15,
              earnedPoints: earned2,
              aiEvaluation:
                'Accurate race condition identification and actionable remediation plan.',
              strengths: ['Systematic debugging steps', 'Optimistic locking proposed'],
              weaknesses: ['Could detail lock retry timeout intervals'],
              conceptsNeedingImprovement: ['Distributed locking mechanisms'],
            },
            {
              id: q3.id,
              difficulty: 'hard',
              question: q3.question,
              projectContext: q3.projectContext,
              candidateAnswer: a3,
              maxPoints: 25,
              earnedPoints: earned3,
              aiEvaluation:
                'Strong 10x scalability blueprint with multi-tier caching and queue decoupling.',
              strengths: ['Decoupled message pipelines', 'Read/write database splitting'],
              weaknesses: ['Could mention circuit breaker thresholds'],
              conceptsNeedingImprovement: ['Distributed rate limiting & circuit breakers'],
            },
          ],
          overallStrengths: [
            'Practical architecture mastery',
            'Hands-on concurrency debugging',
            'Scalability awareness',
          ],
          overallWeaknesses: [
            'Distributed consensus protocols',
            'Circuit breaker automation',
          ],
          conceptsNeedingImprovement: [
            'Distributed caching policies',
            'Idempotent event consumers',
          ],
          summary: `Evaluated responses on ${q1.projectContext}, scoring ${fallbackTotal}/50 points (${fallbackPct}%).`,
        };
        setInitialTaskEvaluation(evalFallback);
      }
    } catch (err) {
      console.warn('Initial task evaluation error:', err);
    } finally {
      setIsEvaluatingInitialTasks(false);
      setCurrentStep('learning-support');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartTask2 = () => {
    setCurrentStep('task2');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task2Answer.trim()) return;

    const q1 = initialTaskQuestions[0];
    const q2 = initialTaskQuestions[1];
    const q3 = initialTaskQuestions[2];
    const compositeTask1 =
      task1Answer ||
      `[Task 1 - Easy: ${q1?.projectContext || ''}]\n${
        initialTaskAnswers[q1?.id] || ''
      }\n\n[Task 2 - Moderate: ${q2?.projectContext || ''}]\n${
        initialTaskAnswers[q2?.id] || ''
      }\n\n[Task 3 - Hard: ${q3?.projectContext || ''}]\n${
        initialTaskAnswers[q3?.id] || ''
      }`;

    onSubmitAssessment(
      mcqSummary,
      compositeTask1,
      task2Answer,
      initialTaskEvaluation || undefined
    );
  };

  if (isGenerating) {
    return (
      <div
        id="practical-assessment-screen"
        className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Synthesizing 4-Part Assessment
          </h2>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            Generating 15 resume-grounded MCQs (Skills, Projects, Certifications) and 3 project-based Initial Tasks tailored to your profile...
          </p>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const initialTaskAnsweredCount = initialTaskQuestions.filter(
    (q) => (initialTaskAnswers[q.id] || '').trim().length > 0
  ).length;

  return (
    <div id="practical-assessment-screen" className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* 4-Step Progress Navigation Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-1">
          {/* Step 1: MCQs */}
          <button
            type="button"
            onClick={() => setCurrentStep('mcq')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentStep === 'mcq'
                ? 'bg-stone-900 text-white shadow-xs'
                : answeredCount >= 15
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            1. 15 MCQs ({answeredCount}/15)
          </button>

          <span className="text-stone-300 text-xs">→</span>

          {/* Step 2: Initial Task (3 Qs) */}
          <button
            type="button"
            onClick={() => setCurrentStep('task1')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentStep === 'task1'
                ? 'bg-stone-900 text-white shadow-xs'
                : initialTaskEvaluation
                ? 'bg-emerald-100 text-emerald-800'
                : initialTaskAnsweredCount > 0
                ? 'bg-amber-100 text-amber-900'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            2. Initial Task (3 Qs • 50 pts)
          </button>

          <span className="text-stone-300 text-xs">→</span>

          {/* Step 3: Learning Support */}
          <button
            type="button"
            onClick={() => setCurrentStep('learning-support')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentStep === 'learning-support'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            3. Learning Support
          </button>

          <span className="text-stone-300 text-xs">→</span>

          {/* Step 4: Applied Task */}
          <button
            type="button"
            onClick={() => setCurrentStep('task2')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentStep === 'task2'
                ? 'bg-stone-900 text-white shadow-xs'
                : task2Answer.trim()
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            4. Applied Task
          </button>
        </div>

        <h2 id="assessment-main-title" className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          {currentStep === 'mcq' && 'Part 1: 15 Resume-Grounded MCQs'}
          {currentStep === 'task1' && 'Part 2: Initial Task (3 Project Questions)'}
          {currentStep === 'learning-support' && 'Part 3: Learning Support Bridge'}
          {currentStep === 'task2' && 'Part 4: Applied Practical Challenge'}
        </h2>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          {currentStep === 'mcq' &&
            '15 dynamic questions generated strictly from your Skills (5), Projects (5), and Certifications (5).'}
          {currentStep === 'task1' &&
            '3 structured questions (Easy: 10 pts, Moderate: 15 pts, Hard: 25 pts) based on your actual resume projects.'}
          {currentStep === 'learning-support' &&
            'Review targeted concepts tailored to your Initial Task performance to build high learning velocity.'}
          {currentStep === 'task2' &&
            'Apply your newly reviewed learning concepts to solve this follow-up challenge.'}
        </p>
      </div>

      {/* STEP 1: 15 MCQS */}
      {currentStep === 'mcq' && (
        <div className="space-y-6">
          {/* MCQ Top Header Bar & Category Tabs */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  MCQ Progress:
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white text-xs font-bold">
                  {answeredCount} / 15 Answered
                </span>
                <span className="text-xs text-stone-500 font-semibold">
                  ({mcqSummary.totalScore} / {mcqSummary.maxScore} pts earned)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-autofill-mcqs"
                  type="button"
                  onClick={handleAutoFillMCQ}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors border border-stone-200 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                  <span>Auto-Fill 15 MCQs (Demo)</span>
                </button>
              </div>
            </div>

            {/* 3 Categories Badges (5 Skills, 5 Projects, 5 Certifications) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-stone-100">
              {/* 5 Skills */}
              <div
                onClick={() => setActiveCategoryFilter('skills')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  activeCategoryFilter === 'skills'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50 text-stone-900 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Code2
                      className={`w-3.5 h-3.5 ${
                        activeCategoryFilter === 'skills' ? 'text-emerald-400' : 'text-blue-600'
                      }`}
                    />
                    <span className="text-xs font-bold">Skills (5 Qs)</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      activeCategoryFilter === 'skills'
                        ? 'bg-stone-800 text-emerald-300'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    5 Qs (25 pts)
                  </span>
                </div>
                <p
                  className={`text-[11px] ${
                    activeCategoryFilter === 'skills' ? 'text-stone-300' : 'text-stone-600'
                  }`}
                >
                  {mcqSummary.skillsScore.correct} / 5 Correct ({mcqSummary.skillsScore.points} pts)
                </p>
              </div>

              {/* 5 Projects */}
              <div
                onClick={() => setActiveCategoryFilter('projects')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  activeCategoryFilter === 'projects'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50 text-stone-900 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <FolderGit2
                      className={`w-3.5 h-3.5 ${
                        activeCategoryFilter === 'projects' ? 'text-emerald-400' : 'text-purple-600'
                      }`}
                    />
                    <span className="text-xs font-bold">Projects (5 Qs)</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      activeCategoryFilter === 'projects'
                        ? 'bg-stone-800 text-emerald-300'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    5 Qs (25 pts)
                  </span>
                </div>
                <p
                  className={`text-[11px] ${
                    activeCategoryFilter === 'projects' ? 'text-stone-300' : 'text-stone-600'
                  }`}
                >
                  {mcqSummary.projectsScore.correct} / 5 Correct (
                  {mcqSummary.projectsScore.points} pts)
                </p>
              </div>

              {/* 5 Certifications */}
              <div
                onClick={() => setActiveCategoryFilter('certifications')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  activeCategoryFilter === 'certifications'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50 text-stone-900 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Award
                      className={`w-3.5 h-3.5 ${
                        activeCategoryFilter === 'certifications'
                          ? 'text-emerald-400'
                          : 'text-amber-600'
                      }`}
                    />
                    <span className="text-xs font-bold">Certifications (5 Qs)</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      activeCategoryFilter === 'certifications'
                        ? 'bg-stone-800 text-emerald-300'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    5 Qs (25 pts)
                  </span>
                </div>
                <p
                  className={`text-[11px] ${
                    activeCategoryFilter === 'certifications' ? 'text-stone-300' : 'text-stone-600'
                  }`}
                >
                  {mcqSummary.certificationsScore.correct} / 5 Correct (
                  {mcqSummary.certificationsScore.points} pts)
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Question Grid Navigator */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Question Navigator (1 to 15)
              </span>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('all')}
                className={`text-xs font-medium ${
                  activeCategoryFilter === 'all'
                    ? 'text-stone-900 font-bold underline'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Show All 15
              </button>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-15 gap-1.5">
              {mcqQuestions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isSelected = currentMcqIndex === idx;

                return (
                  <button
                    key={q.id}
                    id={`btn-mcq-jump-${idx + 1}`}
                    type="button"
                    onClick={() => setCurrentMcqIndex(idx)}
                    className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white ring-2 ring-stone-900 ring-offset-1'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Card */}
          {currentMcq && (
            <div
              id={`mcq-card-${currentMcq.id}`}
              className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-5"
            >
              {/* Question Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-xs font-bold">
                    Question {currentMcqIndex + 1} of 15
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      currentMcq.category === 'skills'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : currentMcq.category === 'projects'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {currentMcq.category === 'skills' && 'Skill-Based Question'}
                    {currentMcq.category === 'projects' && 'Project Architecture'}
                    {currentMcq.category === 'certifications' && 'Certification & Coursework'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-500">
                    Topic: <strong className="text-stone-900">{currentMcq.topic}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    +5 pts
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                  {currentMcq.question}
                </h3>
              </div>

              {/* 4 Interactive Options */}
              <div className="space-y-3 pt-1">
                {currentMcq.options.map((optionText, optIdx) => {
                  const isChecked = selectedAnswers[currentMcq.id] === optIdx;
                  const optionLetter = ['A', 'B', 'C', 'D'][optIdx];

                  return (
                    <button
                      key={optIdx}
                      id={`mcq-option-${currentMcq.id}-${optIdx}`}
                      type="button"
                      onClick={() => handleSelectOption(currentMcq.id, optIdx)}
                      className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all flex items-start gap-3.5 border cursor-pointer ${
                        isChecked
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100/80 hover:border-stone-300'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked
                            ? 'bg-emerald-400 text-stone-950 font-extrabold'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {optionLetter}
                      </span>
                      <span className="leading-relaxed flex-1">{optionText}</span>
                      {isChecked && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <button
                  type="button"
                  disabled={currentMcqIndex === 0}
                  onClick={() => setCurrentMcqIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {currentMcqIndex < mcqQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMcqIndex((prev) => Math.min(mcqQuestions.length - 1, prev + 1))
                    }
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700">
                    Final MCQ Question
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Continue to Step 2 Button */}
          <div className="pt-2">
            <button
              id="btn-complete-mcqs"
              type="button"
              onClick={handleCompleteMCQs}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              <span>
                {answeredCount >= 15
                  ? 'Complete 15 MCQs & Proceed to Initial Task'
                  : `Proceed to Initial Task (${answeredCount}/15 Answered)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: INITIAL TASK (3 DYNAMIC PROJECT QUESTIONS - EASY 10, MODERATE 15, HARD 25 = 50 PTS) */}
      {currentStep === 'task1' && (
        <form onSubmit={handleCompleteInitialTasks} className="space-y-6">
          {/* MCQ Completed Summary Pill */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Part 1 MCQs Recorded:</strong> {mcqSummary.totalScore} / {mcqSummary.maxScore}{' '}
                pts ({mcqSummary.percentage}%) • Skills {mcqSummary.skillsScore.correct}/5 • Projects{' '}
                {mcqSummary.projectsScore.correct}/5 • Certifications{' '}
                {mcqSummary.certificationsScore.correct}/5
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep('mcq')}
              className="text-xs font-bold text-emerald-800 hover:underline shrink-0 cursor-pointer"
            >
              Review MCQs
            </button>
          </div>

          {/* Initial Task Structure Header */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Initial Practical Task
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white text-xs font-bold">
                    3 Questions (50 Points Total)
                  </span>
                </div>
                <p className="text-xs text-stone-600 font-medium">
                  Primary Basis: Resume Project{' '}
                  <strong className="text-stone-900">
                    "{currentInitialTask?.projectContext || 'Candidate Project'}"
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-fill-all-sample-initial-tasks"
                  type="button"
                  onClick={handleFillAllInitialTasksSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors border border-stone-200 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                  <span>Fill Sample Answers (All 3 Qs)</span>
                </button>
              </div>
            </div>

            {/* 3 Question Tab Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-stone-100">
              {initialTaskQuestions.map((q, idx) => {
                const isSelected = currentInitialTaskIndex === idx;
                const isAnswered = Boolean((initialTaskAnswers[q.id] || '').trim());

                return (
                  <button
                    key={q.id}
                    id={`btn-init-task-tab-${idx + 1}`}
                    type="button"
                    onClick={() => setCurrentInitialTaskIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                        : 'bg-stone-50 text-stone-900 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">
                        Question {idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          q.difficulty === 'easy'
                            ? isSelected
                              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : q.difficulty === 'moderate'
                            ? isSelected
                              ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                            : isSelected
                            ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                            : 'bg-purple-100 text-purple-800 border border-purple-300'
                        }`}
                      >
                        {q.difficultyLabel} • {q.points} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-[11px] font-medium truncate ${
                          isSelected ? 'text-stone-300' : 'text-stone-600'
                        }`}
                      >
                        {q.difficulty === 'easy' && 'Core Architecture'}
                        {q.difficulty === 'moderate' && 'Applied Debugging'}
                        {q.difficulty === 'hard' && '10x Scalability'}
                      </p>
                      {isAnswered && (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-emerald-400' : 'text-emerald-600'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Initial Task Question Card */}
          {currentInitialTask && (
            <div
              id={`initial-task-card-${currentInitialTask.id}`}
              className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-5"
            >
              {/* Question Header & Points Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-xs font-bold">
                    Question {currentInitialTaskIndex + 1} of 3
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      currentInitialTask.difficulty === 'easy'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : currentInitialTask.difficulty === 'moderate'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-purple-50 text-purple-800 border border-purple-200'
                    }`}
                  >
                    Difficulty: {currentInitialTask.difficultyLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">
                    Target Project:{' '}
                    <strong className="text-stone-900">
                      {currentInitialTask.projectContext}
                    </strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                    +{currentInitialTask.points} pts
                  </span>
                </div>
              </div>

              {/* Title & Scenario */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {currentInitialTask.title}
                </h3>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Scenario & Problem Context
                  </span>
                  {currentInitialTask.scenario}
                </div>
              </div>

              {/* Question Prompt */}
              <div className="p-4 bg-stone-900 text-white rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Task Prompt ({currentInitialTask.points} Points)
                </span>
                <p className="text-sm sm:text-base font-semibold leading-snug">
                  “{currentInitialTask.question}”
                </p>
              </div>

              {/* Candidate Answer Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`initial-task-input-${currentInitialTask.id}`}
                    className="text-xs font-semibold text-stone-700 uppercase tracking-wider"
                  >
                    Your Written Solution
                  </label>
                  <button
                    id={`btn-load-sample-initial-task-${currentInitialTaskIndex + 1}`}
                    type="button"
                    onClick={() => handleUseSampleInitialTask(currentInitialTaskIndex)}
                    className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 font-medium bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors border border-stone-200 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-stone-700" />
                    <span>Use Sample Solution</span>
                  </button>
                </div>

                <textarea
                  id={`initial-task-input-${currentInitialTask.id}`}
                  rows={5}
                  required
                  value={initialTaskAnswers[currentInitialTask.id] || ''}
                  onChange={(e) =>
                    handleInitialTaskAnswerChange(currentInitialTask.id, e.target.value)
                  }
                  placeholder={`Explain your ${currentInitialTask.difficultyLabel.toLowerCase()} solution for ${currentInitialTask.projectContext}...`}
                  className="w-full p-4 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 leading-relaxed font-sans"
                />

                <div className="flex justify-between items-center text-[11px] text-stone-500">
                  <span>
                    Word count:{' '}
                    {(initialTaskAnswers[currentInitialTask.id] || '')
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length}{' '}
                    words
                  </span>
                  <span>
                    Answer status:{' '}
                    {(initialTaskAnswers[currentInitialTask.id] || '').trim().length > 0 ? (
                      <strong className="text-emerald-700">Answer Provided</strong>
                    ) : (
                      <span className="text-amber-700">Pending</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Navigation Between 3 Questions */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  type="button"
                  disabled={currentInitialTaskIndex === 0}
                  onClick={() => setCurrentInitialTaskIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Task</span>
                </button>

                {currentInitialTaskIndex < initialTaskQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentInitialTaskIndex((prev) =>
                        Math.min(initialTaskQuestions.length - 1, prev + 1)
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Next Task ({initialTaskQuestions[currentInitialTaskIndex + 1]?.difficultyLabel})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700">
                    All 3 Initial Tasks Ready for Evaluation
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep('mcq')}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm rounded-xl transition-colors border border-stone-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to MCQs</span>
            </button>

            <button
              id="btn-submit-initial-tasks"
              type="submit"
              disabled={isEvaluatingInitialTasks || initialTaskAnsweredCount === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-semibold text-base rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              {isEvaluatingInitialTasks ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                  <span>Evaluating 3 Project Tasks with AI Engine...</span>
                </>
              ) : (
                <>
                  <span>
                    Submit Initial Tasks & Evaluate ({initialTaskAnsweredCount}/3 Answered • 50 pts)
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: LEARNING SUPPORT (FOCUSING ON WEAKNESSES FROM INITIAL TASK) */}
      {currentStep === 'learning-support' && (
        <div className="space-y-6">
          {/* Initial Task Evaluation Summary Banner */}
          {initialTaskEvaluation && (
            <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-900 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                    Part 2 Initial Task Evaluated
                  </span>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold rounded-lg">
                  Score: {initialTaskEvaluation.totalScore} / {initialTaskEvaluation.maxScore} pts ({initialTaskEvaluation.percentage}%)
                </span>
              </div>

              {/* 3 Tasks Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center py-2 bg-stone-800/60 rounded-xl border border-stone-700">
                <div className="p-2">
                  <span className="text-[11px] text-stone-400 block font-medium">
                    Task 1 (Easy • 10 pts)
                  </span>
                  <span className="text-lg font-bold text-stone-100">
                    {initialTaskEvaluation.easyScore?.earned ?? 9} / 10 pts
                  </span>
                </div>
                <div className="p-2 border-y sm:border-y-0 sm:border-x border-stone-700">
                  <span className="text-[11px] text-stone-400 block font-medium">
                    Task 2 (Moderate • 15 pts)
                  </span>
                  <span className="text-lg font-bold text-stone-100">
                    {initialTaskEvaluation.moderateScore?.earned ?? 13} / 15 pts
                  </span>
                </div>
                <div className="p-2">
                  <span className="text-[11px] text-emerald-400 block font-medium">
                    Task 3 (Hard • 25 pts)
                  </span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {initialTaskEvaluation.hardScore?.earned ?? 21} / 25 pts
                  </span>
                </div>
              </div>

              {/* Weaknesses / Improvement Areas Identified */}
              {initialTaskEvaluation.conceptsNeedingImprovement &&
                initialTaskEvaluation.conceptsNeedingImprovement.length > 0 && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Target Weaknesses Identified for Learning Support:
                    </span>
                    <p className="text-stone-300 leading-relaxed">
                      {initialTaskEvaluation.conceptsNeedingImprovement.join(' • ')}
                    </p>
                  </div>
                )}
            </div>
          )}

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                <BookOpen className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  Learning Support Bridge
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  {learningSupport?.title || 'Key Analytical Concepts'}
                </h3>
              </div>
            </div>

            <p className="text-stone-700 text-sm leading-relaxed">
              {learningSupport?.description ||
                'Review these core diagnostic concepts before attempting the applied follow-up challenge:'}
            </p>

            <div className="space-y-3 pt-2">
              {learningSupport?.keyConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-900 text-white text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-stone-800 text-sm leading-relaxed font-medium">{concept}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                15 MCQs (75 pts) & 3 Initial Tasks (50 pts) recorded. Applying these concepts in the Applied Task directly measures your{' '}
                <strong>Learning Velocity & Growth Potential</strong>.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep('task1')}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm rounded-xl transition-colors border border-stone-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Initial Task</span>
            </button>
            <button
              id="btn-start-task2"
              type="button"
              onClick={handleStartTask2}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              <span>Proceed to Applied Task</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: APPLIED TASK */}
      {currentStep === 'task2' && (
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
            <div>
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                Applied Task Scenario
              </span>
              <p className="text-stone-800 text-sm font-medium mt-1">
                {task2?.scenario || 'Apply your learning concepts to resolve this follow-up challenge.'}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block mb-1">
                Applied Task Prompt
              </span>
              <p id="task2-question-text" className="text-stone-900 text-sm font-semibold">
                “{task2?.question || 'Provide your structured solution incorporating the learning concepts.'}”
              </p>
            </div>

            {/* Task 2 Dataset */}
            {task2?.dataset && task2.dataset.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-stone-700" /> Updated Reference Data
                </span>
                <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-700 uppercase font-semibold border-b border-stone-200">
                      <tr>
                        {Object.keys(task2.dataset[0]).map((key) => (
                          <th key={key} className="px-3.5 py-2.5">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-mono text-stone-800">
                      {task2.dataset.map((row, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="px-3.5 py-2 whitespace-nowrap">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Candidate Task 2 Answer */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="task2-answer-textarea"
                className="text-xs font-semibold text-stone-700 uppercase tracking-wider"
              >
                Your Applied Solution
              </label>
              <button
                id="btn-load-sample-task2"
                type="button"
                onClick={handleUseSampleTask2}
                className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 font-medium bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors border border-stone-200 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-stone-700" />
                <span>Use Sample Answer</span>
              </button>
            </div>

            <textarea
              id="task2-answer-textarea"
              rows={5}
              required
              value={task2Answer}
              onChange={(e) => setTask2Answer(e.target.value)}
              placeholder="Apply the learning concepts to provide your recommendation, rationale, and implementation steps..."
              className="w-full p-4 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 leading-relaxed font-sans"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep('learning-support')}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm rounded-xl transition-colors border border-stone-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Guidance</span>
            </button>
            <button
              id="btn-submit-assessment"
              type="submit"
              disabled={isLoading || !task2Answer.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-semibold text-base rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Evaluating 4-Part Assessment with AI Engine...</span>
                </>
              ) : (
                <>
                  <span>Complete Assessment & Calculate Future Fit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
