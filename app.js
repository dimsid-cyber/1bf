const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

const $ = (id) => document.getElementById(id);

let voix = null;
let reco = null;
let etape = 0;
let essais = 0;
let mode = null;
let transcriptionExpose = "";
let secondes = 0;
let minuteurChrono = null;
let minuteurSilence = null;
let ecouteEnCours = false;

function normaliser(t) {
  return t
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.,!?;:«»"()]/g, " ")
    .replace(/'/g, " ")
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

function chargerVoix() {
  return new Promise((resolve) => {
    if (!synth) return resolve([]);
    let v = synth.getVoices();
    if (v.length) return resolve(v);
    let n = 0;
    const iv = setInterval(() => {
      v = synth.getVoices();
      if (v.length || ++n > 25) { clearInterval(iv); resolve(v); }
    }, 200);
    synth.onvoiceschanged = () => { v = synth.getVoices(); };
  });
}

function choisirVoixFr(voices) {
  const fr = voices.filter((v) => /^fr[-_]?/i.test(v.lang) || /french|français/i.test(v.name));
  const prefs = [
    /google.*fran/i, /amelie|amélie/i, /thomas/i, /denise/i, /charline/i,
    /hortense/i, /marie/i, /audrey/i, /aurelie|aurélie/i, /french|français/i
  ];
  for (const p of prefs) {
    const f = fr.find((v) => p.test(v.name));
    if (f) return f;
  }
  return fr[0] || null;
}

function parler(texte, lent = false) {
  return new Promise((resolve) => {
    if (!synth) return resolve();
    synth.cancel();
    const u = new SpeechSynthesisUtterance(texte);
    u.lang = "fr-FR";
    if (voix) u.voice = voix;
    u.rate = lent ? 0.62 : 0.95;
    u.onstart = () => setOrbe("parle");
    u.onend = () => resolve();
    u.onerror = () => resolve();
    synth.speak(u);
  });
}

function setOrbe(etat) {
  const o = $("orbe");
  o.className = "orbe " + etat;
}

function sousTitre(t) {
  $("sous-titre").textContent = t;
}

function entendu(t) {
  $("entendu").textContent = t;
}

function montrer(id) { $(id).classList.remove("hidden"); }
function cacher(id) { $(id).classList.add("hidden"); }

function arreterEcoute() {
  if (minuteurSilence) { clearTimeout(minuteurSilence); minuteurSilence = null; }
  if (reco) {
    reco.onend = null;
    try { reco.stop(); } catch (e) {}
    reco = null;
  }
  ecouteEnCours = false;
}

function demarrerEcoute(continu, onFinal, onInterim, onFin) {
  if (!SR) { cacher("btn-micro"); montrer("clavier"); return false; }
  arreterEcoute();
  ecouteEnCours = true;
  reco = new SR();
  reco.lang = "fr-FR";
  reco.continuous = continu;
  reco.interimResults = true;
  let final = "";
  reco.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
      else interim += e.results[i][0].transcript;
    }
    if (onInterim) onInterim((final + interim).trim());
    if (final.trim()) onFinal(final.trim());
  };
  reco.onerror = () => { if (onFin) onFin(final.trim()); };
  reco.onend = () => {
    ecouteEnCours = false;
    setOrbe("idle");
    if (onFin) onFin(final.trim());
  };
  reco.onstart = () => setOrbe("ecoute");
  try { reco.start(); } catch (e) { ecouteEnCours = false; return false; }
  return true;
}

function motsTrouves(cible, dit) {
  const cibleN = normaliser(cible);
  const ditN = normaliser(dit);
  let p = 0;
  const mots = cibleN.split(" ").map((mot) => {
    const idx = ditN.indexOf(mot, p);
    if (idx !== -1) { p = idx + 1; return { mot, ok: true }; }
    return { mot, ok: false };
  });
  const ok = mots.filter((m) => m.ok).length;
  return { mots, score: ok / mots.length };
}

function correspond(step, texte) {
  const t = normaliser(texte);
  return step.keys.some((k) => t.includes(normaliser(k)));
}

function transcriptionRecue() {
  return $("entendu").textContent.includes("🗣️");
}

async function ecouterReponse(modeTraitement) {
  mode = modeTraitement;
  montrer("btn-micro");
  $("btn-micro").textContent = "🎤 Appuie et parle";
  $("btn-micro").classList.remove("recording");
  const lance = demarrerEcoute(
    false,
    (final) => { arreterEcoute(); traiter(modeTraitement, final); },
    (interim) => entendu("🗣️ " + interim),
    () => {}
  );
  if (lance) {
    minuteurSilence = setTimeout(async () => {
      if (!transcriptionRecue()) {
        arreterEcoute();
        await parler("Tu es là ? Appuie sur le bouton et parle !");
        setOrbe("idle");
      }
    }, 12000);
  }
}

async function traiter(m, texte) {
  if (!texte) { await ecouterReponse(m); return; }
  entendu("🗣️ " + texte);
  const step = CONVERSATION[etape];

  if (m === "q") {
    if (correspond(step, texte)) {
      const rep = step.oui[Math.floor(Math.random() * step.oui.length)];
      sousTitre(rep);
      await parler(rep);
      await jouerEtape(etape + 1);
    } else {
      essais++;
      if (essais <= 2) {
        sousTitre(step.non);
        await parler(step.non);
        await ecouterReponse("q");
      } else {
        const rep = "Pas de problème ! On continue !";
        sousTitre(rep);
        await parler(rep);
        await jouerEtape(etape + 1);
      }
    }
  } else if (m === "repeat") {
    const r = motsTrouves(step.phrase, texte);
    if (r.score >= 0.8) {
      const rep = "Bravo ! Très bien prononcé ! 🎉";
      sousTitre(rep);
      await parler(rep);
      await jouerEtape(etape + 1);
    } else if (r.score >= 0.4 && essais < 2) {
      essais++;
      const rep = "Presque ! Écoute encore.";
      sousTitre(rep + " " + step.phrase);
      await parler(rep);
      await parler(step.phrase, true);
      await parler("À toi !");
      await ecouterReponse("repeat");
    } else {
      const rep = "Ce n'est pas grave ! On continue !";
      sousTitre(rep);
      await parler(rep);
      await jouerEtape(etape + 1);
    }
  }
}

