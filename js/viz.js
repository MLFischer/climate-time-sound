// viz.js — canvas rendering of the data score with a moving playhead.
// Dark, reduced aesthetic: monochrome lines + signal red.

// theme-aware palette: swapped by setVizTheme() so the canvas follows the
// light/dark toggle just like the CSS does
const PALETTES = {
  dark: {
    bg: '#0c0c0e', grid: '#1d1d22', axis: '#4a4a52',
    monthly: '#8f8f98', trend: '#e6392f', season: '#3b6ea8',
    hot: '#e6392f', cold: '#4a7fbf', play: '#f2f2f4', text: '#6a6a72',
    mini: '#52525c', viewFill: 'rgba(242,242,244,0.06)', viewStroke: 'rgba(242,242,244,0.55)',
    sect: '#26262e', played: 'rgba(216,216,222,0.30)', laneAlt: '#d8d8de',
    thread: 'rgba(242,242,244,0.55)', halo: 'rgba(230,57,47,0.22)',
    segTint: '232,232,236', laneA: '#b08b2e', laneB: '#7a5fb5'
  },
  light: {
    bg: '#f7f6f3', grid: '#e5e3dd', axis: '#bebbb2',
    monthly: '#9a988f', trend: '#d42a20', season: '#3667a8',
    hot: '#d42a20', cold: '#3667a8', play: '#26262b', text: '#8d8b83',
    mini: '#c2bfb6', viewFill: 'rgba(30,30,36,0.05)', viewStroke: 'rgba(30,30,36,0.42)',
    sect: '#dedcd4', played: 'rgba(42,42,50,0.32)', laneAlt: '#44424a',
    thread: 'rgba(30,30,36,0.5)', halo: 'rgba(212,42,32,0.20)',
    segTint: '30,30,42', laneA: '#9c7a1e', laneB: '#6a52a0'
  }
};
let CO = PALETTES.dark;
export function setVizTheme(name) { CO = PALETTES[name] || PALETTES.dark; }

export function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = Math.max(300, Math.round(rect.width * dpr));
  const H = Math.max(150, Math.round(rect.height * dpr));
  // resizing resets (and reallocates) the canvas — only do it when needed,
  // otherwise redraws at 60 fps stutter
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W; canvas.height = H;
  }
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, w: rect.width, h: rect.height };
}

function line(g, pts, color, width) {
  g.strokeStyle = color; g.lineWidth = width; g.beginPath();
  let started = false;
  for (const [x, y] of pts) {
    if (!Number.isFinite(y)) { started = false; continue; }
    if (!started) { g.moveTo(x, y); started = true; } else g.lineTo(x, y);
  }
  g.stroke();
}

