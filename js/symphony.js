// symphony.js — THE PLEISTOCENE SYMPHONY
// Not a sonification of the Pleistocene: a symphony whose COMPOSITION RULES
// are derived from the climate data. Two stages:
//
// ── STAGE A · ANALYSIS: data → grammar ──────────────────────────────────────
//  form        4-band windowed DFT of LR04 at the Milankovitch periods
//              (23/41/100/405 kyr). The movement boundaries are DETECTED:
//              movement II begins where 100-kyr power first rivals 41-kyr
//              power, movement III where it clearly dominates (the measured
//              Mid-Pleistocene Transition); movement IV begins at the
//              detected Termination II. Band activities also decide which
//              LEITMOTIF may sound (23k → wind triplet, 41k → horn cell,
//              100k → bass chorale, 405k → pedal drone): the music contains
//              the spectrum of the data.
//  harmony     ice level (LR04) selects the MODE on a brightness ladder
//              (lydian … phrygian): an ice age sounds different, not merely
//              lower. CO₂ selects the CHORD COLOUR (open fifths → triads →
//              added-note warmth); dust sets the DISSONANCE BUDGET (clusters,
//              tritones allowed); the derivative of an insolation proxy
//              (obliquity+precession) sets the MODULATION PROBABILITY along
//              the circle of fifths.
//  counterpoint rolling correlations choose the TEXTURE: coupled (r≥.45) →
//              parallel thirds/sixths · decoupled (|r|<.3) → imitation ·
//              anti-coupled (r≤−.3) → contrary motion. Couplings are heard.
//  uncertainty archive coverage scores the ORCHESTRATION: where proxies are
//              missing the music turns solo, hollow (open intervals) and wet
//              (long reverb); certainty plays tutti and dry.
//  conductor   Milanković conducts but does not play: precession = rubato,
//              obliquity = dynamics, eccentricity = phrase length; a cheap
//              recurrence measure (autocorrelation at the dominant period)
//              sets timing precision. The proxies are the players; the
//              orbit holds the baton.
//  density     roughness of the record (windowed variability of change) sets
//              how many sections play at once — chamber music in orderly
//              stretches, full orchestra in complex ones. Sections also enter
//              historically: brass only exists where the CO₂ archive exists.
//  events      terminations → timpani-tutti · extreme Greenland minima →
//              GENERAL PAUSE · D-O warming → written-out accelerando ·
//              Toba (~74 ka) → cluster shock · African Humid Period
//              (14.8–5.5 ka) → the woodwinds bloom.
//
// ── STAGE B · COMPOSITION: notes inside the grammar ─────────────────────────
//  Voices are composed as constrained walks: interval choices from the
//  allowed set, contour from the proxy derivative, an elastic anchor pulling
//  toward the data register. ONE voice stays literal — the cantus firmus of
//  the ice in the celli — so the data→sound link remains pointable.
//  The Holocene finale is the only major/lydian passage: the warm, stable
//  chord our civilisation lives inside. The coda lets modern CO₂ leave the
//  pitch space of everything heard.

import {
  SCALES, midiFreq, snapToScale, scaleChord, mulberry32
} from './score.js?v=202607141032';
import { paleoOnGrid, quantile } from './data.js?v=202607141032';

const clamp01 = x => Math.max(0, Math.min(1, x));
const BASE_STEP = 0.12;
const PAUSE_STEPS = 7;
const HOLOCENE = 11.7;

// mode ladder, bright → dark (harmony from ice, not register)
const MODES = [
  { name: 'lydisch', iv: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'dur', iv: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'mixolydisch', iv: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'dorisch', iv: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'moll', iv: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'phrygisch', iv: [0, 1, 3, 5, 7, 8, 10] }
];
const NOTE = ['c', 'cis', 'd', 'dis', 'e', 'f', 'fis', 'g', 'gis', 'a', 'b', 'h'];

// ---------- tiny analysis toolbox -------------------------------------------
function interp1(xs, ys, x) {                       // xs strictly decreasing (ages)
  if (x >= xs[0]) return ys[0];
  if (x <= xs[xs.length - 1]) return ys[ys.length - 1];
  let lo = 0, hi = xs.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; (xs[m] >= x ? lo = m : hi = m); }
  const f = (xs[lo] - x) / Math.max(1e-9, xs[lo] - xs[hi]);
  return ys[lo] + (ys[hi] - ys[lo]) * f;
}

