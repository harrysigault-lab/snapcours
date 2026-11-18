import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Send,
} from 'lucide-react';
import {
  getSubjectInfo,
  type QuizQuestion,
  type SubjectId,
  type UserAnswerRecord,
} from '../types/quiz';
import { checkUserAnswer } from '../utils/quizLogic';

interface QuizPlayerProps {
  topic: string;
  subject: SubjectId;
  questions: QuizQuestion[];
  isRetryMode?: boolean;
  onExit: () => void;
  onComplete: (records: Record<string, UserAnswerRecord>) => void;
}

const QUESTION_TYPE_LABELS: Record<QuizQuestion['type'], string> = {
  qcm: 'Choix multiple',
  vrai_faux: 'Vrai ou Faux',
  reponse_courte: 'Réponse courte',
};

const CONFETTI_OFFSETS = [
  { x: -65, y: -55, color: '#10B981', rotate: -35 },
  { x: -30, y: -78, color: '#4F46E5', rotate: 25 },
  { x: 0, y: -85, color: '#F59E0B', rotate: -15 },
  { x: 35, y: -72, color: '#0EA5E9', rotate: 45 },
  { x: 68, y: -50, color: '#EC4899', rotate: -40 },
  { x: -48, y: -30, color: '#F59E0B', rotate: 60 },
  { x: 52, y: -25, color: '#10B981', rotate: -55 },
];

