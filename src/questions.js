export const TZ = 'Africa/Douala';
export const RECAP_HOUR = 20;

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const BASE_QUESTIONS = [
  {
    id: 1,
    category: 'Culture Cameroun',
    difficulty: 'Normal',
    points: 1,
    text: "Le Cameroun est surnommé 'L'Afrique en miniature'. Quelle caractéristique NE correspond PAS à ce surnom ?",
    options: [
      "A) Ses paysages variés (montagnes, déserts, forêts tropicales, côtes)",
      "B) Sa diversité linguistique avec plus de 250 langues parlées",
      "C) Il est le plus petit pays d'Afrique centrale",
      "D) On y trouve le lac Tchad, le Mont Cameroun et des milliers d'espèces"
    ],
    answer: "C",
    explanation: "Le Cameroun est le PLUS GRAND pays d'Afrique Centrale avec 475 442 km², pas le plus petit ! Il est appelé 'Afrique en miniature' pour sa diversité géographique, climatique et culturelle.",
    funFact: "Le Cameroun a 10 régions, chacune avec ses propres traditions, langues et cuisines !"
  },
  {
    id: 2,
    category: 'Mathématiques',
    difficulty: 'Normal+',
    points: 2,
    text: "Un marchand de Douala achète des pagnes à 2 500 FCFA l'unité et les revend à 4 000 FCFA. Pour avoir un bénéfice de 45 000 FCFA, combien de pagnes doit-il vendre ?",
    hint: "Calcule d'abord le bénéfice par pagne, puis divise le bénéfice total.",
    answer: "30 pagnes",
    explanation: "Bénéfice par pagne = 4000 - 2500 = 1500 FCFA. Nombre de pagnes = 45000 ÷ 1500 = 30 pagnes.",
    funFact: "Le pagne est un tissu traditionnel très important dans la culture camerounaise !"
  },
  {
    id: 3,
    category: 'Culture Afrique',
    difficulty: 'Difficile',
    points: 3,
    text: "Quelle reine africaine est connue pour avoir défendu son royaume contre les colonisateurs britanniques au Nigeria et est devenue un symbole de résistance ?",
    hint: "Cette reine a vécu au 19ème siècle et son nom signifie 'Ma mère ne peut pas être surpassée'.",
    answer: "La Reine Amina",
    explanation: "La Reine Amina (vers 1533-1610) était une souveraine du Royaume de Zaria au Nigeria. Elle a étendu son territoire par la conquête et est devenue une icône de la résistance africaine.",
    funFact: "Amina est la seule femme à avoir un État nommé en son honneur au Nigeria : l'État d'Amina !"
  },
  {
    id: 4,
    category: 'Logique Pure',
    difficulty: 'Difficile+',
    points: 4,
    text: "Dans un tournoi de football entre 8 équipes, chaque équipe joue contre toutes les autres une seule fois. Combien de matchs seront joués au total ?",
    hint: "Pense à la formule des combinaisons : C(n,2) = n(n-1)/2",
    answer: "28 matchs",
    explanation: "Avec 8 équipes, chaque équipe joue 7 matchs. 8 × 7 = 56, mais chaque match implique 2 équipes, donc 56 ÷ 2 = 28 matchs.",
    funFact: "Le Cameroun a gagné la CAN 2000 et 2002 avec les Lions Indomptables !"
  },
  {
    id: 5,
    category: 'Énigme',
    difficulty: 'Expert',
    points: 5,
    text: "Je nais dans le feu, je vis dans l'eau, je meurs dans l'air. Qui suis-je ?",
    hint: "Pense aux trois états de la matière : solide, liquide, gazeux.",
    answer: "La glace / La neige",
    explanation: "La glace naît du froid intense (feu au sens figuré = froid intense), vit en fondant dans l'eau, et disparaît en s'évaporant dans l'air.",
    funFact: "Au Cameroun, on peut voir de la neige au sommet du Mont Cameroun (4 095m) !"
  },
  {
    id: 6,
    category: 'Mathématiques',
    difficulty: 'Normal+',
    points: 2,
    text: "Un taxi à Yaoundé facture 250 FCFA pour les 2 premiers kilomètres et 100 FCFA par kilomètre supplémentaire. Combien coûte un trajet de 7 kilomètres ?",
    hint: "Sépare le prix des 2 premiers km et celui des km supplémentaires.",
    answer: "750 FCFA",
    explanation: "2 premiers km = 250 FCFA. Km supplémentaires = 7 - 2 = 5 km × 100 FCFA = 500 FCFA. Total = 250 + 500 = 750 FCFA.",
    funFact: "Yaoundé est la capitale du Cameroun, connue pour ses sept collines !"
  },
  {
    id: 7,
    category: 'Logique Pure',
    difficulty: 'Normal',
    points: 1,
    text: "Dans un village, il y a 10 maisons. Chaque maison a 5 chats. Chaque chat a 4 chatons. Combien de pattes y a-t-il en tout dans le village ?",
    hint: "Compte d'abord les chats, puis les chatons. Chaque chat a 4 pattes.",
    answer: "400 pattes",
    explanation: "Chats = 10 × 5 = 50. Chatons = 50 × 4 = 200. Total chats = 250. Pattes = 250 × 4 = 1000 pattes. Oh wait, 50 + 200 = 250 chats × 4 = 1000 pattes.",
    funFact: "Les chats sont considérés comme chanceux dans plusieurs cultures africaines !"
  },
  {
    id: 8,
    category: 'Culture Cameroun',
    difficulty: 'Difficile',
    points: 3,
    text: "Quelle danse traditionnelle camerounaise, reconnue UNESCO, est pratiquée par le peuple Bamiléké et symbolise la fécondité et la joie ?",
    hint: "Cette danse utilise des masques colorés et des mouvements circulaires.",
    answer: "La danse des Maskoi / Ngondo",
    explanation: "La danse Ngondo (ou danse des Maskoi) est une tradition Bamiléké où les danseurs portent des masques et des vêtements colorés, symbolisant les esprits de la nature.",
    funFact: "Le Festival des Maskoi se tient chaque année à Foumban !"
  },
  {
    id: 9,
    category: 'Énigme',
    difficulty: 'Difficile+',
    points: 4,
    text: "Un homme entre dans un bar et commande un verre d'eau. Le barman sort un pistola. L'homme dit 'Merci' et part. Pourquoi ?",
    hint: "Pourquoi demander de l'eau dans un bar ? Quel problème l'eau pourrait-elle résoudre ?",
    answer: "Il avait le hoquet",
    explanation: "Le barman a compris que l'homme avait le hoquet. La surprise de voir un pistola (ou le choc) ferait disparaître le hoquet. C'est une astuce traditionnelle !",
    funFact: "Cette astuce du 'pistolet contre le hoquet' est utilisée depuis des siècles en Europe aussi !"
  },
  {
    id: 10,
    category: 'Culture Afrique',
    difficulty: 'Normal+',
    points: 2,
    text: "Quelle est la plus haute montagne d'Afrique et dans quel pays se trouve-t-elle principalement ?",
    hint: "C'est le 'toit de l'Afrique' et son sommet est souvent enneigé.",
    answer: "Le Kilimandjaro, en Tanzanie",
    explanation: "Le Kilimandjaro (5 895 m) est le plus haut sommet d'Afrique. Il est situé en Tanzanie et ses trois volcans sont le Kibo, le Mawenzi et le Shira.",
    funFact: "Le Kilimandjaro pourrait perdre ses neiges d'ici 2030 à cause du changement climatique !"
  },
  {
    id: 11,
    category: 'Mathématiques',
    difficulty: 'Difficile+',
    points: 4,
    text: "Si 2 + 2 = 8, 3 + 3 = 18, 5 + 5 = 50, alors combien vaut 7 + 7 ?",
    hint: "Ce n'est pas une addition classique. Cherche un pattern entre les nombres.",
    answer: "98",
    explanation: "Le pattern est : a + a = a × a × 2. Donc 7 × 7 × 2 = 98. Vérification : 2×2×2=8, 3×3×2=18, 5×5×2=50.",
    funFact: "Ce type de 'fausses additions' est populaire dans les tests de logique !"
  },
  {
    id: 12,
    category: 'Logique Pure',
    difficulty: 'Expert',
    points: 5,
    text: "Vous avez 9 pièces identiques, mais une est fausse et légèrement plus lourde. Avec une balance à deux plateaux, quel est le nombre minimum de pesées pour trouver la fausse pièce ?",
    hint: "Divise et conquiers. Répartis les pièces en groupes égaux.",
    answer: "2 pesées",
    explanation: "1ère pesée : 3 vs 3. Si équilibre → la fausse est parmi les 3 restantes. Sinon → elle est dans le groupe le plus lourd. 2ème pesée : 1 vs 1 parmi les 3 suspectes. Si équilibre → c'est la 3ème. Sinon → le plateau le plus lourd indique la fausse.",
    funFact: "Cette énigme classique est utilisée dans les entretiens d'embauche des grandes entreprises tech !"
  },
  {
    id: 13,
    category: 'Culture Cameroun',
    difficulty: 'Normal',
    points: 1,
    text: "Combien de régions compte le Cameroun ?",
    hint: "C'est un nombre qui a changé récemment après une réforme administrative.",
    answer: "10 régions",
    explanation: "Le Cameroun compte 10 régions depuis 2008 : Adamaoua, Centre, Est, Extrême-Nord, Littoral, Nord, Nord-Ouest, Ouest, Sud, Sud-Ouest.",
    funFact: "La région du Littoral abrite Douala, la plus grande ville du Cameroun !"
  },
  {
    id: 14,
    category: 'Énigme',
    difficulty: 'Difficile',
    points: 3,
    text: "Je peux voler sans avoir d'ailes. Je pleure sans avoir d'yeux. Quand je disparais, j'apporte la lumière. Qui suis-je ?",
    hint: "Regarde vers le ciel, surtout pendant les jours de pluie.",
    answer: "Un nuage",
    explanation: "Les nuages 'volent' dans le ciel, 'pleurent' sous forme de pluie, et quand ils se dissipent, ils révèlent le soleil (lumière).",
    funFact: "Les nuages sont composés de milliards de minuscules gouttes d'eau ou de cristaux de glace !"
  },
  {
    id: 15,
    category: 'Culture Afrique',
    difficulty: 'Normal+',
    points: 2,
    text: "Quelle langue est parlée par le plus grand nombre de personnes en Afrique ?",
    hint: "Cette langue a des milliers de locuteurs natifs et des millions de locuteurs secondaires.",
    answer: "Le swahili / Arabe",
    explanation: "L'arabe est la langue la plus parlée en Afrique (environ 170 millions de locuteurs). Le swahili est deuxième avec environ 100 millions de locuteurs et est langue officielle dans plusieurs pays de l'Est africain.",
    funFact: "Le swahili est une langue bantoue enrichie de mots arabes, persans et portugais !"
  },
  {
    id: 16,
    category: 'Logique Pure',
    difficulty: 'Normal+',
    points: 2,
    text: "Un train part de Douala à 7h vers Yaoundé (distance 300 km) à 100 km/h. Un autre train part de Yaoundé vers Douala à 8h à 120 km/h. À quelle heure se croiseront-ils ?",
    hint: "Calcule la distance parcourue par chaque train avant qu'ils ne se croisent.",
    answer: "8h18 environ",
    explanation: "À 8h, le train de Douala a parcouru 100 km. Distance restante = 200 km. Vitesse combinée = 100 + 120 = 220 km/h. Temps = 200 ÷ 220 ≈ 0,91h ≈ 55 min. Croisement à 8h55.",
    funFact: "Le Transcamerounais est le chemin de fer national du Cameroun !"
  },
  {
    id: 17,
    category: 'Mathématiques',
    difficulty: 'Difficile',
    points: 3,
    text: "Le Mont Cameroun mesure 4 095 mètres. Un grimpeur part du camp de base (2 000m) à 8h et atteint le sommet à 14h. Quel est le rythme moyen d'ascension en mètres/heure ?",
    hint: "Calcule la différence de hauteur et divise par le temps.",
    answer: "350 m/h environ",
    explanation: "Dénivelé = 4095 - 2000 = 2095 m. Temps = 6h. Rythme = 2095 ÷ 6 ≈ 349 m/h.",
    funFact: "Le Mont Cameroun est le volcan le plus haut d'Afrique de l'Ouest !"
  },
  {
    id: 18,
    category: 'Énigme',
    difficulty: 'Expert',
    points: 5,
    text: "Un homme regarde une photo et dit : 'Je n'ai ni frère ni sœur, mais le père de cet homme est le fils de mon père.' Qui est dans la photo ?",
    hint: "Réfléchis à la structure familiale. 'Mon père' est le père de qui ?",
    answer: "Son fils",
    explanation: "Le père de l'homme dans la photo est 'le fils de mon père'. 'Mon père' = l'homme qui parle. Le fils de 'mon père' = le frère de l'homme QUI PARLE OU l'homme lui-même. Comme il n'a ni frère ni sœur, cela ne peut être que lui-même. Donc c'est son propre fils.",
    funFact: "Cette énigme joue sur la structure grammaticale française pour créer une ambiguïté amusante !"
  },
  {
    id: 19,
    category: 'Culture Afrique',
    difficulty: 'Difficile+',
    points: 4,
    text: "Quelle est la plus grande île d'Afrique et dans quel pays se trouve-t-elle ?",
    hint: "Cette île est souvent associée à une biodiversité unique et à des animaux endémiques.",
    answer: "Madagascar",
    explanation: "Madagascar est la 4ème plus grande île du monde et la plus grande d'Afrique. Elle se trouve à 400 km de la côte est de l'Afrique, dans l'océan Indien.",
    funFact: "Plus de 90% de la faune et de la flore de Madagascar n'existent nulle part ailleurs sur Terre !"
  },
  {
    id: 20,
    category: 'Logique Pure',
    difficulty: 'Difficile',
    points: 3,
    text: "Trois amis vont au marché. Ils achètent 3 poissons pour 30 FCFA. Chaque ami donne 10 FCFA. Le marchand fait une réduction de 5 FCFA. Le garçon de courses ramène 1 FCFA à chaque ami et garde 2 FCFA. Chaque ami a donc payé 9 FCFA. 3 × 9 = 27 FCFA + 2 FCFA du garçon = 29 FCFA. Où est passé 1 FCFA ?",
    hint: "L'erreur est dans la façon de compter. L'addition n'est pas correcte.",
    answer: "L'erreur de calcul est dans l'addition",
    explanation: "Les amis ont payé 27 FCFA (3×9). Le marchand a reçu 25 FCFA, le garçon a gardé 2 FCFA. 25 + 2 = 27. L'erreur est de'ajouter 2 à 27 au lieu de soustraire.",
    funFact: "Cette énigme est un classique des mathématiques récréatives !"
  }
];