// --------------------------------------------------------------- climate --
// Long records scroll: the main pane shows a moving ~40-year window that
// follows the playhead (fixed y-scale, so the climb stays visible) while a
// minimal overview strip on top shows the full record with the viewport.
export function drawClimate(canvas, material, playFrac = -1, opts = {}) {
  const { g, w, h } = setupCanvas(canvas);
  const rows = material.rows, stats = material.stats;
  g.fillStyle = CO.bg; g.fillRect(0, 0, w, h);
  const n = rows.length;
  const viewMonths = opts.viewMonths ?? 480;
  const useWindow = n > viewMonths * 1.25;
  const mmH = useWindow ? 34 : 0;

  const padL = 44, padR = 12, padB = 24;
  const padT = mmH ? mmH + 12 : 14;
  const iw = w - padL - padR, ih = h - padT - padB;
  const lo = Math.min(stats.lo, stats.trendLo) - 0.3;
  const hi = Math.max(stats.hi, stats.trendHi) + 0.3;

  // visible index window — fractional, so the view glides instead of
  // jumping in whole-month steps
  const pi = playFrac >= 0 ? playFrac * (n - 1) : -1;
  let i0 = 0, i1 = n - 1;
  if (useWindow && pi >= 0) {
    i0 = Math.max(0, Math.min(n - viewMonths, pi - viewMonths * 0.5));
    i1 = Math.min(n - 1, i0 + viewMonths - 1);
  }
  const a = Math.max(0, Math.floor(i0)), b = Math.min(n - 1, Math.ceil(i1));

  const X = i => padL + ((i - i0) / Math.max(1, i1 - i0)) * iw;
  const Y = v => padT + (1 - (v - lo) / (hi - lo)) * ih;

  // ---- overview strip (minimap) ----
  if (mmH) {
    const mTop = 4, mBot = mmH - 4, mH = mBot - mTop;
    const mY = v => mTop + (1 - (v - lo) / (hi - lo)) * mH;
    const mX = i => padL + (i / (n - 1)) * iw;
    const step = Math.max(1, Math.floor(n / iw));
    const pts = [];
    for (let i = 0; i < n; i += step) pts.push([mX(i), mY(rows[i].anomaly)]);
    line(g, pts, CO.mini, 1);
    const tpts = [];
    for (let i = 0; i < n; i += step) tpts.push([mX(i), mY(rows[i].trend)]);
    line(g, tpts, CO.trend, 1.2);
    // viewport
    g.strokeStyle = CO.viewStroke; g.lineWidth = 1;
    g.fillStyle = CO.viewFill;
    const vx0 = mX(i0), vx1 = mX(i1);
    g.fillRect(vx0, mTop - 2, Math.max(3, vx1 - vx0), mH + 4);
    g.strokeRect(vx0, mTop - 2, Math.max(3, vx1 - vx0), mH + 4);
    g.fillStyle = CO.text; g.font = '9px ui-monospace, monospace';
    g.fillText(String(rows[0].year), padL - 34, mBot);
    g.fillText(String(rows[n - 1].year), w - padR - 26, mBot);
    if (pi >= 0) {
      g.strokeStyle = CO.play; g.beginPath();
      g.moveTo(mX(pi), mTop - 2); g.lineTo(mX(pi), mBot + 2); g.stroke();
    }
  }

  // ---- main pane: grid, zero line, degree labels ----
  g.strokeStyle = CO.grid; g.lineWidth = 1;
  for (let d = Math.ceil(lo); d <= Math.floor(hi); d++) {
    g.beginPath(); g.moveTo(padL, Y(d)); g.lineTo(w - padR, Y(d)); g.stroke();
    g.fillStyle = CO.text; g.font = '10px ui-monospace, monospace';
    g.fillText((d > 0 ? '+' : '') + d + '°', 8, Y(d) + 3);
  }
  if (lo < 0 && hi > 0) {
    g.strokeStyle = CO.axis; g.beginPath(); g.moveTo(padL, Y(0)); g.lineTo(w - padR, Y(0)); g.stroke();
  }

  // year ticks within the window
  const y0 = rows[a].year, y1 = rows[b].year;
  const span = Math.max(1, y1 - y0);
  const yearStepC = span > 90 ? 20 : span > 45 ? 10 : 5;
  g.fillStyle = CO.text; g.font = '10px ui-monospace, monospace';
  for (let yy = Math.ceil(y0 / yearStepC) * yearStepC; yy <= y1; yy += yearStepC) {
    for (let i = a; i <= b; i++) {
      if (rows[i].year === yy && rows[i].month === 1) {
        const x = X(i);
        if (x > padL + 26 && x < w - padR - 30) g.fillText(String(yy), x - 12, h - 8);
        break;
      }
    }
  }
  // explicit window bounds (xmin / xmax)
  if (useWindow) {
    g.fillStyle = CO.play; g.font = '10px ui-monospace, monospace';
    g.fillText(String(y0), padL, h - 8);
    g.fillText(String(y1), w - padR - 26, h - 8);
  }

  // series + markers, clipped to the plot area (fractional edges spill a bit)
  g.save();
  g.beginPath(); g.rect(padL - 1, padT - 2, iw + 3, ih + 4); g.clip();

  // data-driven form, layer 1: segment intensity as a whisper of shading —
  // the darker→lighter bands ARE the Quantil-Dramaturgie (I1…I5)
  if (opts.segI) {
    let runStart = a, runI = opts.segI[a];
    const paint = (from, to, I) => {
      if (!Number.isFinite(I) || I <= 1) return;
      g.fillStyle = `rgba(${CO.segTint},${(0.014 * (I - 1)).toFixed(3)})`;
      g.fillRect(X(from), padT, X(Math.min(b + 1, to)) - X(from), ih);
    };
    for (let i = a; i <= b; i++) {
      if (opts.segI[i] !== runI) { paint(runStart, i, runI); runStart = i; runI = opts.segI[i]; }
    }
    paint(runStart, b + 1, runI);
  }

  // data-driven form: faint verticals at section boundaries (studio classic)
  if (opts.sectStarts) {
    g.strokeStyle = CO.sect; g.lineWidth = 1;
    for (const si of opts.sectStarts) {
      if (si < a || si > b) continue;
      const x = X(si);
      g.beginPath(); g.moveTo(x, padT); g.lineTo(x, h - padB); g.stroke();
    }
  }

  const seg = [];
  for (let i = a; i <= b; i++) seg.push([X(i), Y(rows[i].anomaly)]);
  line(g, seg, CO.monthly, 1);
  const tseg = [];
  for (let i = a; i <= b; i++) tseg.push([X(i), Y(rows[i].trend)]);
  line(g, tseg, CO.trend, 2.2);

  // the note that actually sounds: soft horizontal dashes, one per held note —
  // no vertical connectors, so the line reads as a quiet score overlay
  if (opts.played) {
    g.strokeStyle = CO.played; g.lineWidth = 1; g.beginPath();
    let runStart = -1, runVal = NaN;
    const flush = end => {
      if (runStart < 0) return;
      const y = Y(runVal);
      g.moveTo(X(runStart), y); g.lineTo(X(end), y);
    };
    for (let i = a; i <= b; i++) {
      const v = opts.played[i];
      if (!Number.isFinite(v)) { flush(i); runStart = -1; continue; }
      if (v !== runVal) { flush(i); runStart = i; runVal = v; }
    }
    flush(Math.min(b + 1, rows.length - 1));
    g.stroke();
  }

  // extremes
  for (let i = a; i <= b; i++) {
    const r = rows[i];
    if (r.record) { g.fillStyle = CO.hot; g.beginPath(); g.arc(X(i), Y(r.anomaly), 2.6, 0, 7); g.fill(); }
    else if (r.cold) { g.fillStyle = CO.cold; g.beginPath(); g.arc(X(i), Y(r.anomaly), 2, 0, 7); g.fill(); }
  }
  g.restore();

  // inline series labels (identity never by color alone)
  if (opts.labels) {
    g.font = '10px ui-monospace, monospace';
    const lx = w - padR - 6;
    g.textAlign = 'right';
    g.fillStyle = CO.trend; g.fillText(opts.labels.trend, lx, padT + 12);
    g.fillStyle = CO.monthly; g.fillText(opts.labels.monthly, lx, padT + 24);
    if (opts.played && opts.labels.played) {
      g.fillStyle = CO.laneAlt; g.fillText(opts.labels.played, lx, padT + 36);
    }
    g.textAlign = 'left';
  }

  // playhead
  if (pi >= i0 && pi <= i1) {
    const x = X(pi);
    g.strokeStyle = CO.play; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(x, padT); g.lineTo(x, h - padB); g.stroke();

    // the act of translation, made visible: a thread from the raw monthly
    // value (small ring) up/down to the note that sounds right now (dot)
    const ci = Math.max(0, Math.min(rows.length - 1, Math.round(pi)));
    const pv = opts.played?.[ci];
    if (Number.isFinite(pv)) {
      const yData = Y(rows[ci].anomaly), yNote = Y(pv);
      g.strokeStyle = CO.thread; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, yData); g.lineTo(x, yNote); g.stroke();
      if (rows[ci].record || rows[ci].hot) {              // extreme sounding now: halo
        g.fillStyle = CO.halo;
        g.beginPath(); g.arc(x, yData, 8, 0, 7); g.fill();
      }
      g.strokeStyle = CO.play; g.lineWidth = 1.2;
      g.beginPath(); g.arc(x, yData, 3, 0, 7); g.stroke();  // the datum (ring)
      g.fillStyle = CO.play;
      g.beginPath(); g.arc(x, yNote, 3.6, 0, 7); g.fill();  // the note (dot)
    }
  }
}

