const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

const $ = (id) => document.getElementById(id);

let voix = null;
let reco = null;
let historique = [];
let mode = null;
let dernierEntendu = "";
let erreurReco = null;
let essaisSilence = 0;
let ecouteEnCours = false;
let enTraitement = false;

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

async function repondreIA() {
  const messages = [{ role: "system", content: SYSTEME }, ...historique.slice(-12)];
  const controleur = new AbortController();
  const timeout = setTimeout(() => controleur.abort(), 25000);
  try {
    const r = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai", messages, max_tokens: 120, temperature: 0.7 }),
      signal: controleur.signal
    });
    if (!r.ok) throw new Error("http " + r.status);
    const d = await r.json();
    const texte = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
    return texte ? texte.trim() : null;
  } finally {
    clearTimeout(timeout);
  }
}

function setOrbe(etat) {
  $("orbe").className = "orbe " + etat;
}

function sousTitre(t) { $("sous-titre").textContent = t; }
function entendu(t) { $("entendu").textContent = t; }
function montrer(id) { $(id).classList.remove("hidden"); }
function cacher(id) { $(id).classList.add("hidden"); }

function arreterEcoute() {
  if (reco) {
    reco.onend = null;
    reco.onresult = null;
    try { reco.stop(); } catch (e) {}
    reco = null;
  }
  ecouteEnCours = false;
}

function demarrerEcoute(onFinal, onInterim, onFin) {
  if (!SR) return false;
  arreterEcoute();
  dernierEntendu = "";
  erreurReco = null;
  ecouteEnCours = true;
  reco = new SR();
  reco.lang = "fr-FR";
  reco.continuous = false;
  reco.interimResults = true;
  let final = "";
  reco.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
      else interim += e.results[i][0].transcript;
    }
    const tout = (final + interim).trim();
    if (tout) dernierEntendu = tout;
    if (onInterim && tout) onInterim(tout);
    if (final.trim() && onFinal) onFinal(final.trim());
  };
  reco.onerror = (e) => { erreurReco = e.error || "erreur"; };
  reco.onend = () => {
    ecouteEnCours = false;
    setOrbe("idle");
    if (onFin) onFin(final.trim());
  };
  reco.onstart = () => setOrbe("ecoute");
  try { reco.start(); } catch (e) { ecouteEnCours = false; return false; }
  return true;
}

function gererErreurMicro() {
  if (!erreurReco) return false;
  if (erreurReco === "not-allowed" || erreurReco === "service-not-allowed") {
    const w = $("avertissement");
    w.textContent = "⚠️ Le micro est bloqué. Autorise le micro pour ce site (icône 🔒 dans la barre d'adresse), ou écris tes réponses ci-dessous.";
    montrer("avertissement");
    montrer("clavier");
    cacher("btn-micro");
    return true;
  }
  if (erreurReco === "network") {
    const w = $("avertissement");
    w.textContent = "⚠️ La reconnaissance vocale a besoin d'internet et le réseau la bloque. Écris tes réponses ci-dessous, le bot te répondra à voix haute.";
    montrer("avertissement");
    montrer("clavier");
    return true;
  }
  return false;
}

async function ecouterReponse() {
  if (enTraitement) return;
  mode = "libre";
  montrer("btn-micro");
  $("btn-micro").textContent = "🎤 Appuie et parle";
  $("btn-micro").classList.remove("recording");
  const lance = demarrerEcoute(
    (final) => { arreterEcoute(); envoyer(final); },
    (interim) => entendu("🗣️ " + interim),
    () => finEcouteReponse()
  );
  if (lance) setOrbe("ecoute");
}

async function finEcouteReponse() {
  if (ecouteEnCours || enTraitement) return;
  if (gererErreurMicro()) { setOrbe("idle"); return; }
  if (dernierEntendu.trim()) { envoyer(dernierEntendu.trim()); return; }
  essaisSilence++;
  if (essaisSilence <= 2) {
    await parler("Je ne t'ai pas entendu ! Appuie sur le bouton et parle !");
    ecouterReponse();
  } else {
    sousTitre("Appuie sur 🎤 et parle plus près du micro !");
    setOrbe("idle");
  }
}

async function envoyer(texte) {
  if (!texte || enTraitement) return;
  enTraitement = true;
  essaisSilence = 0;
  cacher("btn-micro");
  entendu("🗣️ " + texte);
  historique.push({ role: "user", content: texte });
  sousTitre("Coach Léo réfléchit...");
  setOrbe("parle");

  let rep = null;
  try { rep = await repondreIA(); } catch (e) { rep = null; }
  if (!rep) rep = ERREUR_IA;

  historique.push({ role: "assistant", content: rep });
  sousTitre(rep);
  await parler(rep);
  enTraitement = false;
  ecouterReponse();
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
  historique = [];
  sousTitre(ACCUEIL);
  await parler(ACCUEIL);
  historique.push({ role: "assistant", content: ACCUEIL });
  ecouterReponse();
});

$("btn-micro").addEventListener("click", () => {
  if (enTraitement) return;
  if (ecouteEnCours) {
    arreterEcoute();
    if (dernierEntendu.trim()) {
      envoyer(dernierEntendu.trim());
    } else if (gererErreurMicro()) {
      setOrbe("idle");
    } else {
      ecouterReponse();
    }
  } else {
    ecouterReponse();
  }
});

$("btn-restart").addEventListener("click", () => {
  arreterEcoute();
  if (synth) synth.cancel();
  enTraitement = false;
  historique = [];
  cacher("btn-restart");
  montrer("btn-commencer");
  sousTitre("Prêt ? Appuie sur Commencer !");
  entendu("");
  setOrbe("idle");
});

$("clavier").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && $("clavier").value.trim()) {
    const v = $("clavier").value.trim();
    $("clavier").value = "";
    envoyer(v);
  }
});

window.addEventListener("beforeunload", () => { arreterEcoute(); if (synth) synth.cancel(); });
