import { LANG } from './i18n';

const POOL_1 = [
  {
    category: 'Logique', difficulty: 'Facile',
    text: "Je commence la nuit et je finis le matin. Qui suis-je ?",
    hint: "Observe l'orthographe des mots.", answer: "La lettre N",
    text_en: "I start the night and I finish the morning. What am I?",
    hint_en: "Look at the spelling closely.", answer_en: "The letter N", category_en: "Logic"
  },
  {
    category: 'Logique', difficulty: 'Facile',
    text: "Quel mois de l'année compte 28 jours ?",
    hint: "Ce n'est pas forcément qu'un seul mois...", answer: "Tous les mois",
    text_en: "Which month of the year has 28 days?",
    hint_en: "It's not necessarily just one month...", answer_en: "All of them", category_en: "Logic"
  },
  {
    category: 'Mots', difficulty: 'Facile',
    text: "Je suis d'eau, je suis d'air, et je suis d'électricité. Qui suis-je ?",
    hint: "Pense au mouvement de ces trois éléments.", answer: "Le courant",
    text_en: "I am of water, I am of air, and I am electricity. What am I?",
    hint_en: "Think about the movement of these three elements.", answer_en: "The current", category_en: "Words"
  }
];

const POOL_2 = [
  {
    category: 'Survie', difficulty: 'Moyen',
    text: "Un assassin doit choisir entre 3 salles : la 1ère est en feu, la 2ème pleine de tireurs d'élite, la 3ème contient des lions affamés depuis 3 ans. Laquelle est la plus sûre ?",
    hint: "Réfléchis à l'état des lions après une telle période...", answer: "La 3ème (les lions sont morts)",
    text_en: "An assassin must choose between 3 rooms: 1st is on fire, 2nd is full of snipers, 3rd has lions starved for 3 years. Which is safest?",
    hint_en: "Think about the state of the lions...", answer_en: "The 3rd (dead lions)", category_en: "Survival"
  },
  {
    category: 'Observation', difficulty: 'Moyen',
    text: "Un homme sort sous une pluie torrentielle sans parapluie et sans chapeau. Pourtant, pas un seul de ses cheveux n'est mouillé. Pourquoi ?",
    hint: "C'est une question de pilosité.", answer: "Il est chauve",
    text_en: "A man goes out in heavy rain without an umbrella or a hat. Yet, not a single hair on his head gets wet. Why?",
    hint_en: "It's a question of hair.", answer_en: "He is bald", category_en: "Observation"
  },
  {
    category: 'Logique', difficulty: 'Moyen',
    text: "J'ai des branches mais ni tronc, ni feuilles, ni fruits. Que suis-je ?",
    hint: "L'argent y circule, ou bien l'eau...", answer: "Une banque (ou une rivière)",
    text_en: "I have branches, but no trunk, leaves, or fruit. What am I?",
    hint_en: "Money circulates there, or maybe water...", answer_en: "A bank (or a river)", category_en: "Logic"
  }
];

const POOL_3 = [
  {
    category: 'Mathématiques', difficulty: 'Difficile',
    text: "Dans un lac, un nénuphar double de surface chaque jour. S'il lui faut 30 jours pour recouvrir tout le lac, combien de jours lui a-t-il fallu pour n'en recouvrir que la moitié ?",
    hint: "Ne fais pas de division par deux sur le temps.", answer: "29 jours",
    text_en: "A lily pad doubles in size every day. If it takes 30 days to cover the lake, how many days to cover half of it?",
    hint_en: "Do not divide the time by two.", answer_en: "29 days", category_en: "Mathematics"
  },
  {
    category: 'Logique', difficulty: 'Difficile',
    text: "Si 5 machines prennent 5 minutes pour fabriquer 5 objets, combien de temps faut-il à 100 machines pour fabriquer 100 objets ?",
    hint: "Chaque machine travaille en parallèle.", answer: "5 minutes",
    text_en: "If 5 machines take 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    hint_en: "Each machine works in parallel.", answer_en: "5 minutes", category_en: "Logic"
  },
  {
    category: 'Mathématiques', difficulty: 'Difficile',
    text: "Quel est le seul nombre qui, lorsqu'on le divise par lui-même (sans être 0), donne son double ?",
    hint: "Il faut qu'il soit plus petit que 1.", answer: "0.5 (car 0.5 / 0.5 = 1, et 0.5 * 2 = 1)",
    text_en: "Which unique number, when divided by itself, equals its double?",
    hint_en: "It must be smaller than 1.", answer_en: "0.5", category_en: "Mathematics"
  }
];

