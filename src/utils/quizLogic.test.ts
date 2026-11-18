import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHistoryStats,
  checkUserAnswer,
  computeMissedNotions,
  filterHistoryBySubject,
  getRecentDaysWindow,
  normalizeAnswer,
  updateStreak,
} from './quizLogic';
import type { QuizHistoryEntry, QuizQuestion, StreakState } from '../types/quiz';

test('normalizeAnswer strips accents, punctuation and normalizes decimal commas', () => {
  assert.equal(normalizeAnswer('  Photosynthèse ! '), 'photosynthese');
  assert.equal(normalizeAnswer('3,5'), '3.5');
  assert.equal(normalizeAnswer('x = 12'), 'x=12');
});

test('checkUserAnswer handles QCM, Vrai/Faux and tolerant short answers', () => {
  const qcm: QuizQuestion = {
    id: 'q1',
    type: 'qcm',
    notion: 'Chloroplaste',
    question: 'Où se déroule la photosynthèse ?',
    options: ['Mitochondrie', 'Chloroplaste', 'Noyau', 'Vacuole'],
    correctAnswer: 'Chloroplaste',
    explanation: 'Dans les chloroplastes.',
  };
  assert.equal(checkUserAnswer(qcm, 'Chloroplaste'), true);
  assert.equal(checkUserAnswer(qcm, 'Noyau'), false);

  const vf: QuizQuestion = {
    id: 'q2',
    type: 'vrai_faux',
    notion: 'Équation',
    question: 'La photosynthèse produit du dioxygène.',
    options: ['Vrai', 'Faux'],
    correctAnswer: 'Vrai',
    explanation: 'Oui, 6 O2 sont libérés.',
  };
  assert.equal(checkUserAnswer(vf, 'Vrai'), true);
  assert.equal(checkUserAnswer(vf, 'Faux'), false);

  const shortQ: QuizQuestion = {
    id: 'q3',
    type: 'reponse_courte',
    notion: 'Équation du 1er degré',
    question: 'Résoudre 2x + 3 = 10',
    options: [],
    correctAnswer: '3,5',
    acceptedVariants: ['x = 3.5'],
    explanation: '2x = 7 donc x = 3,5.',
  };
  assert.equal(checkUserAnswer(shortQ, '3.5'), true);
  assert.equal(checkUserAnswer(shortQ, 'x = 3,5'), true);
  assert.equal(checkUserAnswer(shortQ, '4'), false);
});

test('computeMissedNotions deduplicates notions from incorrect questions only', () => {
  const questions: QuizQuestion[] = [
    {
      id: '1',
      type: 'qcm',
      notion: 'Pythagore',
      question: 'Q1',
      options: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'E1',
    },
    {
      id: '2',
      type: 'qcm',
      notion: 'Thalès',
      question: 'Q2',
      options: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'E2',
    },
    {
      id: '3',
      type: 'vrai_faux',
      notion: 'Pythagore',
      question: 'Q3',
      options: ['Vrai', 'Faux'],
      correctAnswer: 'Vrai',
      explanation: 'E3',
    },
  ];
  const missed = computeMissedNotions(questions, {
    '1': { questionId: '1', userAnswer: 'B', isCorrect: false },
    '2': { questionId: '2', userAnswer: 'A', isCorrect: true },
    '3': { questionId: '3', userAnswer: 'Faux', isCorrect: false },
  });
  assert.deepEqual(missed, ['Pythagore']);
});

test('updateStreak increments consecutive days, preserves same-day, and resets after gap', () => {
  const empty: StreakState = {
    currentStreak: 0,
    bestStreak: 0,
    lastActiveDate: null,
    activeDates: [],
  };

  const day1 = updateStreak(empty, '2026-11-16');
  assert.equal(day1.currentStreak, 1);
  assert.equal(day1.bestStreak, 1);

  const sameDay = updateStreak(day1, '2026-11-16');
  assert.equal(sameDay.currentStreak, 1);

  const day2 = updateStreak(sameDay, '2026-11-17');
  assert.equal(day2.currentStreak, 2);
  assert.equal(day2.bestStreak, 2);

  const afterGap = updateStreak(day2, '2026-11-20');
  assert.equal(afterGap.currentStreak, 1);
  assert.equal(afterGap.bestStreak, 2);
});

test('getRecentDaysWindow returns 7 chronological days ending on reference date', () => {
  const days = getRecentDaysWindow('2026-11-18', 7);
  assert.equal(days.length, 7);
  assert.equal(days[0].dateKey, '2026-11-12');
  assert.equal(days[6].dateKey, '2026-11-18');
});

test('filterHistoryBySubject and calculateHistoryStats compute accurate aggregates', () => {
  const history: QuizHistoryEntry[] = [
    {
      id: 'h1',
      dateIso: '2026-11-17T10:00:00Z',
      dateKey: '2026-11-17',
      subject: 'maths',
      gradeLevel: 'college',
      mode: 'course_quiz',
      difficulty: 'moyen',
      topic: 'Équations',
      score: 4,
      total: 5,
      percentage: 80,
      missedNotions: ['Signe'],
    },
    {
      id: 'h2',
      dateIso: '2026-11-18T10:00:00Z',
      dateKey: '2026-11-18',
      subject: 'svt',
      gradeLevel: 'lycee',
      mode: 'course_quiz',
      difficulty: 'facile',
      topic: 'Photosynthèse',
      score: 5,
      total: 5,
      percentage: 100,
      missedNotions: [],
    },
  ];

  const mathsOnly = filterHistoryBySubject(history, 'maths');
  assert.equal(mathsOnly.length, 1);
  assert.equal(mathsOnly[0].id, 'h1');

  const stats = calculateHistoryStats(history);
  assert.equal(stats.totalQuizzes, 2);
  assert.equal(stats.averagePercentage, 90);
  assert.equal(stats.bestPercentage, 100);
});
