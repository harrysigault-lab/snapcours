import { useEffect, useState } from 'react';
import { Header, type AppView } from './components/Header';
import { HistoryView } from './components/HistoryView';
import { HomeSetup } from './components/HomeSetup';
import { QuizPlayer } from './components/QuizPlayer';
import { QuizResults } from './components/QuizResults';
import type {
  GeneratedQuizPayload,
  PhotoPage,
  QuizConfig,
  QuizHistoryEntry,
  QuizQuestion,
  StreakState,
  UserAnswerRecord,
} from './types/quiz';
import { getDemoQuizForSample } from './utils/demoQuizzes';
import { createSampleMathsPage } from './utils/imageHelpers';
import {
  computeMissedNotions,
  getLocalDateKey,
  updateStreak,
} from './utils/quizLogic';
import {
  loadHistory,
  loadStreak,
  loadTheme,
  saveHistory,
  saveStreak,
  saveTheme,
} from './utils/storage';

interface ActiveQuizState {
  topic: string;
  allQuestions: QuizQuestion[];
  currentQuestions: QuizQuestion[];
  isRetryMode: boolean;
  lastRecords: Record<string, UserAnswerRecord>;
  attemptKey: number;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());
  const [view, setView] = useState<AppView>('home');

  const [pages, setPages] = useState<PhotoPage[]>([]);
  const [config, setConfig] = useState<QuizConfig>({
    subject: 'maths',
    gradeLevel: 'college',
    mode: 'course_quiz',
    questionCount: 5,
    difficulty: 'moyen',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuizState | null>(null);

  const [history, setHistory] = useState<QuizHistoryEntry[]>(() => loadHistory());
  const [streak, setStreak] = useState<StreakState>(() => loadStreak());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const demo = getDemoQuizForSample('maths', 'similar_exercises');
      setPages([createSampleMathsPage()]);
      setConfig((prev) => ({ ...prev, subject: 'maths', mode: 'similar_exercises' }));
      setActiveQuiz({
        topic: demo.detectedTopic,
        allQuestions: demo.questions,
        currentQuestions: demo.questions,
        isRetryMode: false,
        lastRecords: {},
        attemptKey: Date.now(),
      });
      setView('quiz');
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  function handleToggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  async function requestQuizGeneration(avoidQuestions: string[] = []) {
    if (pages.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
      const demo = getDemoQuizForSample(config.subject, config.mode);
      setActiveQuiz({
        topic: demo.detectedTopic,
        allQuestions: demo.questions,
        currentQuestions: demo.questions,
        isRetryMode: false,
        lastRecords: {},
        attemptKey: Date.now(),
      });
      setView('quiz');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: pages.map((p) => ({ dataUrl: p.dataUrl, mimeType: p.mimeType })),
          subject: config.subject,
          gradeLevel: config.gradeLevel,
          mode: config.mode,
          questionCount: config.questionCount,
          difficulty: config.difficulty,
          avoidQuestions,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setErrorMessage(
          payload?.error ||
            'Une erreur est survenue pendant l’analyse de ta photo. Réessaie dans un instant.',
        );
        setView('home');
        return;
      }

      const data = payload as GeneratedQuizPayload;

      if (!data.isReadable || !Array.isArray(data.questions) || data.questions.length === 0) {
        setErrorMessage(
          data.unreadableReason ||
            'La photo semble un peu floue ou trop sombre pour être lue avec certitude. Peux-tu en reprendre une bien éclairée et bien cadrée ?',
        );
        setView('home');
        return;
      }

      setActiveQuiz({
        topic: data.detectedTopic || 'Révision du cours',
        allQuestions: data.questions,
        currentQuestions: data.questions,
        isRetryMode: false,
        lastRecords: {},
        attemptKey: Date.now(),
      });
      setView('quiz');
    } catch {
      setErrorMessage(
        'Connexion impossible au serveur de quiz. Vérifie ta connexion et réessaie.',
      );
      setView('home');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleQuizComplete(records: Record<string, UserAnswerRecord>) {
    if (!activeQuiz) return;

    const total = activeQuiz.currentQuestions.length;
    const score = Object.values(records).filter((r) => r.isCorrect).length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const missedNotions = computeMissedNotions(activeQuiz.currentQuestions, records);

    const todayKey = getLocalDateKey();
    const nextStreak = updateStreak(streak, todayKey);
    setStreak(nextStreak);
    saveStreak(nextStreak);

    if (!activeQuiz.isRetryMode) {
      const entry: QuizHistoryEntry = {
        id: `quiz-${Date.now()}`,
        dateIso: new Date().toISOString(),
        dateKey: todayKey,
        subject: config.subject,
        gradeLevel: config.gradeLevel,
        mode: config.mode,
        difficulty: config.difficulty,
        topic: activeQuiz.topic,
        score,
        total,
        percentage,
        missedNotions,
      };
      const nextHistory = [...history, entry];
      setHistory(nextHistory);
      saveHistory(nextHistory);
    }

    setActiveQuiz({
      ...activeQuiz,
      lastRecords: records,
    });
    setView('results');
  }

  function handleRetryMissed() {
    if (!activeQuiz) return;
    const missedQuestions = activeQuiz.currentQuestions.filter(
      (q) => !activeQuiz.lastRecords[q.id]?.isCorrect,
    );
    if (missedQuestions.length === 0) return;

    setActiveQuiz({
      ...activeQuiz,
      currentQuestions: missedQuestions,
      isRetryMode: true,
      lastRecords: {},
      attemptKey: Date.now(),
    });
    setView('quiz');
  }

  function handleGenerateNewQuiz() {
    const previousQuestions = activeQuiz?.allQuestions.map((q) => q.question) ?? [];
    requestQuizGeneration(previousQuestions);
  }

  function handleClearHistory() {
    setHistory([]);
    saveHistory([]);
  }

  function handleNavigate(target: 'home' | 'history') {
    setView(target);
  }

  const missedQuestionsCount = activeQuiz
    ? activeQuiz.currentQuestions.filter((q) => !activeQuiz.lastRecords[q.id]?.isCorrect).length
    : 0;

  const lastScore = activeQuiz
    ? Object.values(activeQuiz.lastRecords).filter((r) => r.isCorrect).length
    : 0;

  const lastMissedNotions = activeQuiz
    ? computeMissedNotions(activeQuiz.currentQuestions, activeQuiz.lastRecords)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        currentView={view}
        onNavigate={handleNavigate}
        streakCount={streak.currentStreak}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 pb-12">
        {view === 'home' && (
          <HomeSetup
            pages={pages}
            onChangePages={setPages}
            config={config}
            onChangeConfig={setConfig}
            onGenerateQuiz={() => requestQuizGeneration()}
            isGenerating={isGenerating}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
          />
        )}

        {view === 'quiz' && activeQuiz && (
          <QuizPlayer
            key={activeQuiz.attemptKey}
            topic={activeQuiz.topic}
            subject={config.subject}
            questions={activeQuiz.currentQuestions}
            isRetryMode={activeQuiz.isRetryMode}
            onExit={() => setView('home')}
            onComplete={handleQuizComplete}
          />
        )}

        {view === 'results' && activeQuiz && (
          <QuizResults
            topic={activeQuiz.topic}
            subject={config.subject}
            score={lastScore}
            total={activeQuiz.currentQuestions.length}
            missedNotions={lastMissedNotions}
            missedCount={missedQuestionsCount}
            streakCount={streak.currentStreak}
            onRetryMissed={handleRetryMissed}
            onGenerateNew={handleGenerateNewQuiz}
            onBackToSetup={() => setView('home')}
            onOpenHistory={() => setView('history')}
            isGeneratingNew={isGenerating}
          />
        )}

        {view === 'history' && (
          <HistoryView
            history={history}
            streak={streak}
            onStartRevision={() => setView('home')}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>
    </div>
  );
}
