import { useRef, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Calculator,
  Camera,
  Dna,
  FlaskConical,
  Globe,
  ImagePlus,
  Languages,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  DIFFICULTIES,
  GRADE_LEVELS,
  QUESTION_COUNTS,
  QUIZ_MODES,
  SUBJECTS,
  type PhotoPage,
  type QuizConfig,
  type SubjectId,
} from '../types/quiz';
import {
  compressImageFile,
  createSampleMathsPage,
  loadSampleImageUrl,
} from '../utils/imageHelpers';

interface HomeSetupProps {
  pages: PhotoPage[];
  onChangePages: (pages: PhotoPage[]) => void;
  config: QuizConfig;
  onChangeConfig: (config: QuizConfig) => void;
  onGenerateQuiz: () => void;
  isGenerating: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

const SUBJECT_ICONS: Record<SubjectId, typeof Calculator> = {
  maths: Calculator,
  francais: BookOpen,
  histoire_geo: Globe,
  svt: Dna,
  physique_chimie: FlaskConical,
  anglais: Languages,
  autre: Sparkles,
};

export function HomeSetup({
  pages,
  onChangePages,
  config,
  onChangeConfig,
  onGenerateQuiz,
  isGenerating,
  errorMessage,
  onClearError,
}: HomeSetupProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isReadingFiles, setIsReadingFiles] = useState(false);

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    onClearError();
    setIsReadingFiles(true);
    try {
      const processed = await Promise.all(
        Array.from(files).slice(0, 6 - pages.length).map((f) => compressImageFile(f)),
      );
      onChangePages([...pages, ...processed].slice(0, 6));
    } catch (err) {
      console.error(err);
    } finally {
      setIsReadingFiles(false);
    }
  }

  function handleRemovePage(id: string) {
    onChangePages(pages.filter((p) => p.id !== id));
    onClearError();
  }

  async function handleUseSampleSvt() {
    onClearError();
    setIsReadingFiles(true);
    try {
      const sample = await loadSampleImageUrl(
        '/src/assets/images/sample_svt_cours_1795031589798.jpg',
        'SVT · La Photosynthèse',
      );
      onChangePages([sample]);
      onChangeConfig({
        ...config,
        subject: 'svt',
        gradeLevel: 'lycee',
        mode: 'course_quiz',
      });
    } catch {
      // Fallback if asset unavailable
    } finally {
      setIsReadingFiles(false);
    }
  }

  function handleUseSampleMaths() {
    onClearError();
    const mathsPage = createSampleMathsPage();
    onChangePages([mathsPage]);
    onChangeConfig({
      ...config,
      subject: 'maths',
      gradeLevel: 'college',
      mode: 'similar_exercises',
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white [text-wrap:balance]">
          Transforme ton cours en quiz interactif
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
          Prends en photo tes notes ou tes exercices (une ou plusieurs pages) et entraîne-toi avec des corrections claires.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-amber-950 dark:text-amber-100">
                Impossible de lire correctement la photo
              </p>
              <p className="text-sm text-amber-900 dark:text-amber-200 mt-1">
                {errorMessage}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
          >
            Reprendre une photo
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Colonne gauche : Capture et gestion multi-pages */}
        <section
          aria-labelledby="capture-heading"
          className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs"
        >
          <div className="flex items-baseline justify-between gap-2 mb-4">
            <h2 id="capture-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              1. Tes photos de cours
            </h2>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              {pages.length} / 6 pages
            </span>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="sr-only"
            aria-label="Prendre une photo avec l’appareil"
            onChange={(e) => {
              handleFilesSelected(e.target.files);
              e.target.value = '';
            }}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            aria-label="Importer des photos depuis la galerie"
            onChange={(e) => {
              handleFilesSelected(e.target.files);
              e.target.value = '';
            }}
          />

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isGenerating || isReadingFiles || pages.length >= 6}
              className="w-full min-h-[64px] px-5 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer"
            >
              <Camera className="w-6 h-6 shrink-0" aria-hidden="true" />
              <span>Prendre une photo</span>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={isGenerating || isReadingFiles || pages.length >= 6}
              className="w-full min-h-[48px] px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <ImagePlus className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span>Importer depuis la galerie</span>
            </button>
          </div>

          {/* Pages ajoutées */}
          {pages.length > 0 ? (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Pages sélectionnées
                </p>
                {pages.length < 6 && (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="min-h-[36px] px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Ajouter une page</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="photo-pages-grid">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-[3/4]"
                  >
                    <img
                      src={page.dataUrl}
                      alt={`Page ${index + 1} : ${page.name}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-white truncate">
                        Page {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePage(page.id)}
                        aria-label={`Supprimer la page ${index + 1}`}
                        className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg bg-black/50 hover:bg-rose-600 text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 pt-5 border-t border-slate-200/80 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
                Pas de feuille sous la main ? Essaie avec un exemple :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleUseSampleMaths}
                  disabled={isReadingFiles || isGenerating}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-800/50 text-left transition-colors cursor-pointer"
                >
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Maths · Équations
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    3e · Exercices types
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleUseSampleSvt}
                  disabled={isReadingFiles || isGenerating}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 bg-slate-50 dark:bg-slate-800/50 text-left transition-colors cursor-pointer"
                >
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                    SVT · Photosynthèse
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Lycée · Fiche de cours
                  </span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Colonne droite : Paramètres du quiz */}
        <section
          aria-labelledby="config-heading"
          className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6"
        >
          <h2 id="config-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            2. Configure ton entraînement
          </h2>

          {/* Matière */}
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
              Matière
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SUBJECTS.map((subj) => {
                const Icon = SUBJECT_ICONS[subj.id];
                const selected = config.subject === subj.id;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => onChangeConfig({ ...config, subject: subj.id })}
                    aria-pressed={selected}
                    className={`min-h-[48px] px-3 py-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      selected
                        ? `${subj.accentBg} ${subj.accentBorder} ${subj.accentText} font-bold shadow-xs`
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="text-sm truncate">{subj.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Niveau scolaire */}
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
              Niveau scolaire
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GRADE_LEVELS.map((lvl) => {
                const selected = config.gradeLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => onChangeConfig({ ...config, gradeLevel: lvl.id })}
                    aria-pressed={selected}
                    className={`min-h-[52px] px-3 py-2 rounded-2xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="block text-sm font-bold">{lvl.label}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {lvl.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode */}
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
              Mode d’entraînement
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUIZ_MODES.map((m) => {
                const selected = config.mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onChangeConfig({ ...config, mode: m.id })}
                    aria-pressed={selected}
                    className={`min-h-[68px] p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="block text-sm font-bold">{m.label}</span>
                    <span className="block text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {m.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nombre de questions + Difficulté */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
                Nombre de questions
              </p>
              <div className="grid grid-cols-3 gap-2">
                {QUESTION_COUNTS.map((count) => {
                  const selected = config.questionCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => onChangeConfig({ ...config, questionCount: count })}
                      aria-pressed={selected}
                      className={`min-h-[48px] rounded-xl border text-sm font-bold tabular-nums transition-all cursor-pointer ${
                        selected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {count}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
                Difficulté
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((diff) => {
                  const selected = config.difficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => onChangeConfig({ ...config, difficulty: diff.id })}
                      aria-pressed={selected}
                      className={`min-h-[48px] px-2 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                        selected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {diff.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bouton principal */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onGenerateQuiz}
              disabled={pages.length === 0 || isGenerating}
              className="w-full min-h-[56px] px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
                  <span>Lecture du cours et création du quiz…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>
                    {pages.length === 0
                      ? 'Ajoute d’abord une photo'
                      : `Générer mon quiz (${config.questionCount} questions)`}
                  </span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
