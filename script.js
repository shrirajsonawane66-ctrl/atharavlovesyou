/* ============================================================
   script.js — Atharva Loves You ❤️
   Everything: escaping NO button, floating hearts, typewriter,
   countdown, heart trail, confetti, fireworks, music, surprises.
   Vanilla JS only, all anim loops run on requestAnimationFrame.
   ============================================================ */

"use strict";

/* ------------------------------------------------------------
   1. CONFIG — everything you might want to customize lives here
   ------------------------------------------------------------ */
const CONFIG = {
  // ✏️ EDIT: the date you fell for her. Format: new Date('Year, Month(1-12), Day, Hour, Minute')
  fellForYou: new Date(2024, 5, 14, 18, 30),

  // Names / messages (easy to change)
  myName: "Atharva",
  typewriterMain: "Atharva Loves You ❤️",
  typewriterSub: "Kuchupuchu 🥺💖",

  // Funny messages for the escaping NO button
  noMessages: [
    "Please don't 😭",
    "Think again 🥺",
    "Areeeee noooo",
    "Kuch toh sharam karo 😭",
    "Really??",
    "Don't break my heart 💔",
    "No option disabled 😂",
  ],

  // Surprise floating texts (every 10 seconds)
  surprises: [
    "You're Beautiful ❤️",
    "My Favorite Person 🌸",
    "Lucky To Have You 🥺",
    "I Love Your Smile 😊",
    "Cutest Human Ever 💖",
    "My Happiness ❤️",
  ],

  surpriseIntervalMs: 10000,

  // Timing
  celebratePopupAfterMs: 15000, // "I LOVE YOU" finale starts 15s after celebration
  proposalDurationMs: 5000,     // length of the ring + kiss scene
  delays: {
    cardFaceIn: 500,     // slight wait for heart pop
    typewriterGap: 1200, // after big heart before typing
    typeCharMs: 70,      // speed of typewriter
    typeCharMsSub: 80,
  },
};

/* ------------------------------------------------------------
   2. ELEMENT REFS
   ------------------------------------------------------------ */
const $ = (sel) => document.querySelector(sel);

const yesBtn      = $("#yes-btn");
const noBtn       = $("#no-btn");
const noMessage   = $("#no-message");
const mainCard    = $("#main-card");
const celebrate   = $("#celebrate");
const stage       = $("#stage");
const musicBtn    = $("#music-btn");
const music       = $("#music");
const surpriseLay = $("#surprise-layer");
const loveFlood   = $("#love-flood");

/* ------------------------------------------------------------
   3. CANVASES: floating background hearts + FX (confetti/fireworks)
   ------------------------------------------------------------ */
const bgCanvas = $("#hearts-bg");
const fxCanvas = $("#fx-canvas");
const bgCtx = bgCanvas.getContext("2d");
const fxCtx = fxCanvas.getContext("2d");

let W = 0, H = 0;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvases() {
  W = window.innerWidth;
  H = window.innerHeight;
  bgCanvas.width = fxCanvas.width = W * DPR;
  bgCanvas.height = fxCanvas.height = H * DPR;
  bgCanvas.style.width = fxCanvas.style.width = W + "px";
  bgCanvas.style.height = fxCanvas.style.height = H + "px";
  bgCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  fxCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener("resize", resizeCanvases);
resizeCanvases();

/* ============================================================
   A. FLOATING BACKGROUND HEARTS  (continuous upward drift)
   ============================================================ */
const bgHearts = [];
const bgHeartColors = ["#ff6f9c", "#ff9ec0", "#c6a4ff", "#a8f0d4", "#ffffff"];

function spawnBgHeart(initial) {
  bgHearts.push({
    x: Math.random() * W,
    y: initial ? Math.random() * H : H + 20 + Math.random() * 40,
    size: 6 + Math.random() * 12,
    speed: 0.4 + Math.random() * 1.1,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.008 + Math.random() * 0.02,
    color: bgHeartColors[Math.floor(Math.random() * bgHeartColors.length)],
    alpha: 0.25 + Math.random() * 0.45,
    rot: Math.random() * Math.PI * 2,
  });
}

// draw a heart path centered at (0,0) roughly size `s`
function drawHeart(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.32);
  ctx.bezierCurveTo(s, -s * 0.32, s * 0.55, -s, 0, -s * 0.42);
  ctx.bezierCurveTo(-s * 0.55, -s, -s, -s * 0.32, 0, s * 0.32);
  ctx.closePath();
}