export function QuizPlayer({
  topic,
  subject,
  questions,
  isRetryMode = false,
  onExit,
  onComplete,
}: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [records, setRecords] = useState<Record<string, UserAnswerRecord>>({});
  const [shortInput, setShortInput] = useState('');
  const [celebrateKey, setCelebrateKey] = useState(0);

  const currentQuestion = questions[currentIndex];
  const currentRecord = currentQuestion ? records[currentQuestion.id] : undefined;
  const isAnswered = Boolean(currentRecord);
  const totalQuestions = questions.length;
  const correctCount = Object.values(records).filter((r) => r.isCorrect).length;
  const progressPercent = Math.round(
    ((currentIndex + (isAnswered ? 1 : 0)) / Math.max(totalQuestions, 1)) * 100,
  );
  const subjectInfo = getSubjectInfo(subject);

  function submitAnswer(answerText: string) {
    if (!currentQuestion || isAnswered) return;
    const trimmed = answerText.trim();
    if (!trimmed) return;

    const isCorrect = checkUserAnswer(currentQuestion, trimmed);
    if (isCorrect) {
      setCelebrateKey((k) => k + 1);
    }

    setRecords((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        userAnswer: trimmed,
        isCorrect,
      },
    }));
  }

  function handleShortSubmit(e: FormEvent) {
    e.preventDefault();
    submitAnswer(shortInput);
  }

  function handleNext() {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((i) => i + 1);
      setShortInput('');
    } else {
      onComplete(records);
    }
  }

  if (!currentQuestion) {
    return null;
  }

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
      {/* Barre supérieure du quiz */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          type="button"
          onClick={onExit}
          className="min-h-[44px] px-3 py-2 -ml-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Quitter</span>
        </button>

        <div className="text-right">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {subjectInfo.shortLabel} · {isRetryMode ? 'Rattrapage' : topic}
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums" data-testid="quiz-score">
            Score : {correctCount} / {totalQuestions}
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
          <span className="tabular-nums">
            Question {currentIndex + 1} sur {totalQuestions}
          </span>
          <span className="tabular-nums">{progressPercent} %</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progression du quiz"
          className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-indigo-600 transition-transform duration-300 origin-left"
            style={{ transform: `scaleX(${Math.max(progressPercent, 4) / 100})` }}
          />
        </div>
      </div>

      {/* Carte question */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 shadow-xs">
        {/* Effet de réussite léger (confetti particules compositor-only) */}
        <AnimatePresence>
          {isAnswered && currentRecord?.isCorrect && (
            <div
              key={celebrateKey}
              aria-hidden="true"
              className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 z-20"
            >
              {CONFETTI_OFFSETS.map((p, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0.6, rotate: 0 }}
                  animate={{ opacity: 0, x: p.x, y: p.y, scale: 1.15, rotate: p.rotate }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute block w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Métadonnées propres sans pilules */}
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
          {QUESTION_TYPE_LABELS[currentQuestion.type]} · {currentQuestion.notion}
        </p>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-6 [text-wrap:balance]">
          {currentQuestion.question}
        </h2>

        {/* Options QCM ou Vrai / Faux */}
        {(currentQuestion.type === 'qcm' || currentQuestion.type === 'vrai_faux') && (
          <div
            className={`grid gap-3 ${
              currentQuestion.type === 'vrai_faux' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {currentQuestion.options.map((option, idx) => {
              const isSelected = currentRecord?.userAnswer === option;
              const isOptionCorrect = option === currentQuestion.correctAnswer;

              let stateStyle =
                'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-900 dark:text-slate-100';

              if (isAnswered) {
                if (isOptionCorrect) {
                  stateStyle =
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 font-semibold';
                } else if (isSelected && !isOptionCorrect) {
                  stateStyle =
                    'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-100';
                } else {
                  stateStyle =
                    'border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500';
                }
              }

              return (
                <button
                  key={`${currentQuestion.id}-opt-${idx}`}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => submitAnswer(option)}
                  className={`min-h-[56px] w-full p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer disabled:cursor-default ${stateStyle}`}
                >
                  {currentQuestion.type === 'qcm' && (
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                        isAnswered && isOptionCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isSelected
                            ? 'bg-amber-500 text-white'
                            : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {letters[idx] ?? idx + 1}
                    </span>
                  )}
                  <span className="text-base leading-snug flex-1">{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Champ Réponse courte */}
        {currentQuestion.type === 'reponse_courte' && (
          <form onSubmit={handleShortSubmit} className="space-y-3">
            <label htmlFor="short-answer-input" className="sr-only">
              Ta réponse
            </label>
            <input
              id="short-answer-input"
              type="text"
              value={isAnswered ? currentRecord?.userAnswer ?? '' : shortInput}
              onChange={(e) => setShortInput(e.target.value)}
              disabled={isAnswered}
              placeholder="Écris ta réponse ici…"
              autoComplete="off"
              className="w-full min-h-[56px] px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base focus:outline-2 focus:outline-indigo-600 disabled:opacity-80"
            />
            {!isAnswered && (
              <button
                type="submit"
                disabled={!shortInput.trim()}
                className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 text-white font-bold text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Valider ma réponse</span>
              </button>
            )}
          </form>
        )}

        {/* Zone de correction immédiate */}
        {isAnswered && currentRecord && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4"
            data-testid="question-feedback"
          >
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                currentRecord.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
              }`}
            >
              {currentRecord.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <HeartHandshake className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div className="space-y-1">
                <p className="font-bold text-base">
                  {currentRecord.isCorrect
                    ? 'Bravo, c’est juste !'
                    : 'Pas tout à fait, tu vas y arriver !'}
                </p>
                {!currentRecord.isCorrect && (
                  <p className="text-sm font-medium">
                    Bonne réponse : <strong className="font-bold">{currentQuestion.correctAnswer}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                {currentQuestion.explanation}
              </p>

              {currentQuestion.steps && currentQuestion.steps.length > 0 && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-4 space-y-2.5">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Correction étape par étape
                  </p>
                  <ol className="space-y-2">
                    {currentQuestion.steps.map((step, sIdx) => (
                      <li
                        key={sIdx}
                        className="flex items-start gap-2.5 text-sm text-slate-800 dark:text-slate-100"
                      >
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0 tabular-nums">
                          {sIdx + 1}.
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>
                {currentIndex + 1 < totalQuestions ? 'Question suivante' : 'Voir mes résultats'}
              </span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
