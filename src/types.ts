export interface Challenge {
  taskTitle: string;
  taskObjective: string;
  starterCode: string;
  expectedOutput: string;
}

export interface Milestone {
  id: string;
  title: string;
  duration: string;
  description: string;
  concepts: string[];
  challenge: Challenge;
}

export interface LearningRoadmap {
  role: string;
  focus: string;
  milestones: Milestone[];
}

export interface SkillSparkCard {
  id: string;
  title: string;
  category: "React" | "Javascript" | "Python" | "CSS" | "SQL" | "Backend";
  summary: string;
  importance: string;
  codeSnippet?: string;
  language?: string;
  mcqs: MCQ[];
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface InterviewTurn {
  role: "user" | "interviewer";
  content: string;
  feedback?: string;
  score?: string;
}

export interface MockInterviewConfig {
  role: string;
  difficulty: "Junior" | "Mid-level" | "Senior" | "Lead";
  resumeSummary?: string;
}

export interface InterviewSkillScore {
  skillName: string;
  scoreMaxTen: number;
  justification: string;
}

export interface InterviewEvaluationReport {
  scoreSkills: InterviewSkillScore[];
  overallScore: number; // Max 100
  hiringRecommendation: "Strong Hire" | "Hire" | "Leaning Hire" | "No Hire";
  strengths: string[];
  improvements: string[];
  detailedReview: string;
}

export interface CheatSheetCategory {
  id: string;
  name: string;
  iconName: string;
  items: {
    question: string;
    answer: string;
    code?: string;
    language?: string;
  }[];
}

export interface ResumeRecommendation {
  section: string;
  currentText: string;
  recommendedText: string;
  explanation: string;
}

export interface ResumeOptimizationReport {
  matchScore: number;
  formatRating: string;
  foundKeywords: string[];
  missingKeywords: string[];
  alignmentAnalysis: string;
  recommendedChanges: ResumeRecommendation[];
  atsOptimizationTips: string[];
}