function renderBgHearts(t) {
  bgCtx.clearRect(0, 0, W, H);

  for (let i = bgHearts.length - 1; i >= 0; i--) {
    const h = bgHearts[i];
    h.y -= h.speed;
    h.wobble += h.wobbleSpeed;
    h.rot += 0.005;

    const x = h.x + Math.sin(h.wobble) * 14;

    // remove when off top
    if (h.y < -30) {
      bgHearts.splice(i, 1);
      spawnBgHeart(false);
      continue;
    }

    bgCtx.save();
    bgCtx.translate(x, h.y);
    bgCtx.rotate(Math.sin(h.rot) * 0.3);
    bgCtx.globalAlpha = h.alpha;
    bgCtx.fillStyle = h.color;
    bgCtx.shadowColor = h.color;
    bgCtx.shadowBlur = 10;
    drawHeart(bgCtx, h.size);
    bgCtx.fill();
    bgCtx.restore();
  }

  // keep a steady population
  const target = Math.min(22, Math.floor(W / 70));
  while (bgHearts.length < target) spawnBgHeart(true);

  requestAnimationFrame(renderBgHearts);
}

/* ============================================================
   B. FX PARTICLES — confetti, burst hearts, heart-rain
   One pool reused by all effects for performance.
   ============================================================ */
let fxParticles = [];

function spawnConfetti(n) {
  const colors = ["#ff6f9c", "#ffd166", "#a8f0d4", "#c6a4ff", "#ffffff", "#ff9ec0"];
  for (let i = 0; i < n; i++) {
    fxParticles.push({
      kind: "confetti",
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.4,
      vx: (Math.random() - 0.5) * 2.4,
      vy: 1.2 + Math.random() * 2.2,
      g: 0.02 + Math.random() * 0.025,
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
      color: colors[(Math.random() * colors.length) | 0],
      life: 260 + Math.random() * 160,
      maxLife: 260 + Math.random() * 160,
    });
  }
}

function heartBurst(x, y, n) {
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 2 + Math.random() * 5;
    fxParticles.push({
      kind: "heart",
      x, y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 1.5,
      g: 0.12,
      size: 8 + Math.random() * 14,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: ["#ff6f9c", "#ff9ec0", "#ff8fb1"][(Math.random() * 3) | 0],
      life: 70 + Math.random() * 40,
      maxLife: 70 + Math.random() * 40,
    });
  }
}

function heartRain(n) {
  for (let i = 0; i < n; i++) {
    fxParticles.push({
      kind: "heart",
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.5,
      vx: (Math.random() - 0.5) * 1,
      vy: 1.4 + Math.random() * 1.6,
      g: 0.005,
      size: 10 + Math.random() * 20,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.1,
      color: "#ff6f9c",
      life: 400,
      maxLife: 400,
    });
  }
}

function firework(x, y) {
  const colors = ["#ff6f9c", "#ffd166", "#a8f0d4", "#c6a4ff", "#ffffff"];
  const n = 34 + (Math.random() * 20 | 0);
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const spd = 2.5 + Math.random() * 3;
    fxParticles.push({
      kind: "dot",
      x, y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      g: 0.03,
      size: 2 + Math.random() * 2.5,
      color: colors[(Math.random() * colors.length) | 0],
      life: 50 + Math.random() * 50,
      maxLife: 50 + Math.random() * 50,
    });
  }
}

