# Coach Léo — Chatbot oral libre de FLE (niveau A1)

Application web **100 % orale** pour élèves de FLE niveau A1 (CECRL), adolescents.
Fonctionne sur smartphone, tablette et ordinateur, sans installation ni compte.

## Principe

Un seul écran : une orbe qui brille quand le bot parle, rouge quand il écoute.
L'élève appuie sur « Commencer » et converse **librement** avec Coach Léo :

- Le bot écoute (reconnaissance vocale du navigateur) et comprend **n'importe quelle phrase** — pas de mots-clés, pas de scénario figé
- La conversation est générée par une IA (service gratuit Pollinations.ai, sans clé API), avec une consigne pédagogique stricte : français très simple A1, 1-2 phrases courtes, une question à la fois pour faire parler
- **Correction de la production** : si l'élève fait une erreur, le bot répond puis ajoute une ligne 💡 avec la phrase correcte
- **Prononciation** : si la transcription du micro révèle une prononciation déformée, le bot donne l'orthographe correcte et une astuce
- Le bot parle avec une **voix française** sélectionnée automatiquement sur l'appareil

## Secours prévus

- Réseau scolaire bloquant la reconnaissance vocale de Chrome → champ clavier de secours (le bot répond toujours à voix haute)
- Micro refusé → message explicatif (icône 🔒 de la barre d'adresse)
- Aucune voix française sur l'appareil → chemin exact pour l'installer (iOS : Réglages → Accessibilité → Contenus énoncés ; Android : Paramètres → Synthèse vocale)
- IA injoignable → message d'excuse et relance

## Compatibilité

Reconnaissance vocale : **Chrome, Edge, Safari** (iOS 14.5+). Firefox : saisie clavier.

## Personnaliser

La consigne pédagogique donnée à l'IA est dans `data.js` (constante `SYSTEME`) : niveau, longueur des réponses, style de correction, thème à privilégier.

## Vie privée

Les phrases de l'élève sont envoyées au service d'IA gratuit Pollinations.ai pour générer la réponse ; la reconnaissance vocale de Chrome passe par les serveurs de Google. Aucune donnée n'est stockée sur le site.

## Mise en ligne

Site statique (HTML/CSS/JS) hébergé sur **GitHub Pages** : chaque push sur `main` met le site à jour automatiquement.
