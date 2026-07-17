// classic.js — "studio classic": synthetic pieces in the spirit of great
// composers, built from the same climate material and ground rules
// (melody = anomaly, warmth = height, extremes = accents).
//
// Two things make this mode different from the electronic studio:
//
// 1. IDIOM PACING — every composer keeps the pace of their style: the fast
//    layer (Bach's motor line, Alberti figures, nocturne arpeggios, minimal
//    cells) carries the month-by-month data, while the MELODY moves at the
//    idiom's own rate on group means (Mozart ~0.5 s, Chopin ~1 s, Satie one
//    tone per bar). Instruments are classical: piano, harpsichord, strings —
//    the bass is a low piano/harpsichord, never a synth sub.
//
// 2. QUANTIL-DRAMATURGIE (segment ranking engine, see score.js): blocks of
//    eight years are ranked by mean climate state (→ intensity I1–I5) and by
//    variability (→ character C1–C3: cantabile · mosso · agitato). Every
//    segment gets its own rules; transitions carry a cadence weighted by |ΔI|,
//    rising segments enter with a crescendo. The highest-ranked block is the
//    climax (★), the lowest the still point.

import {
  SCALES, midiFreq, midiName, snapToScale, mapToMidi, scaleChord,
  mulberry32, derivePlayed, buildSegmentPlan
} from './score.js?v=202607170924';

export const CLASSICS = {
  bach: {
    name: 'J. S. Bach', city: 'leipzig', scale: 'minor', root: 45,
    tempoTxt: 'toccata · motorik', spm: 0.14,
    mix: { delayTime: 0.42, delayFb: 0.16, verbSec: 3.0, verbDecay: 2.7, duck: 0 }
  },
  mozart: {
    name: 'W. A. Mozart', city: 'vienna', scale: 'major', root: 48,
    tempoTxt: 'allegretto grazioso', spm: 0.13,
    mix: { delayTime: 0.5, delayFb: 0.12, verbSec: 2.8, verbDecay: 2.6, duck: 0 }
  },
  beethoven: {
    name: 'L. v. Beethoven', city: 'bonn', scale: 'minor', root: 45,
    tempoTxt: 'allegro con brio', spm: 0.12,
    mix: { delayTime: 0.48, delayFb: 0.14, verbSec: 3.4, verbDecay: 2.8, duck: 0 }
  },
  chopin: {
    name: 'F. Chopin', city: 'warsaw', scale: 'minor', root: 45,
    tempoTxt: 'nocturne · lento rubato', spm: 0.1175,
    mix: { delayTime: 0.6, delayFb: 0.18, verbSec: 4.4, verbDecay: 2.9, duck: 0 }
  },
  satie: {
    name: 'E. Satie', city: 'paris', scale: 'dorian', root: 50,
    tempoTxt: 'lent et douloureux', spm: 0.13,
    mix: { delayTime: 0.7, delayFb: 0.2, verbSec: 4.8, verbDecay: 3.0, duck: 0 }
  },
  glass: {
    name: 'Ph. Glass · S. Reich', city: 'newyork', scale: 'pentMinor', root: 45,
    tempoTxt: 'minimal · phasing', spm: 0.105,
    mix: { delayTime: 0.42, delayFb: 0.26, verbSec: 2.4, verbDecay: 2.6, duck: 0 }
  }
};

export const CLASSIC_ORDER = ['bach', 'mozart', 'beethoven', 'chopin', 'satie', 'glass'];

const clamp01 = x => Math.max(0, Math.min(1, x));

// Length never stretches the idiom pulse. Instead, 'long'/'epic' refine the
// data: every month is upsampled into f pulses whose in-between values are
// interpolated passing tones (baroque diminution) — original months keep the
// accents, the pace stays the composer's own.
function stretchMaterial(rows, f) {
  if (f <= 1) return { rows2: rows, vals2: rows.map(r => r.anomaly) };
  const rows2 = [], vals2 = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], nx = rows[Math.min(rows.length - 1, i + 1)];
    for (let k = 0; k < f; k++) {
      rows2.push(k === 0 ? r : { ...r, hot: false, record: false, cold: false, jump: false, runStart: false, isSub: true });
      const a2 = k / f;
      vals2.push(r.anomaly * (1 - a2) + nx.anomaly * a2);
    }
  }
  return { rows2, vals2 };
}

