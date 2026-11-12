const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

const $ = (id) => document.getElementById(id);

function normaliser(t) {
  return t
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.,!?;:«»"()]/g, " ")
    .replace(/'/g, " ")
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function parler(texte, lent = false) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(texte);
  u.lang = "fr-FR";
  u.rate = lent ? 0.6 : 0.95;
  const voix = synth.getVoices().find(v => v.lang && v.lang.startsWith("fr"));
  if (voix) u.voice = voix;
  synth.speak(u);
}

function creerReco(continu, onResultat, onInterim, onFin) {
  if (!SR) return null;
  const r = new SR();
  r.lang = "fr-FR";
  r.continuous = continu;
  r.interimResults = true;
  let final = "";
  r.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
      else interim += e.results[i][0].transcript;
    }
    onInterim(final + interim);
    if (final.trim()) onResultat(final.trim());
  };
  r.onerror = () => onFin && onFin(final.trim());
  r.onend = () => onFin && onFin(final.trim());
  return r;
}

const tabs = document.querySelectorAll(".tab");
tabs.forEach(t => t.addEventListener("click", () => {
  tabs.forEach(x => x.classList.remove("active"));
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  t.classList.add("active");
  $(t.dataset.tab).classList.add("active");
}));

let phraseCourante = null;
let recoPron = null;

function afficherGroupes() {
  const c = $("phrase-groupes");
  PHRASES.forEach(g => {
    const div = document.createElement("div");
    div.className = "groupe";
    const h = document.createElement("h3");
    h.textContent = g.groupe;
    div.appendChild(h);
    g.items.forEach(item => {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = item.t;
      b.addEventListener("click", () => {
        document.querySelectorAll("#phrase-groupes .chip").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        phraseCourante = item;
        $("phrase-texte").textContent = item.t;
        $("phrase-tip").textContent = "💡 " + item.tip;
        $("pron-reco").textContent = "";
        $("pron-mots").innerHTML = "";
        $("pron-feedback").textContent = "";
        $("pron-feedback").className = "feedback";
      });
      div.appendChild(b);
    });
    c.appendChild(div);
  });
}

function comparerMots(cible, dit) {
  const cibleN = normaliser(cible);
  const ditN = normaliser(dit);
  let p = 0;
  return cibleN.map(mot => {
    const idx = ditN.indexOf(mot, p);
    if (idx !== -1) { p = idx + 1; return { mot, ok: true }; }
    return { mot, ok: false };
  });
}

function afficherPronResultat(dit) {
  if (!phraseCourante) return;
  const mots = comparerMots(phraseCourante.t, dit);
  const c = $("pron-mots");
  c.innerHTML = "";
  let ok = 0;
  mots.forEach(m => {
    if (m.ok) ok++;
    const s = document.createElement("span");
    s.className = "mot " + (m.ok ? "ok" : "ko");
    s.textContent = m.mot;
    c.appendChild(s);
  });
  const score = ok / mots.length;
  const f = $("pron-feedback");
  if (score >= 0.8) {
    f.textContent = "🎉 Bravo ! C'est très bien prononcé !";
    f.className = "feedback good";
    parler("Bravo ! C'est très bien !");
  } else if (score >= 0.5) {
    f.textContent = "👍 Presque ! Les mots en rouge sont à répéter.";
    f.className = "feedback mid";
  } else {
    f.textContent = "💪 Réessaie ! Écoute d'abord la phrase, puis répète.";
    f.className = "feedback bad";
  }
}

$("btn-ecouter").addEventListener("click", () => phraseCourante && parler(phraseCourante.t));
$("btn-ecouter-lent").addEventListener("click", () => phraseCourante && parler(phraseCourante.t, true));

