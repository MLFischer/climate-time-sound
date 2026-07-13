// classic.js — "studio classic": synthetic pieces in the spirit of great
// composers, built from the same climate material and the same ground rules
// (melody = monthly anomaly, bass = trend, accents = extremes). What is new
// here is FORM: quantiles of the climate state and of the decadal variability
// split every piece into sections (solo · duo · agitato · tutti) with their
// own rules, joined by cadences — structure the listener can follow.

import { SCALES, midiFreq, midiName, snapToScale, mapToMidi, scaleChord, mulberry32, derivePlayed } from './score.js?v=202607131001';

export const CLASSICS = {
  bach: {
    name: 'J. S. Bach', city: 'leipzig', scale: 'minor', root: 45,
    tempoTxt: 'allegro · achtel-motorik', spm: 0.115,
    mix: { delayTime: 0.46, delayFb: 0.22, verbSec: 3.2, verbDecay: 2.7, duck: 0 }
  },
  mozart: {
    name: 'W. A. Mozart', city: 'vienna', scale: 'major', root: 48,
    tempoTxt: 'allegretto grazioso', spm: 0.12,
    mix: { delayTime: 0.48, delayFb: 0.16, verbSec: 2.9, verbDecay: 2.6, duck: 0 }
  },
  beethoven: {
    name: 'L. v. Beethoven', city: 'bonn', scale: 'minor', root: 45,
    tempoTxt: 'allegro con brio', spm: 0.115,
    mix: { delayTime: 0.46, delayFb: 0.2, verbSec: 3.4, verbDecay: 2.8, duck: 0 }
  },
  chopin: {
    name: 'F. Chopin', city: 'warsaw', scale: 'minor', root: 45,
    tempoTxt: 'nocturne · rubato', spm: 0.14,
    mix: { delayTime: 0.56, delayFb: 0.22, verbSec: 4.2, verbDecay: 2.9, duck: 0 }
  },
  satie: {
    name: 'E. Satie', city: 'paris', scale: 'dorian', root: 50,
    tempoTxt: 'lent et douloureux', spm: 0.11,
    mix: { delayTime: 0.66, delayFb: 0.24, verbSec: 4.6, verbDecay: 3.0, duck: 0 }
  },
  glass: {
    name: 'Ph. Glass · S. Reich', city: 'newyork', scale: 'pentMinor', root: 45,
    tempoTxt: 'minimal · 16tel-zellen', spm: 0.105,
    mix: { delayTime: 0.42, delayFb: 0.3, verbSec: 2.6, verbDecay: 2.6, duck: 0 }
  }
};

export const CLASSIC_ORDER = ['bach', 'mozart', 'beethoven', 'chopin', 'satie', 'glass'];

const clamp01 = x => Math.max(0, Math.min(1, x));
const quantile = (arr, q) => {
  const s = arr.filter(Number.isFinite).slice().sort((x, y) => x - y);
  if (!s.length) return NaN;
  const p = (s.length - 1) * q, lo = Math.floor(p);
  return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (p - lo);
};

// -------------------------------------------------------- section engine --
// 4-year blocks, classified by quantiles of climate state and variability.
function buildSections(rows, cs, va, blockLen = 48) {
  const n = rows.length;
  const blocks = [];
  for (let i0 = 0; i0 < n; i0 += blockLen) {
    const i1 = Math.min(n, i0 + blockLen);
    let sc = 0, sv = 0, c = 0;
    for (let i = i0; i < i1; i++) { sc += cs[i]; sv += va[i]; c++; }
    blocks.push({ i0, i1, cs: sc / c, va: sv / c });
  }
  const csQ25 = quantile(blocks.map(b => b.cs), 0.25);
  const csQ75 = quantile(blocks.map(b => b.cs), 0.75);
  const vaQ70 = quantile(blocks.map(b => b.va), 0.70);
  for (const b of blocks) {
    b.type = b.va > vaQ70 ? 'agitato' : b.cs < csQ25 ? 'solo' : b.cs > csQ75 ? 'tutti' : 'duo';
  }
  const sect = new Array(n), sectStart = new Array(n).fill(false);
  for (const b of blocks) {
    for (let i = b.i0; i < b.i1; i++) sect[i] = b.type;
    sectStart[b.i0] = true;
  }
  return { blocks, sect, sectStart };
}

