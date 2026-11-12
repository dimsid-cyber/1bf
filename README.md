# Coach Léo — Bot oral de FLE (niveau A1, thème « le sport »)

Application web **100 % orale** pour élèves de FLE niveau A1 (CECRL), adolescents.
Fonctionne sur smartphone, tablette et ordinateur, sans installation ni compte.

## Principe

Un seul écran, aucune catégorie : le bot **parle** (synthèse vocale française) et **écoute** (micro).
L'élève appuie sur « Commencer », et la conversation se déroule comme en face à face :

1. Tu aimes le sport ?
2. Quel sport est-ce que tu aimes ?
3. 🎯 Répète après moi : « Il faut un ballon. » (entraînement de prononciation, avec relecture lente si besoin)
4. Tu joues où ?
5. 🎯 Répète : « On ne peut pas toucher le ballon avec les mains. »
6. C'est quoi les règles de ton sport ?
7. 🎤 Présente ton sport (30-90 s) — évaluation orale : durée, mots du sport utilisés, structures présentes
8. Félicitations !

Le bot réagit aux mots-clés : il encourage, relance avec un modèle de phrase si l'élève bloque, et fait réécouter la phrase à répéter (voix lente) jusqu'à 2 fois.

## Voix française

L'application choisit automatiquement une **voix française** de l'appareil (Google français, Amelie, Thomas, Denise, etc.). Si l'appareil n'en possède pas, un avertissement explique comment installer le pack de voix française (iOS : Réglages → Accessibilité → Contenus énoncés ; Android : Paramètres → Synthèse vocale).

## Compatibilité

- Reconnaissance vocale : **Chrome, Edge, Safari** (iOS 14.5+). Firefox : saisie clavier de secours.
- Le micro demande l'autorisation du navigateur à la première utilisation.

## Modifier le contenu

Tout le scénario est dans `data.js` : questions du bot, phrases à répéter (avec astuce phonétique), mots-clés acceptés, mots évalués pour l'exposé. Pour changer de thème, modifier ce fichier suffit.

## Mise en ligne

Site statique (HTML/CSS/JS, aucune dépendance, aucune clé API) hébergé sur **GitHub Pages** : `Settings → Pages → Deploy from a branch → main / root`. Chaque push sur `main` met le site à jour automatiquement.