$("btn-micro").addEventListener("click", () => {
  if (!SR) {
    $("pron-reco").textContent = "⚠️ Ton navigateur ne reconnaît pas la voix. Utilise Chrome, Edge ou Safari.";
    return;
  }
  if (!phraseCourante) {
    $("pron-reco").textContent = "D'abord, choisis une phrase ci-dessus !";
    return;
  }
  if (recoPron) { recoPron.stop(); recoPron = null; return; }
  const btn = $("btn-micro");
  btn.textContent = "⏹️ Stop";
  btn.classList.add("recording");
  $("pron-reco").textContent = "J'écoute... répète la phrase ! 🎧";
  $("pron-feedback").textContent = "";
  $("pron-feedback").className = "feedback";
  recoPron = creerReco(false,
    (final) => { afficherPronResultat(final); recoPron && recoPron.stop(); },
    (interim) => { $("pron-reco").textContent = "🗣️ " + interim; },
    () => {
      btn.textContent = "🎤 Je répète !";
      btn.classList.remove("recording");
      recoPron = null;
    });
  recoPron.start();
});

let etape = 0;
let recoChat = null;
let enEcouteChat = false;

function ajouterBulle(texte, qui) {
  const c = $("chat");
  const b = document.createElement("div");
  b.className = "bulle " + qui;
  b.textContent = texte;
  c.appendChild(b);
  c.scrollTop = c.scrollHeight;
}

function reponseBot(reponses) {
  const r = reponses[Math.floor(Math.random() * reponses.length)];
  ajouterBulle(r, "bot");
  parler(r);
}

function traiterReponse(texte) {
  ajouterBulle(texte, "user");
  const etapeActuelle = DIALOG[etape];
  if (!etapeActuelle) return;
  const t = normaliser(texte).join(" ");
  const trouve = etapeActuelle.keywords.some(k => t.includes(normaliser(k).join(" ")) || normaliser(k).join(" ").split(" ").every(m => t.includes(m)));
  if (trouve) {
    reponseBot(etapeActuelle.oui);
    if (etapeActuelle.next !== null && etapeActuelle.next > etape) {
      etape = etapeActuelle.next;
      setTimeout(() => {
        ajouterBulle(DIALOG[etape].bot, "bot");
        parler(DIALOG[etape].bot);
      }, 1800);
    }
  } else {
    reponseBot(etapeActuelle.non);
  }
}

function envoyerChat() {
  const v = $("chat-input").value.trim();
  if (!v) return;
  $("chat-input").value = "";
  traiterReponse(v);
}

$("btn-envoyer").addEventListener("click", envoyerChat);
$("chat-input").addEventListener("keydown", e => { if (e.key === "Enter") envoyerChat(); });

$("btn-micro-chat").addEventListener("click", () => {
  if (!SR) {
    $("chat-reco").textContent = "⚠️ Reconnaissance vocale non disponible. Utilise Chrome, Edge ou Safari, ou écris.";
    return;
  }
  if (enEcouteChat) { recoChat && recoChat.stop(); return; }
  enEcouteChat = true;
  const btn = $("btn-micro-chat");
  btn.textContent = "⏹️ Stop";
  btn.classList.add("recording");
  $("chat-reco").textContent = "J'écoute... parle ! 🎧";
  recoChat = creerReco(false,
    (final) => { traiterReponse(final); },
    (interim) => { $("chat-reco").textContent = "🗣️ " + interim; },
    () => {
      enEcouteChat = false;
      btn.textContent = "🎤 Parler";
      btn.classList.remove("recording");
      $("chat-reco").textContent = "";
      recoChat = null;
    });
  recoChat.start();
});

$("btn-restart").addEventListener("click", () => {
  $("chat").innerHTML = "";
  etape = 0;
  ajouterBulle(DIALOG[0].bot, "bot");
  parler(DIALOG[0].bot);
});

function afficherPlan() {
  const c = $("plan");
  EXPOSE_PLAN.forEach(e => {
    const d = document.createElement("div");
    d.className = "etape";
    const h = document.createElement("h3");
    h.textContent = e.titre;
    d.appendChild(h);
    const ul = document.createElement("ul");
    e.exemples.forEach(x => {
      const li = document.createElement("li");
      li.textContent = x;
      const btn = document.createElement("button");
      btn.className = "chip";
      btn.textContent = "🔊";
      btn.style.marginLeft = "0.4rem";
      btn.addEventListener("click", () => parler(x));
      li.appendChild(btn);
      ul.appendChild(li);
    });
    d.appendChild(ul);
    c.appendChild(d);
  });
}

let recoExpose = null;
let chronoTimer = null;
let secondes = 0;
let transcriptionExpose = "";