// ----------------------------------------------------------------- paleo --
export function drawPaleo(canvas, meta, labels, playFrac = -1) {
  const { g, w, h } = setupCanvas(canvas);
  g.fillStyle = CO.bg; g.fillRect(0, 0, w, h);
  const tracks = meta.tracks;
  const padL = 12, padR = 12, padT = 10, padB = 24;
  if (!tracks.length) {
    g.fillStyle = CO.text; g.font = '12px ui-monospace, monospace';
    g.fillText('—', w / 2, h / 2);
    return;
  }
  const laneH = (h - padT - padB) / tracks.length;
  const iw = w - padL - padR;
  const colors = [CO.trend, CO.laneAlt, CO.season, CO.laneA, CO.laneB];

  tracks.forEach((tr, ti) => {
    const top = padT + ti * laneH;
    g.strokeStyle = CO.grid;
    g.beginPath(); g.moveTo(padL, top + laneH); g.lineTo(w - padR, top + laneH); g.stroke();
    const pts = tr.norm.map((v, i) => [
      padL + (i / (tr.norm.length - 1)) * iw,
      Number.isFinite(v) ? top + 6 + (1 - v) * (laneH - 12) : NaN
    ]);
    line(g, pts, colors[ti % colors.length], 1.4);
    g.fillStyle = CO.text; g.font = '10px ui-monospace, monospace';
    g.fillText(labels[ti] || tr.dataset, padL + 4, top + 12);
  });

  // age axis: oldest (left) -> present (right)
  const ages = meta.ages;
  g.fillStyle = CO.text; g.font = '10px ui-monospace, monospace';
  const nTicks = Math.min(6, ages.length);
  for (let k = 0; k < nTicks; k++) {
    const i = Math.round(k * (ages.length - 1) / (nTicks - 1));
    const x = padL + (i / (ages.length - 1)) * iw;
    g.fillText(Math.round(ages[i]) + ' kyr', Math.min(x, w - 50), h - 8);
  }

  if (playFrac >= 0 && playFrac <= 1) {
    const x = padL + playFrac * iw;
    g.strokeStyle = CO.play; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(x, padT); g.lineTo(x, h - padB); g.stroke();
  }
}
