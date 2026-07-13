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

export function mapToMidi(v, lo, hi, midiLo, midiHi, root, scale) {
  const n = hi > lo ? clamp01((v - lo) / (hi - lo)) : 0.5;
  return snapToScale(Math.round(midiLo + n * (midiHi - midiLo)), root, scale);
}

// What actually sounds, month by month: derived from the built melody events
// (group means, octave jumps, scale snapping included), then mapped back to
// the °C axis so the plot can show the played note as a step line.
export function derivePlayed(events, rows, { lead, spm, melLo, melHi, vLo, vHi }) {
  const n = rows.length;
  const midiAt = new Array(n).fill(NaN);
  const velAt = new Array(n).fill(-1);
  for (const e of events) {
    if (e.track !== 'melody') continue;
    const f = e.f ?? (e.fs ? Math.min(...e.fs) : null);
    if (!f) continue;
    const i = Math.round((e.t - lead) / spm);
    if (i < 0 || i >= n) continue;
    if ((e.vel ?? 0) <= velAt[i]) continue;      // loudest event wins the month
    velAt[i] = e.vel ?? 0;
    midiAt[i] = Math.round(69 + 12 * Math.log2(f / 440));
  }
  // hold each note until the next one starts
  for (let i = 1; i < n; i++) if (!Number.isFinite(midiAt[i])) midiAt[i] = midiAt[i - 1];
  const span = Math.max(1e-6, melHi - melLo);
  const played = midiAt.map(m => Number.isFinite(m)
    ? vLo + Math.max(-0.2, Math.min(1.2, (m - melLo) / span)) * (vHi - vLo) : NaN);
  const monthNotes = midiAt.map(m => Number.isFinite(m) ? midiName(m) : '—');
  return { played, monthNotes };
}

export function scaleChord(root, scale, degree, midiLo, size = 3) {
  const notes = [];
  for (let i = 0; i < size; i++) {
    const d = degree + i * 2, oct = Math.floor(d / scale.length);
    notes.push(root + scale[((d % scale.length) + scale.length) % scale.length] + 12 * oct);
  }
  // move chord into register
  return notes.map(n => { while (n < midiLo) n += 12; while (n > midiLo + 24) n -= 12; return n; });
}