function evaluerExpose() {
  const t = normaliser(transcriptionExpose).join(" ");
  const c = $("expose-eval");
  c.innerHTML = "";

  const ligne = (ico, label, detail) => {
    const d = document.createElement("div");
    d.className = "eval-item";
    d.innerHTML = `<span class="ico">${ico}</span><span><span class="label">${label}</span><br><span class="detail">${detail}</span></span>`;
    c.appendChild(d);
  };

  const structures = [
    ["bonjour", "Je salue"],
    ["je m'appelle", "Je me présente"],
    ["je vais vous présenter|mon sport", "Je présente mon sport"],
    ["il faut|on joue", "Je parle du matériel et des règles"],
    ["interdit|on ne peut pas", "Je donne une règle interdite"],
    ["j'aime|parce que", "Je donne mon avis"]
  ];
  let nbStruct = 0;
  structures.forEach(([pat, label]) => {
    const ok = pat.split("|").some(p => t.includes(normaliser(p).join(" ")));
    if (ok) nbStruct++;
    ligne(ok ? "✅" : "⬜", label, ok ? "Présent dans ton exposé" : "À ajouter ! Regarde le plan.");
  });

  const motsTrouves = [...new Set(EXPOSE_MOTS_CLES.filter(m => t.includes(normaliser(m).join(" "))))];
  const pct = Math.min(100, Math.round(motsTrouves.length / 8 * 100));
  ligne(pct >= 60 ? "✅" : pct >= 30 ? "🟡" : "⬜",
    "Vocabulaire du sport",
    pct + "% — mots utilisés : " + (motsTrouves.slice(0, 10).join(", ") || "aucun pour l'instant"));

  const dureeOk = secondes >= 45;
  ligne(dureeOk ? "✅" : "🟡", "Durée : " + fmtTemps(secondes),
    dureeOk ? "C'est une bonne durée !" : "Objectif : au moins 45 secondes. Continue !");

  const score = Math.round((nbStruct / structures.length) * 60 + pct * 0.4);
  const s = document.createElement("p");
  s.className = "score-final";
  s.textContent = "Score : " + score + " / 100 " + (score >= 75 ? "🎉 Excellent !" : score >= 50 ? "👍 Bien, continue !" : "💪 Entraîne-toi encore !");
  c.appendChild(s);

  const p = document.createElement("p");
  p.style.cssText = "font-size:0.88rem;color:#4a5578;margin-top:0.5rem;font-style:italic";
  p.textContent = "Ce que j'ai entendu : " + (transcriptionExpose || "—");
  c.appendChild(p);
}

function fmtTemps(s) {
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

$("btn-micro-expose").addEventListener("click", () => {
  if (!SR) {
    $("expose-reco").textContent = "⚠️ Reconnaissance vocale non disponible. Utilise Chrome, Edge ou Safari.";
    return;
  }
  const btn = $("btn-micro-expose");
  if (recoExpose) {
    recoExpose.stop();
    return;
  }
  transcriptionExpose = "";
  secondes = 0;
  $("expose-eval").innerHTML = "";
  btn.textContent = "⏹️ Stop";
  btn.classList.add("recording");
  $("expose-reco").textContent = "C'est parti ! Présente ton exposé 🎤";
  chronoTimer = setInterval(() => {
    secondes++;
    $("chrono").textContent = fmtTemps(secondes);
  }, 1000);
  recoExpose = creerReco(true,
    (final) => { transcriptionExpose = final; },
    (interim) => { $("expose-reco").textContent = "🗣️ " + interim.slice(-120); },
    () => {
      clearInterval(chronoTimer);
      btn.textContent = "🎤 Je commence";
      btn.classList.remove("recording");
      $("expose-reco").textContent = "";
      recoExpose = null;
      evaluerExpose();
    });
  recoExpose.start();
});

function init() {
  afficherGroupes();
  afficherPlan();
  ajouterBulle(DIALOG[0].bot, "bot");
  if (!SR) {
    $("support-note").textContent = "Pour parler avec le micro, utilise Chrome, Edge ou Safari. Sinon, tu peux écrire dans le dialogue.";
  }
  if (synth) synth.onvoiceschanged = () => {};
}

init();