async function jouerEtape(i) {
  if (i >= CONVERSATION.length) i = CONVERSATION.length - 1;
  etape = i;
  essais = 0;
  cacher("btn-micro");
  cacher("btn-restart");
  const s = CONVERSATION[i];
  setOrbe("parle");
  sousTitre(s.bot);
  entendu("");
  await parler(s.bot);

  if (s.type === "q") {
    await ecouterReponse("q");
  } else if (s.type === "repeat") {
    sousTitre(s.phrase);
    await parler(s.phrase);
    await parler("À toi ! Répète !");
    await ecouterReponse("repeat");
  } else if (s.type === "expose") {
    sousTitre("Appuie sur le bouton, parle, puis appuie encore pour arrêter.");
    montrer("btn-micro");
    $("btn-micro").textContent = "🎤 Je commence";
    setOrbe("idle");
  } else if (s.type === "end") {
    montrer("btn-restart");
    setOrbe("idle");
  }
}

function evaluerExpose() {
  const t = normaliser(transcriptionExpose);
  const trouve = [...new Set(MOTS_EXPOSE.filter((m) => t.includes(normaliser(m))))];
  const structures = [
    ["bonjour|salut|je m'appelle", "tu salues"],
    ["il faut|on joue", "tu parles du matériel"],
    ["interdit|on ne peut pas", "tu donnes une règle"],
    ["j'aime|parce que", "tu donnes ton avis"]
  ];
  const nbStruct = structures.filter(([p]) => p.split("|").some((x) => t.includes(normaliser(x)))).length;

  let msg = "Super ! Tu as parlé " + secondes + " secondes. ";
  if (trouve.length >= 5) msg += "J'ai entendu plein de mots du sport : " + trouve.slice(0, 6).join(", ") + ". Excellent ! ";
  else if (trouve.length >= 2) msg += "J'ai entendu : " + trouve.slice(0, 5).join(", ") + ". Continue à utiliser les mots du sport ! ";
  else msg += "Essaie d'utiliser les mots du sport : ballon, terrain, il faut... ";
  msg += nbStruct >= 3 ? "Très bien, ta présentation est complète ! " :
         nbStruct >= 1 ? "Pense aussi à : " + structures.filter(([p]) => !p.split("|").some((x) => t.includes(normaliser(x)))).map(([, l]) => l).join(", ") + ". " :
         "Suis le plan : le sport, le matériel, les règles, et pourquoi tu l'aimes. ";
  return msg;
}

$("btn-commencer").addEventListener("click", async () => {
  cacher("btn-commencer");
  const voices = await chargerVoix();
  voix = choisirVoixFr(voices);
  if (!voix && synth) {
    const w = $("avertissement");
    w.textContent = "⚠️ Aucune voix française trouvée sur cet appareil. Sur iPhone : Réglages → Accessibilité → Contenus énoncés → Voix → Français. Sur Android : Paramètres → Gestion de la langue → Synthèse vocale.";
    montrer("avertissement");
  }
  if (!SR) {
    const w = $("avertissement");
    w.textContent = "ℹ️ La reconnaissance vocale n'est pas disponible ici. Utilise Chrome, Edge ou Safari, ou écris tes réponses.";
    montrer("avertissement");
    montrer("clavier");
  }
  jouerEtape(0);
});

$("btn-micro").addEventListener("click", () => {
  const s = CONVERSATION[etape];
  if (s.type === "expose") {
    if (ecouteEnCours) {
      arreterEcoute();
      clearInterval(minuteurChrono);
      $("btn-micro").textContent = "🎤 Je commence";
      $("btn-micro").classList.remove("recording");
      const msg = evaluerExpose();
      sousTitre(msg);
      parler(msg).then(() => jouerEtape(etape + 1));
      return;
    }
    transcriptionExpose = "";
    secondes = 0;
    $("btn-micro").textContent = "⏹️ J'ai fini";
    $("btn-micro").classList.add("recording");
    demarrerEcoute(
      true,
      (final) => { transcriptionExpose = final; },
      (interim) => entendu("🗣️ " + interim.slice(-100)),
      () => {}
    );
    minuteurChrono = setInterval(() => {
      secondes++;
      if (secondes >= 90) {
        arreterEcoute();
        clearInterval(minuteurChrono);
        $("btn-micro").textContent = "🎤 Je commence";
        $("btn-micro").classList.remove("recording");
        const msg = evaluerExpose();
        sousTitre(msg);
        parler(msg).then(() => jouerEtape(etape + 1));
      }
    }, 1000);
  } else if (ecouteEnCours) {
    arreterEcoute();
    setOrbe("idle");
  } else {
    ecouterReponse(mode || "q");
  }
});

$("btn-restart").addEventListener("click", () => {
  cacher("btn-restart");
  jouerEtape(0);
});

$("clavier").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && $("clavier").value.trim()) {
    const v = $("clavier").value.trim();
    $("clavier").value = "";
    traiter(mode || "q", v);
  }
});

window.addEventListener("beforeunload", () => { arreterEcoute(); if (synth) synth.cancel(); });
