const VOCAB = {
  materiel: [
    "un ballon", "une balle", "un maillot", "des chaussures", "un terrain",
    "un but", "un filet", "une raquette", "un panier", "une piscine",
    "un vélo", "un casque", "une raquette de tennis", "des gants"
  ],
  actions: [
    "courir", "sauter", "lancer", "nager", "jouer", "gagner", "perdre",
    "marquer un but", "marquer un panier", "s'entraîner", "frapper"
  ],
  personnes: [
    "un joueur", "une joueuse", "l'équipe", "l'arbitre", "le capitaine", "l'entraîneur"
  ],
  regles: [
    "une règle", "il faut", "c'est interdit", "on ne peut pas", "on peut",
    "le match", "un point", "la mi-temps", "le score", "gagner le match"
  ]
};

const SPORTS = [
  "le football", "le basket-ball", "le tennis", "la natation", "le vélo",
  "le handball", "le volleyball", "le judo", "la danse", "le rugby",
  "le badminton", "l'escalade"
];

const PHRASES = [
  {
    groupe: "Le matériel",
    items: [
      { t: "J'ai un ballon.", tip: "Le son [b] : bouche fermée, puis ouvre ! « ba-llon »." },
      { t: "Il faut des chaussures de sport.", tip: "« chaussures » = [ʃo-syʁ]. Le son [ʃ] comme « chat »." },
      { t: "Le terrain est grand.", tip: "Attention au [ʁ] de « terrain » et « grand » : la gorge vibre." },
      { t: "Je mets mon maillot.", tip: "« maillot » = [ma-jo]. On ne prononce pas les deux « l »." }
    ]
  },
  {
    groupe: "Les règles",
    items: [
      { t: "On joue à onze contre onze.", tip: "« onze » = [ɔ̃z]. C'est un son nasal : la bouche est ouverte." },
      { t: "Il faut marquer un but.", tip: "« but » = [by] avec un son [y] (comme « tu »), pas [u] (comme « tout »)." },
      { t: "On ne peut pas toucher le ballon avec les mains.", tip: "« toucher » = [tu-ʃe]. Le [u] est rond et long." },
      { t: "Le match dure quatre-vingt-dix minutes.", tip: "« dure » = [dyʁ] avec le son [y]. « quatre-vingt-dix » = 90." },
      { t: "L'arbitre siffle la fin du match.", tip: "« siffle » = [si-fl]. Attention au [f] et au [l]." }
    ]
  },
  {
    groupe: "Les actions",
    items: [
      { t: "Je cours vite sur le terrain.", tip: "« cours » = [kuʁ]. Le [ʁ] final est doux." },
      { t: "L'équipe gagne le match.", tip: "« gagne » = [ga-ɲ]. Le « gn » = [ɲ] comme « montagne »." },
      { t: "Tu joues au basket le samedi ?", tip: "« joues » = [ʒu]. Le « j » = [ʒ] comme « jour »." },
      { t: "Je nage dans la piscine.", tip: "« nage » = [na-ʒ]. Le « ge » = [ʒ]." }
    ]
  }
];

