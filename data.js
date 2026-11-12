const SPORTS = [
  "le football", "le basket", "le tennis", "la natation", "le vélo",
  "le handball", "le volley", "le judo", "la danse", "le rugby",
  "le badminton", "l'escalade", "le foot", "la gym", "le skate"
];

const CONVERSATION = [
  {
    type: "q",
    bot: "Salut ! Moi, c'est Coach Léo. Bienvenue ! Est-ce que tu aimes le sport ?",
    oui: ["Super ! Moi aussi, j'adore le sport !", "Génial ! Le sport, c'est la vie !"],
    non: ["Ce n'est pas grave ! On va découvrir un sport ensemble !"],
    keys: ["oui", "non", "j'aime", "j aime", "jadore", "j'adore", "adore", "aime", "un peu", "bien", "ok", "oui oui", "yes"]
  },
  {
    type: "q",
    bot: "Quel sport est-ce que tu aimes ? Le football ? Le basket ? La natation ?",
    oui: ["Très bon choix !", "Super ! J'adore ce sport aussi !", "Excellent !"],
    non: ["Choisis un sport : le football, le basket, la natation, le tennis..."],
    keys: SPORTS.flatMap(s => s.replace(/^l[ea']+\s?/i, "").split(/[\s-]/)).concat(["foot", "basket", "tennis", "natation", "velo", "vélo", "judo", "danse", "rugby", "hand", "volley", "escalade", "gym", "skate", "sport"])
  },
  {
    type: "repeat",
    bot: "Super ! Maintenant, répète après moi :",
    phrase: "Il faut un ballon.",
    tip: "« ballon » : le son [y] à la fin, la bouche est petite et arrondie."
  },
  {
    type: "q",
    bot: "Bravo ! Et tu joues où ? Dans un gymnase ? Sur un terrain ? À la piscine ?",
    oui: ["Parfait ! C'est un bon endroit !", "Très bien !", "D'accord !"],
    non: ["Réponds avec : « Je joue... » Par exemple : « Je joue dans un gymnase. »"],
    keys: ["terrain", "gymnase", "piscine", "stade", "salle", "dehors", "parc", "maison", "école", "cour", "plage", "montagne", "jardin", "playground"]
  },
  {
    type: "repeat",
    bot: "Très bien ! Maintenant, une règle. Répète après moi :",
    phrase: "On ne peut pas toucher le ballon avec les mains.",
    tip: "« toucher » : le son [ʃ] comme « chat », et le [u] est rond et long."
  },
  {
    type: "q",
    bot: "Parfait ! Et c'est quoi les règles de ton sport ?",
    oui: ["Excellent ! Tu connais bien les règles !", "Très bien ! C'est exactement ça !"],
    non: ["Essaie avec : « Il faut... » ou « C'est interdit de... »"],
    keys: ["il faut", "interdit", "on ne peut pas", "on peut", "marquer", "but", "panier", "point", "minutes", "mi-temps", "arbitre", "nager", "courir", "gagner", "règles", "regle", "règle"]
  },
  {
    type: "expose",
    bot: "Bravo ! Dernière étape : présente ton sport ! Parle un peu : le sport, le matériel, les règles, et pourquoi tu l'aimes. Appuie sur le bouton et parle !"
  },
  {
    type: "end",
    bot: "Félicitations ! Tu es prêt pour ton exposé ! À bientôt ! Au revoir !"
  }
];

const MOTS_EXPOSE = [
  "ballon", "balle", "maillot", "chaussures", "terrain", "but", "filet",
  "raquette", "panier", "piscine", "vélo", "casque", "joueur", "équipe",
  "arbitre", "il faut", "interdit", "on joue", "parce que", "j'aime",
  "courir", "nager", "marquer", "point", "match", "minutes", "gagner",
  "règles", "gymnase", "stade", "bonjour", "je m'appelle", "préféré"
];
