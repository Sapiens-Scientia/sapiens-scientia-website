/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-expressions, @typescript-eslint/no-unused-vars */
// @ts-nocheck
// Integrated Big Bang Universe runtime. Ported mechanically from public/standalone/big-bang-universe/index.html.

export function mountBigBangUniverse(root, options = {}) {
  let disposed = false;
  let animationFrameId = 0;
  let resizeObserver = null;
  const abort = new AbortController();
  const listen = (target, type, listener, optionsArg) => {
    target.addEventListener(type, listener, { ...(optionsArg || {}), signal: abort.signal });
  };

  const YR = 3.1557e7; // seconds in a year
  const T_MIN = 1e-43;                 // Planck time
  const T_MAX = 13.8e9 * YR;           // ~4.355e17 s (present)
  const L0 = Math.log10(T_MIN);
  const L1 = Math.log10(T_MAX);
  const LR = L1 - L0;
  const BASE_DURATION = 48;            // seconds for currentP 0 -> 1 at 1x
  const TAU = Math.PI * 2;
  const siteIntroMode = Boolean(options.siteIntroMode);
  const embeddedMode = Boolean(options.embeddedMode);

  // time (s) <-> progress (0..1), logarithmic
  const timeToP = (t) => (Math.log10(t) - L0) / LR;
  const pToTime = (p) => Math.pow(10, L0 + p * LR);
  const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;

  // Deterministic RNG so starfields/galaxies are stable between frames & resizes
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---- Milestones ---------------------------------------------------------
  // `fill` (optional) overrides the color used in the funnel gradient so the
  // wash can be art-directed without changing node/card accent colors.
  // `color` must read on both the dark cosmos and a white page; `fill`
  // (optional) overrides the hue used inside the funnel gradient.
  const MS = [
    { name: "Planck epoch",            t: 1e-43,       side: "L", color: "#a9bce8", fill: "#f2f7ff", desc: "Physics as we know it begins." },
    { name: "Cosmic inflation",        t: 1e-35,       side: "R", color: "#8fa9f5", fill: "#b9cdff", desc: "Space expands faster than light, smoothing the cosmos." },
    { name: "Quark–gluon plasma",      t: 1e-9,        side: "L", color: "#6f95f0", fill: "#8fb3ff", desc: "A dense soup of fundamental particles." },
    { name: "Protons & neutrons form", t: 1e-6,        side: "R", color: "#9678f0", fill: "#a98cff", desc: "Quarks bind into the first hadrons." },
    { name: "Neutrinos decouple",      t: 1,           side: "L", color: "#46bff0", fill: "#7fd4ff", desc: "Electrons and positrons annihilate." },
    { name: "Nucleosynthesis",         t: 180,         side: "R", color: "#f5a53a", fill: "#ffb347", desc: "First light nuclei form: hydrogen, helium, lithium." },
    { name: "Matter–radiation equality", t: 5e4 * YR,  side: "L", color: "#eeb64e", fill: "#ffd27f", desc: "Matter's density overtakes radiation." },
    { name: "Recombination (CMB)",     t: 3.8e5 * YR,  side: "R", color: "#f57a4a", fill: "#ff8a5c", desc: "Atoms form and light escapes — the cosmic microwave background." },
    { name: "The Dark Ages",           t: 1e7 * YR,    side: "L", color: "#6a6a92", fill: "#23233f", desc: "No stars yet — only cooling neutral gas." },
    { name: "First stars",             t: 2e8 * YR,    side: "R", color: "#e3c25d", fill: "#8a86b8", desc: "Cosmic dawn: the first stars ignite." },
    { name: "Reionization & galaxies", t: 7e8 * YR,    side: "L", color: "#64b4ef", fill: "#9ad0ff", desc: "Starlight reionizes gas; the first galaxies grow." },
    { name: "Peak galaxy formation",   t: 3.5e9 * YR,  side: "R", color: "#b184f5", fill: "#c9a0ff", desc: "The busiest era of star and galaxy building." },
    { name: "Our Solar System",        t: 9.2e9 * YR,  side: "L", color: "#eebc45", fill: "#ffd36b", desc: "The Sun and Earth form, 4.6 billion years ago." },
    { name: "Dark energy takes over",  t: 9.8e9 * YR,  side: "R", color: "#7f6bff", desc: "Cosmic expansion begins to accelerate." },
    { name: "Today",                   t: 13.8e9 * YR, side: "L", color: "#3ecfae", fill: "#57d9b8", desc: "13.8 billion years after the Big Bang." },
  ];
  MS.forEach(m => { m.p = clamp01(timeToP(m.t)); });
  const RECOMB = MS[7]; // CMB flash trigger

  // Vertical placement (vy) blends true log-time progress with even milestone
  // spacing, so the crowded late universe isn't squished into the bottom sliver.
  // The TIME axis (age readout + physics) stays purely logarithmic; only the
  // vertical position on screen is warped.
  const BETA = 0.2; // 1 = pure log, 0 = evenly spaced milestones
  MS.forEach((m, i) => { m.vy = BETA * m.p + (1 - BETA) * (i / (MS.length - 1)); });
  if (MS[0]) MS[0].vy = 0.001; // first scrubber unit past 0, so the first card waits for motion

  // Continuous, invertible piecewise-linear map between log-progress p and
  // display position vy, anchored on the milestones (both are monotonic 0..1).
  function warp(p) {
    if (p <= 0) return 0; if (p >= 1) return 1;
    for (let i = 0; i < MS.length - 1; i++)
      if (p >= MS[i].p && p <= MS[i + 1].p) {
        const f = (p - MS[i].p) / ((MS[i + 1].p - MS[i].p) || 1);
        return MS[i].vy + (MS[i + 1].vy - MS[i].vy) * f;
      }
    return 1;
  }
  function invWarp(vy) {
    if (vy <= 0) return 0; if (vy >= 1) return 1;
    for (let i = 0; i < MS.length - 1; i++)
      if (vy >= MS[i].vy && vy <= MS[i + 1].vy) {
        const f = (vy - MS[i].vy) / ((MS[i + 1].vy - MS[i].vy) || 1);
        return MS[i].p + (MS[i + 1].p - MS[i].p) * f;
      }
    return 1;
  }

  // Era captions rendered faintly inside the funnel
  const CAPTIONS = [
    ["INFLATION", 0.125],
    ["PRIMORDIAL PLASMA", 0.335],
    ["FIRST NUCLEI", 0.475],
    ["THE DARK AGES", 0.615],
    ["COSMIC DAWN", 0.735],
    ["AGE OF GALAXIES", 0.835],
    ["ACCELERATING EXPANSION", 0.915],
  ];

  // ---- Composition keyframes (fractions r,m,de by cosmic time) ------------
  const COMP = [
    { t: 1e-40,       r: 1.000, m: 0.000, de: 0.000 },
    { t: 1,           r: 0.960, m: 0.040, de: 0.000 },
    { t: 5e4 * YR,    r: 0.500, m: 0.500, de: 0.000 },
    { t: 3.8e5 * YR,  r: 0.230, m: 0.769, de: 0.001 },
    { t: 2e8 * YR,    r: 0.060, m: 0.920, de: 0.020 },
    { t: 3.5e9 * YR,  r: 0.010, m: 0.700, de: 0.290 },
    { t: 9.8e9 * YR,  r: 0.002, m: 0.500, de: 0.498 },
    { t: 13.8e9 * YR, r: 0.000, m: 0.315, de: 0.685 },
  ];
  // ---- Temperature keyframes (kelvin by cosmic time, log-log) -------------
  const TEMP = [
    [1e-43, 1.4e32],   // Planck temperature
    [1e-32, 1e27],     // reheating after inflation
    [1e-6, 1.5e12],    // quark–hadron transition
    [1, 1e10],         // neutrino decoupling
    [180, 1e9],        // nucleosynthesis
    [5e4 * YR, 9400],  // matter–radiation equality
    [3.8e5 * YR, 3000],// recombination
    [2e8 * YR, 60],    // cosmic dawn
    [1e9 * YR, 19],    // reionization era
    [13.8e9 * YR, 2.725], // CMB today
  ];
  function tempAt(t) {
    if (t <= TEMP[0][0]) return TEMP[0][1];
    if (t >= TEMP[TEMP.length - 1][0]) return TEMP[TEMP.length - 1][1];
    for (let i = 0; i < TEMP.length - 1; i++) {
      const [t0, k0] = TEMP[i], [t1, k1] = TEMP[i + 1];
      if (t >= t0 && t <= t1) {
        const f = (Math.log10(t) - Math.log10(t0)) / (Math.log10(t1) - Math.log10(t0));
        return Math.pow(10, Math.log10(k0) + (Math.log10(k1) - Math.log10(k0)) * f);
      }
    }
    return TEMP[TEMP.length - 1][1];
  }
  function formatTemp(k) {
    if (k >= 1e5) {
      const e = Math.floor(Math.log10(k));
      const m = k / Math.pow(10, e);
      return `${m > 1.15 ? Math.round(m) + "×" : ""}10${sup(e)} K`;
    }
    if (k >= 1000) return `${commas(k)} K`;
    return `${k < 10 ? k.toFixed(1) : Math.round(k)} K`;
  }

  function compAt(t) {
    if (t <= COMP[0].t) return COMP[0];
    if (t >= COMP[COMP.length - 1].t) return COMP[COMP.length - 1];
    for (let i = 0; i < COMP.length - 1; i++) {
      const a = COMP[i], b = COMP[i + 1];
      if (t >= a.t && t <= b.t) {
        const f = (Math.log10(t) - Math.log10(a.t)) / (Math.log10(b.t) - Math.log10(a.t));
        return { r: a.r + (b.r - a.r) * f, m: a.m + (b.m - a.m) * f, de: a.de + (b.de - a.de) * f };
      }
    }
    return COMP[COMP.length - 1];
  }

  // ---- Age formatting -----------------------------------------------------
  const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const sup = (n) => String(n).split("").map(c => SUP[c] || c).join("");
  function commas(n) { return Math.round(n).toLocaleString("en-US"); }
  function formatAge(t) {
    if (t < 1e-3) {
      const e = Math.floor(Math.log10(t));
      const m = t / Math.pow(10, e);
      const mant = m > 1.15 ? Math.round(m) + "×" : "";
      return `${mant}10${sup(e)} s`;
    }
    if (t < 1)       return `${t.toPrecision(2)} s`;
    if (t < 90)      return `${t < 10 ? t.toFixed(1) : Math.round(t)} s`;
    if (t < 5400)    return `${(t / 60).toFixed(1)} min`;
    if (t < 129600)  return `${(t / 3600).toFixed(1)} hours`;
    if (t < 3 * YR)  return `${(t / 86400).toFixed(1)} days`;
    const y = t / YR;
    if (y < 1e3)  return `${commas(y)} years`;
    if (y < 1e6)  return `${(y / 1e3).toFixed(y < 1e4 ? 1 : 0)} thousand yr`;
    if (y < 1e9)  return `${(y / 1e6).toFixed(y < 1e7 ? 1 : 0)} million yr`;
    return `${(y / 1e9).toFixed(2)} billion yr`;
  }

  // ---- DOM ----------------------------------------------------------------
  const canvas = root.querySelector("#c");
  const ctx = canvas.getContext("2d");
  const cardsRoot = root.querySelector("#cards");
  const scrub = root.querySelector("#scrub");
  const scrubwrap = root.querySelector("#scrubwrap");
  const ageEl = root.querySelector("#age");
  const tempEl = root.querySelector("#temp");
  const playBtn = root.querySelector("#playBtn");
  const restartBtn = root.querySelector("#restartBtn");
  const skipAnimationBtn = root.querySelector("#skipAnimationBtn");
  const segRad = root.querySelector("#seg-rad"), segMat = root.querySelector("#seg-mat"), segDe = root.querySelector("#seg-de");
  const vRad = root.querySelector("#v-rad"), vMat = root.querySelector("#v-mat"), vDe = root.querySelector("#v-de");
  const eraEl = root.querySelector("#comp-era");
  const controlsEl = root.querySelector("#controls");
  const compEl = root.querySelector("#composition");
  root.classList.toggle("site-intro", siteIntroMode);
  root.classList.toggle("embedded", embeddedMode);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const observableUniverseImage = new Image();
  observableUniverseImage.decoding = "async";
  observableUniverseImage.src = "/images/observable-universe-logarithmic-illustration.png";
  listen(observableUniverseImage, "load", () => { if (!disposed) animationFrameId = requestAnimationFrame((now) => draw(currentP, now * 0.001)); });

  const SVG_PLAY = '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  const SVG_PAUSE = '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>';

  // Milestone tick dots on the scrubber (thumb is ~13px wide)
  MS.forEach(m => {
    const tk = document.createElement("i");
    tk.className = "tick";
    tk.style.background = m.color;
    tk.style.left = `calc(6.5px + (100% - 13px) * ${m.vy.toFixed(4)})`;
    scrubwrap.appendChild(tk);
  });

  // Build cards (clickable: travel to that moment; hover: highlight node)
  MS.forEach((m) => {
    const el = document.createElement("div");
    el.className = "card";
    el.style.setProperty("--mcol", m.color);
    el.innerHTML =
      `<div class="ct"><i></i>${m.name}</div>` +
      `<div class="ctime">${formatAge(m.t)}</div>` +
      `<div class="cdesc">${m.desc}</div>`;
    listen(el, "click", () => travelTo(m.vy));
    listen(el, "mouseenter", () => { m.hover = true; });
    listen(el, "mouseleave", () => { m.hover = false; });
    cardsRoot.appendChild(el);
    m.el = el;
  });

  // ---- Geometry -----------------------------------------------------------
  let W = 0, H = 0, dpr = 1;
  let centerX = 0, topPad = 0, usableH = 0, maxHW = 0, cardW = 214;

  // Schematic expansion profile: a narrow Planck neck, one inflationary flare,
  // a long decelerating expansion, then a subtler late dark-energy acceleration.
  // Keep this analytic rather than anchor-based so the silhouette does not pick
  // up accidental shelves and repeated inflection points.
  const smoothstep = (edge0, edge1, value) => {
    const u = clamp01((value - edge0) / ((edge1 - edge0) || 1));
    return u * u * (3 - 2 * u);
  };
  function expansionProfile(p) {
    const v = clamp01(p);
    const neck = 0.006;
    const inflation = 0.31 * smoothstep(0.035, 0.17, v);
    const postInflation = 0.50 * Math.pow(clamp01((v - 0.13) / 0.87), 0.42);
    const darkEnergy = 0.184 * Math.pow(smoothstep(0.78, 1.00, v), 2.1);
    return Math.min(1, neck + inflation + postInflation + darkEnergy);
  }
  function funnelHW(p) {
    return maxHW * expansionProfile(p);
  }
  const pToY = (p) => topPad + p * usableH;
  // Downward sag of the expanding "now" front (and the bottom rim)
  const sagAt = (hw) => Math.min(hw * 0.06, 26);
  const todayRimRY = () => Math.max(24, Math.min(maxHW * 0.06, 34));

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = root.getBoundingClientRect();
    W = Math.max(1, bounds.width);
    H = Math.max(1, bounds.height);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    centerX = W / 2;
    const mobile = W < 720;
    compEl.style.top = (mobile ? 14 : 18) + "px";
    topPad = embeddedMode ? (mobile ? 60 : 54) : (mobile ? 154 : 128);
    // Leave room below the present-day rim for its labels. In site-intro mode
    // the controls are hidden, so reserve explicit space for the click prompt.
    const controlsH = siteIntroMode ? 0 : controlsEl.offsetHeight;
    const bottomReserve = siteIntroMode ? (mobile ? 86 : 78) : controlsH + 14 + 46;
    usableH = H - topPad - bottomReserve;
    maxHW = Math.min(W * 0.44, centerX - (mobile ? 24 : 244));
    cardW = mobile ? 150 : 214;

    computeCardLayout();
  }

  function computeCardLayout() {
    // lowest allowed card BOTTOM edge sits above the controls or intro gutter
    const bottomInset = siteIntroMode ? 34 : controlsEl.offsetHeight + 34;
    const bottomLimit = H - bottomInset;
    const pad = 12;              // vertical gap between adjacent cards
    // Set widths first so wrapped heights measure correctly, then read heights.
    MS.forEach(m => { m.el.style.width = cardW + "px"; m.ch = m.el.offsetHeight || 70; });

    const compB = compEl.offsetTop + compEl.offsetHeight;
    ["L", "R"].forEach(side => {
      // Left column clears the title (desktop); right clears the composition panel.
      const minY = side === "L" ? (embeddedMode ? 20 : (W < 720 ? 16 : 96)) : compB + 12;
      const list = MS.filter(m => m.side === side).sort((a, b) => a.vy - b.vy);
      const n = list.length;
      // forward pass: node-centred, then pushed down to clear the previous card
      for (let i = 0; i < n; i++) {
        let y = Math.max(pToY(list[i].vy) - list[i].ch / 2, minY);
        if (i > 0) y = Math.max(y, list[i - 1].cardY + list[i - 1].ch + pad);
        list[i].cardY = y;
      }
      // backward pass: keep the last card's bottom on-screen, cascade upward
      if (n) list[n - 1].cardY = Math.min(list[n - 1].cardY, bottomLimit - list[n - 1].ch);
      for (let i = n - 2; i >= 0; i--)
        list[i].cardY = Math.min(list[i].cardY, list[i + 1].cardY - list[i].ch - pad);
      for (let i = 0; i < n; i++)
        list[i].cardY = Math.max(list[i].cardY, minY);

      list.forEach(m => {
        m.cardX = side === "L" ? 22 : W - 22 - cardW;
        m.el.style.left = m.cardX + "px";
        m.el.style.top = m.cardY + "px";
        m.anchorX = side === "L" ? m.cardX + cardW : m.cardX;
      });
    });
  }

  // ---- The Void (outside the universe) -------------------------------------
  // A perfectly flat, featureless field — dark blue-black or blank white.
  // Nothing exists out there; the universe is the only object on the page.
  const PALETTES = {
    dark: {
      bg: "#000000",
      flash: "235,242,255", flashA: 0.6,
      ring: "#cfe0ff",
      spike: "255,255,255", singCore: "255,255,255", singComp: "lighter", haloLift: 60,
      edgeFaint: "rgba(150,180,255,0.10)", edgeBright: "rgba(175,198,255,0.55)",
      edgeShadow: "rgba(150,180,255,0.7)", rimPhoton: "rgba(255,255,255,0.5)",
      partComp: "lighter",
      todayRim: "102,224,192", todayRimHi: "160,255,225",
      funnelShadow: null,
      pillBg: "rgba(10,13,32,0.85)", pillBrd: "rgba(160,180,255,0.45)", pillInk: "#dfe7ff",
      captionInk: "222,232,255",
      inviteInk: "205,218,255",
    },
    light: {
      bg: "#ffffff",
      flash: "70,60,190", flashA: 0.45,
      ring: "#4d5fc9",
      spike: "90,100,220", singCore: "80,90,215", singComp: "source-over", haloLift: -50,
      edgeFaint: "rgba(70,85,170,0.12)", edgeBright: "rgba(70,90,180,0.6)",
      edgeShadow: "rgba(90,110,220,0.5)", rimPhoton: "rgba(60,75,180,0.55)",
      partComp: "source-over",
      todayRim: "35,170,140", todayRimHi: "46,207,174",
      funnelShadow: "rgba(50,60,140,0.35)",
      pillBg: "rgba(255,255,255,0.94)", pillBrd: "rgba(70,85,160,0.4)", pillInk: "#1c2340",
      captionInk: "222,232,255",
      inviteInk: "70,82,140",
    },
  };
  let PAL = PALETTES.dark;

  // ---- Galaxy & star sprites (structure inside the late funnel) ------------
  function makeSprite(kind, seed) {
    const s = document.createElement("canvas");
    s.width = s.height = 44;
    const g = s.getContext("2d");
    const rng = mulberry32(seed);
    g.translate(22, 22);
    if (kind === "spiral") {
      const core = g.createRadialGradient(0, 0, 0, 0, 0, 6);
      core.addColorStop(0, "rgba(255,250,235,0.95)");
      core.addColorStop(1, "rgba(255,240,210,0)");
      g.fillStyle = core; g.fillRect(-8, -8, 16, 16);
      for (let arm = 0; arm < 2; arm++) {
        for (let k = 0; k < 34; k++) {
          const t = k / 34;
          const r = 2.5 + t * 16;
          const a = arm * Math.PI + t * 2.7 + (rng() - 0.5) * 0.3;
          g.globalAlpha = (1 - t) * 0.75;
          g.fillStyle = t < 0.35 ? "#fff6e8" : (rng() < 0.5 ? "#cfe0ff" : "#ffd9b0");
          g.fillRect(Math.cos(a) * r - 0.7, Math.sin(a) * r * 0.62 - 0.7, 1.4, 1.4);
        }
      }
    } else if (kind === "ell") {
      const blob = g.createRadialGradient(0, 0, 0, 0, 0, 13);
      blob.addColorStop(0, "rgba(255,244,220,0.9)");
      blob.addColorStop(0.4, "rgba(255,228,190,0.35)");
      blob.addColorStop(1, "rgba(255,220,180,0)");
      g.fillStyle = blob;
      g.save(); g.scale(1, 0.68); g.beginPath(); g.arc(0, 0, 13, 0, TAU); g.fill(); g.restore();
    } else { // irregular cluster
      for (let k = 0; k < 14; k++) {
        const a = rng() * TAU, r = rng() * 9;
        g.globalAlpha = 0.35 + rng() * 0.55;
        g.fillStyle = rng() < 0.6 ? "#e6efff" : "#ffe9c8";
        g.fillRect(Math.cos(a) * r - 0.8, Math.sin(a) * r * 0.8 - 0.8, 1.6, 1.6);
      }
    }
    return s;
  }
  const SPRITES = { spiral: makeSprite("spiral", 7), spiral2: makeSprite("spiral", 19), ell: makeSprite("ell", 3), irr: makeSprite("irr", 11) };

  const gals = [];
  (function buildGalaxies() {
    const rng = mulberry32(77);
    for (let i = 0; i < 130; i++) {
      const early = i < 30; // cosmic dawn: lone stars before galaxies assemble
      const vy = early ? 0.66 + rng() * 0.13 : 0.72 + Math.pow(rng(), 0.8) * 0.28;
      let type;
      if (early || vy < 0.78) type = rng() < 0.72 ? "star" : "irr";
      else { const r = rng(); type = r < 0.4 ? (rng() < 0.5 ? "spiral" : "spiral2") : r < 0.68 ? "ell" : "star"; }
      gals.push({
        vy, type,
        relX: (rng() * 2 - 1) * 0.88,
        dy: (rng() - 0.5) * 14,
        scale: type === "star" ? 0.5 + rng() * 0.7 : 0.45 + rng() * 0.95,
        rot: rng() * TAU,
        rotSp: (rng() - 0.5) * 0.00045,
        tw: 0.5 + rng() * 1.6,
        ph: rng() * TAU,
      });
    }
    gals.sort((a, b) => a.vy - b.vy);
  })();

  // ---- Cinematic state ------------------------------------------------------
  let flashA = 0;      // full-screen bang flash
  let cmbGlow = 0;     // warm recombination glow
  const PREROLL_T = 1.5;
  let preroll = 0;     // seconds of held breath before the bang
  let focusVy = 0, focusA = 0; // glow band lighting up a visited moment
  let singularityHover = false, singularityHoverA = 0;
  function bang() {
    if (reduceMotion) return;
    flashA = 0.85;
  }

  // ---- Funnel gradient (era tinted) ---------------------------------------
  function funnelGradient(y0, y1) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    const span = y1 - y0 || 1;
    g.addColorStop(0, "#ffffff");
    MS.forEach(m => {
      let stop = (pToY(m.vy) - y0) / span;
      stop = clamp01(stop);
      g.addColorStop(stop, m.fill || m.color);
    });
    return g;
  }

  function drawSingularity(x, y, pul, ant, tsec, hover = 0) {
    const lightMode = root.classList.contains("light");
    const safePul = Number.isFinite(pul) ? Math.max(0.01, pul) : 1;
    const hoverA = clamp01(hover);
    const phase = reduceMotion || !Number.isFinite(tsec) ? 0 : tsec;
    const shimmer = reduceMotion ? 0 : Math.sin(phase * 1.7) * 0.5 + 0.5;
    const cool = lightMode ? "66,76,190" : "130,190,255";
    const hot = lightMode ? "36,180,158" : "80,255,214";
    const violet = lightMode ? "120,70,210" : "170,116,255";
    const core = lightMode ? "34,40,112" : "7,9,28";
    const shadow = lightMode ? "32,36,96" : "2,3,14";

    ctx.save();
    ctx.translate(x, y);

    ctx.globalCompositeOperation = lightMode ? "source-over" : "lighter";
    const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 58 * safePul * (1 + hoverA * 0.16));
    halo.addColorStop(0, `rgba(${hot},${0.34 + shimmer * 0.08 + hoverA * 0.14})`);
    halo.addColorStop(0.26, `rgba(${violet},${0.30 + ant * 0.16 + hoverA * 0.12})`);
    halo.addColorStop(0.68, `rgba(${cool},${0.18 + ant * 0.10 + hoverA * 0.10})`);
    halo.addColorStop(1, `rgba(${cool},0)`);
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(0, 0, 58 * safePul * (1 + hoverA * 0.16), 0, TAU); ctx.fill();

    const caustic = ctx.createRadialGradient(0, 0, 0, 0, 0, 29 * safePul);
    caustic.addColorStop(0, `rgba(${hot},${0.44 + shimmer * 0.08 + ant * 0.10 + hoverA * 0.12})`);
    caustic.addColorStop(0.44, `rgba(${violet},${0.24 + ant * 0.08 + hoverA * 0.08})`);
    caustic.addColorStop(1, `rgba(${cool},0)`);
    ctx.fillStyle = caustic;
    ctx.beginPath();
    ctx.ellipse(0, 0, 29 * safePul, 10 * safePul, 0, 0, TAU);
    ctx.fill();

    const verticalCharge = ctx.createRadialGradient(0, 0, 0, 0, 0, 22 * safePul);
    verticalCharge.addColorStop(0, `rgba(${violet},${0.28 + ant * 0.08 + hoverA * 0.10})`);
    verticalCharge.addColorStop(0.54, `rgba(${cool},${0.14 + hoverA * 0.08})`);
    verticalCharge.addColorStop(1, `rgba(${cool},0)`);
    ctx.fillStyle = verticalCharge;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12 * safePul, 23 * safePul, 0, 0, TAU);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
    const lens = ctx.createRadialGradient(0, 0, 1, 0, 0, 16 * safePul);
    lens.addColorStop(0, `rgba(${shadow},0.82)`);
    lens.addColorStop(0.68, `rgba(${shadow},0.74)`);
    lens.addColorStop(1, `rgba(${shadow},0)`);
    ctx.fillStyle = lens;
    ctx.beginPath(); ctx.arc(0, 0, 16 * safePul, 0, TAU); ctx.fill();

    ctx.globalCompositeOperation = lightMode ? "source-over" : "lighter";
    const pinch = ctx.createRadialGradient(0, 0, 0, 0, 0, 16 * safePul);
    pinch.addColorStop(0, `rgba(${hot},${0.24 + shimmer * 0.06 + hoverA * 0.12})`);
    pinch.addColorStop(0.5, `rgba(${violet},${0.14 + hoverA * 0.08})`);
    pinch.addColorStop(1, `rgba(${hot},0)`);
    ctx.fillStyle = pinch;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15 * safePul, 5 * safePul, 0, 0, TAU);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(${core},${lightMode ? 0.46 : 0.72})`;
    ctx.beginPath(); ctx.arc(0, 0, 4.4 * safePul * (1 + hoverA * 0.18), 0, TAU); ctx.fill();
    ctx.restore();
  }

  // ---- Drawing ------------------------------------------------------------
  function draw(currentP, tsec) {
    ctx.clearRect(0, 0, W, H);

    // the void: one flat, featureless color — nothing exists out here
    ctx.fillStyle = PAL.bg;
    ctx.fillRect(0, 0, W, H);

    const frontY = pToY(currentP);
    const hwF = funnelHW(currentP);
    const sag = sagAt(hwF);
    const steps = 320;
    const rightEdge = [];
    const leftEdge = [];
    for (let i = 0; i <= steps; i++) {
      const p = currentP * (i / steps), y = pToY(p), hw = funnelHW(p);
      rightEdge.push({ x: centerX + hw, y });
      leftEdge.push({ x: centerX - hw, y });
    }
    function traceSmoothEdge(points, reverse = false, move = true) {
      if (points.length === 0) return;
      const start = reverse ? points.length - 1 : 0;
      const end = reverse ? 0 : points.length - 1;
      const step = reverse ? -1 : 1;
      const first = points[start];
      move ? ctx.moveTo(first.x, first.y) : ctx.lineTo(first.x, first.y);
      for (let i = start + step; reverse ? i > end : i < end; i += step) {
        const next = points[i + step];
        const midX = (points[i].x + next.x) * 0.5;
        const midY = (points[i].y + next.y) * 0.5;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }
      if (points.length > 1) ctx.lineTo(points[end].x, points[end].y);
    }

    // ---- funnel fill (revealed portion, arced bottom) ----
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, topPad);
    traceSmoothEdge(rightEdge, false, false);
    ctx.quadraticCurveTo(centerX, frontY + sag * 2, centerX - hwF, frontY);
    traceSmoothEdge(leftEdge, true, false);
    ctx.closePath();
    // on the white page, the universe floats — it casts a soft shadow
    if (PAL.funnelShadow) {
      ctx.save();
      ctx.shadowColor = PAL.funnelShadow; ctx.shadowBlur = 48; ctx.shadowOffsetY = 12;
      ctx.fillStyle = "#0b0722";
      ctx.fill();
      ctx.restore();
    }
    ctx.clip();

    // opaque dark interior: the cosmos stays vivid whatever the page color
    const base = ctx.createLinearGradient(0, topPad, 0, pToY(1));
    base.addColorStop(0, "#0b0722"); base.addColorStop(1, "#050313");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    const grad = funnelGradient(topPad, pToY(1));
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // brighten core column
    ctx.globalAlpha = 0.35;
    const core = ctx.createLinearGradient(centerX - maxHW, 0, centerX + maxHW, 0);
    core.addColorStop(0, "rgba(0,0,0,0)");
    core.addColorStop(0.5, "rgba(255,255,255,0.14)");
    core.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = core; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    // inner rim light: the walls of the cosmos catch the light, giving the
    // bell volume (stroke is clipped, so only the inward half shows)
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = "lighter";
    for (const edge of [leftEdge, rightEdge]) {
      ctx.beginPath();
      traceSmoothEdge(edge);
      ctx.lineWidth = 16;
      ctx.strokeStyle = "rgba(150,175,255,0.10)";
      ctx.shadowColor = "rgba(160,185,255,0.5)"; ctx.shadowBlur = 22;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // CMB flash: warm glow blooming from recombination's row
    if (cmbGlow > 0.01) {
      const gy = pToY(RECOMB.vy);
      const g = ctx.createRadialGradient(centerX, gy, 0, centerX, gy, maxHW * 1.1);
      g.addColorStop(0, `rgba(255,160,90,${cmbGlow * 0.5})`);
      g.addColorStop(0.5, `rgba(255,120,60,${cmbGlow * 0.22})`);
      g.addColorStop(1, "rgba(255,100,50,0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }

    // focus glow: the moment you traveled to lights up, then fades
    if (focusA > 0.01) {
      const fy = pToY(focusVy);
      const g = ctx.createLinearGradient(0, fy - 44, 0, fy + 44);
      g.addColorStop(0, "rgba(210,225,255,0)");
      g.addColorStop(0.5, `rgba(210,225,255,${focusA * 0.22})`);
      g.addColorStop(1, "rgba(210,225,255,0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = g;
      ctx.fillRect(0, fy - 44, W, 88);
      ctx.globalCompositeOperation = "source-over";
    }

    // galaxies & first stars bloom inside the late funnel
    ctx.globalCompositeOperation = "lighter";
    for (const g of gals) {
      if (currentP < g.vy - 0.001) continue;
      const fade = Math.min(1, (currentP - g.vy) / 0.025);
      const tw = reduceMotion ? 0.85 : 0.72 + 0.28 * Math.sin(tsec * g.tw + g.ph);
      const x = centerX + g.relX * funnelHW(g.vy);
      const y = pToY(g.vy) + g.dy;
      if (g.type === "star") {
        ctx.globalAlpha = fade * tw * 0.9;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(x, y, 0.8 + g.scale, 0, TAU); ctx.fill();
      } else {
        const spr = SPRITES[g.type];
        const rot = g.rot + (reduceMotion ? 0 : tsec * 1000 * g.rotSp);
        ctx.globalAlpha = fade * tw * 0.8;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(rot); ctx.scale(g.scale, g.scale);
        ctx.drawImage(spr, -22, -22);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    // era captions, readable but still embedded in the cosmic volume
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "700 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    try { ctx.letterSpacing = "4px"; } catch (e) {}
    ctx.shadowColor = "rgba(0,0,0,0.75)";
    ctx.shadowBlur = 10;
    for (const [label, cvy] of CAPTIONS) {
      const reveal = clamp01((currentP - cvy) / 0.03);
      if (reveal <= 0) continue;
      const cw = ctx.measureText(label).width;
      if (funnelHW(cvy) * 2 - 44 < cw) continue;
      ctx.fillStyle = `rgba(${PAL.captionInk},${0.48 * reveal})`;
      ctx.fillText(label, centerX, pToY(cvy));
    }
    ctx.shadowBlur = 0;
    try { ctx.letterSpacing = "0px"; } catch (e) {}
    ctx.restore(); // end funnel clip

    // ---- funnel outline (dual-stroke glow) ----
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (const edge of [leftEdge, rightEdge]) {
      ctx.beginPath();
      traceSmoothEdge(edge);
      ctx.lineWidth = 5; ctx.strokeStyle = PAL.edgeFaint; ctx.stroke();
      ctx.lineWidth = 1.4; ctx.strokeStyle = PAL.edgeBright;
      ctx.shadowColor = PAL.edgeShadow; ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // photons streaming down the rim
      if (!reduceMotion) {
        ctx.setLineDash([3, 42]);
        ctx.lineDashOffset = -tsec * 46;
        ctx.lineWidth = 2.2; ctx.strokeStyle = PAL.rimPhoton;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    ctx.restore();

    // ---- milestone nodes + curved leader lines (revealed) ----
    ctx.save();
    for (const m of MS) {
      if (currentP < m.vy - 0.0005) continue;
      const y = pToY(m.vy);
      const sgn = m.side === "L" ? -1 : 1;
      const nx = centerX + sgn * funnelHW(m.vy);
      const t = clamp01((currentP - m.vy) / 0.02);
      const ax = m.anchorX, ay = m.cardY + (m.ch || 64) / 2;
      // curved leader
      ctx.globalAlpha = (m.hover ? 0.85 : 0.30) * t;
      ctx.strokeStyle = m.color; ctx.lineWidth = m.hover ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(nx, y);
      ctx.bezierCurveTo(nx + (ax - nx) * 0.45, y, ax - (ax - nx) * 0.30, ay, ax, ay);
      ctx.stroke();
      if (m.hover && !reduceMotion) {
        // photons run from the universe out to the card you're reading
        ctx.setLineDash([3, 11]);
        ctx.lineDashOffset = -tsec * 46;
        ctx.globalAlpha = t;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }
      // endpoint dot at the card
      ctx.globalAlpha = 0.55 * t;
      ctx.fillStyle = m.color;
      ctx.beginPath(); ctx.arc(ax, ay, 1.8, 0, TAU); ctx.fill();
      // node on the funnel edge (pulses just after crossing, glows on hover)
      const pulse = 1 + (1 - t) * 0.9 + (m.hover ? 0.5 : 0);
      ctx.globalAlpha = t;
      ctx.fillStyle = m.color;
      ctx.shadowColor = m.color; ctx.shadowBlur = m.hover ? 22 : 14;
      ctx.beginPath(); ctx.arc(nx, y, 3.6 * pulse, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.35 * t;
      ctx.strokeStyle = m.color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(nx, y, 6.5 * pulse, 0, TAU); ctx.stroke();
    }
    ctx.restore();

    // ---- expanding "now" front (arced, glowing) ----
    if (currentP < 0.997) {
      ctx.save();
      ctx.globalCompositeOperation = PAL.partComp;
      const fg = ctx.createLinearGradient(centerX - hwF, 0, centerX + hwF, 0);
      fg.addColorStop(0, `rgba(${PAL.singCore},0)`);
      fg.addColorStop(0.5, `rgba(${PAL.singCore},0.9)`);
      fg.addColorStop(1, `rgba(${PAL.singCore},0)`);
      ctx.beginPath();
      ctx.moveTo(centerX - hwF, frontY);
      ctx.quadraticCurveTo(centerX, frontY + sag * 2, centerX + hwF, frontY);
      ctx.strokeStyle = fg;
      ctx.lineWidth = 7; ctx.globalAlpha = 0.16; ctx.stroke();
      ctx.lineWidth = 2.2; ctx.globalAlpha = 1;
      ctx.shadowColor = PAL.ring; ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();
    }

    // ---- "today" rim: the face of the observable universe ----
    if (currentP > 0.96) {
      // once parked at today, the rim keeps breathing — expansion never stops
      const pulse = Number.isFinite(tsec) ? Math.sin(tsec * 1.1) : 0;
      const breathe = (currentP >= 1 && !reduceMotion) ? 0.8 + 0.2 * pulse : 1;
      const a = Number.isFinite(currentP) ? clamp01((currentP - 0.96) / 0.04) * breathe : 0;
      const ry = todayRimRY();
      const yb = pToY(1);
      ctx.save();
      ctx.globalCompositeOperation = PAL.partComp;
      if (observableUniverseImage.complete && observableUniverseImage.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath(); ctx.ellipse(centerX, yb, maxHW, ry, 0, 0, TAU); ctx.clip();
        ctx.translate(centerX, yb);
        ctx.rotate(-0.12);
        ctx.globalAlpha = a * (root.classList.contains("light") ? 0.64 : 0.78);
        ctx.drawImage(observableUniverseImage, -maxHW, -maxHW, maxHW * 2, maxHW * 2);
        ctx.restore();
        const veil = ctx.createRadialGradient(centerX, yb, 0, centerX, yb, maxHW);
        veil.addColorStop(0, `rgba(${PAL.todayRimHi},0.16)`);
        veil.addColorStop(0.48, `rgba(${PAL.todayRim},0.06)`);
        veil.addColorStop(1, `rgba(${PAL.todayRim},0)`);
        ctx.globalAlpha = a * 0.52;
        ctx.fillStyle = veil;
        ctx.beginPath(); ctx.ellipse(centerX, yb, maxHW, ry, 0, 0, TAU); ctx.fill();
      } else {
        ctx.globalAlpha = a * 0.10;
        const fill = ctx.createRadialGradient(centerX, yb, 0, centerX, yb, maxHW);
        fill.addColorStop(0, `rgba(${PAL.todayRimHi},0.22)`);
        fill.addColorStop(0.62, `rgba(${PAL.todayRim},0.10)`);
        fill.addColorStop(1, `rgba(${PAL.todayRim},0)`);
        ctx.fillStyle = fill;
        ctx.beginPath(); ctx.ellipse(centerX, yb, maxHW, ry, 0, 0, TAU); ctx.fill();
      }
      const rim = ctx.createLinearGradient(centerX - maxHW, 0, centerX + maxHW, 0);
      rim.addColorStop(0, `rgba(${PAL.todayRim},0)`);
      rim.addColorStop(0.16, `rgba(${PAL.todayRim},${a * 0.72})`);
      rim.addColorStop(0.5, `rgba(${PAL.todayRimHi},${a})`);
      rim.addColorStop(0.84, `rgba(${PAL.todayRim},${a * 0.72})`);
      rim.addColorStop(1, `rgba(${PAL.todayRim},0)`);
      ctx.strokeStyle = rim;
      ctx.shadowColor = `rgb(${PAL.todayRim})`; ctx.shadowBlur = 16;
      ctx.globalAlpha = a;
      ctx.lineWidth = 3.8;
      ctx.beginPath(); ctx.ellipse(centerX, yb, maxHW, ry, 0, 0, TAU); ctx.stroke();
      ctx.shadowBlur = 0;
      // the payoff: what this rim actually is
      if (currentP >= 0.995) {
        const la = clamp01((currentP - 0.995) / 0.005) * a;
        ctx.font = "700 10.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        try { ctx.letterSpacing = "3px"; } catch (err) {}
        const label = "PRESENT OBSERVABLE UNIVERSE";
        if (ctx.measureText(label).width < maxHW * 2 - 40) {
          ctx.globalAlpha = la * 0.88;
          ctx.fillStyle = `rgb(${PAL.todayRimHi})`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.shadowBlur = 0;
          ctx.fillText(label, centerX, yb - 2);
        }
        if (siteIntroMode) {
          const prompt = "ENTER OBSERVABLE UNIVERSE";
          if (ctx.measureText(prompt).width < maxHW * 2 - 40) {
            ctx.globalAlpha = la * 0.72;
            ctx.fillStyle = `rgb(${PAL.todayRimHi})`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.shadowBlur = 0;
            ctx.fillText(prompt, centerX, yb + ry + 18);
          }
        }
        try { ctx.letterSpacing = "0px"; } catch (err) {}
      }
      ctx.restore();
    }

    // ---- the singularity: abstract event horizon + gravitational lens ----
    ctx.save();
    const ant = preroll > 0 ? 1 - preroll / PREROLL_T : 0; // pre-bang anticipation
    let pul = reduceMotion ? 1 : 1 + 0.045 * Math.sin(tsec * 1.35);
    if (ant > 0) pul *= 1 + 0.18 * ant * Math.sin(tsec * 8.5); // shiver builds
    pul *= 1 + singularityHoverA * 0.16;
    drawSingularity(centerX, topPad, pul, ant, tsec, singularityHoverA);
    // The void inhales: a collapse ring appears only during ignition.
    if (ant > 0 && !reduceMotion) {
      const r = (1 - ant) * 150 + 6;
      ctx.globalAlpha = ant * 0.55;
      ctx.strokeStyle = PAL.ring; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(centerX, topPad, r, r * 0.55, 0, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // ---- bang flash (an event, not a backdrop — the void stays flat) ----
    if (flashA > 0.005) {
      ctx.fillStyle = `rgba(${PAL.flash},${flashA * PAL.flashA})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ---- Overlay update (cards + composition + readout) ---------------------
  function syncIntroTitle() {
    const introComplete = siteIntroMode && currentP >= 0.999 && preroll <= 0 && targetP === null;
    root.classList.toggle("intro-complete", introComplete);
  }
  function syncStartChrome() {
    root.classList.toggle("prestart", waiting());
    syncIntroTitle();
  }
  function updateOverlay(currentP) {
    syncStartChrome();
    const cardsVisible = !waiting();
    for (const m of MS) {
      const on = cardsVisible && currentP >= m.vy - 0.0005;
      m.el.classList.toggle("show", on);
      const justCrossed = on && (currentP - m.vy) < 0.02;
      m.el.classList.toggle("pop", justCrossed);
    }
    const t = pToTime(invWarp(currentP));
    const c = compAt(t);
    const r = Math.round(c.r * 100), mm = Math.round(c.m * 100);
    const de = Math.max(0, 100 - r - mm);
    segRad.style.width = r + "%"; segMat.style.width = mm + "%"; segDe.style.width = de + "%";
    vRad.textContent = r + "%"; vMat.textContent = mm + "%"; vDe.textContent = de + "%";
    eraEl.textContent = c.de > c.m ? "Dark-energy-dominated era"
                      : c.m > c.r ? "Matter-dominated era" : "Radiation-dominated era";

    ageEl.innerHTML = `<small>Age</small> ${formatAge(t)}`;
    tempEl.innerHTML = `<small>Temp</small> ${formatTemp(tempAt(t))}`;
    if (!scrubbing) scrub.value = Math.round(currentP * 1000);
    scrub.style.setProperty("--fill", (currentP * 100).toFixed(2) + "%");
  }

  // ---- Loop / state -------------------------------------------------------
  let currentP = 0, prevP = 0, playing = true, speed = siteIntroMode ? 2 : 1;
  let scrubbing = false, targetP = null, last = performance.now();

  function crossings(from, to) {
    if (from < RECOMB.vy && to >= RECOMB.vy) {
      cmbGlow = 1; // the universe becomes transparent: flash!
    }
  }

  function travelTo(vy) {
    targetP = clamp01(vy);
    playing = false;
    preroll = 0;
    focusVy = targetP; focusA = 1; // light up the destination
    syncPlay();
  }

  function frame(now) {
    if (disposed) return;
    const raw = Math.max(0, now - last); last = now;
    const dt = Math.min(raw, 60);        // simulation step (pauses gracefully)
    const wdt = Math.min(raw, 500);      // wall-clock step for cinematic decays,
                                         // so cinematic fades continue in throttled tabs
    const tsec = now * 0.001;

    if (preroll > 0) {
      // held breath: the singularity shivers, the void inhales… then bang
      preroll -= wdt / 1000;
      if (preroll <= 0) bang();
    } else if (targetP !== null && !scrubbing) {
      // smooth flight to a clicked milestone
      prevP = currentP;
      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 0.006);
      currentP += (targetP - currentP) * k;
      if (currentP > prevP) crossings(prevP, currentP);
      if (Math.abs(targetP - currentP) < 0.0015) { currentP = targetP; targetP = null; updateHash(); }
    } else if (playing && !scrubbing) {
      prevP = currentP;
      currentP += (dt / 1000) / BASE_DURATION * speed;
      if (currentP >= 1) {
        currentP = 1;
        playing = false; syncPlay();
      }
      crossings(prevP, currentP);
    }

    // decay cinematic state
    flashA = Math.max(0, flashA - wdt * 0.0011);
    cmbGlow = Math.max(0, cmbGlow - wdt * 0.0006);
    if (targetP === null) focusA = Math.max(0, focusA - wdt * 0.0005);
    const hoverTarget = singularityHover ? 1 : 0;
    singularityHoverA += (hoverTarget - singularityHoverA) * (reduceMotion ? 1 : 1 - Math.exp(-wdt * 0.012));

    draw(currentP, tsec);
    updateOverlay(currentP);
    animationFrameId = requestAnimationFrame(frame);
  }

  function resetRun() {
    currentP = 0; prevP = 0; targetP = null; cmbGlow = 0;
    playing = true;
    preroll = reduceMotion ? 0 : PREROLL_T;
    syncPlay();
  }
  function skipToEnd() {
    currentP = 1; prevP = 1; targetP = null; cmbGlow = 0; focusA = 0; flashA = 0;
    playing = false;
    preroll = 0;
    syncPlay();
    syncStartChrome();
  }
  function syncPlay() { playBtn.innerHTML = playing ? SVG_PAUSE : SVG_PLAY; }

  // ---- Events -------------------------------------------------------------
  // True while the page waits for its first start.
  function waiting() { return !playing && currentP === 0 && preroll <= 0 && targetP === null; }
  function ignite() {
    preroll = PREROLL_T;
    playing = true;
    last = performance.now();
    syncPlay();
    syncStartChrome();
  }
  function togglePlay() {
    if (currentP >= 1) { resetRun(); return; }
    if (waiting()) { ignite(); return; }
    targetP = null;
    playing = !playing;
    last = performance.now(); syncPlay();
  }
  listen(playBtn, "click", togglePlay);
  listen(restartBtn, "click", () => { resetRun(); last = performance.now(); });
  if (skipAnimationBtn) listen(skipAnimationBtn, "click", skipToEnd);

  listen(scrub, "input", () => {
    scrubbing = true; targetP = null; preroll = 0;
    const to = (+scrub.value) / 1000;
    if (to > currentP) crossings(currentP, to);
    prevP = currentP = to;
  });
  listen(scrub, "change", () => { scrubbing = false; last = performance.now(); updateHash(); });

  // hover tooltip: read any moment's age straight off the scrubber
  const scrubtip = root.querySelector("#scrubtip");
  listen(scrub, "mousemove", (e) => {
    const rect = scrub.getBoundingClientRect();
    const f = clamp01((e.clientX - rect.left) / rect.width);
    scrubtip.textContent = formatAge(pToTime(invWarp(f)));
    scrubtip.style.left = (e.clientX - rect.left) + "px";
    scrubtip.style.opacity = 1;
  });
  listen(scrub, "mouseleave", () => { scrubtip.style.opacity = 0; });

  listen(root.querySelector("#speeds"), "click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    speed = +b.dataset.s;
    [...e.currentTarget.children].forEach(c => c.classList.toggle("active", c === b));
  });

  // Theme: the void flips between deep space and blank page; the cosmos stays dark.
  const themeBtn = root.querySelector("#themeBtn");
  function setTheme(name, persist) {
    PAL = PALETTES[name] || PALETTES.light;
    root.classList.toggle("light", name === "light");
    themeBtn.textContent = name === "light" ? "☾" : "☀";
    const tc = options.updateThemeColor === false ? null : document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute("content", name === "light" ? "#ffffff" : "#060b18");
    // only an explicit toggle saves the preference — a shared link shouldn't
    if (persist) try { localStorage.setItem("bbu-theme", name); } catch (err) {}
  }
  listen(themeBtn, "click", () => {
    setTheme(root.classList.contains("light") ? "dark" : "light", true);
    updateHash();
  });
  let savedTheme = "dark";
  try { savedTheme = localStorage.getItem("bbu-theme") || "dark"; } catch (err) {}
  setTheme(savedTheme);

  // Deep links: #t=0.62&theme=dark restores a moment in cosmic history.
  function updateHash() {
    if (options.syncHash === false) return;
    const th = root.classList.contains("light") ? "light" : "dark";
    // some browsers refuse replaceState on file:// — deep links are a nicety,
    // never let them break scrubbing
    try { history.replaceState(null, "", `#t=${currentP.toFixed(3)}&theme=${th}`); } catch (err) {}
  }
  function applyHash() {
    if (options.syncHash === false) return;
    const th = location.hash.match(/theme=(light|dark)/);
    if (th) setTheme(th[1]);
    const m = location.hash.match(/t=([\d.]+)/);
    if (m) {
      const v = clamp01(parseFloat(m[1]));
      if (!isNaN(v) && v > 0) {
        preroll = 0; playing = false;
        prevP = currentP = v;
        crossings(0, v);
        syncPlay();
      }
    }
  }

  listen(document, "keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
    if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    else if (e.code === "ArrowRight") {
      targetP = null; preroll = 0; const to = Math.min(1, currentP + 0.015);
      crossings(currentP, to); prevP = currentP = to;
    }
    else if (e.code === "ArrowLeft") { targetP = null; preroll = 0; prevP = currentP = Math.max(0, currentP - 0.015); }
    else if (e.code === "KeyR") { resetRun(); last = performance.now(); }
    else if (e.code === "KeyT") { themeBtn.click(); }
  });

  // Clicking the waiting singularity ignites the whole thing.
  const eventPoint = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };
  const nearSingularity = (e) => {
    const point = eventPoint(e);
    const dx = point.x - centerX, dy = point.y - topPad;
    return dx * dx + dy * dy < 48 * 48;
  };
  const nearTodayRim = (e) => {
    if (!siteIntroMode || currentP < 0.995) return false;
    const rx = Math.max(maxHW, 1);
    const ry = Math.max(todayRimRY(), 30);
    const point = eventPoint(e);
    const dx = (point.x - centerX) / rx;
    const dy = (point.y - pToY(1)) / ry;
    return dx * dx + dy * dy <= 1.12;
  };
  const enterObservableUniverse = () => {
    if (options.onEnterObservableUniverse) {
      options.onEnterObservableUniverse?.();
    } else {
      window.location.href = "/observable-universe";
    }
  };
  listen(canvas, "mousemove", (e) => {
    singularityHover = nearSingularity(e);
    root.dataset.singularityHover = singularityHover ? "true" : "false";
    canvas.style.cursor = (waiting() && singularityHover) ? "pointer"
                        : nearTodayRim(e) ? "pointer"
                        : "default";
  });
  listen(canvas, "mouseout", () => {
    singularityHover = false;
    root.dataset.singularityHover = "false";
    canvas.style.cursor = "default";
  });
  listen(canvas, "click", (e) => {
    if (waiting() && nearSingularity(e)) { ignite(); return; }
    if (nearTodayRim(e)) { enterObservableUniverse(); return; }
  });

  // No visibilitychange time-reset needed: dt is capped at 60ms per frame, so
  // returning to a hidden tab can never produce a time jump — and resetting
  // `last` on visibility churn starves the simulation in throttled tabs.
  listen(window, "resize", layout);
  // The bar's height changes when its content wraps (mobile) or the age text
  // grows — re-flow everything positioned beneath it.
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(root);
    resizeObserver.observe(controlsEl);
  }

  // ---- Go -----------------------------------------------------------------
  layout();
  if (reduceMotion) { playing = false; currentP = 1; }
  else playing = false; // the universe waits for a click on the singularity
  applyHash(); // a shared #t link lands straight on the moment
  syncPlay();
  syncStartChrome();
  animationFrameId = requestAnimationFrame(frame);
  return () => {
    disposed = true;
    abort.abort();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (resizeObserver) resizeObserver.disconnect();
  };
}