// windowed single-frequency DFT power of series y (uniform step dt) at period P
function bandPower(y, dt, P, win) {
  const n = y.length, W = Math.max(8, Math.round(win / dt)), out = new Array(n).fill(NaN);
  for (let i = 0; i < n; i++) {
    const a0 = Math.max(0, i - (W >> 1)), a1 = Math.min(n - 1, i + (W >> 1));
    let m = 0, c = 0;
    for (let j = a0; j <= a1; j++) if (Number.isFinite(y[j])) { m += y[j]; c++; }
    if (c < W * 0.6) continue;
    m /= c;
    let sa = 0, sb = 0;
    for (let j = a0; j <= a1; j++) {
      if (!Number.isFinite(y[j])) continue;
      const ph = 2 * Math.PI * (j * dt) / P;
      sa += (y[j] - m) * Math.sin(ph); sb += (y[j] - m) * Math.cos(ph);
    }
    out[i] = Math.sqrt(sa * sa + sb * sb) / c;
  }
  return out;
}

function rollCorr(a, b, W) {
  const n = a.length, out = new Array(n).fill(NaN);
  for (let i = 0; i < n; i++) {
    const a0 = Math.max(0, i - (W >> 1)), a1 = Math.min(n - 1, i + (W >> 1));
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, c = 0;
    for (let j = a0; j <= a1; j++) {
      if (!Number.isFinite(a[j]) || !Number.isFinite(b[j])) continue;
      sx += a[j]; sy += b[j]; sxx += a[j] * a[j]; syy += b[j] * b[j]; sxy += a[j] * b[j]; c++;
    }
    if (c < W * 0.5) continue;
    const cov = sxy / c - (sx / c) * (sy / c);
    const vx = sxx / c - (sx / c) ** 2, vy = syy / c - (sy / c) ** 2;
    if (vx > 1e-12 && vy > 1e-12) out[i] = cov / Math.sqrt(vx * vy);
  }
  return out;
}

function autocorrAt(y, lag, W) {
  const n = y.length, out = new Array(n).fill(NaN);
  for (let i = 0; i < n; i++) {
    const a0 = Math.max(0, i - (W >> 1)), a1 = Math.min(n - 1, i + (W >> 1)) - lag;
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, c = 0;
    for (let j = a0; j <= a1; j++) {
      const u = y[j], v = y[j + lag];
      if (!Number.isFinite(u) || !Number.isFinite(v)) continue;
      sx += u; sy += v; sxx += u * u; syy += v * v; sxy += u * v; c++;
    }
    if (c < 12) continue;
    const cov = sxy / c - (sx / c) * (sy / c);
    const vx = sxx / c - (sx / c) ** 2, vy = syy / c - (sy / c) ** 2;
    if (vx > 1e-12 && vy > 1e-12) out[i] = cov / Math.sqrt(vx * vy);
  }
  return out;
}

const normArr = arr => {
  const fin = arr.filter(Number.isFinite);
  if (!fin.length) return arr.map(() => NaN);
  const lo = quantile(fin, 0.02), hi = quantile(fin, 0.98);
  return arr.map(v => Number.isFinite(v) && hi > lo ? clamp01((v - lo) / (hi - lo)) : NaN);
};

// movement scaffold; boundaries b1/b2 are detected, IV starts at detected T-II
export const MOVEMENTS = [
  { key: 'sym1', numeral: 'I', kps: 12, root: 45, dyn: 0.8 },
  { key: 'sym2', numeral: 'II', kps: 8, root: 45, dyn: 0.92 },
  { key: 'sym3', numeral: 'III', kps: 5, root: 38, dyn: 1.0 },
  { key: 'sym4', numeral: 'IV', kps: 1.2, root: 45, dyn: 0.95 }
];

