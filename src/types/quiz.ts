export type SubjectId =
  | 'maths'
  | 'francais'
  | 'histoire_geo'
  | 'svt'
  | 'physique_chimie'
  | 'anglais'
  | 'autre';

export type GradeLevel =
  | 'primaire'
  | 'college'
  | 'lycee'
  | 'superieur';

export type QuizMode = 'course_quiz' | 'similar_exercises';

export type QuestionCount = 5 | 10 | 15;

export type Difficulty = 'facile' | 'moyen' | 'difficile';

export type QuestionType = 'qcm' | 'vrai_faux' | 'reponse_courte';

export interface SubjectInfo {
  id: SubjectId;
  label: string;
  shortLabel: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  chartColor: string;
}

export const SUBJECTS: SubjectInfo[] = [
  {
    id: 'maths',
    label: 'Mathématiques',
    shortLabel: 'Maths',
    accentBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    accentText: 'text-indigo-700 dark:text-indigo-300',
    accentBorder: 'border-indigo-300 dark:border-indigo-700',
    chartColor: '#4F46E5',
  },
  {
    id: 'francais',
    label: 'Français',
    shortLabel: 'Français',
    accentBg: 'bg-rose-50 dark:bg-rose-950/60',
    accentText: 'text-rose-700 dark:text-rose-300',
    accentBorder: 'border-rose-300 dark:border-rose-700',
    chartColor: '#E11D48',
  },
  {
    id: 'histoire_geo',
    label: 'Histoire-Géo',
    shortLabel: 'Hist.-Géo',
    accentBg: 'bg-amber-50 dark:bg-amber-950/60',
    accentText: 'text-amber-800 dark:text-amber-300',
    accentBorder: 'border-amber-300 dark:border-amber-700',
    chartColor: '#D97706',
  },
  {
    id: 'svt',
    label: 'SVT',
    shortLabel: 'SVT',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    accentText: 'text-emerald-700 dark:text-emerald-300',
    accentBorder: 'border-emerald-300 dark:border-emerald-700',
    chartColor: '#059669',
  },
  {
    id: 'physique_chimie',
    label: 'Physique-Chimie',
    shortLabel: 'Phys.-Chimie',
    accentBg: 'bg-sky-50 dark:bg-sky-950/60',
    accentText: 'text-sky-700 dark:text-sky-300',
    accentBorder: 'border-sky-300 dark:border-sky-700',
    chartColor: '#0284C7',
  },
  {
    id: 'anglais',
    label: 'Anglais',
    shortLabel: 'Anglais',
    accentBg: 'bg-violet-50 dark:bg-violet-950/60',
    accentText: 'text-violet-700 dark:text-violet-300',
    accentBorder: 'border-violet-300 dark:border-violet-700',
    chartColor: '#7C3AED',
  },
  {
    id: 'autre',
    label: 'Autre matière',
    shortLabel: 'Autre',
    accentBg: 'bg-slate-100 dark:bg-slate-800/80',
    accentText: 'text-slate-700 dark:text-slate-300',
    accentBorder: 'border-slate-300 dark:border-slate-600',
    chartColor: '#475569',
  },
];

export const GRADE_LEVELS: { id: GradeLevel; label: string; detail: string }[] = [
  { id: 'primaire', label: 'Primaire', detail: 'CM1 – CM2' },
  { id: 'college', label: 'Collège', detail: '6e – 3e' },
  { id: 'lycee', label: 'Lycée', detail: '2nde – Tle' },
  { id: 'superieur', label: 'Supérieur', detail: 'Université / Prépa' },
];

export const QUIZ_MODES: { id: QuizMode; label: string; description: string }[] = [
  {
    id: 'course_quiz',
    label: 'Quiz sur mon cours',
    description: 'Questions basées directement sur le contenu de tes photos.',
  },
  {
    id: 'similar_exercises',
    label: 'Exercices similaires',
    description: 'Nouveaux exercices du même type avec valeurs et énoncés variés.',
  },
];

export const QUESTION_COUNTS: QuestionCount[] = [5, 10, 15];

export const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'facile', label: 'Facile' },
  { id: 'moyen', label: 'Moyen' },
  { id: 'difficile', label: 'Difficile' },
];

export interface PhotoPage {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
}

export interface QuizConfig {
  subject: SubjectId;
  gradeLevel: GradeLevel;
  mode: QuizMode;
  questionCount: QuestionCount;
  difficulty: Difficulty;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  notion: string;
  question: string;
  options: string[];
  correctAnswer: string;
  acceptedVariants?: string[];
  explanation: string;
  steps?: string[];
}

export interface GeneratedQuizPayload {
  isReadable: boolean;
  unreadableReason?: string;
  detectedTopic: string;
  questions: QuizQuestion[];
}

export interface UserAnswerRecord {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizHistoryEntry {
  id: string;
  dateIso: string;
  dateKey: string;
  subject: SubjectId;
  gradeLevel: GradeLevel;
  mode: QuizMode;
  difficulty: Difficulty;
  topic: string;
  score: number;
  total: number;
  percentage: number;
  missedNotions: string[];
}

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  activeDates: string[];
}

export function getSubjectInfo(id: SubjectId): SubjectInfo {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[SUBJECTS.length - 1];
}