export const getRandomQuestions = (count = 5) => {
  const shuffled = shuffleArray(BASE_QUESTIONS);
  return shuffled.slice(0, count).map((q, index) => ({
    ...q,
    displayId: index + 1
  }));
};

export const QUESTIONS_DU_JOUR = getRandomQuestions(5);

export const getCurrentHour = () =>
  parseInt(
    new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hour12: false, timeZone: TZ }).format(new Date()),
    10
  );

export const getCurrentMinute = () =>
  parseInt(
    new Intl.DateTimeFormat('fr-FR', { minute: 'numeric', hour12: false, timeZone: TZ }).format(new Date()),
    10
  );

export const getTimeUntilRecap = () => {
  const h = getCurrentHour();
  const m = getCurrentMinute();
  const currentMinutes = h * 60 + m;
  const recapMinutes = RECAP_HOUR * 60;
  
  if (currentMinutes < recapMinutes) {
    return recapMinutes - currentMinutes;
  }
  return 0;
};

export const DIFFICULTY_CONFIG = {
  'Normal':      { color: 'text-emerald-400',   bg: 'bg-emerald-500/10',   border: 'border-emerald-500/30',   glow: 'rgba(16,185,129,0.25)',   ring: '#10b981', stars: 1 },
  'Normal+':     { color: 'text-teal-400',     bg: 'bg-teal-500/10',      border: 'border-teal-500/30',      glow: 'rgba(20,184,166,0.25)',   ring: '#14b8a6', stars: 2 },
  'Difficile':   { color: 'text-amber-400',    bg: 'bg-amber-500/10',     border: 'border-amber-500/30',     glow: 'rgba(245,158,11,0.25)',   ring: '#f59e0b', stars: 3 },
  'Difficile+':  { color: 'text-orange-400',  bg: 'bg-orange-500/10',    border: 'border-orange-500/30',    glow: 'rgba(249,115,22,0.25)',  ring: '#f97316', stars: 4 },
  'Expert':      { color: 'text-rose-400',     bg: 'bg-rose-500/10',      border: 'border-rose-500/30',      glow: 'rgba(244,63,94,0.25)',   ring: '#f43f5e', stars: 5 },
};