// ------------------------------------------------- segment ranking engine --
// "Quantil-Dramaturgie": the piece is split into blocks; blocks are RANKED
// by their mean climate state (Mittelwertsreihenfolge) and by their mean
// variability (Variabilitätsreihenfolge). The rank quintile gives the
// intensity level I (1..5: solo/pp … tutti/f), the rank tercile gives the
// character C (1 cantabile · 2 mosso · 3 agitato). Each segment therefore
// gets its own rule set; transitions carry a cadence whose weight is |ΔI|.
// The block with the highest rank sum is the CLIMAX, the lowest the STILL point.
export function buildSegmentPlan(rows, cs, va, blockLen = 96) {
  const n = rows.length;
  const blocks = [];
  for (let i0 = 0; i0 < n; i0 += blockLen) {
    const i1 = Math.min(n, i0 + blockLen);
    let sm = 0, sv = 0, c = 0;
    for (let i = i0; i < i1; i++) { sm += cs[i]; sv += va[i]; c++; }
    blocks.push({ i0, i1, m: sm / c, v: sv / c });
  }
  const k = blocks.length;
  const rank = key => {
    const order = blocks.slice().sort((a, b) => a[key] - b[key]);
    order.forEach((b, j) => { b['r' + key] = k > 1 ? j / (k - 1) : 0.5; });
  };
  rank('m'); rank('v');
  blocks.forEach(b => {
    b.I = 1 + Math.min(4, Math.floor(b.rm * 5));   // quintile of the mean ordering
    b.C = 1 + Math.min(2, Math.floor(b.rv * 3));   // tercile of the variability ordering
  });
  let climax = blocks[0], still = blocks[0];
  for (const b of blocks) {
    if (b.rm + b.rv > climax.rm + climax.rv) climax = b;
    if (b.rm + b.rv < still.rm + still.rv) still = b;
  }
  climax.climax = true; still.still = true;
  blocks.forEach((b, j) => { b.dI = j === 0 ? 0 : b.I - blocks[j - 1].I; });

  const CHAR = ['cantabile', 'mosso', 'agitato'];
  const seg = new Array(n);
  const segLabel = new Array(n);
  const starts = [];
  for (const b of blocks) {
    const label = (b.climax ? '★ ' : b.still ? '· ' : '') + `${'I'.repeat(0)}${b.I}/5 · ${CHAR[b.C - 1]}`;
    for (let i = b.i0; i < b.i1; i++) { seg[i] = b; segLabel[i] = label; }
    if (b.i0 > 0) starts.push(b.i0);
  }
  return { blocks, seg, segLabel, starts };
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
    city: 'berlin', years: [1850, 2020], fullMult: 0.25, refs: 'Basic Channel · Deepchord',
    mix: { delayTime: 0.375, delayFb: 0.58, verbSec: 3.4, verbDecay: 2.8, duck: 0.38 }
  },
  hypnotic: {
    bpm: 122, scale: 'pentMinor', root: 45, swing: 0,
    city: 'tokyo', years: [1850, 2020], fullMult: 0.25, refs: 'Donato Dozzy · Plastikman',
    mix: { delayTime: 0.369, delayFb: 0.42, verbSec: 2.2, verbDecay: 2.6, duck: 0.3 }
  },
  driving: {
    bpm: 128, scale: 'minor', root: 45, swing: 0,
    city: 'detroit', years: [1850, 2020], fullMult: 0.25, refs: 'Jeff Mills · Robert Hood',
    mix: { delayTime: 0.352, delayFb: 0.35, verbSec: 1.9, verbDecay: 2.4, duck: 0.45 }
  },
  acid: {
    bpm: 130, scale: 'phrygian', root: 45, swing: 0.10,
    city: 'chicago', years: [1850, 2020], fullMult: 0.25, refs: 'Phuture · DJ Pierre',
    mix: { delayTime: 0.346, delayFb: 0.38, verbSec: 1.7, verbDecay: 2.4, duck: 0.42 }
  },
  electro: {
    bpm: 125, scale: 'minor', root: 45, swing: 0,
    city: 'newyork', years: [1850, 2020], fullMult: 0.25, refs: 'Drexciya · Afrika Bambaataa',
    mix: { delayTime: 0.36, delayFb: 0.32, verbSec: 1.8, verbDecay: 2.4, duck: 0.35 }
  },
  industrial: {
    bpm: 132, scale: 'phrygian', root: 43, swing: 0,
    city: 'birmingham', years: [1850, 2020], fullMult: 0.25, refs: 'Surgeon · Ancient Methods · Perc',
    mix: { delayTime: 0.341, delayFb: 0.45, verbSec: 1.6, verbDecay: 2.0, duck: 0.3 }
  },
  idm: {
    bpm: 109, scale: 'dorian', root: 47, swing: 0.08,
    city: 'manchester', years: [1850, 2020], fullMult: 0.22, refs: 'Aphex Twin · Autechre',
    mix: { delayTime: 0.413, delayFb: 0.4, verbSec: 2.2, verbDecay: 2.6, duck: 0.25 }
  },
  downtempo: {
    bpm: 100, scale: 'dorian', root: 48, swing: 0.09,
    city: 'lisbon', years: [1850, 2020], fullMult: 0.21, refs: 'Bonobo · Four Tet · Ben Böhmer',
    mix: { delayTime: 0.45, delayFb: 0.35, verbSec: 2.6, verbDecay: 2.6, duck: 0.3 }
  },
  triphop: {
    bpm: 86, scale: 'minor', root: 45, swing: 0.13,
    city: 'london', years: [1850, 2020], fullMult: 0.18, refs: 'Massive Attack · Portishead',
    mix: { delayTime: 0.523, delayFb: 0.4, verbSec: 3.0, verbDecay: 2.6, duck: 0.35 }
  },
  neoclassic: {
    bpm: 100, scale: 'minor', root: 57, swing: 0,
    city: 'paris', years: [1850, 2020], fullMult: 0.2, refs: 'Nils Frahm · Max Richter',
    mix: { delayTime: 0.6, delayFb: 0.25, verbSec: 3.6, verbDecay: 2.8, duck: 0 }
  },
  ambient: {
    bpm: 50, scale: 'dorian', root: 50, swing: 0,
    city: 'reykjavik', years: [1850, 2020], fullMult: 0.1, refs: 'Brian Eno · Stars of the Lid · GAS',
    mix: { delayTime: 0.9, delayFb: 0.45, verbSec: 5.5, verbDecay: 3.2, duck: 0 }
  },
  drone: {
    bpm: 30, scale: 'phrygian', root: 38, swing: 0,
    city: 'oslo', years: [1850, 2020], fullMult: 0.06, refs: 'Tim Hecker · Thomas Köner · Basinski',
    mix: { delayTime: 1.1, delayFb: 0.5, verbSec: 6.5, verbDecay: 3.4, duck: 0 }
  }
};