// ---------------------------------------------------------------- builder --
export function buildClassicScore(material, id, opts = {}) {
  const st = CLASSICS[id];
  const scale = SCALES[st.scale];
  const root = st.root;
  const spm = st.spm;                                   // idiom pace is sacred
  const stretch = Math.max(1, Math.round(opts.stretch || 1));
  const stats = material.stats;
  const { rows2: rows, vals2 } = stretchMaterial(material.rows, stretch);
  const rand = mulberry32(opts.seed ?? 1234);
  const n = rows.length;
  const ev = [];
  const lead = 0.4;
  const T = i => lead + i * spm;

  const val = vals2;
  const vLo = stats.lo, vHi = stats.hi;
  const melLo = id === 'mozart' ? root + 19 : id === 'chopin' ? root + 15 : root + 12;
  const melHi = melLo + 24;
  const M = v => mapToMidi(v, vLo, vHi, melLo, melHi, root, scale);
  const groupMean = (i, g) => {
    let s = 0, c = 0;
    for (let k = i; k < Math.min(n, i + g); k++) if (Number.isFinite(val[k])) { s += val[k]; c++; }
    return c ? s / c : val[i];
  };

  const cs = rows.map(r => clamp01(0.5 + ((r.trend - stats.trendLo) / Math.max(1e-6, stats.trendHi - stats.trendLo) - 0.5) * 1.6));
  const va = rows.map(r => r.variab ?? 0.5);

  // ---- segment plan: intensity & character per 8-year block --------------
  const plan = buildSegmentPlan(rows, cs, va, 96 * stretch);
  const segI = i => plan.seg[i]?.I ?? 3;
  const segC = i => plan.seg[i]?.C ?? 2;
  const isClimax = i => !!plan.seg[i]?.climax;
  const isStill = i => !!plan.seg[i]?.still;

  // dynamics: each intensity level has its base loudness; segment entries
  // ramp from the previous level across two years (crescendo/diminuendo)
  const velOfI = I => 0.66 + I * 0.075;
  const velScale = new Array(n);
  for (const b of plan.blocks) {
    const from = velOfI(b.I - b.dI), to = velOfI(b.I) + (b.climax ? 0.06 : 0) - (b.still ? 0.1 : 0);
    for (let i = b.i0; i < b.i1; i++) {
      const x = Math.min(1, (i - b.i0) / 24);
      velScale[i] = from + (to - from) * x;
    }
  }

  // after a strong drop in intensity the music takes a breath: no melody
  // in the first bar of the new segment
  const rest = new Array(n).fill(false);
  for (const b of plan.blocks) {
    if (b.dI <= -1) for (let k = b.i0; k < Math.min(n, b.i0 + 6); k++) rest[k] = true;
  }

  // ---- classical voices ---------------------------------------------------
  const piano = (t, midi, vel, dur = 1.6, pan = 0, track = 'melody') =>
    ev.push({ t, dur: Math.max(0.8, dur), track, voice: 'piano', f: midiFreq(midi), vel, pan, send: { verb: 0.35 } });
  const cembalo = (t, midi, vel, dur = 0.5, pan = 0, track = 'melody') =>
    ev.push({ t, dur, track, voice: 'pluck', f: midiFreq(midi), vel, bright: 0.7, pan, send: { verb: 0.22, delay: 0.1 } });
  const bassPiano = (t, midi, vel, dur = 1.8) =>
    piano(t, midi, vel, dur, -0.15, 'bass');
  const bassCembalo = (t, midi, vel, dur = 0.8) =>
    cembalo(t, midi, vel, dur, -0.15, 'bass');
  const strings = (t, midis, vel, dur, pan = 0) =>
    ev.push({ t, dur, track: 'pad', voice: 'pad', fs: midis.map(midiFreq), vel, bright: 0.28, pan, send: { verb: 0.5 } });
  const bell = (t, midi, vel) =>
    ev.push({ t, dur: 2.2, track: 'extremes', voice: 'bell', f: midiFreq(midi), vel, send: { verb: 0.5, delay: 0.2 } });

  // cadence: V–I in low piano octaves; its weight follows the intensity jump
  const cadence = (i, dI) => {
    const w = 1 + Math.abs(dI) * 0.4;
    const lowBass = id === 'bach' ? bassCembalo : bassPiano;
    lowBass(T(i) - 4 * spm, root - 5, 0.2 * w, spm * 4);
    lowBass(T(i), root - 12, 0.24 * w, spm * 8);
    if (Math.abs(dI) >= 1 || segI(i) >= 4) {
      strings(T(i), scaleChord(root, scale, 0, root + 3, Math.abs(dI) >= 2 ? 4 : 3), 0.07 * w, spm * 16 * w);
    }
  };
  for (const b of plan.blocks) if (b.i0 > 0) cadence(b.i0, b.dI);

  // ---- composer generators -------------------------------------------------
  rows.forEach((r, i) => {
    const I = segI(i), C = segC(i);
    const vs = velScale[i] * (isStill(i) ? 0.85 : 1);
    const legato = C === 1 ? 1.5 : 1;                 // cantabile holds longer
    const midi = M(val[i]);
    const yearStart = r.month === 1 && !r.isSub;
    const decade = yearStart && r.year % 10 === 0;

    switch (id) {
      case 'bach': {
        // the motor line IS the melody — one harpsichord note per month
        if (!rest[i]) {
          cembalo(T(i), midi, 0.28 * vs, spm * 1.6 * legato);
          if (C === 3 && I >= 2 && Number.isFinite(val[i + 1]) && rand() < 0.55) {
            cembalo(T(i) + spm / 2, M((val[i] + val[i + 1]) / 2), 0.14 * vs, spm * 0.8);   // passing note
          }
        }
        // canon: the same line, eight months later, a fifth below
        if (I >= 2 && i >= 8) cembalo(T(i), snapToScale(M(val[i - 8]) - 7, root, scale), 0.18 * vs, spm * 1.5, -0.3, 'accomp');
        if (I >= 4 && i >= 16) cembalo(T(i), snapToScale(M(val[i - 16]) + 12, root, scale), 0.11 * vs, spm * 1.2, 0.3, 'accomp');
        // continuo quarters, walking root/fifth — silent in solo segments
        if (I >= 2 && i % 4 === 0) bassCembalo(T(i), snapToScale(root - 12 + (i % 8 === 0 ? 0 : 7), root, scale), 0.2 * vs, spm * 4);
        break;
      }
      case 'mozart': {
        // melody: one singing tone per 4 months; Alberti carries the months
        if (i % 4 === 0 && !rest[i]) {
          const gm = M(groupMean(i, 4));
          piano(T(i), gm, 0.3 * vs, spm * 4.4 * legato, 0.1);
          if (C === 3 && rand() < 0.5) piano(T(i) - spm * 0.45, snapToScale(gm + 2, root, scale), 0.15 * vs, spm * 0.9, 0.1);  // mordent
          if (i % 32 === 28) piano(T(i + 4 <= n ? i : i) + spm * 3.4, snapToScale(gm + 2, root, scale), 0.16 * vs, spm * 1.4, 0.1); // appoggiatura at phrase end
        }
        if (I >= 2) {
          const ch = scaleChord(root, scale, Math.round(cs[i] * 4), root, 3);
          const alberti = [ch[0], ch[2], ch[1], ch[2]];
          if (C !== 1 || i % 2 === 0) piano(T(i), alberti[i % 4] - 12, 0.115 * vs, spm * 1.5, -0.2, 'accomp');
        } else if (i % 8 === 0) {
          bassPiano(T(i), root - 12, 0.16 * vs, spm * 8);
        }
        if (I >= 4 && i % 16 === 0) strings(T(i), scaleChord(root, scale, Math.round(cs[i] * 4), root + 7, 3), 0.075 * vs, spm * 17, 0.3);
        break;
      }
      case 'beethoven': {
        // driving eighths on 2-month means; extremes strike sforzato
        if (i % 2 === 0 && !rest[i]) {
          const gm = M(groupMean(i, 2));
          const sfz = r.hot || r.record;
          piano(T(i), gm, (sfz ? 0.5 : 0.28) * vs, spm * 2.4 * legato, 0.08);
          if (sfz || I >= 5) piano(T(i), gm - 12, (sfz ? 0.32 : 0.16) * vs, spm * 2.2, 0.08);
        }
        if (plan.seg[i]?.i0 === i) {                              // the motif, stated low
          for (let k2 = 0; k2 < 4 && i + k2 * 2 < n; k2++) {
            piano(T(i) + k2 * spm * 2, M(groupMean(i + k2 * 2, 2)) - 24, 0.4 * vs, spm * 3);
          }
        }
        if (C === 3 && I >= 3) strings(T(i), [midi - 5], 0.07 * vs, spm * 1.4, 0.25);          // tremolo pulse
        else if (I >= 4 && i % 16 === 0) strings(T(i), scaleChord(root, scale, Math.round(cs[i] * 4), root + 3, 3), 0.085 * vs, spm * 17, 0.2);
        if (I >= 2 && i % 4 === 0) bassPiano(T(i), root - 12 - (i % 16 === 8 ? 5 : 0), 0.22 * vs, spm * 4.4);
        if (decade) for (const dm of scaleChord(root, scale, 0, root - 12, 3)) piano(T(i), dm, 0.4 * vs, spm * 8);
        break;
      }
      case 'chopin': {
        // LH: broken-chord eighths every 2 months; RH: one long tone per 8
        if (I >= 2 && i % (C === 1 ? 3 : 2) === 0) {
          const ch = scaleChord(root, scale, Math.round(cs[i] * 4), root - 12, 3);
          const arp = [ch[0] - 12, ch[0], ch[1], ch[2], ch[1] + 12, ch[2] + 12];
          piano(T(i), arp[Math.floor(i / 2) % 6], 0.11 * vs, spm * 3, -0.25, 'accomp');
        } else if (I === 1 && i % 16 === 0) {
          bassPiano(T(i), root - 17, 0.14 * vs, spm * 14);
        }
        if (i % 8 === 0 && !rest[i]) {
          const rub = (rand() - 0.5) * spm * (C === 3 ? 2.4 : 1.2) * va[i];   // rubato from variability
          piano(T(i) + rub, M(groupMean(i, 8)), 0.3 * vs, spm * 8.5, 0.15);
        }
        if (r.record && C === 3) for (let k2 = 0; k2 < 5; k2++) {
          piano(T(i) - (5 - k2) * spm / 2.5, snapToScale(midi + 12 - k2 * 2, root, scale), 0.1 * vs, spm * 0.9, 0.2);
        }
        if (I >= 4 && i % 32 === 0) strings(T(i), [root - 5, root + 7].map(x => snapToScale(x, root, scale)), 0.06 * vs, spm * 33, 0.3);
        break;
      }
      case 'satie': {
        // gymnopédie: 18-month bar — bass · chord · chord, one tone per bar
        const ph = i % 18;
        if (rest[i]) break;
        if (ph === 0) bassPiano(T(i), root - 12 + (Math.floor(i / 18) % 2 ? 7 : 0), 0.18 * vs, spm * 12);
        if (ph === 6 || ph === 12) {
          for (const cm of scaleChord(root, scale, Math.round(cs[i] * 3), root, 3)) {
            piano(T(i), cm, 0.1 * vs, spm * 5, ph === 6 ? -0.15 : 0.15, 'accomp');
          }
        }
        const melEvery = C === 3 ? 9 : 18;
        if (ph === 2 || (melEvery === 9 && ph === 11)) {
          piano(T(i), M(groupMean(i, melEvery)), 0.26 * vs, spm * 14, 0.1);
        }
        if (I >= 4 && ph === 0 && i % 36 === 0) strings(T(i), [snapToScale(root + 7, root, scale)], 0.05 * vs, spm * 36, 0.25);
        break;
      }
      case 'glass': {
        // minimal cells: one 16th per month; agitato adds the 7th step,
        // higher intensity adds a phase-shifted second voice (à la Reich)
        const cellLen = C === 3 ? 7 : 6;
        const base = M(groupMean(i - (i % 12), 12));
        const ch = scaleChord(root, scale, Math.round(cs[i] * 4), base, 3);
        const cell = [ch[0], ch[1], ch[2], ch[1], ch[0] + 12, ch[2]];
        if (cellLen === 7) cell.push(ch[1] + 12);
        const m2 = cell[i % cellLen];
        if (!rest[i]) cembalo(T(i), m2, (0.2 + 0.05 * cs[i]) * vs, spm * 1.4, i % 2 ? 0.18 : -0.18);
        if (I >= 3 && i >= 1) cembalo(T(i), cell[(i - 1) % cellLen], 0.12 * vs, spm * 1.3, i % 2 ? -0.3 : 0.3, 'accomp');
        if (I >= 2 && i % 24 === 0) bassPiano(T(i), root - 12, 0.2 * vs, spm * 20);
        if (I >= 4 && i % 24 === 0) strings(T(i), scaleChord(root, scale, Math.round(cs[i] * 4), root + 7, 3), 0.06 * vs, spm * 25);
        if (I >= 5 && r.hot && i % 2 === 0) bell(T(i), m2 + 12, 0.09 * vs);
        break;
      }
    }

    // shared: records shimmer (gently, intensity-aware)
    if (r.record && id !== 'chopin' && id !== 'glass') bell(T(i), snapToScale(midi + 12, root, scale), 0.1 * vs);
  });

  const sounding = derivePlayed(ev, rows, { lead, spm, melLo, melHi, vLo, vHi });
  // reduce pulse-level series back to real months for the plot overlay
  const nReal = material.rows.length;
  const playedReal = new Array(nReal), segIReal = new Array(nReal);
  for (let ri = 0; ri < nReal; ri++) {
    playedReal[ri] = sounding.played[ri * stretch];
    segIReal[ri] = plan.seg[ri * stretch]?.I ?? 3;
  }

  return {
    events: ev,
    duration: lead + n * spm + 3,
    mix: st.mix,
    meta: {
      styleId: id, spm, lead, rows,
      bodyEnd: lead + n * spm,
      monthNotes: sounding.monthNotes,
      played: playedReal,
      segI: segIReal,
      sectStarts: plan.starts.map(x => Math.floor(x / stretch)),
      segLabel: plan.segLabel,
      mapRule: { lo: vLo, hi: vHi, noteLo: midiName(melLo), noteHi: midiName(melHi), scale: st.scale, source: 'anomaly' }
    }
  };
}