export const CATEGORY_CONFIG = {
  'Culture Cameroun': { color: 'text-green-400',    bg: 'bg-green-500/10',     border: 'border-green-500/30' },
  'Culture Afrique':  { color: 'text-emerald-400', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/30' },
  'Mathématiques':    { color: 'text-cyan-400',     bg: 'bg-cyan-500/10',      border: 'border-cyan-500/30' },
  'Logique Pure':    { color: 'text-amber-400',    bg: 'bg-amber-500/10',    border: 'border-amber-500/30' },
  'Énigme':          { color: 'text-pink-400',     bg: 'bg-pink-500/10',      border: 'border-pink-500/30' },
};

export const SCHEDULE_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  ENDED: 'ended',
  NEXT: 'next'
};

export const getScheduleStatus = () => {
  const h = getCurrentHour();
  const m = getCurrentMinute();
  const currentMinutes = h * 60 + m;
  const recapMinutes = RECAP_HOUR * 60;
  
  if (currentMinutes >= recapMinutes) {
    return SCHEDULE_STATUS.ENDED;
  }
  return SCHEDULE_STATUS.NEXT;
};

export const QUOTES = [
  { text: "L'esprit le plus fort n'est pas celui qui gagne, mais celui qui persiste.", author: "Proverbe Camerounais" },
  { text: "Les lions n'ont pas peur desoparder face aux hyènes.", author: "Proverbe Africain" },
  { text: "Celui qui n'avance pas recule.", author: "Proverbe Bamiléké" },
  { text: "La patience est la mère de toutes les vertus.", author: "Proverbe Africain" },
  { text: "Un seul arbre ne fait pas une forêt.", author: "Proverbe Camerounais" },
];