const DIALOG = [
  {
    bot: "Salut ! Moi, c'est Coach Léo. 👋 Bienvenue ! Tu aimes le sport ?",
    keywords: ["oui", "j'aime", "j adore", "jadore", "non", "un peu", "j'adore"],
    oui: ["Super ! Moi aussi, j'adore le sport !", "Génial ! Le sport, c'est important !"],
    non: ["Ce n'est pas grave ! On va découvrir un sport ensemble !"],
    next: 1
  },
  {
    bot: "Quel sport est-ce que tu aimes ? Par exemple : le football, le basket, la natation, le tennis...",
    keywords: SPORTS.flatMap(s => s.replace(/^l[ea]s? |^l'|^l[eé]\s?/i, "").split(/[\s-]/)),
    oui: ["Très bien !", "Super choix !", "Excellent !"],
    non: ["Ce n'est pas grave ! Choisis un sport : le football, le basket, la natation, le tennis..."],
    next: 2
  },
  {
    bot: "D'accord ! Et tu joues où ? À la piscine ? Sur un terrain ? Dans un gymnase ?",
    keywords: ["terrain", "gymnase", "piscine", "stade", "dehors", "dehors", "salle", "parc", "maison", "école", "cour"],
    oui: ["Parfait ! C'est un bon endroit !", "Très bien !", "D'accord !"],
    non: ["Pas de problème ! Réponds avec : « Je joue... » Par exemple : « Je joue dans un gymnase. »"],
    next: 3
  },
  {
    bot: "Super ! Maintenant, le matériel : de quoi est-ce que tu as besoin ? Un ballon ? Des chaussures ? Une raquette ?",
    keywords: ["ballon", "balle", "chaussures", "raquette", "maillot", "casque", "vélo", "filet", "panier", "maillot de bain", "lunettes", "gants"],
    oui: ["Excellent ! C'est le bon matériel !", "Très bien ! Il faut aussi de l'énergie ! 💪"],
    non: ["Essaie avec : « Il faut... » Par exemple : « Il faut un ballon et des chaussures. »"],
    next: 4
  },
  {
    bot: "Bravo ! Dernière question : c'est quoi les règles ? Par exemple : « Il faut marquer un but. » « C'est interdit de toucher le ballon avec les mains. »",
    keywords: ["il faut", "interdit", "on ne peut pas", "on peut", "marquer", "but", "panier", "point", "nager", "courir", "minutes", "mi-temps", "arbitre"],
    oui: ["Parfait ! Tu connais bien les règles ! 🎉", "Très bien ! C'est exactement ça !"],
    non: ["Essaie avec : « Il faut... » ou « C'est interdit de... »"],
    next: 5
  },
  {
    bot: "Félicitations ! 🎉 Tu es prêt(e) pour ton exposé ! Va dans l'onglet « Exposé » pour t'entraîner. À bientôt !",
    keywords: ["merci", "au revoir", "salut", "ok", "oui", "bye"],
    oui: ["Au revoir ! Bon courage ! 👋"],
    non: ["Au revoir ! Bon courage pour ton exposé ! 👋"],
    next: null
  }
];

const EXPOSE_PLAN = [
  {
    titre: "1. Je salue",
    exemples: ["Bonjour, je m'appelle Léa.", "Bonjour à tous !"],
    mots: ["bonjour", "je m'appelle", "salut"]
  },
  {
    titre: "2. Je présente mon sport",
    exemples: ["Je vais vous présenter le football.", "Mon sport préféré est le basket-ball."],
    mots: ["je vais vous présenter", "mon sport préféré", "aujourd'hui"]
  },
  {
    titre: "3. Je parle du matériel",
    exemples: ["Il faut un ballon et des chaussures.", "On joue avec une raquette."],
    mots: ["il faut", "on joue avec", "un ballon", "des chaussures", "une raquette"]
  },
  {
    titre: "4. Je parle des règles",
    exemples: ["On joue à cinq contre cinq.", "Il faut marquer des buts pour gagner.", "C'est interdit de toucher le ballon avec les mains."],
    mots: ["on joue à", "il faut", "c'est interdit", "pour gagner", "minutes"]
  },
  {
    titre: "5. Je donne mon avis",
    exemples: ["J'aime ce sport parce que c'est amusant.", "À mon avis, c'est un sport génial !"],
    mots: ["j'aime", "parce que", "à mon avis", "amusant", "génial"]
  }
];

const EXPOSE_MOTS_CLES = [
  ...VOCAB.materiel.flatMap(m => m.split(" ")),
  "il faut", "interdit", "on joue", "parce que", "bonjour", "je m'appelle",
  "j'aime", "mon sport", "préféré", "courir", "nager", "marquer", "but",
  "panier", "point", "match", "équipe", "arbitre", "terrain", "piscine",
  "gymnase", "minutes", "gagner", "règles"
];