function renderFx() {
  fxCtx.clearRect(0, 0, W, H);

  /* --- draw trail hearts (integrated here to avoid flicker) --- */
  for (let i = trailHearts.length - 1; i >= 0; i--) {
    const h = trailHearts[i];
    h.alpha -= 0.05;
    h.y -= 0.4;
    if (h.alpha <= 0) { trailHearts.splice(i, 1); continue; }

    fxCtx.save();
    fxCtx.globalAlpha = Math.max(h.alpha, 0);
    fxCtx.fillStyle = h.color;
    fxCtx.shadowColor = h.color;
    fxCtx.shadowBlur = 8;
    fxCtx.translate(h.x, h.y);
    drawHeart(fxCtx, h.size);
    fxCtx.fill();
    fxCtx.restore();
  }

  /* --- draw FX particles (confetti, hearts, dots) --- */
  for (let i = fxParticles.length - 1; i >= 0; i--) {
    const p = fxParticles[i];
    p.life--;
    if (p.life <= 0) { fxParticles.splice(i, 1); continue; }

    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;

    const lifeRatio = p.life / p.maxLife;

    fxCtx.save();
    fxCtx.globalAlpha = Math.max(lifeRatio, 0);
    fxCtx.translate(p.x, p.y);
    fxCtx.rotate(p.rot);

    if (p.kind === "confetti") {
      fxCtx.fillStyle = p.color;
      fxCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    } else if (p.kind === "dot") {
      fxCtx.fillStyle = p.color;
      fxCtx.beginPath();
      fxCtx.arc(0, 0, p.size, 0, Math.PI * 2);
      fxCtx.fill();
    } else {
      // heart
      fxCtx.fillStyle = p.color;
      fxCtx.shadowColor = p.color;
      fxCtx.shadowBlur = 12;
      drawHeart(fxCtx, p.size);
      fxCtx.fill();
    }
    fxCtx.restore();
  }

  requestAnimationFrame(renderFx);
}

/* ============================================================
   C. ESCAPING NO BUTTON — runs away using transform() so the
      card layout never shifts. It can never be clicked.
   ============================================================ */
let escapeCount = 0;       // each escape is slightly faster
let noFrozen = false;      // tiny cool-down so it doesn't jitter
let noOffsetX = 0, noOffsetY = 0; // accumulated transform offset

function moveNoButton() {
  if (noFrozen) return;
  noFrozen = true;
  setTimeout(() => (noFrozen = false), 55);

  // jump in a random direction, further each time
  const pushDist = 90 + Math.random() * 130 + escapeCount * 14;
  const pushAngle = Math.random() * Math.PI * 2;
  noOffsetX += Math.cos(pushAngle) * pushDist;
  noOffsetY += Math.sin(pushAngle) * pushDist;

  // keep it on screen (approx — clamp to a travel range)
  const range = Math.min(W / 2 - 90, 260);
  noOffsetX = Math.max(-range, Math.min(range, noOffsetX));
  noOffsetY = Math.max(-H * 0.25, Math.min(H * 0.25, noOffsetY));

  // slightly faster + smaller each time it escapes
  const dur = Math.max(0.09, 0.28 - escapeCount * 0.015);
  const rot = (Math.random() - 0.5) * 28;
  const scale = Math.max(0.82, 1 - escapeCount * 0.012);

  noBtn.style.zIndex = "15";
  noBtn.classList.add("flight");
  noBtn.style.transition =
    `transform ${dur}s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease`;
  noBtn.style.transform =
    `translate(${noOffsetX}px, ${noOffsetY}px) rotate(${rot}deg) scale(${scale})`;

  escapeCount++;

  // random cute message + tiny pop (only on attempted click/hover)
  noMessage.textContent =
    CONFIG.noMessages[(Math.random() * CONFIG.noMessages.length) | 0];
  noMessage.classList.remove("show");
  void noMessage.offsetWidth; // restart animation
  noMessage.classList.add("show");

  setTimeout(() => noBtn.classList.remove("flight"), 320);
}

// desktop: run away when mouse gets close
function onNoBtnHover(e) {
  const r = noBtn.getBoundingClientRect(); // reflects the transform position
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  if (Math.hypot(dx, dy) < 80) moveNoButton();
}

// mobile: run away on (attempted) touch
function onNoBtnTouch(e) {
  e.preventDefault();
  e.stopPropagation();
  moveNoButton();
}

noBtn.addEventListener("mousemove", onNoBtnHover);
noBtn.addEventListener("mouseenter", onNoBtnHover);
noBtn.addEventListener("touchstart", onNoBtnTouch, { passive: false });
noBtn.addEventListener("pointerdown", (e) => e.preventDefault()); // foolproof

/* ============================================================
   C2. MAGNETIC YES BUTTON — it gently follows the cursor so
       "YES" is always the easiest choice to make.
   ============================================================ */
let mouseX = W / 2, mouseY = H / 2;
let yesOffsetX = 0, yesOffsetY = 0;

