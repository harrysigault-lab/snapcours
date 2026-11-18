import { useMemo, useState } from 'react';
import { Flame, Trash2, TrendingUp } from 'lucide-react';
import {
  getSubjectInfo,
  SUBJECTS,
  type QuizHistoryEntry,
  type StreakState,
  type SubjectId,
} from '../types/quiz';
import {
  calculateHistoryStats,
  filterHistoryBySubject,
  getLocalDateKey,
  getRecentDaysWindow,
} from '../utils/quizLogic';

interface HistoryViewProps {
  history: QuizHistoryEntry[];
  streak: StreakState;
  onStartRevision: () => void;
  onClearHistory: () => void;
}

export function HistoryView({
  history,
  streak,
  onStartRevision,
  onClearHistory,
}: HistoryViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [activePointId, setActivePointId] = useState<string | null>(null);

  const todayKey = getLocalDateKey();
  const recentDays = useMemo(() => getRecentDaysWindow(todayKey, 7), [todayKey]);

  const filtered = useMemo(
    () => filterHistoryBySubject(history, selectedSubject),
    [history, selectedSubject],
  );
  const stats = useMemo(() => calculateHistoryStats(filtered), [filtered]);

  // Chronological order (oldest to newest) for progression curve
  const chartEntries = useMemo(() => {
    return [...filtered].slice(-12);
  }, [filtered]);

  const activeEntry =
    chartEntries.find((e) => e.id === activePointId) ??
    chartEntries[chartEntries.length - 1] ??
    null;

  // SVG coordinate math
  const chartWidth = 600;
  const chartHeight = 220;
  const padLeft = 38;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 32;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const points = chartEntries.map((entry, idx) => {
    const x =
      chartEntries.length === 1
        ? padLeft + plotW / 2
        : padLeft + (idx / (chartEntries.length - 1)) * plotW;
    const y = padTop + plotH - (entry.percentage / 100) * plotH;
    return { x, y, entry };
  });

  const polylinePath = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath =
    points.length >= 2
      ? `M ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} ` +
        points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : '';

  const lineColor =
    selectedSubject === 'all' ? '#4F46E5' : getSubjectInfo(selectedSubject).chartColor;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Ton parcours de révision
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1">
            Suis ta régularité et l’évolution de tes scores par matière.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 inline-flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Effacer l’historique</span>
          </button>
        )}
      </div>

      {/* Série + Statistiques clés */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section
          aria-labelledby="streak-heading"
          className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="streak-heading" className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Série de révisions
              </h2>
              <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums flex items-center gap-2">
                <Flame className="w-7 h-7 text-amber-500 shrink-0" aria-hidden="true" />
                <span>
                  {streak.currentStreak} jour{streak.currentStreak > 1 ? 's' : ''}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Record</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                {streak.bestStreak} j
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {recentDays.map((day) => {
              const active = streak.activeDates.includes(day.dateKey);
              const isToday = day.dateKey === todayKey;
              return (
                <div
                  key={day.dateKey}
                  className={`py-2 px-1 rounded-xl text-center border ${
                    active
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : isToday
                        ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-slate-700 dark:text-slate-200'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span className="block text-[11px] font-semibold">{day.shortDayLabel}</span>
                  <span className="block text-sm font-bold tabular-nums mt-0.5">
                    {day.dayNumber}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section
          aria-labelledby="stats-heading"
          className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 id="stats-heading" className="text-base font-bold text-slate-900 dark:text-white">
              Indicateurs de progression
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedSubject('all')}
                aria-pressed={selectedSubject === 'all'}
                className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedSubject === 'all'
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Toutes
              </button>
              {SUBJECTS.map((subj) => (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSelectedSubject(subj.id)}
                  aria-pressed={selectedSubject === subj.id}
                  className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedSubject === subj.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {subj.shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Quiz terminés
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {stats.totalQuizzes}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Score moyen
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {stats.averagePercentage}%
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Meilleur score
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {stats.bestPercentage}%
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Courbe de progression */}
      <section
        aria-labelledby="chart-heading"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 id="chart-heading" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <span>Courbe de progression</span>
          </h2>
          {activeEntry && (
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 tabular-nums">
              {getSubjectInfo(activeEntry.subject).shortLabel} · {activeEntry.topic} ·{' '}
              <strong className="font-bold text-slate-900 dark:text-white">
                {activeEntry.percentage}%
              </strong>{' '}
              ({activeEntry.score}/{activeEntry.total})
            </p>
          )}
        </div>

        {chartEntries.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Aucun quiz enregistré pour cette sélection. Termine un premier quiz pour voir ta courbe apparaître !
            </p>
            <button
              type="button"
              onClick={onStartRevision}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors cursor-pointer"
            >
              Lancer une révision
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[320px] max-h-[260px]"
              role="img"
              aria-label="Courbe d’évolution des scores en pourcentage"
              data-testid="progression-chart"
            >
              {/* Lignes repères horizontales */}
              {[0, 25, 50, 75, 100].map((tick) => {
                const y = padTop + plotH - (tick / 100) * plotH;
                return (
                  <g key={tick}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartWidth - padRight}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="1"
                      strokeDasharray={tick === 0 ? undefined : '4 4'}
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400 dark:fill-slate-500 text-[11px] font-mono"
                    >
                      {tick}%
                    </text>
                  </g>
                );
              })}

              {/* Aire sous la courbe */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill={lineColor}
                  fillOpacity="0.12"
                />
              )}

              {/* Ligne de progression */}
              {points.length >= 2 && (
                <polyline
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePath}
                />
              )}

              {/* Points cliquables */}
              {points.map((pt, idx) => {
                const isSelected = activeEntry?.id === pt.entry.id;
                return (
                  <g key={pt.entry.id}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 7 : 5}
                      fill={isSelected ? lineColor : '#FFFFFF'}
                      stroke={lineColor}
                      strokeWidth="3"
                      className="cursor-pointer"
                      onClick={() => setActivePointId(pt.entry.id)}
                    />
                    <text
                      x={pt.x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      className="fill-slate-500 dark:fill-slate-400 text-[11px] font-mono"
                    >
                      #{idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </section>

      {/* Liste des quiz récents */}
      {filtered.length > 0 && (
        <section
          aria-labelledby="history-list-heading"
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs"
        >
          <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-800">
            <h2 id="history-list-heading" className="text-lg font-bold text-slate-900 dark:text-white">
              Derniers quiz réalisés
            </h2>
          </div>

          <ul className="divide-y divide-slate-200/80 dark:divide-slate-800" data-testid="history-list">
            {[...filtered].reverse().map((item) => {
              const subj = getSubjectInfo(item.subject);
              const dateDisplay = new Date(item.dateIso).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              });
              return (
                <li
                  key={item.id}
                  className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className={`font-bold ${subj.accentText}`}>{subj.label}</span>
                      {' · '}
                      <span>{dateDisplay}</span>
                      {' · '}
                      <span>
                        {item.mode === 'similar_exercises'
                          ? 'Exercices similaires'
                          : 'Quiz sur mon cours'}
                      </span>
                    </p>
                    <p className="text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {item.topic}
                    </p>
                    {item.missedNotions.length > 0 && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        À revoir : {item.missedNotions.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <span
                      className={`text-lg font-extrabold tabular-nums ${
                        item.percentage >= 75
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : item.percentage >= 50
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                    <span className="ml-2 sm:ml-0 sm:block text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                      {item.score} / {item.total}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
