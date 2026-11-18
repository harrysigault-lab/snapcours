import { Award, CheckCircle2, Flame, RotateCcw, Sparkles, TrendingUp } from 'lucide-react';
import { getSubjectInfo, type SubjectId } from '../types/quiz';

interface QuizResultsProps {
  topic: string;
  subject: SubjectId;
  score: number;
  total: number;
  missedNotions: string[];
  missedCount: number;
  streakCount: number;
  onRetryMissed: () => void;
  onGenerateNew: () => void;
  onBackToSetup: () => void;
  onOpenHistory: () => void;
  isGeneratingNew: boolean;
}

export function QuizResults({
  topic,
  subject,
  score,
  total,
  missedNotions,
  missedCount,
  streakCount,
  onRetryMissed,
  onGenerateNew,
  onBackToSetup,
  onOpenHistory,
  isGeneratingNew,
}: QuizResultsProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const subjectInfo = getSubjectInfo(subject);

  let headline = 'Beau travail de révision !';
  let subline = 'Chaque séance renforce ta mémoire. Continue sur ta lancée !';
  if (percentage === 100) {
    headline = 'Sans faute, félicitations !';
    subline = 'Tu maîtrises parfaitement les notions de ce cours.';
  } else if (percentage >= 75) {
    headline = 'Très solide performance !';
    subline = 'Tu as compris l’essentiel. Un petit coup d’œil sur les points restants suffira.';
  } else if (percentage < 50) {
    headline = 'C’est en s’entraînant qu’on progresse !';
    subline = 'Ne lâche rien : refais les questions ratées pour ancrer ces notions.';
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs text-center">
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          {subjectInfo.label} · {topic}
        </p>

        <div className="my-6 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border-4 border-indigo-600 dark:border-indigo-400 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-200 tabular-nums">
              {percentage}%
            </span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 tabular-nums">
              {score} / {total}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white [text-wrap:balance]">
          {headline}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          {subline}
        </p>

        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
          <Flame className="w-4 h-4 text-amber-500" aria-hidden="true" />
          <span className="tabular-nums">
            Série en cours : {streakCount} jour{streakCount > 1 ? 's' : ''} consécutif{streakCount > 1 ? 's' : ''}
          </span>
        </div>

        {/* Notions à revoir */}
        <div className="mt-7 pt-6 border-t border-slate-200 dark:border-slate-800 text-left">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            {missedNotions.length > 0 ? (
              <>
                <Award className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
                <span>Notions à revoir</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden="true" />
                <span>Notions maîtrisées</span>
              </>
            )}
          </h2>

          {missedNotions.length > 0 ? (
            <ul className="space-y-2">
              {missedNotions.map((notion, idx) => (
                <li
                  key={idx}
                  className="px-4 py-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/70 text-sm font-medium text-amber-950 dark:text-amber-100"
                >
                  {notion}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Aucune notion à revoir sur cette série : tu as tout validé !
            </p>
          )}
        </div>

        {/* Deux boutons principaux demandés */}
        <div className="mt-8 space-y-3">
          {missedCount > 0 && (
            <button
              type="button"
              onClick={onRetryMissed}
              disabled={isGeneratingNew}
              className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Refaire les questions ratées ({missedCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onGenerateNew}
            disabled={isGeneratingNew}
            className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>
              {isGeneratingNew ? 'Génération en cours…' : 'Générer un nouveau quiz'}
            </span>
          </button>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onBackToSetup}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Changer de photos ou matière
            </button>
            <button
              type="button"
              onClick={onOpenHistory}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              <span>Voir ma progression</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
