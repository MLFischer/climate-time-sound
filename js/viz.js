// viz.js — canvas rendering of the data score with a moving playhead.
// Dark, reduced aesthetic: monochrome lines + signal red.

const CO = {
  bg: '#0c0c0e', grid: '#1d1d22', axis: '#4a4a52',
  monthly: '#8f8f98', trend: '#e6392f', season: '#3b6ea8',
  hot: '#e6392f', cold: '#4a7fbf', play: '#f2f2f4', text: '#6a6a72'
};

export function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(300, rect.width * dpr);
  canvas.height = Math.max(150, rect.height * dpr);
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
export function drawClimate(canvas, material, playFrac = -1) {
  const { g, w, h } = setupCanvas(canvas);
  const rows = material.rows, stats = material.stats;
  g.fillStyle = CO.bg; g.fillRect(0, 0, w, h);
  const padL = 44, padR = 12, padT = 14, padB = 24;
  const iw = w - padL - padR, ih = h - padT - padB;
  const lo = Math.min(stats.lo, stats.trendLo) - 0.3;
  const hi = Math.max(stats.hi, stats.trendHi) + 0.3;
  const X = i => padL + (i / Math.max(1, rows.length - 1)) * iw;
  const Y = v => padT + (1 - (v - lo) / (hi - lo)) * ih;

  // grid: zero line + degree steps
  g.strokeStyle = CO.grid; g.lineWidth = 1;
  for (let d = Math.ceil(lo); d <= Math.floor(hi); d++) {
    g.beginPath(); g.moveTo(padL, Y(d)); g.lineTo(w - padR, Y(d)); g.stroke();
    g.fillStyle = CO.text; g.font = '10px ui-monospace, monospace';
    g.fillText((d > 0 ? '+' : '') + d + '°', 8, Y(d) + 3);
  }
  if (lo < 0 && hi > 0) {
    g.strokeStyle = CO.axis; g.beginPath(); g.moveTo(padL, Y(0)); g.lineTo(w - padR, Y(0)); g.stroke();
  }
  // year labels
  const y0 = rows[0].year, y1 = rows[rows.length - 1].year;
  const yearStepC = Math.max(10, Math.round((y1 - y0) / 6 / 10) * 10);
  g.fillStyle = CO.text;
  for (let yy = Math.ceil(y0 / yearStepC) * yearStepC; yy <= y1; yy += yearStepC) {
    const i = rows.findIndex(r => r.year === yy && r.month === 1);
    if (i >= 0) g.fillText(String(yy), X(i) - 12, h - 8);
  }

  // monthly anomaly (thin) + trend (red)
  line(g, rows.map((r, i) => [X(i), Y(r.anomaly)]), CO.monthly, 1);
  line(g, rows.map((r, i) => [X(i), Y(r.trend)]), CO.trend, 2.2);

  // extremes
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.record) { g.fillStyle = CO.hot; g.beginPath(); g.arc(X(i), Y(r.anomaly), 2.6, 0, 7); g.fill(); }
    else if (r.cold) { g.fillStyle = CO.cold; g.beginPath(); g.arc(X(i), Y(r.anomaly), 2, 0, 7); g.fill(); }
  }

  // playhead
  if (playFrac >= 0 && playFrac <= 1) {
    const x = padL + playFrac * iw;
    g.strokeStyle = CO.play; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(x, padT); g.lineTo(x, h - padB); g.stroke();
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
  const colors = [CO.trend, '#d8d8de', CO.season, '#b08b2e', '#7a5fb5'];

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