window.addEventListener("pointermove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}, { passive: true });

function animateYesMagnet() {
  const r = yesBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  const dx = mouseX - cx;
  const dy = mouseY - cy;
  const dist = Math.hypot(dx, dy);

  // magnetic pull: closer cursor → stronger pull, capped at 46px
  const activation = 320;
  let tx = 0, ty = 0;
  if (dist > 1 && dist < activation) {
    const strength = (1 - dist / activation) * 46;
    tx = (dx / dist) * strength;
    ty = (dy / dist) * strength;
  }

  // smooth follow
  yesOffsetX += (tx - yesOffsetX) * 0.09;
  yesOffsetY += (ty - yesOffsetY) * 0.09;

  if (Math.abs(yesOffsetX) > 0.05 || Math.abs(yesOffsetY) > 0.05) {
    yesBtn.style.transform =
      `translate(${yesOffsetX.toFixed(1)}px, ${yesOffsetY.toFixed(1)}px)`;
  } else {
    yesBtn.style.transform = "translate(0px, 0px)";
  }

  requestAnimationFrame(animateYesMagnet);
}

/* ============================================================
   D. YES BUTTON → celebration
   ============================================================ */
yesBtn.addEventListener("click", () => {
  // 1. heart explosion on the button
  const r = yesBtn.getBoundingClientRect();
  heartBurst(r.left + r.width / 2, r.top + r.height / 2, 26);

  // 2. confetti pouring in
  spawnConfetti(180);

  // 3. quick zoom of the whole page
  document.body.classList.add("zoom-in");
  setTimeout(() => document.body.classList.remove("zoom-in"), 600);

  // 4. heavy heart rain
  heartRain(140);
  setTimeout(() => spawnConfetti(120), 300);
  setTimeout(() => heartRain(100), 650);
  setTimeout(() => heartBurst(W / 2, H * 0.4, 30), 900);

  if (music.paused) toggleMusic();

  // 5. swap to celebration screen
  celebrate.show();
  mainCard.closest(".stage").style.opacity = "0";
  setTimeout(() => {
    stage.hidden = true;
    celebrate.classList.add("show");
    scrollTo({ top: 0, behavior: "smooth" });
    playProposal();           // bear offers ring 💍 then they kiss 💋
    startCountdown();
    startSurprises();
    // after 15s of celebration, go straight to the grand "I LOVE YOU" finale
    setTimeout(finale, CONFIG.celebratePopupAfterMs);
  }, 250);
});

/* Page zoom keyframes – injected as a tiny style block to avoid
   cluttering the CSS file with a one-off animation. */
const pageZoomCss = document.createElement("style");
pageZoomCss.textContent = `
  body.zoom-in { animation: pageZoom 0.6s ease; }
  @keyframes pageZoom {
    0%   { transform: scale(1); }
    35%  { transform: scale(1.045); }
    100% { transform: scale(1); }
  }`;
document.head.appendChild(pageZoomCss);

// show() is a native HTMLElement method on our section (below)

/* ============================================================
   D2. PROPOSAL SCENE — the teddy bear offers a diamond ring
       to the panda, they lean in and kiss. Plays as a short
       cinematic overlay, then the celebration content follows.
   ============================================================ */
function playProposal() {
  const overlay = $("#proposal-overlay");
  const cap = $("#proposal-caption");
  const phrases = [
    "Will you be mine? 💍",
    "Forever & always? 🥺",
    "I love you! 💋",
  ];

  overlay.classList.remove("play", "done");
  void overlay.offsetWidth; // restart animations
  overlay.classList.add("play");

  // captions swap one after another
  let pi = 0;
  cap.textContent = phrases[0];
  cap.classList.add("show");
  const capTimer = setInterval(() => {
    pi++;
    if (pi >= phrases.length) { clearInterval(capTimer); return; }
    cap.classList.remove("show");
    void cap.offsetWidth;
    cap.textContent = phrases[pi];
    cap.classList.add("show");
  }, 1500);

  // fade the scene out and start the typewriter celebration
  setTimeout(() => {
    clearInterval(capTimer);
    overlay.classList.add("done");
    setTimeout(() => {
      overlay.classList.remove("play", "done");
      overlay.style.display = "none";
    }, 600);
    runCelebrationSequence();
  }, CONFIG.proposalDurationMs);
}

/* ============================================================
   E. CELEBRATION SEQUENCE — typewriter + promises + letter
   ============================================================ */
const typedMain = $("#typewriter-line");
const typedSub  = $("#typewriter-sub");
const foreverEl = $(".forever-line");
const promises  = document.querySelectorAll(".promise");
const letterLines = document.querySelectorAll(".letter-line");
const endingLines = document.querySelectorAll(".ending p");

function typeText(el, text, charMs) {
  return new Promise((resolve) => {
    el.textContent = "";
    let i = 0;
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    el.appendChild(cursor);
    cursor.style.marginLeft = "4px";

    const step = () => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        el.appendChild(cursor);
        i++;
        setTimeout(step, charMs + (Math.random() * 30 | 0));
      } else {
        cursor.remove();
        resolve();
      }
    };
    step();
  });
}

