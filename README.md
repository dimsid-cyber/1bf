# Coach Oral FLE — Le sport, le matériel et les règles

Application web pour élèves de FLE niveau **A1 (CECRL)**, adolescents.
Fonctionne sur **smartphone, tablette et ordinateur**, sans installation ni compte.

## Trois modes

| Mode | Objectif | Comment ça marche |
|---|---|---|
| 🎙️ **Prononciation** | Répéter des phrases du thème « sport » | L'élève écoute la phrase (voix normale ou lente), la répète dans le micro. L'application compare mot à mot et met en vert/rouge, avec une astuce phonétique ([y]/[u], nasales, [ʁ], etc.) |
| 💬 **Dialogue** | S'exprimer en interaction | Coach Léo pose des questions (sport préféré, lieu, matériel, règles). L'élève répond au micro ou au clavier ; le bot réagit aux mots-clés et relance avec un modèle de phrase |
| 📝 **Exposé** | Préparer un exposé oral | Plan en 5 étapes (saluer → présenter le sport → matériel → règles → avis) avec phrases modèles. L'élève s'entraîne en continu ; l'app évalue : structures présentes, vocabulaire du sport utilisé, durée, score /100 |

## Utilisation en classe

1. Ouvrir l'adresse du site sur l'appareil de l'élève.
2. Autoriser le micro quand le navigateur le demande.
3. Navigateurs compatibles micro : **Chrome, Edge, Safari** (Firefox : mode clavier uniquement).

## Pistes pédagogiques

- **Prononciation** : 5 min en début de cours comme rituel phonétique.
- **Dialogue** : entraînement individuel avant une activité de pair en présentiel.
- **Exposé** : préparation à la maison, capture d'écran du score à envoyer au professeur ; l'évaluation (structures, vocabulaire, durée) peut servir de grille d'auto-évaluation.

## Modifier le contenu

Tout le contenu pédagogique est dans `data.js` : listes de vocabulaire, phrases de prononciation (avec astuces), dialogue, plan d'exposé et mots-clés d'évaluation. Pour changer de thème (ex. « la ville », « les repas »), il suffit de modifier ce fichier.

## Mise en ligne

Site 100 % statique (HTML/CSS/JS, aucune dépendance, aucune clé API) : hébergeable gratuitement sur **GitHub Pages**, Netlify ou tout serveur scolaire. Avec GitHub Pages : pousser ce dossier dans un dépôt, puis *Settings → Pages → Source : main / root*.