const POOL_4 = [
  {
    category: 'Énigme', difficulty: 'Expert',
    text: "Celui qui le fabrique n’en a pas besoin. Celui qui l’achète ne s’en sert pas. Celui qui l’utilise ne le sait même pas. Qu'est-ce que c'est ?",
    hint: "Un objet lié à notre destinée.", answer: "Un cercueil",
    text_en: "The maker doesn't need it, the buyer doesn't use it, the user doesn't know it. What is it?",
    hint_en: "An object linked to our destiny.", answer_en: "A coffin", category_en: "Riddle"
  },
  {
    category: 'Survie', difficulty: 'Expert',
    text: "Légère comme une plume, même la personne la plus forte du monde ne peut la retenir plus de quelques minutes. De quoi s'agit-il ?",
    hint: "Essentiel à la vie.", answer: "Sa respiration",
    text_en: "Light as a feather, yet the strongest person can't hold it for more than a few minutes. What is it?",
    hint_en: "Essential to life.", answer_en: "Their breath", category_en: "Survival"
  },
  {
    category: 'Mystère', difficulty: 'Expert',
    text: "Je parle toutes les langues sans jamais avoir appris à parler. Je réponds toujours mais je n'initie jamais le dialogue. Qui suis-je ?",
    hint: "Je te renvoie tes propres mots.", answer: "L'écho",
    text_en: "I speak all languages but never learned to speak. I always reply but never start the dialogue. What am I?",
    hint_en: "I send back your own words.", answer_en: "An echo", category_en: "Mystery"
  }
];

const POOL_5 = [
  {
    category: 'Démoniaque', difficulty: 'Boss',
    text: "Quel est le prochain nombre de cette suite logique ?\n1\n11\n21\n1211\n111221\n?",
    hint: "Lis les chiffres à voix haute pour décrire la ligne précédente (Ex: 'un 1').", answer: "312211",
    text_en: "What is the next number in this sequence?\n1\n11\n21\n1211\n111221\n?",
    hint_en: "Read the digits out loud to describe the previous line.", answer_en: "312211", category_en: "Demonic"
  },
  {
    category: 'Paradoxe', difficulty: 'Boss',
    text: "Trois médecins disent que Paul est leur frère. Paul quant à lui affirme n'avoir aucun frère. Qui ment ?",
    hint: "Fait attention au genre des mots...", answer: "Personne (les médecins sont ses soeurs)",
    text_en: "Three doctors say Paul is their brother. Paul says he has no brother. Who is lying?",
    hint_en: "Pay attention to gender...", answer_en: "No one (the doctors are his sisters)", category_en: "Paradox"
  },
  {
    category: 'Logique Numérique', difficulty: 'Boss',
    text: "Combien de fois peut-on soustraire 10 de 100 ?",
    hint: "Que se passe-t-il après la première soustraction ?", answer: "Une seule fois (après ce n'est plus 100, c'est 90)",
    text_en: "How many times can you subtract 10 from 100?",
    hint_en: "What happens after the first subtraction?", answer_en: "Only once (then it's 90)", category_en: "Numerical Logic"
  }
];

export const getQuestionsForToday = () => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Douala',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const parts = formatter.format(new Date()).split('/'); // DD/MM/YYYY
  const seed = parseInt(parts[2] + parts[1] + parts[0], 10);

  return [
    { ...POOL_1[seed % POOL_1.length], id: 1, start: 8, end: 10, points: 1 },
    { ...POOL_2[seed % POOL_2.length], id: 2, start: 10, end: 12, points: 2 },
    { ...POOL_3[seed % POOL_3.length], id: 3, start: 12, end: 14, points: 4 },
    { ...POOL_4[seed % POOL_4.length], id: 4, start: 14, end: 16, points: 7 },
    { ...POOL_5[seed % POOL_5.length], id: 5, start: 16, end: 18, points: 15 },
  ];
};

export const QUESTIONS_DU_JOUR = getQuestionsForToday();

export const getCurrentHour = () => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Douala',
    hour: '2-digit',
    hour12: false,
  });
  const hourString = formatter.format(new Date());
  return parseInt(hourString, 10);
};

export const getLocalizedQuestionData = (question) => {
  if (!question) return null;
  const isEn = LANG === 'en';
  return {
    ...question,
    displayCategory: isEn && question.category_en ? question.category_en : question.category,
    displayText: isEn && question.text_en ? question.text_en : question.text,
    displayHint: isEn && question.hint_en ? question.hint_en : question.hint,
    displayAnswer: isEn && question.answer_en ? question.answer_en : question.answer,
  };
};