async function runCelebrationSequence() {
  // big heart throbs for a moment, then typewriter
  await wait(CONFIG.delays.typewriterGap);
  await typeText(typedMain, CONFIG.typewriterMain, CONFIG.delays.typeCharMs);
  await wait(350);
  await typeText(typedSub, CONFIG.typewriterSub, CONFIG.delays.typeCharMsSub);

  // "Forever & Always"
  await wait(500);
  foreverEl.classList.add("show");

  // promises appear one after another
  await wait(600);
  for (const p of promises) {
    p.classList.add("show");
    await wait(650);
  }

  // reveal letter paragraphs while user scrolls
  revealOnScroll(letterLines, 150);
  revealOnScroll(endingLines, 150);
}

/* IntersectionObserver-based reveal for letter + ending */
function revealOnScroll(els, offset) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("show");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: `0px 0px -${offset}px 0px`, threshold: 0.15 }
  );
  els.forEach((el) => io.observe(el));
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ============================================================
   F. COUNTDOWN  — "Since I Fell For You"
   ============================================================ */
const cdDays = $("#cd-days"), cdHours = $("#cd-hours"),
      cdMins = $("#cd-minutes"), cdSecs = $("#cd-seconds");

function pad(n) { return String(n).padStart(2, "0"); }

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, now - CONFIG.fellForYou.getTime());
  const secs = Math.floor(diff / 1000);

  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  cdDays.textContent = d;
  cdHours.textContent = pad(h);
  cdMins.textContent = pad(m);
  cdSecs.textContent = pad(s);
}

function startCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ============================================================
   G. MUSIC — generated sweet instrumental (WebAudio, no file)
       OPTIONAL: place your own mp3 at assets/music/ and the
       <audio> tag will use it instead automatically.
   ============================================================ */
let audioCtx = null;

function ensureMusic() {
  // If user dropped a real file in assets/music/, <audio> handles it.
  if (music.querySelector("source") && music.currentSrc) return true;
  return buildSynthTune();
}

function buildSynthTune() {
  // Already built — just resume if needed.
  if (audioCtx && music.synthLoop) {
    if (audioCtx.state === "suspended") audioCtx.resume();
    return true;
  }

  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    audioCtx = new AC();
  }

  const ctx = audioCtx;
  const master = ctx.createGain();
  master.gain.value = 0.16;
  master.connect(ctx.destination);

  const chords = [
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [196.0,  246.94, 293.66, 349.23], // G
    [174.61, 220.0, 261.63, 310.35], // F7-ish
    [164.81, 207.65, 261.63, 329.63], // Em7
  ];

  let beat = 0;

  function scheduleNote(freq, start, dur, gainVal, type = "triangle") {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gainVal, start + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  function loop() {
    const now = ctx.currentTime;
    if (!music.isPlayingFlag) { return; }

    // gentle arpeggio melody over the chord
    const chord = chords[beat % chords.length];
    const arp = [0, 1, 3, 2, 3, 1, 0, 2];
    for (let i = 0; i < 8; i++) {
      const t = now + i * 0.3;
      scheduleNote(chord[arp[i]] * 2, t, 0.28, 0.12, "sine");
    }
    // soft bass
    scheduleNote(chord[0] / 2, now, 2.2, 0.10, "sine");
    // sparkle high octave on beat 0 and 4
    scheduleNote(chord[2] * 4, now, 0.5, 0.05, "sine");
    scheduleNote(chord[2] * 4 + 8, now + 1.2, 0.5, 0.05, "sine");

    beat++;
    const delay = 2400; // loop every 2.4s, matches arpeggio
    setTimeout(loop, delay - (ctx.currentTime - now) * 1000);
  }

  // loop scheduling with wall-clock to stay in sync after resume
  music.isPlayingFlag = false;  // not playing yet, waiting for user click
  music.synthLoop = loop;
  return true;
}

