import type { QuizHistoryEntry, StreakState } from '../types/quiz';

const HISTORY_KEY = 'revisnap_history_v1';
const STREAK_KEY = 'revisnap_streak_v1';
const THEME_KEY = 'revisnap_theme_v1';

export const DEFAULT_STREAK: StreakState = {
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  activeDates: [],
};

export function loadHistory(): QuizHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: QuizHistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(-100)));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return DEFAULT_STREAK;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.currentStreak === 'number') {
      return {
        currentStreak: parsed.currentStreak,
        bestStreak: parsed.bestStreak ?? parsed.currentStreak,
        lastActiveDate: parsed.lastActiveDate ?? null,
        activeDates: Array.isArray(parsed.activeDates) ? parsed.activeDates : [],
      };
    }
    return DEFAULT_STREAK;
  } catch {
    return DEFAULT_STREAK;
  }
}

export function saveStreak(streak: StreakState): void {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore storage errors
  }
}
