import type { GeneratedQuizPayload, QuizMode } from '../types/quiz';

export function getDemoQuizForSample(
  subject: string,
  mode: QuizMode,
): GeneratedQuizPayload {
  if (subject === 'svt') {
    return {
      isReadable: true,
      detectedTopic: 'La photosynthèse',
      questions: [
        {
          id: 'demo-svt-1',
          type: 'qcm',
          notion: 'Organite cellulaire',
          question: 'Dans quel organite de la cellule végétale se déroule la photosynthèse ?',
          options: ['La mitochondrie', 'Le chloroplaste', 'Le noyau', 'Le ribosome'],
          correctAnswer: 'Le chloroplaste',
          explanation:
            'Les chloroplastes contiennent la chlorophylle et les thylakoïdes indispensables à la photosynthèse.',
          steps: [],
        },
        {
          id: 'demo-svt-2',
          type: 'vrai_faux',
          notion: 'Équation bilan',
          question:
            'La photosynthèse consomme du dioxygène (O₂) et rejette du dioxyde de carbone (CO₂).',
          options: ['Vrai', 'Faux'],
          correctAnswer: 'Faux',
          explanation:
            'C’est l’inverse ! Les plantes absorbent le CO₂ et l’eau pour produire du glucose et libérer du dioxygène (6 O₂).',
          steps: [],
        },
        {
          id: 'demo-svt-3',
          type: 'reponse_courte',
          notion: 'Pigment photosynthétique',
          question: 'Quel pigment vert capte l’énergie lumineuse dans les chloroplastes ?',
          options: [],
          correctAnswer: 'La chlorophylle',
          acceptedVariants: ['chlorophylle', 'la chlorophylle'],
          explanation:
            'La chlorophylle donne aux feuilles leur couleur verte et capte la lumière pour démarrer la phase photochimique.',
          steps: [],
        },
        {
          id: 'demo-svt-4',
          type: 'qcm',
          notion: 'Phase chimique',
          question: 'Où se déroule la phase chimique (cycle de Calvin) qui produit le glucose ?',
          options: [
            'Dans le stroma du chloroplaste',
            'Dans la paroi cellulaire',
            'Dans la vacuole',
            'Dans les stomates uniquement',
          ],
          correctAnswer: 'Dans le stroma du chloroplaste',
          explanation:
            'La phase photochimique a lieu dans les thylakoïdes, tandis que le cycle de Calvin se déroule dans le stroma.',
          steps: [],
        },
        {
          id: 'demo-svt-5',
          type: 'vrai_faux',
          notion: 'Échanges gazeux',
          question: 'Les stomates des feuilles permettent l’entrée du CO₂ nécessaire à la photosynthèse.',
          options: ['Vrai', 'Faux'],
          correctAnswer: 'Vrai',
          explanation:
            'Les stomates sont de minuscules orifices sur les feuilles qui assurent les échanges gazeux (entrée de CO₂, sortie d’O₂).',
          steps: [],
        },
      ],
    };
  }

  // Default: Maths (Équations & Théorème de Pythagore)
  if (mode === 'similar_exercises') {
    return {
      isReadable: true,
      detectedTopic: 'Équations & Pythagore (Exercices similaires)',
      questions: [
        {
          id: 'demo-math-sim-1',
          type: 'reponse_courte',
          notion: 'Équation du 1er degré',
          question: 'Résoudre l’équation suivante : 4x - 7 = 17. Quelle est la valeur de x ?',
          options: [],
          correctAnswer: '6',
          acceptedVariants: ['x = 6', 'x=6'],
          explanation: 'On isole 4x en ajoutant 7 des deux côtés, puis on divise par 4.',
          steps: [
            'Ajouter 7 de chaque côté : 4x = 17 + 7 = 24',
            'Diviser par 4 : x = 24 / 4',
            'On obtient x = 6',
          ],
        },
        {
          id: 'demo-math-sim-2',
          type: 'qcm',
          notion: 'Théorème de Pythagore',
          question:
            'Soit EFG un triangle rectangle en E avec EF = 5 cm et EG = 12 cm. Quelle est la longueur de l’hypoténuse FG ?',
          options: ['13 cm', '17 cm', '11 cm', '14 cm'],
          correctAnswer: '13 cm',
          explanation: 'D’après le théorème de Pythagore, FG² = EF² + EG².',
          steps: [
            'Identifier l’hypoténuse : le triangle est rectangle en E, donc l’hypoténuse est [FG].',
            'Appliquer Pythagore : FG² = 5² + 12² = 25 + 144 = 169',
            'Prendre la racine carrée : FG = √169 = 13 cm',
          ],
        },
        {
          id: 'demo-math-sim-3',
          type: 'vrai_faux',
          notion: 'Équation avec x des deux côtés',
          question: 'La solution de l’équation 5x + 2 = 3x + 14 est x = 6.',
          options: ['Vrai', 'Faux'],
          correctAnswer: 'Vrai',
          explanation: 'En regroupant les termes en x d’un côté et les constantes de l’autre, on trouve bien x = 6.',
          steps: [
            'Soustraire 3x des deux côtés : 2x + 2 = 14',
            'Soustraire 2 des deux côtés : 2x = 12',
            'Diviser par 2 : x = 6',
          ],
        },
        {
          id: 'demo-math-sim-4',
          type: 'qcm',
          notion: 'Développement et réduction',
          question: 'Quelle est la forme développée et réduite de 3(2x - 4) + 5 ?',
          options: ['6x - 7', '6x - 12', '5x - 7', '6x + 1'],
          correctAnswer: '6x - 7',
          explanation: 'On distribue le 3 sur (2x - 4) puis on ajoute 5.',
          steps: [
            'Développer : 3 × 2x - 3 × 4 = 6x - 12',
            'Ajouter +5 : 6x - 12 + 5 = 6x - 7',
          ],
        },
        {
          id: 'demo-math-sim-5',
          type: 'reponse_courte',
          notion: 'Équation du 1er degré',
          question: 'Résoudre : 2x + 9 = 16. Donne la valeur de x.',
          options: [],
          correctAnswer: '3,5',
          acceptedVariants: ['3.5', 'x = 3,5', 'x = 3.5', '7/2'],
          explanation: 'On soustrait 9 puis on divise 7 par 2.',
          steps: [
            'Soustraire 9 : 2x = 16 - 9 = 7',
            'Diviser par 2 : x = 7 / 2 = 3,5',
          ],
        },
      ],
    };
  }

  return {
    isReadable: true,
    detectedTopic: 'Équations & Théorème de Pythagore',
    questions: [
      {
        id: 'demo-math-1',
        type: 'qcm',
        notion: 'Équation du 1er degré',
        question: 'Dans l’exemple résolu 3x + 5 = 20, quelle est la première opération effectuée ?',
        options: [
          'Soustraire 5 des deux côtés',
          'Diviser par 3 immédiatement',
          'Multiplier par 5',
          'Ajouter 20 des deux côtés',
        ],
        correctAnswer: 'Soustraire 5 des deux côtés',
        explanation: 'Pour isoler 3x, on commence par soustraire 5 de chaque membre.',
        steps: [
          'Partir de 3x + 5 = 20',
          'Soustraire 5 : 3x = 20 - 5 = 15',
          'Diviser par 3 : x = 5',
        ],
      },
      {
        id: 'demo-math-2',
        type: 'vrai_faux',
        notion: 'Théorème de Pythagore',
        question: 'Dans un triangle ABC rectangle en A, l’égalité de Pythagore s’écrit BC² = AB² + AC².',
        options: ['Vrai', 'Faux'],
        correctAnswer: 'Vrai',
        explanation: 'L’hypoténuse est le côté opposé à l’angle droit A, soit [BC].',
        steps: [
          'Le sommet de l’angle droit est A.',
          'Le côté opposé [BC] est donc l’hypoténuse.',
          'Carré de l’hypoténuse = somme des carrés des deux autres côtés : BC² = AB² + AC².',
        ],
      },
      {
        id: 'demo-math-3',
        type: 'reponse_courte',
        notion: 'Calcul d’hypoténuse',
        question: 'Si AB = 6 cm et AC = 8 cm dans un triangle rectangle en A, combien vaut BC (en cm) ?',
        options: [],
        correctAnswer: '10',
        acceptedVariants: ['10 cm', 'BC = 10', 'BC = 10 cm'],
        explanation: 'BC² = 6² + 8² = 36 + 64 = 100, donc BC = √100 = 10 cm.',
        steps: [
          'Calculer les carrés : 6² = 36 et 8² = 64',
          'Additionner : BC² = 36 + 64 = 100',
          'Racine carrée : BC = √100 = 10 cm',
        ],
      },
      {
        id: 'demo-math-4',
        type: 'qcm',
        notion: 'Méthode de résolution',
        question: 'Quel est le principe fondamental pour résoudre une équation du premier degré ?',
        options: [
          'Isoler l’inconnue x en conservant l’égalité',
          'Supprimer le signe égal',
          'Remplacer x par 0',
          'Changer le signe d’un seul côté',
        ],
        correctAnswer: 'Isoler l’inconnue x en conservant l’égalité',
        explanation: 'Toute opération effectuée d’un côté du signe = doit être effectuée de l’autre côté.',
        steps: [
          'Regrouper les termes en x d’un côté et les nombres de l’autre.',
          'Diviser par le coefficient devant x.',
        ],
      },
      {
        id: 'demo-math-5',
        type: 'vrai_faux',
        notion: 'Vérification d’une solution',
        question: 'Pour l’équation 3x + 5 = 20, la solution x = 5 est exacte car 3×5 + 5 = 20.',
        options: ['Vrai', 'Faux'],
        correctAnswer: 'Vrai',
        explanation: 'En remplaçant x par 5, on obtient 15 + 5 = 20 : l’égalité est bien vérifiée.',
        steps: [
          'Remplacer x par 5 dans 3x + 5',
          'Calculer : 3 × 5 + 5 = 15 + 5 = 20',
        ],
      },
    ],
  };
}