// =============================================================== builder ====
export function buildSymphony(paleoData, opts = {}) {
  const stepSec = BASE_STEP * (opts.tempoMult || 1);
  const rand = mulberry32(opts.seed ?? 20260714);
  const lead = 0.6;

  // ---- STAGE A0: spectral form detection on a uniform analysis grid --------
  const A_DT = 2, A_FROM = 2580;
  const aAges = []; for (let a = A_FROM; a >= 0; a -= A_DT) aAges.push(a);
  const aIce = paleoOnGrid(paleoData.lr04, aAges);
  const P23 = bandPower(aIce, A_DT, 23, 180);
  const P41 = bandPower(aIce, A_DT, 41, 250);
  const P100 = bandPower(aIce, A_DT, 100, 420);
  const P405 = bandPower(aIce, A_DT, 405, 900);
  const nrm = p => { const m = Math.max(...p.filter(Number.isFinite), 1e-9); return p.map(v => Number.isFinite(v) ? v / m : NaN); };
  const B23 = nrm(P23), B41 = nrm(P41), B100 = nrm(P100), B405 = nrm(P405);

  // MPT detection: where does the 100-kyr world take over from the 41-kyr world?
  const detectCross = (thresh, lo, hi, fallback) => {
    let run = 0;
    for (let i = 0; i < aAges.length; i++) {
      const age = aAges[i];
      if (age > hi || age < lo) { run = 0; continue; }
      const ok = Number.isFinite(B100[i]) && Number.isFinite(B41[i]) && B100[i] > thresh * B41[i];
      run = ok ? run + 1 : 0;
      if (run >= 6) return aAges[i - 5];
    }
    return fallback;
  };
  const b1 = detectCross(0.85, 950, 1500, 1250);      // I|II: 100k starts to rival 41k
  const b2 = detectCross(1.35, 550, Math.min(1100, b1 - 80), 700);   // II|III: 100k dominates

  // ---- musical step grid (movement kps, detected boundaries) ---------------
  const bounds = [2580, b1, b2, null, 0];              // IV start set after terminations
  const ages = [], moveIdx = [], silent = [];
  const moveStarts = [];
  const provisional = [[2580, b1], [b1, b2], [b2, 130], [130, 0]];
  provisional.forEach(([from, to], k) => {
    const kyrPerStep = MOVEMENTS[k].kps * BASE_STEP;
    const nSteps = Math.ceil((from - to) / kyrPerStep);
    moveStarts.push(ages.length);
    for (let j = 0; j < nSteps; j++) { ages.push(from - j * kyrPerStep); moveIdx.push(k); silent.push(false); }
    if (k < 3) for (let j = 0; j < PAUSE_STEPS; j++) { ages.push(to); moveIdx.push(k); silent.push(true); }
  });
  const N = ages.length;
  const T = i => lead + i * stepSec;

  // ---- sample the players ---------------------------------------------------
  const S = {};
  for (const id of ['lr04', 'epica_temp', 'epica_co2', 'prec', 'obl', 'ecc', 'odp967_tial', 'ngrip']) {
    S[id] = paleoOnGrid(paleoData[id], ages);
  }
  const ice = normArr(S.lr04), temp = normArr(S.epica_temp), co2 = normArr(S.epica_co2);
  const prec = normArr(S.prec), obl = normArr(S.obl), ecc = normArr(S.ecc);
  const dust = normArr(S.odp967_tial), ngrip = normArr(S.ngrip);
  const tempEff = ice.map((v, i) => Number.isFinite(temp[i]) ? temp[i] : (Number.isFinite(v) ? 1 - v : 0.5));
  const reconstructed = i => !Number.isFinite(temp[i]);

  // band activities & regularity interpolated onto the musical grid
  const act = { b23: [], b41: [], b100: [], b405: [] };
  const reg = [];
  {
    const domLag = Math.round(100 / A_DT);
    const aReg = autocorrAt(aIce, domLag, 300).map(r => Number.isFinite(r) ? clamp01((r + 1) / 2) : 0.5);
    for (let i = 0; i < N; i++) {
      act.b23.push(interp1(aAges, B23, ages[i]) || 0);
      act.b41.push(interp1(aAges, B41, ages[i]) || 0);
      act.b100.push(interp1(aAges, B100, ages[i]) || 0);
      act.b405.push(interp1(aAges, B405, ages[i]) || 0);
      reg.push(interp1(aAges, aReg, ages[i]) ?? 0.5);
    }
  }

  // couplings (the climate network, reduced to its two principal edges)
  const corrW = 90;
  const rTempCo2 = rollCorr(tempEff, co2, corrW);
  const rIceDust = rollCorr(ice, dust, corrW);     // the independent early-Pleistocene edge

  // uncertainty = archive coverage; roughness = complexity of change
  const unc = ages.map((_, i) => clamp01(0.45 * (Number.isFinite(temp[i]) ? 0 : 1) + 0.45 * (Number.isFinite(co2[i]) ? 0 : 1) + 0.1));
  const rough = (() => {
    const d = ice.map((v, i) => i && Number.isFinite(v) && Number.isFinite(ice[i - 1]) ? Math.abs(v - ice[i - 1]) : NaN);
    const W = 60, out = [];
    for (let i = 0; i < N; i++) {
      let s = 0, c = 0;
      for (let j = Math.max(0, i - W); j <= Math.min(N - 1, i + W); j++) if (Number.isFinite(d[j])) { s += d[j]; c++; }
      out.push(c ? s / c : 0);
    }
    return normArr(out).map(v => Number.isFinite(v) ? v : 0.4);
  })();

  // insolation proxy conducts modulation; its derivative is the trigger
  const insol = ages.map((_, i) => 0.6 * (obl[i] ?? 0.5) + 0.4 * (prec[i] ?? 0.5));
  const dIns = insol.map((v, i) => i ? v - insol[i - 1] : 0);

  // ---- events ----------------------------------------------------------------
  const kyrStep = i => MOVEMENTS[moveIdx[i]].kps * BASE_STEP;
  const detectEvents = (series, drop, winKyr, dir = -1) => {
    const out = []; let cool = 0;
    for (let i = 0; i < N; i++) {
      if (cool-- > 0) continue;
      const L = Math.max(2, Math.round(winKyr / kyrStep(i)));
      const a = series[i - L], b = series[i];
      if (Number.isFinite(a) && Number.isFinite(b) && dir * (b - a) > drop) { out.push(i); cool = 2 * L; }
    }
    return out;
  };
  const terminations = detectEvents(ice, 0.33, 14, -1);
  const doEvents = detectEvents(ngrip, 0.2, 0.9, +1).filter(i => moveIdx[i] === 3);
  // Heinrich-like: deepest Greenland cold reached fast → the orchestra falls silent
  const gp = new Array(N).fill(false);
  {
    const cold = detectEvents(ngrip, 0.22, 1.4, -1).filter(i => Number.isFinite(ngrip[i]) && ngrip[i] < 0.14);
    for (const i of cold) for (let j = 0; j < 6 && i + j < N; j++) gp[i + j] = true;
  }
  // movement IV actually starts at the detected Termination II (nearest 130 ka)
  {
    const tII = terminations.reduce((best, i) => Math.abs(ages[i] - 130) < Math.abs(ages[best] - 130) ? i : best, terminations[0] ?? moveStarts[3]);
    if (tII && Math.abs(ages[tII] - 130) < 25) moveStarts[3] = tII;
  }
  const tobaStep = (() => { let best = -1, bd = 1e9; for (let i = 0; i < N; i++) { if (moveIdx[i] !== 3) continue; const d = Math.abs(ages[i] - 74); if (d < bd) { bd = d; best = i; } } return bd < 3 ? best : -1; })();
  const inAHP = i => ages[i] <= 14.8 && ages[i] >= 5.5;

  // ---- STAGE A → grammar per phrase ------------------------------------------
  // eccentricity conducts the phrase length; each phrase fixes mode, root,
  // chord colour, dissonance budget and texture
  const phrases = [];
  const phraseOf = new Array(N).fill(0);
  {
    let i = 0, rootShift = 0;
    while (i < N) {
      const k = moveIdx[i];
      const len = Math.min(N - i, 8 + Math.round((ecc[i] ?? 0.4) * 8));
      const mid = Math.min(N - 1, i + (len >> 1));
      const fin = k === 3 && ages[mid] <= HOLOCENE;
      // modulation probability from the insolation derivative
      let dm = 0; for (let j = i; j < i + len && j < N; j++) dm += dIns[j] || 0;
      if (rand() < clamp01(Math.abs(dm) * 10)) rootShift += dm > 0 ? 7 : -7;
      rootShift = ((rootShift + 66) % 12) - 6 + (rootShift > 0 ? 0 : 0);
      rootShift = Math.max(-5, Math.min(6, ((rootShift + 5) % 12 + 12) % 12 - 5));
      const modeIdx = fin ? 0 : Math.round(clamp01(ice[mid] ?? 0.5) * 5);
      const mode = MODES[modeIdx];
      const root = fin ? 45 : MOVEMENTS[k].root + rootShift;
      // chord colour from CO₂ (hollow when the archive is silent/uncertain)
      const c = co2[mid];
      const hollow = !Number.isFinite(c) || unc[mid] > 0.42;
      const chord = hollow
        ? [root, root + 7, root + 12]
        : scaleChord(root, mode.iv, Math.round(clamp01(tempEff[mid]) * 4), root, c > 0.62 ? 4 : 3);
      if (!hollow && c > 0.8) chord.push(chord[0] + 14);            // add9 warmth
      // dissonance budget from dust; texture from the coupling network
      const diss = clamp01(dust[mid] ?? 0.3);
      const r = Number.isFinite(rTempCo2[mid]) ? rTempCo2[mid] : (rIceDust[mid] ?? 0);
      const tex = r >= 0.45 ? 'parallel' : r <= -0.3 ? 'gegenbewegung' : 'imitation';
      phrases.push({ i0: i, i1: Math.min(N, i + len), k, root, mode, modeIdx, chord, diss, tex, fin, unc: unc[mid] });
      for (let j = i; j < i + len && j < N; j++) phraseOf[j] = phrases.length - 1;
      i += len;
    }
  }

  // orchestration density: complexity decides how many sections play
  const density = i => {
    let d = 2 + Math.round(rough[i] * 2) + (moveIdx[i] >= 2 ? 1 : 0);
    if (phrases[phraseOf[i]].fin) d += 2;
    return Math.min(6, d);
  };
  const gate = (i, rank) => rank <= density(i) && !gp[i] && !silent[i];

  // Milanković conducts: rubato from precession, loosened by irregularity
  const rub = i => ((prec[i] ?? 0.5) - 0.5) * stepSec * 0.55 * (1 - reg[i]) + (rand() - 0.5) * stepSec * 0.12 * (1 - reg[i]);
  const dynOf = i => MOVEMENTS[moveIdx[i]].dyn * (0.72 + 0.42 * (obl[i] ?? 0.5));

  // ---- leitmotifs (interval cells; transformations chosen by the data) -------
  const iceCell = [0, -2, -3, 0];                    // falling: the weight of ice
  const warmCell = [0, 2, 4, 2];                     // its inversion-like answer
  const cellNotes = (cell, root, mode, base, invert, strFactor) =>
    cell.map((d, j) => ({
      off: j * strFactor,
      midi: snapToScale(base + (invert ? -d : d), root, mode.iv)
    }));

  const ev = [];
  const push = (t, dur, track, voice, o) => ev.push({ t, dur, track, voice, ...o });
  const F = midiFreq;

  // ---- STAGE B · the sections compose inside the grammar ---------------------
  // elastic anchored walk: intervals from the grammar, contour from the data
  const walkVoice = ({ every, register, span, source, track, voice, pan, velBase, rank, subdivOn }) => {
    let cur = null;
    for (const ph of phrases) {
      const { root, mode, diss, tex } = ph;
      const allowed = diss > 0.6 ? [1, 2, 3, 6, -1, -2, -3, -6] : diss > 0.3 ? [2, 3, 4, -2, -3, -4, 5, -5] : [2, 3, 4, 5, -2, -3, -4, 7];
      for (let i = ph.i0; i < ph.i1; i++) {
        if (i % every !== 0 || !gate(i, rank)) continue;
        const anchor = register + clamp01(source[i] ?? 0.5) * span;
        if (cur == null) cur = Math.round(anchor);
        const slope = (source[Math.min(N - 1, i + every)] ?? 0.5) - (source[i] ?? 0.5);
        let step = allowed[Math.floor(rand() * allowed.length)];
        if (slope > 0.004 && step < 0) step = -step;             // contour follows the data
        if (slope < -0.004 && step > 0) step = -step;
        if (Math.abs(cur + step - anchor) > 7) step = anchor > cur ? Math.abs(step) : -Math.abs(step);
        cur = snapToScale(Math.round(cur + step), root, mode.iv);
        const uncI = ph.unc;
        const vel = velBase * dynOf(i) * (uncI > 0.42 ? 0.72 : 1);
        const dur = stepSec * (every + 1.3);
        const t = T(i) + rub(i);
        push(t, dur, track, voice, { f: F(cur), vel, pan, bright: 0.28 + 0.3 * clamp01(source[i] ?? 0.5), send: { verb: 0.34 + 0.3 * uncI } });
        // texture: coupled voices answer in parallel; decoupled imitate; opposed invert
        if (!reconstructed(i) && uncI < 0.42) {
          if (tex === 'parallel') {
            push(t, dur, track, voice, { f: F(snapToScale(cur + (mode.iv.includes(4) ? 4 : 3), root, mode.iv)), vel: vel * 0.6, pan: pan + 0.14, send: { verb: 0.36 } });
          } else if (tex === 'imitation' && i + 4 < ph.i1) {
            push(T(i + 4) + rub(i), dur * 0.9, track, voice, { f: F(snapToScale(cur - 5, root, mode.iv)), vel: vel * 0.5, pan: -pan, send: { verb: 0.42 } });
          } else if (tex === 'gegenbewegung') {
            const mirror = snapToScale(Math.round(2 * anchor - cur), root, mode.iv);
            push(t, dur, track, voice, { f: F(mirror), vel: vel * 0.55, pan: -pan, send: { verb: 0.38 } });
          }
        }
        if (subdivOn && subdivOn(i)) {                            // D-O: written-out accelerando
          push(t + stepSec * every * 0.5, dur * 0.45, track, voice, { f: F(snapToScale(cur + 2, root, mode.iv)), vel: vel * 0.8, pan, send: { verb: 0.35 } });
        }
      }
    }
  };

  const doWindow = new Set();
  for (const i of doEvents) for (let j = 0; j < 10; j++) doWindow.add(i + j);

  // cantus firmus — the ice, literal (the pointable anchor of the whole work)
  for (let i = 0; i < N; i += 8) {
    if (!gate(i, 1)) continue;
    const ph = phrases[phraseOf[i]];
    const midi = snapToScale(Math.round(ph.root - 19 + (1 - (ice[i] ?? 0.5)) * 12), ph.root, ph.mode.iv);
    const vel = (0.15 + 0.1 * (ice[i] ?? 0.5)) * dynOf(i);
    push(T(i), stepSec * 9.5, 'bass', 'strings', { f: F(midi), vel, pan: -0.25, bright: 0.16, send: { verb: 0.42 + 0.25 * ph.unc } });
    if (moveIdx[i] >= 2) push(T(i), stepSec * 9.5, 'bass', 'strings', { f: F(midi - 12), vel: vel * 0.7, pan: -0.35, bright: 0.1, send: { verb: 0.5 } });
  }

  // violins — the warmth voice, composed (walk), textured by the couplings
  walkVoice({ every: 3, register: 57, span: 14, source: tempEff, track: 'melody', voice: 'strings', pan: 0.22, velBase: 0.13, rank: 2, subdivOn: i => doWindow.has(i) });

  // horns — the 41-kyr leitmotif, loud exactly when the band is active
  for (let i = 0; i < N; i += 12) {
    const a41 = act.b41[i];
    if (a41 < 0.3 || !gate(i, 4)) continue;
    const ph = phrases[phraseOf[i]];
    const invert = (tempEff[Math.min(N - 1, i + 6)] ?? 0.5) > (tempEff[i] ?? 0.5);   // warming inverts the cell
    const str = rough[i] > 0.6 ? 1.4 : 2.2;                                          // diminution when rough
    for (const nte of cellNotes(iceCell, ph.root, ph.mode, ph.root + 7, invert, str)) {
      push(T(i) + nte.off * stepSec + rub(i), stepSec * str * 1.5, 'accomp', 'horn',
        { f: F(nte.midi + 5), vel: (0.1 + 0.14 * a41) * dynOf(i), pan: 0.1, send: { verb: 0.42 } });
    }
  }

  // woodwinds — the 23-kyr triplet, amplitude conducted by eccentricity;
  // they bloom in the African Humid Period
  for (let i = 0; i < N; i += 4) {
    const a23 = act.b23[i], bloom = inAHP(i);
    if ((a23 < 0.28 && !bloom) || !gate(i, 5)) continue;
    const ph = phrases[phraseOf[i]];
    const base = snapToScale(ph.root + 26 + Math.round((prec[i] ?? 0.5) * 7), ph.root, ph.mode.iv);
    const vel = (0.035 + 0.2 * (ecc[i] ?? 0.3)) * dynOf(i) * (bloom ? 1.5 : 1);
    [0, 2, 3].forEach((d, j) => push(T(i) + j * stepSec * 0.45 + rub(i), stepSec * 0.9, 'accomp', 'flute',
      { f: F(snapToScale(base + d, ph.root, ph.mode.iv)), vel: vel * (j ? 0.75 : 1), pan: -0.14, send: { verb: 0.38 } }));
    if (bloom) push(T(i) + stepSec * 1.5, stepSec * 1.2, 'accomp', 'flute',
      { f: F(snapToScale(base + 4, ph.root, ph.mode.iv)), vel: vel * 0.8, pan: 0.05, send: { verb: 0.4 } });
  }

  // low brass — CO₂: it plays the CHORD COLOUR itself; tacet before its archive
  for (let i = 4; i < N; i += 8) {
    if (!Number.isFinite(co2[i]) || !gate(i, 3)) continue;
    const ph = phrases[phraseOf[i]];
    const merged = (rTempCo2[i] ?? 0) >= 0.45;                    // coupled: motifs fuse
    push(T(i), stepSec * 8.5, 'pad', 'brassLow', { f: F(ph.chord[0] - 12), vel: (0.08 + 0.12 * co2[i]) * dynOf(i), send: { verb: 0.4 } });
    if (merged && i % 24 === 4) {
      for (const nte of cellNotes(iceCell, ph.root, ph.mode, ph.root - 5, false, 3)) {
        push(T(i) + nte.off * stepSec, stepSec * 4, 'pad', 'brassLow', { f: F(nte.midi), vel: 0.1 * dynOf(i), send: { verb: 0.42 } });
      }
    }
  }

  // 405-kyr pedal: when the longest cycle is strong, the ground itself hums
  for (let i = 0; i < N; i += 24) {
    if (act.b405[i] < 0.55 || !gate(i, 4)) continue;
    const ph = phrases[phraseOf[i]];
    push(T(i), stepSec * 26, 'bass', 'brassLow', { f: F(ph.root - 24), vel: 0.07 * dynOf(i), send: { verb: 0.55 } });
  }

  // harp — dust: pointillism whose density AND dissonance come from the aridity
  for (let i = 0; i < N; i++) {
    if (!Number.isFinite(dust[i]) || !gate(i, 6)) continue;
    if (rand() >= dust[i] * 0.32) continue;
    const ph = phrases[phraseOf[i]];
    const pool = ph.diss > 0.6
      ? [ph.chord[0] + 13, ph.chord[1] + 6, ph.chord[0] + 25]      // clusters & tritones allowed
      : ph.chord.map(m => m + 24);
    push(T(i) + rand() * stepSec * 0.5, stepSec * 2.2, 'extremes', 'pluck',
      { f: F(pool[Math.floor(rand() * pool.length)]), vel: (0.05 + 0.06 * dust[i]) * dynOf(i), bright: 0.8, pan: 0.3, send: { verb: 0.4, delay: 0.12 } });
  }

  // chord chorale — every phrase states its harmony once (colour made audible)
  for (const ph of phrases) {
    const i = ph.i0;
    if (silent[i] || gp[i]) continue;
    push(T(i), stepSec * Math.min(10, ph.i1 - ph.i0 + 2), 'melody', 'strings',
      { fs: ph.chord.map(m => F(m + 12)), vel: (ph.fin ? 0.17 : 0.09) * dynOf(i), pan: 0.05, bright: ph.fin ? 0.42 : 0.3, send: { verb: 0.42 + 0.25 * ph.unc } });
    if (ph.fin) {
      push(T(i), stepSec * 10, 'accomp', 'horn', { f: F(ph.chord[1]), vel: 0.1, pan: -0.1, send: { verb: 0.5 } });
      ph.chord.forEach((m, j) => push(T(i) + j * stepSec * 0.6, stepSec * 2, 'extremes', 'pluck', { f: F(m + 24), vel: 0.07, bright: 0.8, pan: 0.3, send: { verb: 0.45 } }));
    }
  }

  // ---- events: the discrete history strikes ----------------------------------
  for (const i of terminations) {
    const ph = phrases[phraseOf[i]];
    if (moveIdx[i] < 2) {                                        // 41k-world: deglaciations were weak
      push(T(i), 1.3, 'extremes', 'timp', { f: F(ph.root - 19), vel: 0.16 * dynOf(i), send: { verb: 0.4 } });
      continue;
    }
    for (let j = 0; j < 5; j++) push(T(i) - (5 - j) * stepSec * 0.9, 1.2, 'extremes', 'timp', { f: F(ph.root - 19), vel: (0.1 + j * 0.05) * dynOf(i), send: { verb: 0.35 } });
    push(T(i), 1.6, 'extremes', 'timp', { f: F(ph.root - 12), vel: 0.34 * dynOf(i), send: { verb: 0.4 } });
    push(T(i), stepSec * 10, 'melody', 'strings', { fs: ph.chord.map(m => F(m + 12)), vel: 0.27 * dynOf(i), bright: 0.5, send: { verb: 0.5 } });
    push(T(i), stepSec * 8, 'accomp', 'horn', { f: F(ph.chord[Math.min(2, ph.chord.length - 1)] + 12), vel: 0.23 * dynOf(i), accent: true, send: { verb: 0.45 } });
    if (Number.isFinite(co2[i])) push(T(i), stepSec * 9, 'pad', 'brassLow', { f: F(ph.root - 12), vel: 0.2 * dynOf(i), send: { verb: 0.4 } });
  }
  for (const i of doEvents) {
    const ph = phrases[phraseOf[i]];
    push(T(i), stepSec * 4, 'accomp', 'horn', { f: F(snapToScale(ph.root + 12, ph.root, ph.mode.iv)), vel: 0.22, accent: true, send: { verb: 0.4 } });
  }
  if (tobaStep >= 0) {                                            // Toba: the sky darkens at once
    const ph = phrases[phraseOf[tobaStep]];
    push(T(tobaStep), 2.4, 'extremes', 'timp', { f: F(ph.root - 24), vel: 0.36, send: { verb: 0.5 } });
    push(T(tobaStep), stepSec * 14, 'melody', 'strings', { fs: [0, 1, 2, 6].map(d => F(ph.root + 12 + d)), vel: 0.26, bright: 0.2, send: { verb: 0.55 } });
    for (let j = 1; j <= 4; j++) gp[Math.min(N - 1, tobaStep + 8 + j)] = true;
  }

  // motif statements at every (detected) movement start — cyclic form
  moveStarts.forEach((i0, k) => {
    const ph = phrases[phraseOf[Math.min(i0, N - 1)]];
    const str = k === 2 ? 3 : k === 1 ? 1.5 : 2;
    for (const nte of cellNotes(iceCell, ph.root, ph.mode, ph.root - 12, false, str)) {
      push(T(i0) + nte.off * stepSec, stepSec * str * 1.7, 'bass', 'strings', { f: F(nte.midi), vel: 0.26 * MOVEMENTS[k].dyn, pan: -0.1, send: { verb: 0.45 } });
      push(T(i0) + nte.off * stepSec, stepSec * str * 1.6, 'melody', 'horn', { f: F(nte.midi + 12), vel: 0.19 * MOVEMENTS[k].dyn, pan: 0.15, send: { verb: 0.42 } });
    }
  });

  // ---- coda: modern CO₂ leaves the pitch space of everything heard -----------
  const bodyEnd = lead + N * stepSec;
  let tail;
  {
    const t0 = bodyEnd + 0.8;
    const line = [24, 29, 33, 38, 43, 47];
    line.forEach((d, j) => push(t0 + j * 0.38, 1.5, 'melody', 'strings', { f: F(45 + d), vel: 0.1 + j * 0.045, bright: 0.6, pan: 0.1, send: { verb: 0.5 } }));
    push(t0, 3, 'pad', 'brassLow', { f: F(33), vel: 0.24, send: { verb: 0.45 } });
    push(t0 + line.length * 0.38, 3.5, 'extremes', 'bell', { f: F(93), vel: 0.3, send: { verb: 0.55, delay: 0.25 } });
    push(t0 + line.length * 0.38 + 2.6, 3.5, 'bass', 'strings', { f: F(21), vel: 0.1, pan: -0.2, bright: 0.1, send: { verb: 0.55 } });
    tail = line.length * 0.38 + 7.5;
  }

  // ---- meta -------------------------------------------------------------------
  const lanes = [['lr04', ice, S.lr04], ['epica_temp', temp, S.epica_temp], ['epica_co2', co2, S.epica_co2], ['obl', obl, S.obl], ['odp967_tial', dust, S.odp967_tial]];
  const gramLabel = phrases.map(ph =>
    `${NOTE[((ph.root % 12) + 12) % 12]}-${ph.mode.name} · ${ph.tex}`);
  return {
    events: ev,
    duration: bodyEnd + tail,
    mix: { delayTime: 0.5, delayFb: 0.16, verbSec: 5.4, verbDecay: 3.1, duck: 0 },
    meta: {
      symphony: true, stepSec, lead, bodyEnd, ages,
      tracks: lanes.map(([id, n2, raw]) => ({
        dataset: id, voice: 'lead',
        norm: n2.map(v => Number.isFinite(v) ? v : NaN),
        raw: raw.map(v => Number.isFinite(v) ? +Number(v).toPrecision(4) : NaN),
        pan: 0
      })),
      moveStarts, moveNumerals: MOVEMENTS.map(m => m.numeral),
      moveKeyPerStep: moveIdx.map(k => MOVEMENTS[k].key),
      moveTimes: moveStarts.map(s => lead + s * stepSec),
      gramOfStep: phraseOf.map(p => gramLabel[p]),
      detected: { mptStart: Math.round(b1), mptEnd: Math.round(b2), terminations: terminations.filter(i => moveIdx[i] >= 2).length, doEvents: doEvents.length, toba: tobaStep >= 0 }
    }
  };
}
