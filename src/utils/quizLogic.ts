import type {
  QuizHistoryEntry,
  QuizQuestion,
  StreakState,
  SubjectId,
  UserAnswerRecord,
} from '../types/quiz';

/**
 * Normalizes a string for tolerant French short-answer comparison:
 * - lowercases
 * - removes accents/diacritics
 * - converts French decimal commas inside numbers (e.g., "3,5" -> "3.5")
 * - strips surrounding punctuation and collapses whitespace
 */
export function normalizeAnswer(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return '';

  const noAccents = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Replace decimal comma between digits with dot
  const normalizedDecimals = noAccents.replace(/(\d),(\d)/g, '$1.$2');
  // Remove spaces around '=' (e.g. "x = 5" -> "x=5")
  const normalizedEq = normalizedDecimals.replace(/\s*=\s*/g, '=');
  // Strip trailing punctuation
  const noTrailingPunct = normalizedEq.replace(/^[.,;:!?'"«»]+|[.,;:!?'"«»]+$/g, '');
  // Collapse internal whitespace
  return noTrailingPunct.replace(/\s+/g, ' ').trim();
}

function tryParseNumeric(val: string): number | null {
  const cleaned = normalizeAnswer(val).replace(/^[a-z]=/, '');
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
    return null;
  }
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

/**
 * Evaluates whether the user's answer matches the question's verified correct answer.
 */
export function checkUserAnswer(question: QuizQuestion, rawUserAnswer: string): boolean {
  const userNorm = normalizeAnswer(rawUserAnswer);
  if (!userNorm) return false;

  if (question.type === 'qcm' || question.type === 'vrai_faux') {
    return userNorm === normalizeAnswer(question.correctAnswer);
  }

  // Short-answer evaluation: exact normalized match, accepted variants, or numeric equivalence
  const candidates = [question.correctAnswer, ...(question.acceptedVariants ?? [])];
  for (const candidate of candidates) {
    const candNorm = normalizeAnswer(candidate);
    if (!candNorm) continue;
    if (userNorm === candNorm) return true;

    // Allow matching "5" when correct answer is "x = 5" (and vice versa)
    const userWithoutVar = userNorm.replace(/^[a-z]=/, '');
    const candWithoutVar = candNorm.replace(/^[a-z]=/, '');
    if (userWithoutVar && userWithoutVar === candWithoutVar) {
      return true;
    }

    const userNum = tryParseNumeric(userNorm);
    const candNum = tryParseNumeric(candNorm);
    if (userNum !== null && candNum !== null && Math.abs(userNum - candNum) < 1e-6) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts unique notion labels for questions the user answered incorrectly.
 */
export function computeMissedNotions(
  questions: QuizQuestion[],
  records: Record<string, UserAnswerRecord>,
): string[] {
  const seen = new Set<string>();
  const notions: string[] = [];
  for (const q of questions) {
    const rec = records[q.id];
    if (rec && !rec.isCorrect) {
      const label = q.notion.trim();
      if (label && !seen.has(label.toLowerCase())) {
        seen.add(label.toLowerCase());
        notions.push(label);
      }
    }
  }
  return notions;
}

/**
 * Returns local calendar date key formatted as YYYY-MM-DD.
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKeyUTC(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/**
 * Updates consecutive study days streak based on a YYYY-MM-DD local date key.
 */
export function updateStreak(current: StreakState, todayKey: string): StreakState {
  const activeDatesSet = new Set(current.activeDates);
  activeDatesSet.add(todayKey);
  const activeDates = Array.from(activeDatesSet).sort().slice(-30);

  if (current.lastActiveDate === todayKey) {
    return {
      ...current,
      activeDates,
    };
  }

  let nextStreak = 1;
  if (current.lastActiveDate) {
    const diffMs = parseDateKeyUTC(todayKey) - parseDateKeyUTC(current.lastActiveDate);
    const diffDays = Math.round(diffMs / 86_400_000);
    if (diffDays === 1) {
      nextStreak = current.currentStreak + 1;
    } else if (diffDays < 0) {
      // Clock anomaly or older entry: preserve current streak
      nextStreak = current.currentStreak;
    }
  }

  const bestStreak = Math.max(current.bestStreak, nextStreak);
  return {
    currentStreak: nextStreak,
    bestStreak,
    lastActiveDate: todayKey,
    activeDates,
  };
}

/**
 * Returns the last N calendar days ending at referenceDateKey (inclusive), oldest first.
 */
export function getRecentDaysWindow(referenceDateKey: string, count = 7): {
  dateKey: string;
  shortDayLabel: string;
  dayNumber: string;
}[] {
  const [y, m, d] = referenceDateKey.split('-').map(Number);
  const baseMs = Date.UTC(y, m - 1, d);
  const weekdayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const result: { dateKey: string; shortDayLabel: string; dayNumber: string }[] = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const dt = new Date(baseMs - offset * 86_400_000);
    const key = [
      dt.getUTCFullYear(),
      String(dt.getUTCMonth() + 1).padStart(2, '0'),
      String(dt.getUTCDate()).padStart(2, '0'),
    ].join('-');
    result.push({
      dateKey: key,
      shortDayLabel: weekdayLabels[dt.getUTCDay()],
      dayNumber: String(dt.getUTCDate()),
    });
  }

  return result;
}

export function filterHistoryBySubject(
  history: QuizHistoryEntry[],
  subject: SubjectId | 'all',
): QuizHistoryEntry[] {
  if (subject === 'all') return history;
  return history.filter((entry) => entry.subject === subject);
}

export function calculateHistoryStats(history: QuizHistoryEntry[]): {
  totalQuizzes: number;
  averagePercentage: number;
  bestPercentage: number;
} {
  if (history.length === 0) {
    return { totalQuizzes: 0, averagePercentage: 0, bestPercentage: 0 };
  }

  let sum = 0;
  let best = 0;
  for (const item of history) {
    sum += item.percentage;
    if (item.percentage > best) best = item.percentage;
  }

  return {
    totalQuizzes: history.length,
    averagePercentage: Math.round(sum / history.length),
    bestPercentage: best,
  };
}
