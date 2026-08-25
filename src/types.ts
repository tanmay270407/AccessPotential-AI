export interface DocumentClassification {
  type: 'resume' | 'portfolio' | 'academic' | 'certificate' | 'job_description' | 'unrelated' | 'unknown';
  label: string;
  isResume: boolean;
  isPortfolio: boolean;
  analysisMessage: string;
  atsScore?: number;
  atsApplicable: boolean;
  whyAts?: {
    matchedSkills: string[];
    missingSkills: string[];
    relevantExperience: string;
    relevantProjectsCount: number;
    relevantProjects: string[];
    roleRelevance: string;
  };
  projectRelevanceScore?: number;
  portfolioAnalysis?: {
    projectsFound: string[];
    technologiesUsed: string[];
    candidateContribution: string;
    technicalSkills: string[];
    problemSolvingEvidence: string;
    relevanceExplanation: string;
  };
}

export interface CandidateProject {
  title: string;
  technologies: string[];
  description?: string;
  candidateRole?: string;
}

export interface CandidateProfile {
  id?: string;
  candidateId?: string;
  name: string;
  education: string;
  skills: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  experience: string;
  isFresher?: boolean;
  preferredJobRole: string;
  suggestedJobRole?: string;
  suggestedJobRoles?: string[];
  projects?: string[];
  structuredProjects?: CandidateProject[];
  certifications?: string[];
  achievements?: string[];
  resumeFileName?: string;
  resumeFileBase64?: string;
  resumeFileMimeType?: string;
  resumeFilePath?: string;
  resumeStorageUrl?: string;
  resumeContent?: string;
  documentClassification?: DocumentClassification;
  documentRawText?: string;
  atsScore?: number;
  currentFit?: number;
  currentFitStatus?: 'calculated' | 'pending';
  currentFitExplanation?: string;
  supportNeeds?: string[];
  extractedDetails?: {
    skillsFound: string[];
    technicalSkillsFound?: string[];
    softSkillsFound?: string[];
    experienceLevel: string;
    educationSummary: string;
    projects: string[];
    certifications?: string[];
    achievements?: string[];
    transferableStrengths: string[];
  };
}

export interface FutureFitComponents {
  problemSolving: number;
  learningSpeed: number;
  adaptability: number;
  feedbackResponse: number;
  transferableSkills: number;
}

export interface AssessmentMCQ {
  id: string;
  category: 'skills' | 'projects' | 'certifications';
  topic: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  points: number;
  explanation?: string;
}

export interface MCQScoreSummary {
  totalQuestions: number;
  correctCount: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  skillsScore: { correct: number; total: number; points: number; maxPoints: number };
  projectsScore: { correct: number; total: number; points: number; maxPoints: number };
  certificationsScore: { correct: number; total: number; points: number; maxPoints: number };
  selectedAnswers?: { [questionId: string]: number };
  questions?: AssessmentMCQ[];
}

export interface InitialTaskQuestion {
  id: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  difficultyLabel: string;
  points: number; // Easy: 10, Moderate: 15, Hard: 25
  title: string;
  projectContext: string;
  scenario: string;
  question: string;
  dataset?: Array<{ [key: string]: string | number }>;
  sampleAnswer?: string;
  evaluationCriteria?: string;
}

export interface InitialTaskQuestionResult {
  id: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  question: string;
  projectContext: string;
  candidateAnswer: string;
  maxPoints: number;
  earnedPoints: number;
  aiEvaluation: string;
  strengths: string[];
  weaknesses: string[];
  conceptsNeedingImprovement: string[];
}

export interface InitialTaskEvaluation {
  totalScore: number;
  maxScore: number; // 50
  percentage: number;
  easyScore: { earned: number; max: number }; // max 10
  moderateScore: { earned: number; max: number }; // max 15
  hardScore: { earned: number; max: number }; // max 25
  questions: InitialTaskQuestionResult[];
  overallStrengths: string[];
  overallWeaknesses: string[];
  conceptsNeedingImprovement: string[];
  summary: string;
}

export interface AssessmentTaskData {
  title: string;
  question: string;
  scenario: string;
  dataset?: Array<{ [key: string]: string | number }>;
  sampleAnswer?: string;
  skillFocus?: string;
  isPersonalized?: boolean;
  mcqs?: AssessmentMCQ[];
  initialTasks?: InitialTaskQuestion[];
  initialTaskEvaluation?: InitialTaskEvaluation;
  learningSupport: {
    title: string;
    description: string;
    keyConcepts: string[];
  };
  task2: {
    title: string;
    scenario: string;
    question: string;
    dataset?: Array<{ [key: string]: string | number }>;
    sampleAnswer?: string;
    skillFocus?: string;
  };
}

export interface WorkplaceFactor {
  name: string;
  supported: boolean;
  impactDescription: string;
  category?: 'Schedule' | 'Environment' | 'Software' | 'Equipment';
}

export interface JobRole {
  id: string;
  title: string;
  category: string;
  skills: string[];
  description: string;
  currentFit?: number;
  futureFitComponents?: FutureFitComponents;
  assessmentTask: AssessmentTaskData;
  workplaceProfile: {
    factors: WorkplaceFactor[];
    primaryBarrier: {
      title: string;
      category: string;
      severity: string;
      description: string;
      impact?: string;
      barrierType?: string;
    };
    adaptation: {
      problem: string;
      recommendedAction: string;
      initialReadiness: number;
      improvedReadiness: number;
      implementationTime: string;
      costEstimate: string;
      recommendationLabel: string;
      explanation: string;
      humanReviewNote?: string;
    };
  };
}

export interface AssessmentResultData {
  overallPerformance: number;
  mcqSummary?: MCQScoreSummary;
  initialTaskEvaluation?: InitialTaskEvaluation;
  task1Score?: number;
  task2Score?: number;
  scores: {
    problemSolving: number;
    reasoning: number;
    decisionMaking: number;
    communication: number;
    technicalApproach: number;
  };
  learningVelocity: {
    firstTask: number;
    secondTask: number;
    improvement: number;
    label: string;
    explanation: string;
  };
  futureFitComponents: FutureFitComponents;
  finalFutureFit: number;
  aiFeedbackSummary?: string;
}

export interface FinalRecommendationOutcome {
  recommendation: 'Hire + Adapt' | 'Consider with Development Plan' | 'Not Currently Recommended';
  tagline: string;
  explanation: string;
  candidatePotential: number;
  jobFit: number;
  workplaceReadiness: number;
  decisionFactors: Array<{
    label: string;
    weight: number;
    desc: string;
  }>;
  humanReviewNotes: string[];
}

export type ScreenId =
  | 'welcome'
  | 'profile'
  | 'jobs'
  | 'job-match'
  | 'assessment'
  | 'assessment-result'
  | 'workplace-readiness'
  | 'barrier-detection'
  | 'adaptation-plan'
  | 'decision-mirror'
  | 'success-match';


