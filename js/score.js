// score.js — turns climate material into an event score.
// The mapping rules are deliberately simple and identical across styles:
//   one month = one beat · warmer = higher pitch · extremes = accents
//   melody = monthly values · bass = 10-year trend · pad = seasonal cycle
// Styles only change tempo, timbre, rhythm patterns and fx.

export const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  pentMinor: [0, 3, 5, 7, 10],
  major: [0, 2, 4, 5, 7, 9, 11]
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const midiName = m => NOTE_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
export const midiFreq = m => 440 * Math.pow(2, (m - 69) / 12);

export function snapToScale(midi, root, scale) {
  const rel = midi - root, oct = Math.floor(rel / 12), pc = ((rel % 12) + 12) % 12;
  let best = scale[0], bd = 99;
  for (const s of scale) { const d = Math.abs(s - pc); if (d < bd) { bd = d; best = s; } }
  return root + oct * 12 + best;
}

const clamp01 = x => Math.max(0, Math.min(1, x));

function mapToMidi(v, lo, hi, midiLo, midiHi, root, scale) {
  const n = hi > lo ? clamp01((v - lo) / (hi - lo)) : 0.5;
  return snapToScale(Math.round(midiLo + n * (midiHi - midiLo)), root, scale);
}

function scaleChord(root, scale, degree, midiLo, size = 3) {
  const notes = [];
  for (let i = 0; i < size; i++) {
    const d = degree + i * 2, oct = Math.floor(d / scale.length);
    notes.push(root + scale[((d % scale.length) + scale.length) % scale.length] + 12 * oct);
  }
  // move chord into register
  return notes.map(n => { while (n < midiLo) n += 12; while (n > midiLo + 24) n -= 12; return n; });
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ styles --
// city/years = the "score" of the studio card; refs = sonic references.
export const STYLES = {
  dub: {
    bpm: 120, scale: 'minor', root: 45, swing: 0,
    city: 'berlin', years: [1995, 2020], refs: 'Basic Channel · Deepchord',
    mix: { delayTime: 0.375, delayFb: 0.58, verbSec: 3.4, verbDecay: 2.8, duck: 0.38 }
  },
  hypnotic: {
    bpm: 122, scale: 'pentMinor', root: 45, swing: 0,
    city: 'tokyo', years: [1995, 2020], refs: 'Donato Dozzy · Plastikman',
    mix: { delayTime: 0.369, delayFb: 0.42, verbSec: 2.2, verbDecay: 2.6, duck: 0.3 }
  },
  driving: {
    bpm: 128, scale: 'minor', root: 45, swing: 0,
    city: 'detroit', years: [1998, 2020], refs: 'Jeff Mills · Robert Hood',
    mix: { delayTime: 0.352, delayFb: 0.35, verbSec: 1.9, verbDecay: 2.4, duck: 0.45 }
  },
  acid: {
    bpm: 130, scale: 'phrygian', root: 45, swing: 0.10,
    city: 'chicago', years: [1998, 2020], refs: 'Phuture · DJ Pierre',
    mix: { delayTime: 0.346, delayFb: 0.38, verbSec: 1.7, verbDecay: 2.4, duck: 0.42 }
  },
  electro: {
    bpm: 125, scale: 'minor', root: 45, swing: 0,
    city: 'newyork', years: [1998, 2020], refs: 'Drexciya · Afrika Bambaataa',
    mix: { delayTime: 0.36, delayFb: 0.32, verbSec: 1.8, verbDecay: 2.4, duck: 0.35 }
  },
  industrial: {
    bpm: 132, scale: 'phrygian', root: 43, swing: 0,
    city: 'birmingham', years: [1990, 2020], refs: 'Surgeon · Ancient Methods · Perc',
    mix: { delayTime: 0.341, delayFb: 0.45, verbSec: 1.6, verbDecay: 2.0, duck: 0.3 }
  },
  idm: {
    bpm: 109, scale: 'dorian', root: 47, swing: 0.08,
    city: 'manchester', years: [1998, 2020], refs: 'Aphex Twin · Autechre',
    mix: { delayTime: 0.413, delayFb: 0.4, verbSec: 2.2, verbDecay: 2.6, duck: 0.25 }
  },
  downtempo: {
    bpm: 100, scale: 'dorian', root: 48, swing: 0.09,
    city: 'lisbon', years: [2000, 2020], refs: 'Bonobo · Four Tet · Ben Böhmer',
    mix: { delayTime: 0.45, delayFb: 0.35, verbSec: 2.6, verbDecay: 2.6, duck: 0.3 }
  },
  triphop: {
    bpm: 86, scale: 'minor', root: 45, swing: 0.13,
    city: 'london', years: [2000, 2020], refs: 'Massive Attack · Portishead',
    mix: { delayTime: 0.523, delayFb: 0.4, verbSec: 3.0, verbDecay: 2.6, duck: 0.35 }
  },
  neoclassic: {
    bpm: 100, scale: 'minor', root: 57, swing: 0,
    city: 'paris', years: [2000, 2020], refs: 'Nils Frahm · Max Richter',
    mix: { delayTime: 0.6, delayFb: 0.25, verbSec: 3.6, verbDecay: 2.8, duck: 0 }
  },
  ambient: {
    bpm: 50, scale: 'dorian', root: 50, swing: 0,
    city: 'reykjavik', years: [2008, 2020], refs: 'Brian Eno · Stars of the Lid · GAS',
    mix: { delayTime: 0.9, delayFb: 0.45, verbSec: 5.5, verbDecay: 3.2, duck: 0 }
  },
  drone: {
    bpm: 30, scale: 'phrygian', root: 38, swing: 0,
    city: 'oslo', years: [2013, 2020], refs: 'Tim Hecker · Thomas Köner · Basinski',
    mix: { delayTime: 1.1, delayFb: 0.5, verbSec: 6.5, verbDecay: 3.4, duck: 0 }
  }
};

export const STYLE_ORDER = ['downtempo', 'dub', 'hypnotic', 'driving', 'acid', 'electro',
  'industrial', 'idm', 'triphop', 'neoclassic', 'ambient', 'drone'];

// seconds per month: one month = one beat (beat styles); ambient/drone slower
function styleSpm(id) {
  if (id === 'ambient') return 1.2;
  if (id === 'drone') return 2.0;
  return 60 / STYLES[id].bpm;
}

// ---------------------------------------------------------- climate score --
// material: from data.buildMaterial() · opts: {source, tempoMult, seed}
export function buildClimateScore(material, styleId, opts = {}) {
  const st = STYLES[styleId];
  const scale = SCALES[st.scale];
  const root = st.root;
  const spm = styleSpm(styleId) * (opts.tempoMult || 1);
  const swing = st.swing * spm / 4;
  const rows = material.rows;
  const stats = material.stats;
  const rand = mulberry32(opts.seed ?? 1234);
  const ev = [];
  const lead = 0.4;                        // lead-in silence
  const beatStyle = !['neoclassic', 'ambient', 'drone'].includes(styleId);

  // melody source values + range
  const source = opts.source || 'anomaly';
  const val = rows.map(r =>
    source === 'trend' ? r.trend :
    source === 'blend' ? 0.55 * r.anomaly + 0.45 * r.trend : r.anomaly);
  const vLo = source === 'trend' ? stats.trendLo : stats.lo;
  const vHi = source === 'trend' ? stats.trendHi : stats.hi;
  const melLo = styleId === 'neoclassic' ? root + 3 : root + 12;
  const melHi = melLo + 24;                // two octaves — the classic rule

  const T = (mi, slot = 0) => lead + mi * spm + slot * spm / 4 + ((slot % 2) ? swing : 0);
  const hum = () => (rand() - 0.5) * 0.006;
  const vj = () => 1 + (rand() - 0.5) * 0.14;

  // At fast month rates (long time windows in learn mode) thin the beat:
  // one drum "beat" spans 1, 2 or 4 months so the groove keeps a musical tempo
  // while the melody still plays every month.
  const beatEvery = !beatStyle ? 1 : spm >= 0.38 ? 1 : spm >= 0.19 ? 2 : 4;
  const bDur = spm * beatEvery;
  const bSwing = st.swing * bDur / 4;
  const TB = (mi, slot = 0) => lead + mi * spm + slot * bDur / 4 + ((slot % 2) ? bSwing : 0);

  const monthNotes = [];

  rows.forEach((r, i) => {
    const n01 = clamp01((val[i] - vLo) / (vHi - vLo));         // warm = high
    const midi = mapToMidi(val[i], vLo, vHi, melLo, melHi, root, scale);
    monthNotes.push(midiName(midi));
    const f = midiFreq(midi);
    const bright = 0.2 + 0.6 * n01;
    const velMel = 0.5 + 0.4 * Math.abs(r.anomaly - stats.mean) / (2 * stats.sd + 0.001);
    const trendMidi = mapToMidi(r.trend, stats.trendLo, stats.trendHi, root - 12, root - 2, root, scale);
    const fBass = midiFreq(trendMidi);
    const degree = Math.round(n01 * 5);
    const yearStart = r.month === 1;

    // ---------- melody ----------
    switch (styleId) {
      case 'dub':
        ev.push({ t: T(i, 2) + hum(), dur: spm * 0.7, track: 'melody', voice: 'stab', fs: scaleChord(root, scale, degree, root + 12).map(midiFreq), vel: 0.24 * vj(), bright: 0.15 + 0.45 * n01, send: { delay: 0.55, verb: 0.25 } });
        break;
      case 'hypnotic':
        ev.push({ t: T(i, 0) + hum(), dur: spm * 0.4, track: 'melody', voice: 'pluck', f, vel: 0.3 * velMel * vj(), bright, send: { delay: 0.4, verb: 0.12 } });
        ev.push({ t: T(i, 2) + hum(), dur: spm * 0.3, track: 'melody', voice: 'pluck', f: midiFreq(snapToScale(midi + 7, root, scale)), vel: 0.2 * vj(), bright: bright * 0.8, send: { delay: 0.45, verb: 0.1 } });
        break;
      case 'driving':
        if (i % 2 === 0) ev.push({ t: T(i, 0), dur: spm * 0.55, track: 'melody', voice: 'stab', fs: scaleChord(root, scale, degree, root + 24).map(midiFreq), vel: 0.22 * vj(), bright: 0.5 + 0.5 * n01, send: { delay: 0.3, verb: 0.15 } });
        if (r.hot) for (const s of [1, 3]) ev.push({ t: T(i, s), dur: spm * 0.2, track: 'melody', voice: 'acid', f: f * 2, vel: 0.16, bright: n01, send: { delay: 0.35 } });
        break;
      case 'acid': {
        // the 303 line: cutoff opens with the anomaly
        const pattern = [0, 2, 3];
        for (const s of pattern) {
          if (rand() < 0.18) continue;
          const acc = r.hot || (s === 0 && r.record);
          const prev = i > 0 ? midiFreq(mapToMidi(val[i - 1], vLo, vHi, melLo, melHi, root, scale)) : null;
          ev.push({ t: T(i, s), dur: spm * 0.24, track: 'melody', voice: 'acid', f, slide: s === 0 && prev && Math.abs(prev - f) > 1 ? prev : null, accent: acc, vel: 0.32 * vj(), bright: n01, send: { delay: 0.3, verb: 0.08 } });
        }
        break;
      }
      case 'electro':
        for (const s of [0, 3]) ev.push({ t: T(i, s) + hum(), dur: spm * 0.3, track: 'melody', voice: 'pluck', f: s === 3 ? f / 2 : f, vel: 0.28 * vj() * (s === 3 ? 0.7 : 1), bright, send: { delay: 0.25, verb: 0.1 } });
        break;
      case 'industrial':
        if (i % 2 === 0) ev.push({ t: T(i, 0), dur: spm * 0.8, track: 'melody', voice: 'bell', f: f * 1.5, vel: 0.17 * vj(), send: { verb: 0.35, delay: 0.3 } });
        break;
      case 'idm': {
        const jumpOct = rand() < 0.2 ? 12 : 0;
        ev.push({ t: T(i, rand() < 0.3 ? 1 : 0) + hum(), dur: spm * 0.5, track: 'melody', voice: 'pluck', f: midiFreq(midi + jumpOct), vel: 0.3 * velMel * vj(), bright, send: { delay: 0.4, verb: 0.15 } });
        break;
      }
      case 'downtempo':
        ev.push({ t: T(i, 0) + hum(), dur: spm * 0.8, track: 'melody', voice: 'pluck', f, vel: 0.32 * velMel * vj(), bright, send: { delay: 0.3, verb: 0.2 } });
        break;
      case 'triphop':
        if (i % 2 === 0) ev.push({ t: T(i, 0) + hum(), dur: spm * 1.2, track: 'melody', voice: 'pluck', f, vel: 0.3 * velMel * vj(), bright: bright * 0.8, send: { delay: 0.35, verb: 0.25 } });
        break;
      case 'neoclassic':
        ev.push({ t: T(i, 0) + hum() * 2, dur: Math.max(1.2, spm * 1.6), track: 'melody', voice: 'piano', f, vel: 0.34 * velMel * vj(), send: { verb: 0.4 } });
        break;
      case 'ambient':
        ev.push({ t: T(i, 0), dur: spm * 3, track: 'melody', voice: 'pad', f, vel: 0.16 * vj(), bright: 0.25 + 0.35 * n01, pan: (rand() - 0.5) * 0.8, send: { verb: 0.5, delay: 0.2 } });
        break;
      case 'drone':
        if (i % 2 === 0) ev.push({ t: T(i, 0), dur: spm * 2.6, track: 'melody', voice: 'drone', f: f / 2, vel: 0.2 * vj(), bright: 0.15 + 0.3 * n01, send: { verb: 0.5 } });
        break;
    }

    // ---------- bass = trend ----------
    const gi = Math.floor(i / beatEvery);          // beat-group index
    const onBeat = i % beatEvery === 0;
    if (styleId === 'neoclassic') {
      if (yearStart) ev.push({ t: T(i, 0), dur: spm * 3.5, track: 'bass', voice: 'sub', f: fBass, vel: 0.14, send: { verb: 0.2 } });
    } else if (styleId === 'ambient' || styleId === 'drone') {
      if (i % 4 === 0) ev.push({ t: T(i, 0), dur: spm * 4.5, track: 'bass', voice: 'sub', f: fBass, vel: 0.22 });
    } else if (styleId === 'electro') {
      if (onBeat) for (const s of [0, 3]) ev.push({ t: TB(i, s), dur: bDur * 0.35, track: 'bass', voice: 'sub', f: s === 3 ? fBass * 2 : fBass, vel: 0.34 * (s === 3 ? 0.6 : 1) });
    } else if (styleId === 'hypnotic') {
      if (onBeat && gi % 2 === 1) ev.push({ t: TB(i, 0), dur: bDur * 0.8, track: 'bass', voice: 'sub', f: fBass, vel: 0.32 });
    } else if (onBeat) {
      // per-style sub weight: industrial lives on noise, dub/triphop on sub
      const bv = { dub: 0.34, triphop: 0.34, driving: 0.27, acid: 0.25, industrial: 0.15, idm: 0.27, downtempo: 0.26 }[styleId] ?? 0.3;
      ev.push({ t: TB(i, 0), dur: bDur * (beatStyle ? 0.85 : 2), track: 'bass', voice: 'sub', f: fBass, vel: bv * (yearStart ? 1.25 : 1) });
    }

    // ---------- pad = seasonal cycle (or hemispheres for the global record) --
    const padEvery = beatStyle ? 4 * beatEvery : 2;
    if (i % padEvery === 0) {
      if (r.nh != null && r.sh != null) {
        const fN = midiFreq(mapToMidi(r.nh, -3, 17, root + 7, root + 19, root, scale));
        const fS = midiFreq(mapToMidi(r.sh, 11, 19, root + 7, root + 19, root, scale));
        ev.push({ t: T(i, 0), dur: spm * padEvery * 1.4, track: 'pad', voice: 'pad', f: fN, vel: 0.09, pan: -0.6, bright: 0.3, send: { verb: 0.4 } });
        ev.push({ t: T(i, 0), dur: spm * padEvery * 1.4, track: 'pad', voice: 'pad', f: fS, vel: 0.09, pan: 0.6, bright: 0.3, send: { verb: 0.4 } });
      } else {
        const sMidi = snapToScale(Math.round(root + 7 + r.season * 12), root, scale);
        ev.push({ t: T(i, 0), dur: spm * padEvery * 1.4, track: 'pad', voice: 'pad', f: midiFreq(sMidi), vel: styleId === 'neoclassic' ? 0.11 : 0.08, bright: 0.25 + 0.3 * r.season, pan: (i / rows.length - 0.5) * 0.6, send: { verb: 0.45 } });
      }
    }

    // ---------- drums (one "beat" = beatEvery months) ----------
    if (beatStyle && onBeat) {
      const punch = { dub: 0.35, hypnotic: 0.5, driving: 0.72, acid: 0.65, electro: 0.6, industrial: 0.85, idm: 0.55, downtempo: 0.42, triphop: 0.5 }[styleId] ?? 0.5;
      const drive = styleId === 'industrial' ? 0.8 : 0;
      const kick = (s, v) => ev.push({ t: TB(i, s), dur: 0.4, track: 'perc', voice: 'kick', vel: v, punch, drive });
      const hat = (s, v, open) => ev.push({ t: TB(i, s), dur: 0.3, track: 'perc', voice: 'hat', vel: v * vj(), open });
      switch (styleId) {
        case 'triphop':
          kick(0, 0.5); if (gi % 2 === 1) { ev.push({ t: TB(i, 0), dur: 0.3, track: 'perc', voice: 'snare', vel: 0.3 }); }
          if (rand() < 0.35) kick(3, 0.25);
          hat(2, 0.1);
          break;
        case 'idm': {
          kick(0, 0.45);
          const sSlot = gi % 2 === 1 ? (rand() < 0.3 ? 1 : 0) : (rand() < 0.2 ? 2 : -1);
          if (sSlot >= 0) ev.push({ t: TB(i, sSlot), dur: 0.3, track: 'perc', voice: 'snare', vel: 0.26 });
          for (const s of [1, 2, 3]) if (rand() < 0.4) hat(s, 0.08 + 0.06 * rand());
          break;
        }
        case 'electro':
          kick(0, 0.5); if (gi % 2 === 0) kick(3, 0.3);
          if (gi % 2 === 1) ev.push({ t: TB(i, 0), dur: 0.3, track: 'perc', voice: 'clap', vel: 0.28 });
          hat(2, 0.2); if (rand() < 0.3) hat(1, 0.11);
          break;
        case 'downtempo':
          kick(0, 0.45); if (gi % 2 === 1) ev.push({ t: TB(i, 0), dur: 0.3, track: 'perc', voice: 'clap', vel: 0.2 });
          for (const s of [1, 3]) ev.push({ t: TB(i, s), dur: 0.2, track: 'perc', voice: 'shaker', vel: 0.13 * vj() });
          break;
        default: {                            // four on the floor family
          kick(0, styleId === 'dub' ? 0.42 : 0.52);
          // hat weight sets the genre's brightness: dub darkest, driving/industrial brightest
          const hv = { dub: 0.05, hypnotic: 0.17, driving: 0.26, acid: 0.22, industrial: 0.24 }[styleId] ?? 0.13;
          hat(2, hv, gi % 4 === 3 && styleId !== 'dub');
          if (styleId === 'driving') { hat(1, 0.11); hat(3, 0.13); }
          if (styleId !== 'dub' && gi % 2 === 1) ev.push({ t: TB(i, 0), dur: 0.3, track: 'perc', voice: 'clap', vel: 0.2 });
          if (styleId === 'hypnotic') for (const s of [1, 3]) hat(s, 0.06 + 0.05 * (s === 3 ? 1 : 0));
          if (styleId === 'industrial') {
            if (gi % 2 === 0) ev.push({ t: TB(i, 2), dur: 0.3, track: 'perc', voice: 'snare', vel: 0.34, metal: true });
            for (const s of [1, 3]) hat(s, 0.14);
          }
        }
      }
    }

    // ---------- extremes: records, jumps, heat runs, cold snaps ----------
    if (r.hot && beatStyle) for (const s of [1, 3]) ev.push({ t: T(i, s), dur: 0.25, track: 'extremes', voice: 'hat', vel: 0.14, open: s === 3 });
    if (r.runStart && beatStyle) ev.push({ t: T(i, 2), dur: 0.3, track: 'extremes', voice: 'hat', vel: 0.2, open: true });
    if (r.record) {
      if (beatStyle) {
        ev.push({ t: T(Math.max(0, i - 4), 0), dur: spm * 4, track: 'extremes', voice: 'riser', vel: 0.12 });
        ev.push({ t: T(i, 0), dur: 1.2, track: 'extremes', voice: 'ride', vel: 0.12 });
      } else {
        ev.push({ t: T(i, 0), dur: 2.2, track: 'extremes', voice: 'bell', f: midiFreq(snapToScale(midi + 12, root, scale)), vel: 0.14, send: { verb: 0.5, delay: 0.3 } });
      }
    }
    if (r.jump && beatStyle) {
      if (styleId === 'industrial') ev.push({ t: T(i, 1), dur: 0.3, track: 'extremes', voice: 'snare', vel: 0.3, metal: true });
      else if (styleId === 'idm') for (const s of [1, 1.5, 2, 2.5, 3]) ev.push({ t: lead + i * spm + s * spm / 4, dur: 0.1, track: 'extremes', voice: 'hat', vel: 0.1 });
      else ev.push({ t: T(i, 2), dur: 0.25, track: 'extremes', voice: 'clap', vel: 0.16 });
    }
    if (r.cold && !beatStyle) ev.push({ t: T(i, 0), dur: spm * 2, track: 'extremes', voice: 'sub', f: midiFreq(root - 12), vel: 0.12 });
  });

  // texture
  if (styleId === 'triphop') ev.push({ t: 0, dur: lead + rows.length * spm + 1, track: 'texture', voice: 'vinyl', vel: 0.05 });

  return {
    events: ev,
    duration: lead + rows.length * spm + 2.5,
    mix: st.mix,
    meta: {
      styleId, spm, lead, rows,
      bodyEnd: lead + rows.length * spm,     // musical end (before the fx tail)
      monthNotes,
      mapRule: { lo: vLo, hi: vHi, noteLo: midiName(melLo), noteHi: midiName(melHi), scale: st.scale, source }
    }
  };
}

// ------------------------------------------------------------ paleo score --
// tracks: [{dataset, series, voice, octave(2|4|6), gain}] · opts: {from,to,stepSec,root,scaleId}
import { paleoOnGrid, quantile } from './data.js';

export function buildPaleoScore(tracks, opts = {}) {
  const from = opts.from ?? 0, to = opts.to ?? 800;
  const span = to - from;
  const n = Math.max(120, Math.min(440, Math.round(span / 2)));
  const step = span / n;
  const stepSec = opts.stepSec ?? 0.14;
  const root = opts.root ?? 45;
  const scale = SCALES[opts.scaleId || 'minor'];
  const grid = Array.from({ length: n + 1 }, (_, i) => from + i * step);
  const ev = [];
  const lead = 0.4;
  const active = tracks.filter(tr => tr.dataset && tr.dataset !== 'off' && tr.series);
  const meta = { stepKyr: step, stepSec, lead, ages: [], tracks: [] };

  // playback runs oldest -> present: step i corresponds to age = to - i*step
  for (let i = 0; i <= n; i++) meta.ages.push(to - i * step);

  active.forEach((tr, ti) => {
    // time shift (lead–lag teaching tool): evaluate the series `offset` kyr
    // earlier, i.e. a positive shift moves its features towards the present
    const offset = tr.offset || 0;
    const vals = paleoOnGrid(tr.series, offset ? grid.map(g => g - offset) : grid);
    const fin = vals.filter(Number.isFinite);
    if (!fin.length) return;
    const lo = quantile(fin, 0.02), hi = quantile(fin, 0.98);
    const oct = tr.octave ?? 4;
    const midiLo = oct * 12 + 12, midiHi = midiLo + 22;
    const pan = active.length > 1 ? (ti / (active.length - 1)) * 1.2 - 0.6 : 0;
    const gain = tr.gain ?? 1;
    const norm = [], raw = [];
    for (let i = 0; i <= n; i++) {
      const v = vals[n - i];                        // reversed: old -> present
      norm.push(Number.isFinite(v) ? clamp01((v - lo) / (hi - lo)) : NaN);
      raw.push(Number.isFinite(v) ? +v.toPrecision(4) : NaN);
    }
    meta.tracks.push({ dataset: tr.dataset, voice: tr.voice, norm, raw, pan, offset });

    for (let i = 0; i <= n; i++) {
      const x = norm[i];
      if (!Number.isFinite(x)) continue;
      const t = lead + i * stepSec;
      const midi = snapToScale(Math.round(midiLo + x * (midiHi - midiLo)), root, scale);
      const f = midiFreq(midi);
      const bright = 0.2 + 0.5 * x;
      switch (tr.voice) {
        case 'pad':
          if (i % 2 === 0) ev.push({ t, dur: stepSec * 3.2, track: 'pad', voice: 'pad', f, vel: 0.1 * gain, pan, bright, send: { verb: 0.45 } });
          break;
        case 'bass':
          if (i % 2 === 0) ev.push({ t, dur: stepSec * 2.4, track: 'bass', voice: 'sub', f: f / 2, vel: 0.3 * gain, pan: pan * 0.3 });
          break;
        case 'bell':
          if (i % 2 === 0) ev.push({ t, dur: stepSec * 4, track: 'melody', voice: 'bell', f, vel: 0.12 * gain, pan, send: { verb: 0.4, delay: 0.25 } });
          break;
        case 'lead':
          ev.push({ t, dur: stepSec * 1.1, track: 'melody', voice: 'pluck', f, vel: 0.26 * gain, pan, bright: 0.4 + 0.4 * x, send: { verb: 0.2, delay: 0.15 } });
          break;
        default:  // pluck
          ev.push({ t, dur: stepSec * 0.9, track: 'melody', voice: 'pluck', f, vel: 0.2 * gain, pan, bright, send: { verb: 0.25, delay: 0.2 } });
      }
    }

    // glacial terminations: fast melts in LR04 become deep impacts
    if (tr.dataset === 'lr04') {
      const win = Math.max(1, Math.round(10 / step));
      for (let i = win; i <= n; i++) {
        const a = norm[i - win], b = norm[i];
        if (Number.isFinite(a) && Number.isFinite(b) && a - b > 0.42) {
          ev.push({ t: lead + i * stepSec, dur: 2, track: 'extremes', voice: 'impact', f: 100, vel: 0.3, send: { verb: 0.5 } });
          i += win;
        }
      }
    }
  });

  // today marker: one closing tone far above everything heard — as far above
  // as today's CO₂ (424 ppm) sits above the entire glacial range (~180–280).
  let tail = 3;
  if (opts.todayMarker) {
    const tEnd = lead + (n + 1) * stepSec + 0.6;
    const fHigh = midiFreq(snapToScale(root + 46, root, scale));
    ev.push({ t: tEnd, dur: 3.2, track: 'extremes', voice: 'bell', f: fHigh, vel: 0.34, send: { verb: 0.55, delay: 0.3 } });
    ev.push({ t: tEnd, dur: 2.2, track: 'extremes', voice: 'impact', f: 90, vel: 0.26, send: { verb: 0.4 } });
    meta.today = true;
    tail = 5;
  }

  return {
    events: ev,
    duration: lead + (n + 1) * stepSec + tail,
    mix: { delayTime: stepSec * 3, delayFb: 0.4, verbSec: 4.5, verbDecay: 3, duck: 0 },
    meta
  };
}
