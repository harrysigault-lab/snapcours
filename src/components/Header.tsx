import { Flame, Moon, Sun } from 'lucide-react';

export type AppView = 'home' | 'quiz' | 'results' | 'history';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: 'home' | 'history') => void;
  streakCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({
  currentView,
  onNavigate,
  streakCount,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const isHomeTab = currentView === 'home' || currentView === 'quiz' || currentView === 'results';

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-8">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-lg py-1"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-bold shrink-0">
            R
          </span>
          <span>RéviSnap</span>
        </button>

        <nav aria-label="Navigation principale" className="flex items-center gap-2.5 sm:gap-6">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`min-h-[44px] px-1.5 sm:px-2 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              isHomeTab
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Réviser
          </button>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className={`min-h-[44px] px-1.5 sm:px-2 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              currentView === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Historique
          </button>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('history')}
            aria-label={`Série actuelle : ${streakCount} jour${streakCount > 1 ? 's' : ''}`}
            className="min-h-[44px] px-1.5 sm:px-2.5 flex items-center gap-1 text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <Flame className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
            <span className="tabular-nums">
              {streakCount} j
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