export const STYLE_ORDER = ['drone', 'downtempo', 'dub', 'hypnotic', 'driving', 'acid',
  'electro', 'industrial', 'idm', 'triphop', 'neoclassic', 'ambient'];

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

  // Full-span mode (studio, 1850–2020): one beat spans 4 months, so melody
  // switches to the 16th grid — one month = one 16th note. Data-faithful and
  // stylistically right: at ~120 bpm a month is exactly a sixteenth.
  const gridMode = beatStyle && beatEvery > 1;

  // beatless styles: group months so note spacing keeps the style's pacing
  const melTarget = { neoclassic: 0.45, ambient: 1.2, drone: 4.0 }[styleId] || 0;
  const melEvery = !beatStyle ? Math.max(1, Math.round(melTarget / spm)) : 1;
  const groupVal = (i, g) => {
    let s = 0, c = 0;
    for (let k = i; k < Math.min(rows.length, i + g); k++) {
      if (Number.isFinite(val[k])) { s += val[k]; c++; }
    }
    return c ? s / c : val[i];
  };

  const monthNotes = [];

  // segment ranking plan (Quantil-Dramaturgie) — light integration for the
  // electronic styles: intensity gates the pad, character scales the ghosts,
  // strong upward jumps get a riser into the new segment
  const csArr = rows.map(r => clamp01(0.5 + ((r.trend - stats.trendLo) / Math.max(1e-6, stats.trendHi - stats.trendLo) - 0.5) * 1.6));
  const vaArr = rows.map(r => r.variab ?? 0.5);
  const plan = buildSegmentPlan(rows, csArr, vaArr, 48);

  // full form integration: segment dynamics (crescendo into each level) and
  // breakdowns — after a strong intensity drop the kick rests for 8 months
  const velSeg = new Array(rows.length).fill(1);
  const kickRest = new Array(rows.length).fill(false);
  for (const b of plan.blocks) {
    const from = 0.68 + (b.I - b.dI) * 0.065, to = 0.68 + b.I * 0.065 + (b.climax ? 0.05 : 0);
    for (let i = b.i0; i < b.i1; i++) velSeg[i] = from + (to - from) * Math.min(1, (i - b.i0) / 16);
    if (b.i0 > 0 && b.dI <= -1) for (let k = b.i0; k < Math.min(rows.length, b.i0 + 16); k++) kickRest[k] = true;
  }

  rows.forEach((r, i) => {
    const n01 = clamp01((val[i] - vLo) / (vHi - vLo));         // warm = high
    const midi = mapToMidi(val[i], vLo, vHi, melLo, melHi, root, scale);
    monthNotes.push(midiName(midi));
    const f = midiFreq(midi);
    const bright = 0.2 + 0.6 * n01;
    const velMel = 0.5 + 0.4 * Math.abs(r.anomaly - stats.mean) / (2 * stats.sd + 0.001);
    // climate-state macro: the trend, variance-expanded (movements around the
    // middle are exaggerated) — drives register, loudness, harmony, density
    const cs = csArr[i];
    // decadal variability of the anomaly — drives rhythmic complexity
    const va = vaArr[i];
    // wider trend register than before: the bass audibly climbs with the state
    const trendMidi = mapToMidi(r.trend, stats.trendLo, stats.trendHi, root - 14, root + 4, root, scale);
    const fBass = midiFreq(trendMidi);
    const chordSize = (cs > 0.62 || (plan.seg[i]?.I ?? 3) >= 4) ? 4 : 3;   // warm decades / intense segments get sevenths
    const degree = Math.round(n01 * 5);
    const yearStart = r.month === 1;

    // ---------- melody ----------
    if (gridMode) {
      // one month = one 16th note on the beat grid
      const sIB = i % beatEvery;                    // slot within the beat
      switch (styleId) {
        case 'dub':
          if (sIB === 2) ev.push({ t: T(i, 0), dur: bDur * 0.7, track: 'melody', voice: 'stab', fs: scaleChord(root, scale, degree, root + 12, chordSize).map(midiFreq), vel: 0.24 * vj(), bright: 0.15 + 0.45 * n01, send: { delay: 0.55, verb: 0.25 } });
          break;
        case 'hypnotic':
          ev.push({ t: T(i, 0), dur: spm * 1.6, track: 'melody', voice: 'pluck', f: i % 2 ? midiFreq(snapToScale(midi + 7, root, scale)) : f, vel: (i % 2 ? 0.2 : 0.3 * velMel) * vj(), bright, send: { delay: 0.4, verb: 0.1 } });
          break;
        case 'driving':
          if (i % (2 * beatEvery) === 0) ev.push({ t: T(i, 0), dur: bDur * 0.55, track: 'melody', voice: 'stab', fs: scaleChord(root, scale, degree, root + 24, chordSize).map(midiFreq), vel: 0.22 * vj(), bright: 0.5 + 0.5 * n01, send: { delay: 0.3, verb: 0.15 } });
          if (r.hot) ev.push({ t: T(i, 0), dur: spm * 0.8, track: 'melody', voice: 'acid', f: f * 2, vel: 0.15, bright: n01, send: { delay: 0.35 } });
          break;
        case 'acid': {
          if (rand() < 0.15) break;
          const prev = i > 0 ? midiFreq(mapToMidi(val[i - 1], vLo, vHi, melLo, melHi, root, scale)) : null;
          ev.push({ t: T(i, 0), dur: spm * 0.95, track: 'melody', voice: 'acid', f, slide: prev && Math.abs(prev - f) > 1 && rand() < 0.35 + 0.4 * va ? prev : null, accent: r.hot || r.record || rand() < 0.25 * va, vel: 0.32 * vj(), bright: n01, send: { delay: 0.3, verb: 0.08 } });
          break;
        }
        case 'electro':
          if (sIB === 0 || sIB === 3) ev.push({ t: T(i, 0), dur: spm * 1.2, track: 'melody', voice: 'pluck', f: sIB === 3 ? f / 2 : f, vel: 0.28 * vj() * (sIB === 3 ? 0.7 : 1), bright, send: { delay: 0.25, verb: 0.1 } });
          break;
        case 'industrial':
          if (i % (2 * beatEvery) === 0) ev.push({ t: T(i, 0), dur: bDur * 0.8, track: 'melody', voice: 'bell', f: f * 1.5, vel: 0.17 * vj(), send: { verb: 0.35, delay: 0.3 } });
          break;
        case 'idm': {
          if (i % 2 !== 0) break;
          const jumpOct = rand() < 0.2 ? 12 : 0;
          ev.push({ t: T(i, 0) + hum(), dur: spm * 1.8, track: 'melody', voice: 'pluck', f: midiFreq(midi + jumpOct), vel: 0.3 * velMel * vj(), bright, send: { delay: 0.4, verb: 0.15 } });
          break;
        }
        case 'downtempo':
          if (sIB === 0) {
            const gm = mapToMidi(groupVal(i, beatEvery), vLo, vHi, melLo, melHi, root, scale);
            ev.push({ t: T(i, 0) + hum(), dur: bDur * 0.8, track: 'melody', voice: 'pluck', f: midiFreq(gm), vel: 0.32 * velMel * vj(), bright, send: { delay: 0.3, verb: 0.2 } });
          }
          break;
        case 'triphop':
          if (i % (2 * beatEvery) === 0) {
            const gm = mapToMidi(groupVal(i, 2 * beatEvery), vLo, vHi, melLo, melHi, root, scale);
            ev.push({ t: T(i, 0) + hum(), dur: bDur * 1.2, track: 'melody', voice: 'pluck', f: midiFreq(gm), vel: 0.3 * velMel * vj(), bright: bright * 0.8, send: { delay: 0.35, verb: 0.25 } });
          }
          break;
      }
    } else switch (styleId) {
      case 'dub':
        ev.push({ t: T(i, 2) + hum(), dur: spm * 0.7, track: 'melody', voice: 'stab', fs: scaleChord(root, scale, degree, root + 12, chordSize).map(midiFreq), vel: 0.24 * vj(), bright: 0.15 + 0.45 * n01, send: { delay: 0.55, verb: 0.25 } });
        break;
      case 'hypnotic':
        ev.push({ t: T(i, 0) + hum(), dur: spm * 0.4, track: 'melody', voice: 'pluck', f, vel: 0.3 * velMel * vj(), bright, send: { delay: 0.4, verb: 0.12 } });
        ev.push({ t: T(i, 2) + hum(), dur: spm * 0.3, track: 'melody', voice: 'pluck', f: midiFreq(snapToScale(midi + 7, root, scale)), vel: 0.2 * vj(), bright: bright * 0.8, send: { delay: 0.45, verb: 0.1 } });
        break;
      case 'driving':
        if (i % 2 === 0) ev.push({ t: T(i, 0), dur: spm * 0.55, track: 'melody', voice: 'stab', fs: scaleChord(root, scale, degree, root + 24, chordSize).map(midiFreq), vel: 0.22 * vj(), bright: 0.5 + 0.5 * n01, send: { delay: 0.3, verb: 0.15 } });
        if (r.hot) for (const s of [1, 3]) ev.push({ t: T(i, s), dur: spm * 0.2, track: 'melody', voice: 'acid', f: f * 2, vel: 0.16, bright: n01, send: { delay: 0.35 } });
        break;
      case 'acid': {
        // the 303 line: cutoff opens with the anomaly
        const pattern = [0, 2, 3];
        for (const s of pattern) {
          if (rand() < 0.18) continue;
          const acc = r.hot || (s === 0 && r.record) || rand() < 0.25 * va;
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
        if (i % melEvery === 0) {
          const gm = melEvery > 1 ? mapToMidi(groupVal(i, melEvery), vLo, vHi, melLo, melHi, root, scale) : midi;
          ev.push({ t: T(i, 0) + hum() * 2, dur: Math.max(1.2, spm * melEvery * 1.6), track: 'melody', voice: 'piano', f: midiFreq(gm), vel: 0.34 * velMel * vj(), send: { verb: 0.4 } });
          if (cs > 0.5 && rand() < 0.45) ev.push({ t: T(i, 0) + melEvery * spm * 0.5, dur: Math.max(0.9, spm * melEvery), track: 'melody', voice: 'piano', f: midiFreq(snapToScale(gm + 7, root, scale)), vel: 0.16 * vj(), send: { verb: 0.4 } });
        }
        break;
      case 'ambient':
        if (i % melEvery === 0) {
          const gm = melEvery > 1 ? mapToMidi(groupVal(i, melEvery), vLo, vHi, melLo, melHi, root, scale) : midi;
          ev.push({ t: T(i, 0), dur: spm * melEvery * 3, track: 'melody', voice: 'pad', f: midiFreq(gm), vel: 0.16 * vj(), bright: 0.25 + 0.35 * n01, pan: (rand() - 0.5) * 0.8, send: { verb: 0.5, delay: 0.2 } });
          if (rand() < 0.05 + 0.2 * cs) ev.push({ t: T(i, 0) + rand() * spm * melEvery, dur: 2.5, track: 'melody', voice: 'bell', f: midiFreq(snapToScale(gm + 24, root, scale)), vel: 0.08, pan: rand() - 0.5, send: { verb: 0.6, delay: 0.3 } });
        }
        break;
      case 'drone':
        if (i % (2 * melEvery) === 0) {
          const gm = melEvery > 1 ? mapToMidi(groupVal(i, 2 * melEvery), vLo, vHi, melLo, melHi, root, scale) : midi;
          ev.push({ t: T(i, 0), dur: spm * melEvery * 2.6, track: 'melody', voice: 'drone', f: midiFreq(gm) / 2, vel: 0.2 * vj() * (0.85 + 0.3 * cs), bright: 0.1 + 0.45 * cs, send: { verb: 0.5 } });
        }
        break;
    }

    // ornament: a high grace note when decadal variability is high
    if (va > 0.55 && rand() < 0.18 && ['hypnotic', 'downtempo', 'idm', 'electro', 'triphop'].includes(styleId)) {
      ev.push({ t: T(i, 0) + (gridMode ? spm * 0.5 : spm * 0.4), dur: spm * (gridMode ? 0.8 : 0.25), track: 'melody', voice: 'pluck', f: f * 2, vel: 0.11, bright: 0.6, send: { delay: 0.35 } });
    }

    // ---------- bass = trend ----------
    const gi = Math.floor(i / beatEvery);          // beat-group index
    const onBeat = i % beatEvery === 0;
    if (styleId === 'neoclassic') {
      if (yearStart) ev.push({ t: T(i, 0), dur: Math.max(1.2, spm * 3.5), track: 'bass', voice: 'sub', f: fBass, vel: 0.14, send: { verb: 0.2 } });
    } else if (styleId === 'ambient' || styleId === 'drone') {
      if (i % (4 * melEvery) === 0) ev.push({ t: T(i, 0), dur: spm * melEvery * 4.5, track: 'bass', voice: 'sub', f: fBass, vel: 0.22 });
    } else if (styleId === 'electro') {
      if (onBeat) for (const s of [0, 3]) ev.push({ t: TB(i, s), dur: bDur * 0.35, track: 'bass', voice: 'sub', f: s === 3 ? fBass * 2 : fBass, vel: 0.34 * (s === 3 ? 0.6 : 1) });
    } else if (styleId === 'hypnotic') {
      if (onBeat && gi % 2 === 1) ev.push({ t: TB(i, 0), dur: bDur * 0.8, track: 'bass', voice: 'sub', f: fBass, vel: 0.32 });
    } else if (onBeat) {
      // per-style sub weight: industrial lives on noise, dub/triphop on sub
      const bv = { dub: 0.34, triphop: 0.34, driving: 0.27, acid: 0.25, industrial: 0.15, idm: 0.27, downtempo: 0.26 }[styleId] ?? 0.3;
      ev.push({ t: TB(i, 0), dur: bDur * (beatStyle ? 0.85 : 2), track: 'bass', voice: 'sub', f: fBass, vel: bv * (0.8 + 0.45 * cs) * (yearStart ? 1.2 : 1) });
    }

    // decade cadence: 1860, 1870 … anchor the large-scale form
    if (yearStart && r.year % 10 === 0) {
      ev.push({ t: T(i, 0), dur: Math.max(1.4, bDur * 2.2), track: 'bass', voice: 'sub', f: midiFreq(Math.max(26, trendMidi - 12)), vel: 0.3, send: { verb: 0.25 } });
      if (beatStyle) for (const s2 of [1, 2, 3]) ev.push({ t: T(i, 0) + s2 * bDur / 4, dur: 0.2, track: 'perc', voice: 'hat', vel: 0.05 + 0.045 * s2, open: s2 === 3 });
      else ev.push({ t: T(i, 0), dur: 2.5, track: 'melody', voice: 'bell', f: midiFreq(snapToScale(root + 24 + Math.round(cs * 12), root, scale)), vel: 0.1, send: { verb: 0.5 } });
    }

    // ---------- pad = seasonal cycle (or hemispheres for the global record) --
    const padEvery = beatStyle ? 4 * beatEvery : 2 * melEvery;
    if (i % padEvery === 0 && (plan.seg[i]?.I ?? 3) > 1) {
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
      // complexity: decadal variability adds ghost notes and syncopation,
      // a hot climate state adds off-beat kicks
      const charF = plan.seg[i]?.C === 3 ? 1.4 : plan.seg[i]?.C === 1 ? 0.6 : 1;
      if (rand() < (0.08 + 0.35 * va) * charF) hat(rand() < 0.5 ? 1 : 3, 0.05 + 0.09 * va);
      if (styleId !== 'dub' && styleId !== 'triphop' && rand() < 0.1 * va + (cs > 0.7 ? 0.06 : 0)) kick(2, 0.16);
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
    if (r.hot && beatStyle) {
      if (gridMode) ev.push({ t: T(i, 0), dur: 0.25, track: 'extremes', voice: 'hat', vel: 0.13 });
      else for (const s of [1, 3]) ev.push({ t: T(i, s), dur: 0.25, track: 'extremes', voice: 'hat', vel: 0.14, open: s === 3 });
    }
    if (r.runStart && beatStyle) ev.push({ t: gridMode ? T(i, 0) : T(i, 2), dur: 0.3, track: 'extremes', voice: 'hat', vel: 0.2, open: true });
    if (r.record) {
      if (beatStyle) {
        ev.push({ t: T(Math.max(0, i - 4), 0), dur: spm * 4, track: 'extremes', voice: 'riser', vel: 0.12 });
        ev.push({ t: T(i, 0), dur: 1.2, track: 'extremes', voice: 'ride', vel: 0.12 });
      } else {
        ev.push({ t: T(i, 0), dur: 2.2, track: 'extremes', voice: 'bell', f: midiFreq(snapToScale(midi + 12, root, scale)), vel: 0.14, send: { verb: 0.5, delay: 0.3 } });
      }
    }
    if (r.jump && beatStyle) {
      if (gridMode) ev.push({ t: T(i, 0), dur: 0.25, track: 'extremes', voice: styleId === 'industrial' ? 'snare' : 'clap', vel: 0.2, metal: styleId === 'industrial' });
      else if (styleId === 'industrial') ev.push({ t: T(i, 1), dur: 0.3, track: 'extremes', voice: 'snare', vel: 0.3, metal: true });
      else if (styleId === 'idm') for (const s of [1, 1.5, 2, 2.5, 3]) ev.push({ t: lead + i * spm + s * spm / 4, dur: 0.1, track: 'extremes', voice: 'hat', vel: 0.1 });
      else ev.push({ t: T(i, 2), dur: 0.25, track: 'extremes', voice: 'clap', vel: 0.16 });
    }
    if (r.cold && !beatStyle) ev.push({ t: T(i, 0), dur: spm * 2, track: 'extremes', voice: 'sub', f: midiFreq(root - 12), vel: 0.12 });
  });

  // segment transitions: a strong intensity jump announces itself
  if (beatStyle) for (const b of plan.blocks) {
    if (b.i0 > 0 && b.dI >= 1) {
      ev.push({ t: T(Math.max(0, b.i0 - 8), 0), dur: spm * 8, track: 'extremes', voice: 'riser', vel: 0.09 + 0.05 * b.dI });
      ev.push({ t: T(b.i0, 0), dur: 0.3, track: 'extremes', voice: 'hat', vel: 0.2, open: true });
    }
  }

  // texture
  if (styleId === 'triphop') ev.push({ t: 0, dur: lead + rows.length * spm + 1, track: 'texture', voice: 'vinyl', vel: 0.05 });

  // apply the segment plan to everything that sounds: crescendo/diminuendo
  // per intensity level, kick breakdowns, sparse I1 segments lose the claps
  for (const e of ev) {
    const i = Math.floor((e.t - lead) / spm);
    if (i < 0 || i >= rows.length) continue;
    e.vel *= velSeg[i];
    const I = plan.seg[i]?.I ?? 3;
    if (kickRest[i] && e.voice === 'kick' && e.track === 'perc') e.vel = 0;
    if (I === 1 && e.voice === 'clap') e.vel = 0;
  }

  // per-month sounding note (group means, octaves, snapping included)
  const sounding = derivePlayed(ev, rows, { lead, spm, melLo, melHi, vLo, vHi });

  return {
    events: ev,
    duration: lead + rows.length * spm + 2.5,
    mix: st.mix,
    meta: {
      styleId, spm, lead, rows,
      bodyEnd: lead + rows.length * spm,     // musical end (before the fx tail)
      monthNotes: sounding.monthNotes,
      played: sounding.played,
      sectStarts: plan.starts,
      segLabel: plan.segLabel,
      segI: rows.map((_, i) => plan.seg[i]?.I ?? 3),
      mapRule: { lo: vLo, hi: vHi, noteLo: midiName(melLo), noteHi: midiName(melHi), scale: st.scale, source }
    }
  };
}

// ------------------------------------------------------------ paleo score --
// tracks: [{dataset, series, voice, octave(2|4|6), gain}] · opts: {from,to,stepSec,root,scaleId}
import { paleoOnGrid, quantile } from './data.js?v=202607132325';

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