function toggleMusic() {
  // try real audio element first
  const hasSource = music.querySelector("source");

  if (hasSource && music.currentSrc) {
    if (music.paused) {
      music.play().catch(() => {});
      musicBtn.classList.add("spinning");
    } else {
      music.pause();
      musicBtn.classList.remove("spinning");
    }
    return;
  }

  // synth route
  if (!ensureMusic()) { musicBtn.classList.toggle("spinning"); return; }

  if (music.isPlayingFlag) {
    // currently playing → stop
    music.isPlayingFlag = false;
    musicBtn.classList.remove("spinning");
  } else {
    // currently stopped → play
    music.isPlayingFlag = true;
    musicBtn.classList.add("spinning");
    music.synthLoop();
  }
}

musicBtn.addEventListener("click", toggleMusic);

/* ============================================================
   H. MOUSE HEART TRAIL
   ============================================================ */
const trailHearts = [];

function addTrailHeart(x, y) {
  if (trailHearts.length > 26) trailHearts.shift();
  trailHearts.push({
    x: x + (Math.random() - 0.5) * 6,
    y: y + (Math.random() - 0.5) * 6,
    size: 6 + Math.random() * 8,
    alpha: 1,
    color: Math.random() > 0.5 ? "#ff9ec0" : "#c6a4ff",
  });
}

window.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return; // only real cursors
  if (Math.random() < 0.55) addTrailHeart(e.clientX - 8, e.clientY - 8);
});

// Trail hearts are rendered inside renderFx() for clean single-loop draw.
/* ============================================================
   I. SURPRISE FLOATING TEXTS (every 10 seconds)
   ============================================================ */
function showSurprise(text) {
  const el = document.createElement("div");
  el.className = "surprise";
  el.textContent = text;
  el.style.left = (12 + Math.random() * (W - 140)) + "px";
  el.style.top = (30 + Math.random() * (H * 0.55)) + "px";
  surpriseLay.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

function startSurprises() {
  let i = 0;
  let timer = setInterval(() => {
    showSurprise(CONFIG.surprises[i % CONFIG.surprises.length]);
    i++;
  }, CONFIG.surpriseIntervalMs);
  showSurprise(CONFIG.surprises[0]); // one right away
}

/* ============================================================
   J. GRAND FINALE — "I LOVE YOU ❤️" love flood after the
   celebration (no popup question in between)
   ============================================================ */
function finale() {
  loveFlood.hidden = false;
  loveFlood.classList.add("show");

  // heart rain + confetti + fireworks bursts + happy fires
  heartRain(220);
  spawnConfetti(200);
  const fx = setInterval(() => {
    firework(Math.random() * W, Math.random() * H * 0.6);
  }, 700);
  setTimeout(() => clearInterval(fx), 9000);

  celebrate.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 200);

  // a big burst right at the center after a moment
  setTimeout(() => heartBurst(W / 2, H / 2, 40), 600);
  setTimeout(() => spawnConfetti(120), 1200);
  setTimeout(() => heartRain(120), 2500);
}

/* ============================================================
   K. BOOT — fade in everything + first heart pop
   Runs on DOMContentLoaded (NOT window.load) so slow/external
   resources (like fonts) can never block the page from working.
   ============================================================ */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init(); // DOM already parsed
}

function init() {
  // start render loops
  requestAnimationFrame(renderBgHearts);
  requestAnimationFrame(renderFx);
  requestAnimationFrame(animateYesMagnet);

  // pre-fill background hearts
  for (let i = 0; i < 20; i++) spawnBgHeart(true);

  // Staged entrance — no pop-up, just a soft cute reveal:
  //   1) tiny heart pop           2) teddy bears bounce in
  //   3) speech bubble pops       4) card content fades in
  const heartPop = $("#heart-pop");
  heartPop.classList.add("popping");
  setTimeout(() => heartPop.classList.remove("popping"), 1500);

  const illustration = $(".illustration");
  const bubble = $(".bubble");

  setTimeout(() => {
    mainCard.classList.add("visible");
  }, CONFIG.delays.cardFaceIn);

  setTimeout(() => illustration.classList.add("show"), 750);
  setTimeout(() => bubble.classList.add("show"), 1200);
}

/* Native show() for the celebrate section */
if (!Element.prototype.show) {
  Element.prototype.show = function () { this.hidden = false; };
  Element.prototype.hide = function () { this.hidden = true; };
}