// ---------------------------------------------------------------- builder --
export function buildClassicScore(material, id, opts = {}) {
  const st = CLASSICS[id];
  const scale = SCALES[st.scale];
  const root = st.root;
  const spm = st.spm * (opts.tempoMult || 1);
  const rows = material.rows;
  const stats = material.stats;
  const rand = mulberry32(opts.seed ?? 1234);
  const n = rows.length;
  const ev = [];
  const lead = 0.4;
  const T = i => lead + i * spm;

  const val = rows.map(r => r.anomaly);
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
  const { sect, sectStart } = buildSections(rows, cs, va);

  const piano = (t, midi, vel, dur = 1.6, pan = 0) =>
    ev.push({ t, dur: Math.max(0.9, dur), track: 'melody', voice: 'piano', f: midiFreq(midi), vel, pan, send: { verb: 0.38 } });
  const cembalo = (t, midi, vel, dur = 0.5, pan = 0) =>
    ev.push({ t, dur, track: 'melody', voice: 'pluck', f: midiFreq(midi), vel, bright: 0.75, pan, send: { verb: 0.25, delay: 0.12 } });
  const bassNote = (t, midi, vel, dur = 1.6) =>
    ev.push({ t, dur, track: 'bass', voice: 'sub', f: midiFreq(midi), vel, send: { verb: 0.15 } });
  const strings = (t, midis, vel, dur, pan = 0) =>
    ev.push({ t, dur, track: 'pad', voice: 'pad', fs: midis.map(midiFreq), vel, bright: 0.3, pan, send: { verb: 0.5 } });
  const bell = (t, midi, vel) =>
    ev.push({ t, dur: 2.2, track: 'extremes', voice: 'bell', f: midiFreq(midi), vel, send: { verb: 0.5, delay: 0.2 } });

  // cadence at every section boundary: V–I in the bass + a settling chord
  const cadence = i => {
    if (i === 0) return;
    bassNote(T(i) - 2 * spm, root - 5, 0.22, spm * 2);
    bassNote(T(i), root - 12, 0.26, spm * 4);
    strings(T(i), scaleChord(root, scale, 0, root + 3, 3), 0.09, spm * 8);
  };

  rows.forEach((r, i) => {
    const midi = M(val[i]);
    const s = sect[i];
    const deg = Math.round(cs[i] * 4);
    if (sectStart[i]) cadence(i);
    const yearStart = r.month === 1;
    const decade = yearStart && r.year % 10 === 0;

    switch (id) {
      case 'bach': {
        // motor eighths; the melody is the data, a canon voice follows it
        // eight months later a fifth below — the climate imitates itself
        cembalo(T(i), midi, 0.3 + 0.1 * cs[i], spm * 1.6);
        if (s === 'agitato' && Number.isFinite(val[i + 1]) && rand() < 0.6) {
          cembalo(T(i) + spm / 2, M((val[i] + val[i + 1]) / 2), 0.16, spm * 0.9);   // passing 16th
        }
        if (s !== 'solo' && i >= 8) cembalo(T(i), snapToScale(M(val[i - 8]) - 7, root, scale), 0.2, spm * 1.5, -0.35);
        if (s === 'tutti') cembalo(T(i), midi + 12, 0.14, spm * 1.2, 0.35);
        if (i % 4 === 0) {
          const walk = (i % 8 === 0) ? 0 : 7;                    // walking continuo
          bassNote(T(i), snapToScale(root - 12 + walk, root, scale), 0.24, spm * 4.5);
        }
        break;
      }
      case 'mozart': {
        piano(T(i), midi, 0.28 + 0.08 * cs[i], spm * 2.2);
        if (i % 8 === 7) piano(T(i) - spm * 0.3, snapToScale(midi + 2, root, scale), 0.17, spm);  // appoggiatura
        if (s !== 'solo') {
          const ch = scaleChord(root, scale, deg, root, 3);       // alberti: root–5th–3rd–5th
          const alberti = [ch[0], ch[2], ch[1], ch[2]];
          piano(T(i), alberti[i % 4] - 12, 0.13, spm * 1.4, -0.2);
        } else if (i % 4 === 0) {
          bassNote(T(i), root - 12, 0.18, spm * 4);
        }
        if (s === 'tutti' && i % 8 === 0) strings(T(i), scaleChord(root, scale, deg, root + 7, 3), 0.08, spm * 9, 0.3);
        break;
      }
      case 'beethoven': {
        const sfz = r.hot || r.record;
        piano(T(i), midi, sfz ? 0.5 : 0.3, spm * 2);
        if (sfz) piano(T(i), midi - 12, 0.34, spm * 2);           // sforzando octaves
        if (sectStart[i]) {                                       // the motif, stated low
          for (let k = 0; k < 4 && i + k < n; k++) piano(T(i) + k * spm * 2, M(val[i + k]) - 24, 0.4, spm * 2.4);
        }
        if (s === 'agitato') strings(T(i), [midi - 5], 0.09, spm * 1.3, 0.25);   // tremolo pulse
        else if (i % 8 === 0) strings(T(i), scaleChord(root, scale, deg, root + 3, s === 'tutti' ? 4 : 3), 0.1, spm * 9, 0.2);
        if (i % 4 === 0) bassNote(T(i), root - 12 + (i % 16 === 8 ? 7 : 0), 0.26, spm * 4.5);
        if (decade) for (const dm of scaleChord(root, scale, 0, root - 12, 3)) piano(T(i), dm, 0.42, spm * 6);
        break;
      }
      case 'chopin': {
        if (i % 4 === 0) {                                        // nocturne arpeggio, LH
          const ch = scaleChord(root, scale, deg, root - 12, 3);
          const arp = [ch[0] - 12, ch[0], ch[1], ch[2], ch[1] + 12, ch[2] + 12];
          arp.forEach((m2, j) => piano(T(i) + j * (spm * 4 / 6), m2, 0.12, spm * 3.2, -0.25));
        }
        const melEvery = s === 'agitato' ? 1 : 2;
        if (i % melEvery === 0) {
          const rub = (rand() - 0.5) * spm * 0.8 * va[i];          // rubato from variability
          piano(T(i) + rub, M(groupMean(i, melEvery)), 0.3, spm * 4, 0.15);
        }
        if (r.record) for (let k = 0; k < 5; k++) piano(T(i) - (5 - k) * spm / 3, snapToScale(midi + 12 - k * 2, root, scale), 0.12, spm * 0.8, 0.2);
        break;
      }
      case 'satie': {
        const ph = i % 6;
        if (sect[i] && sectStart[i]) break;                       // one breath of rest at boundaries
        if (ph === 0) bassNote(T(i), root - 12 + (Math.floor(i / 6) % 2 ? 7 : 0), 0.2, spm * 6);
        if (ph === 2 || ph === 4) strings(T(i), scaleChord(root, scale, deg, root, 3), 0.09, spm * 3.4, ph === 2 ? -0.2 : 0.2);
        if (ph === 0) piano(T(i) + spm, M(groupMean(i, 6)), 0.26, spm * 5.5, 0.1);
        break;
      }
      case 'glass': {
        // additive 16th cells over the current chord; agitato adds a 7th step
        const cellLen = s === 'agitato' ? 7 : 6;
        const base = M(groupMean(i - (i % 12), 12));              // cell register = year-ish mean
        const ch = scaleChord(root, scale, deg, base, 3);
        const cell = [ch[0], ch[1], ch[2], ch[1], ch[0] + 12, ch[2]];
        if (cellLen === 7) cell.push(ch[1] + 12);
        const m2 = cell[i % cellLen];
        cembalo(T(i), m2, 0.22 + 0.06 * cs[i], spm * 1.4, (i % 2 ? 0.2 : -0.2));
        if (s === 'tutti' && i % 12 === 0) strings(T(i), scaleChord(root, scale, deg, root + 7, 3), 0.08, spm * 13);
        if (i % 24 === 0) bassNote(T(i), root - 12, 0.22, spm * 12);
        if (r.hot && i % 2 === 0) bell(T(i), m2 + 12, 0.1);
        break;
      }
    }

    // shared accents: records shimmer, decades anchor (all composers)
    if (r.record && id !== 'chopin') bell(T(i), snapToScale(midi + 12, root, scale), 0.12);
    if (decade && id !== 'beethoven') bassNote(T(i), root - 24 < 24 ? root - 12 : root - 24, 0.24, spm * 8);
  });

  const sounding = derivePlayed(ev, rows, { lead, spm, melLo, melHi, vLo, vHi });
  const sectStarts = [];
  rows.forEach((_, i) => { if (sectStart[i] && i > 0) sectStarts.push(i); });

  return {
    events: ev,
    duration: lead + n * spm + 3,
    mix: st.mix,
    meta: {
      styleId: id, spm, lead, rows,
      bodyEnd: lead + n * spm,
      monthNotes: sounding.monthNotes,
      played: sounding.played,
      sectStarts,
      sections: sect,
      mapRule: { lo: vLo, hi: vHi, noteLo: midiName(melLo), noteHi: midiName(melHi), scale: st.scale, source: 'anomaly' }
    }
  };
}
