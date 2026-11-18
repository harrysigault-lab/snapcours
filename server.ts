import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface ImageInput {
  dataUrl: string;
  mimeType?: string;
}

interface GenerateQuizBody {
  images: ImageInput[];
  subject: string;
  gradeLevel: string;
  mode: 'course_quiz' | 'similar_exercises';
  questionCount: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  avoidQuestions?: string[];
}

const SUBJECT_LABELS: Record<string, string> = {
  maths: 'Mathématiques',
  francais: 'Français',
  histoire_geo: 'Histoire-Géographie',
  svt: 'SVT (Sciences de la Vie et de la Terre)',
  physique_chimie: 'Physique-Chimie',
  anglais: 'Anglais',
  autre: 'Autre matière scolaire',
};

const GRADE_LABELS: Record<string, string> = {
  primaire: 'Primaire (CM1-CM2)',
  college: 'Collège (6e à 3e)',
  lycee: 'Lycée (Seconde à Terminale)',
  superieur: 'Enseignement supérieur',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  facile: 'Facile (bases et compréhension directe)',
  moyen: 'Moyen (application et réflexion modérée)',
  difficile: 'Difficile (approfondissement, pièges classiques et synthèse)',
};

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseDataUrl(dataUrl: string, fallbackMime = 'image/jpeg'): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: fallbackMime, data: dataUrl };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '30mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/quiz/generate', async (req, res) => {
    try {
      const body = req.body as GenerateQuizBody;
      if (!body || !Array.isArray(body.images) || body.images.length === 0) {
        res.status(400).json({
          error: 'Ajoute au moins une photo de ton cours ou de tes exercices avant de lancer le quiz.',
        });
        return;
      }

      const questionCount = [5, 10, 15].includes(Number(body.questionCount))
        ? Number(body.questionCount)
        : 5;
      const subjectLabel = SUBJECT_LABELS[body.subject] ?? 'Matière scolaire';
      const gradeLabel = GRADE_LABELS[body.gradeLevel] ?? 'Collège';
      const difficultyLabel = DIFFICULTY_LABELS[body.difficulty] ?? 'Moyen';
      const isSimilarMode = body.mode === 'similar_exercises';
      const isStemSubject = body.subject === 'maths' || body.subject === 'physique_chimie';

      const ai = getGeminiClient();

      const imageParts = body.images.slice(0, 6).map((img) => {
        const parsed = parseDataUrl(img.dataUrl, img.mimeType || 'image/jpeg');
        return {
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.data,
          },
        };
      });

      const avoidText =
        Array.isArray(body.avoidQuestions) && body.avoidQuestions.length > 0
          ? `\nQuestions déjà posées récemment (formule de nouvelles questions différentes) :\n- ${body.avoidQuestions
              .slice(0, 12)
              .join('\n- ')}`
          : '';

      const systemInstruction = `Tu es un professeur particulier bienveillant, rigoureux et encourageant en France.
Ton rôle est d'analyser les photos de cours ou d'exercices fournies par l'élève et de générer un quiz interactif en français.

RÈGLES ABSOLUES :
1. LISIBILITÉ DE LA PHOTO : Examine attentivement toutes les images. Si l'image est trop floue, trop sombre, coupée, illisible ou ne contient aucun contenu exploitable de cours/exercice, mets "isReadable": false et rédige un message doux et poli dans "unreadableReason" pour inviter l'élève à reprendre une photo plus nette et bien éclairée (et laisse "questions": []).
2. FIDÉLITÉ AU CONTENU ET AU PROGRAMME : Base tes questions UNIQUEMENT sur ce qui est visible sur les photos et sur le programme officiel de la matière (${subjectLabel}, niveau ${gradeLabel}). N'invente jamais de faits absents du cours ou hors programme.
3. MODES DE QUIZ :
   - Si mode = "course_quiz" (Quiz sur mon cours) : pose des questions de compréhension, de mémorisation et d'application directe basées sur le contenu visible des photos.
   - Si mode = "similar_exercises" (Exercices similaires) : crée de NOUVEAUX exercices du même type et de la même structure que ceux visibles sur les photos, mais avec des valeurs numériques, équations, phrases ou énoncés différents. Résous mentalement chaque exercice avant d'écrire la réponse pour garantir une correction 100 % exacte et vérifiée.
4. VARIÉTÉ DES FORMATS : Génère EXACTEMENT ${questionCount} questions en mélangeant les trois types :
   - "qcm" : 4 propositions plausibles dont une seule est exacte. "correctAnswer" doit être strictement identique à l'une des chaînes de "options".
   - "vrai_faux" : "options" doit être exactement ["Vrai", "Faux"], et "correctAnswer" doit être "Vrai" ou "Faux".
   - "reponse_courte" : question appelant une réponse courte et précise (un nombre, un mot-clé, une valeur comme "x = 4" ou "4"). Laisse "options": [] et fournis "acceptedVariants" (ex: ["4", "x = 4", "4 cm"]) pour tolérer les écritures équivalentes.
5. EXPLICATIONS ET TON :
   - Ton toujours chaleureux, clair, encourageant et pédagogique (jamais moqueur).
   - "explanation" : courte explication claire de pourquoi la réponse est juste.
   - "steps" : ${
     isStemSubject
       ? 'OBLIGATOIRE pour Maths et Physique-Chimie : fournis 2 à 5 étapes claires numérotées (ex: "Isoler le terme en x : 4x = 24") montrant tout le raisonnement.'
       : 'Optionnel (peut contenir 2 ou 3 points clés rapides si utile, sinon tableau vide []).'
   }`;

      const userPrompt = `Analyse ces ${imageParts.length} page(s) de cours/exercices.
Paramètres choisis par l'élève :
- Matière : ${subjectLabel}
- Niveau scolaire : ${gradeLabel}
- Mode : ${isSimilarMode ? 'Exercices similaires (nouvelles valeurs / nouveaux énoncés)' : 'Quiz sur mon cours'}
- Nombre exact de questions souhaité : ${questionCount}
- Difficulté : ${difficultyLabel}${avoidText}

Vérifie chaque calcul et chaque réponse avant de produire le JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [...imageParts, { text: userPrompt }],
        },
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: isStemSubject || isSimilarMode ? ThinkingLevel.HIGH : ThinkingLevel.MEDIUM,
          },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isReadable: {
                type: Type.BOOLEAN,
                description: 'True si les photos sont lisibles et exploitables, false si floues/illisibles.',
              },
              unreadableReason: {
                type: Type.STRING,
                description: 'Message bienveillant si isReadable est false.',
              },
              detectedTopic: {
                type: Type.STRING,
                description: 'Court titre du thème détecté dans la photo (ex: Équations du 1er degré).',
              },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: {
                      type: Type.STRING,
                      description: 'Valeurs autorisées : qcm, vrai_faux, reponse_courte',
                    },
                    notion: {
                      type: Type.STRING,
                      description: 'Nom court de la notion travaillée (2 à 4 mots).',
                    },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctAnswer: { type: Type.STRING },
                    acceptedVariants: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    explanation: { type: Type.STRING },
                    steps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['id', 'type', 'notion', 'question', 'options', 'correctAnswer', 'explanation'],
                },
              },
            },
            required: ['isReadable', 'detectedTopic', 'questions'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({
          error: 'Le service n’a pas renvoyé de réponse. Réessaie dans quelques secondes.',
        });
        return;
      }

      const parsed = JSON.parse(rawText);
      const normalizedQuestions = Array.isArray(parsed.questions)
        ? parsed.questions.map((q: Record<string, unknown>, idx: number) => {
            const rawType = String(q.type || 'qcm');
            const type =
              rawType === 'vrai_faux' || rawType === 'reponse_courte' ? rawType : 'qcm';
            let options = Array.isArray(q.options) ? q.options.map(String) : [];
            let correctAnswer = String(q.correctAnswer ?? '');

            if (type === 'vrai_faux') {
              options = ['Vrai', 'Faux'];
              correctAnswer = correctAnswer.toLowerCase().startsWith('f') ? 'Faux' : 'Vrai';
            } else if (type === 'qcm') {
              if (options.length < 2) {
                options = [correctAnswer || 'Option A', 'Autre réponse'];
              }
              if (correctAnswer && !options.includes(correctAnswer)) {
                options[0] = correctAnswer;
              }
            } else {
              options = [];
            }

            return {
              id: String(q.id || `q-${idx + 1}`),
              type,
              notion: String(q.notion || parsed.detectedTopic || 'Notion du cours'),
              question: String(q.question || ''),
              options,
              correctAnswer,
              acceptedVariants: Array.isArray(q.acceptedVariants)
                ? q.acceptedVariants.map(String)
                : [],
              explanation: String(q.explanation || ''),
              steps: Array.isArray(q.steps) ? q.steps.map(String).filter(Boolean) : [],
            };
          })
        : [];

      res.json({
        isReadable: Boolean(parsed.isReadable),
        unreadableReason: parsed.unreadableReason ? String(parsed.unreadableReason) : undefined,
        detectedTopic: String(parsed.detectedTopic || 'Révision du cours'),
        questions: normalizedQuestions,
      });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error('[api/quiz/generate] Error:', errMessage);

      if (
        errMessage === 'GEMINI_API_KEY_MISSING' ||
        errMessage.includes('API_KEY_INVALID') ||
        errMessage.includes('PERMISSION_DENIED') ||
        errMessage.includes('403')
      ) {
        res.status(403).json({
          error:
            'La clé API Gemini est manquante ou invalide. Vérifie ta clé dans Settings > Secrets puis réessaie.',
        });
        return;
      }

      if (errMessage.includes('429') || errMessage.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error: 'Trop de demandes en même temps. Patiente un court instant puis réessaie !',
        });
        return;
      }

      if (errMessage.includes('404') || errMessage.includes('NOT_FOUND')) {
        res.status(502).json({
          error: 'Le modèle d’analyse est momentanément indisponible. Réessaie dans un instant.',
        });
        return;
      }

      res.status(500).json({
        error: 'Impossible d’analyser la photo pour le moment. Vérifie la netteté de ton image et réessaie.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RéviSnap server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
