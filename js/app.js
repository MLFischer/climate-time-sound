// app.js — UI wiring: modes, controls, playback sync, experiments, sharing.

import { t, setLang, getLang, applyI18n } from './i18n.js?v=202607080951';
import { loadCityIndex, loadCity, loadGlobal, loadPaleo, buildMaterial, loadCityIndexAll, loadCityLive } from './data.js?v=202607080951';
import { play, renderWav } from './engine.js?v=202607080951';
import { STYLES, STYLE_ORDER, buildClimateScore, buildPaleoScore } from './score.js?v=202607080951';
import { drawClimate, drawPaleo } from './viz.js?v=202607080951';

const $ = id => document.getElementById(id);

const state = {
  mode: 'studio',                 // studio is the front door — one click, one piece
  dataset: 'berlin', yearFrom: 1970, yearTo: 2020,
  source: 'anomaly', world: 'warm', tempo: 'mid',
  toggles: { melody: true, bass: true, pad: true, extremes: true, perc: true },
  styleId: 'downtempo',
  studioLen: 'normal', seeking: false,
  paleo: {
    span: [0, 800], tempo: 'mid', constellation: 'iceages',
    root: 'A', scaleId: 'minor', today: false,
    tracks: [
      { dataset: 'lr04', voice: 'lead', octave: 5, gain: 1, offset: 0 },
      { dataset: 'epica_co2', voice: 'bass', octave: 3, gain: 1, offset: 0 },
      { dataset: 'epica_temp', voice: 'pad', octave: 4, gain: 1, offset: 0 },
      { dataset: 'off', voice: 'pluck', octave: 5, gain: 1, offset: 0 }
    ]
  },
  material: null, score: null, handle: null, paleoData: null, cityIndex: [], cityAll: null,
  // endless loop (studio): chain city after city in the same style, gapless
  loop: false, next: null, building: false
};

const WORLD_STYLE = { quiet: 'neoclassic', warm: 'downtempo', electronic: 'driving', wide: 'ambient' };
// learn-mode tempo: months per second matter more than bpm — long windows
// need fast month rates; the score builder thins the beat automatically.
const TEMPO_MULT = { slow: 1, mid: 0.5, fast: 0.25 };
// studio length: stretch the full-record piece (seek slider makes long fine)
const LEN_MULT = { normal: 1, long: 2, epic: 4 };

const PALEO_IDS = ['lr04', 'epica_co2', 'epica_temp', 'vostok_co2', 'vostok_temp', 'chew_k',
  'bosumtwi', 'geob1016_sst', 'enso_pc1', 'ngrip', 'sanbao', 'geob1028_nam', 'kl15_cati',
  'odp967_tial', 'ohrid_k', 'ecc', 'obl', 'prec'];

// short symbols + units for the live legend
const PALEO_SHORT = {
  lr04: 'δ¹⁸O', epica_co2: 'CO₂', epica_temp: 'ΔT', vostok_co2: 'CO₂', vostok_temp: 'ΔT',
  chew_k: 'K', bosumtwi: 'K', geob1016_sst: 'SST', enso_pc1: 'PC1', ngrip: 'δ¹⁸O',
  sanbao: 'δ¹⁸O', geob1028_nam: 'NAM1', kl15_cati: 'Ca/Ti', odp967_tial: 'Ti/Al',
  ohrid_k: 'K', ecc: 'ecc', obl: 'obl', prec: 'prec'
};

const PALEO_ROOTS = { C: 36, D: 38, E: 40, F: 41, G: 43, A: 45, B: 47 };

const CONSTELLATIONS = {
  iceages: { span: [0, 800], tracks: [['lr04', 'lead', 5], ['epica_co2', 'bass', 3], ['epica_temp', 'pad', 4]] },
  milank: { span: [0, 800], tracks: [['ecc', 'pad', 3], ['obl', 'pad', 4], ['prec', 'pluck', 6], ['lr04', 'lead', 5]] },
  africa: { span: [0, 500], tracks: [['chew_k', 'pluck', 6], ['kl15_cati', 'pluck', 5], ['lr04', 'pad', 3]] },
  sahara: { span: [0, 500], tracks: [['odp967_tial', 'lead', 5], ['prec', 'pad', 3], ['lr04', 'pad', 4]] },
  ohrid: { span: [0, 1300], tracks: [['ohrid_k', 'lead', 5], ['lr04', 'pad', 3]] },
  do: { span: [10, 60], tracks: [['ngrip', 'lead', 5], ['ngrip', 'bass', 3]] },
  monsoon: { span: [127, 387], tracks: [['sanbao', 'pluck', 6], ['prec', 'pad', 3]] },
  enso: { span: [12, 205], tracks: [['enso_pc1', 'lead', 5], ['geob1016_sst', 'pad', 3]] }
};

// resolve a dataset id: 'global' | bundled city id | 'live|<loc>|<label>'
function loadDataset(ds) {
  if (ds === 'global') return loadGlobal();
  if (ds.startsWith('live|')) {
    const [, loc, label] = ds.split('|');
    return loadCityLive(loc, label);
  }
  return loadCity(ds);
}

// ------------------------------------------------------------------ audio --
function stopPlayback() {
  if (state.next) { state.next.handle.stop(); state.next = null; }
  if (state.handle) { state.handle.stop(); state.handle = null; }
  state.building = false;
  $('btn-play').textContent = '▶ ' + t('play');
  paintSeek(0);
  updateLoopStatus();
}

async function buildScore() {
  if (state.mode === 'paleo') {
    if (!state.paleoData) state.paleoData = await loadPaleo();
    const tracks = state.paleo.tracks.map(tr => ({
      ...tr, series: tr.dataset !== 'off' ? state.paleoData[tr.dataset] : null
    }));
    const stepSec = { slow: 0.2, mid: 0.13, fast: 0.085 }[state.paleo.tempo];
    state.score = buildPaleoScore(tracks, {
      from: state.paleo.span[0], to: state.paleo.span[1], stepSec,
      root: PALEO_ROOTS[state.paleo.root] ?? 45, scaleId: state.paleo.scaleId,
      todayMarker: state.paleo.today
    });
    state.material = null;
    return;
  }
  const raw = await loadDataset(state.dataset);
  state.material = buildMaterial(raw, state.yearFrom, state.yearTo);
  const styleId = state.mode === 'studio' ? state.styleId : WORLD_STYLE[state.world];
  // studio always plays the full record; fullMult compresses ~170 years to a
  // ~4-minute piece (one month = one 16th note); the length choice stretches it
  const tempoMult = state.mode === 'studio'
    ? (STYLES[styleId].fullMult ?? 1) * (LEN_MULT[state.studioLen] ?? 1)
    : TEMPO_MULT[state.tempo];
  state.score = buildClimateScore(state.material, styleId, {
    source: state.mode === 'studio' ? 'anomaly' : state.source,
    tempoMult, seed: 20260706
  });
}

const isLive = () => state.mode !== 'paleo' && String(state.dataset).startsWith('live|');

async function startPlayback(offset = 0) {
  stopPlayback();
  $('legend-live').textContent = t(isLive() ? 'live_loading' : 'loading');
  try { await buildScore(); } catch (e) {
    console.error(e);
    $('legend-live').textContent = t(isLive() ? 'live_error' : 'data_error');
    return;
  }
  redraw(-1);
  updateRuleLine();
  const handle = play(state.score, { offset, onEnd: () => { if (state.handle === handle && !state.next) { state.handle = null; $('btn-play').textContent = '▶ ' + t('play'); redraw(-1); updateLoopStatus(); } } });
  state.handle = handle;
  applyToggles();
  $('btn-play').textContent = '■ ' + t('stop');
  updateLoopStatus();
  requestAnimationFrame(tick);
}

// jump inside the running (or stopped) piece — the audio graph is rebuilt
// from the target position, long sustains are revived by the engine
async function seekTo(frac) {
  if (!state.score) { await prepareView(); }
  if (!state.score) return;
  const target = Math.max(0, Math.min(0.995, frac)) * state.score.duration;
  if (!state.handle) { await startPlayback(target); return; }
  if (state.next) { state.next.handle.stop(); state.next = null; }
  const old = state.handle;
  state.handle = null;
  old.stop();
  const handle = play(state.score, { offset: target, onEnd: () => { if (state.handle === handle && !state.next) { state.handle = null; $('btn-play').textContent = '▶ ' + t('play'); redraw(-1); updateLoopStatus(); } } });
  state.handle = handle;
  applyToggles();
  $('btn-play').textContent = '■ ' + t('stop');
  requestAnimationFrame(tick);
}

function paintSeek(frac) {
  const sk = $('seek');
  sk.value = String(Math.round(frac * 1000));
  const pc = (frac * 100).toFixed(2) + '%';
  sk.style.background = `linear-gradient(to right, var(--red) ${pc}, var(--bg3) ${pc})`;
}

// ------------------------------------------------------- endless loop ----
function nextCityId(cur) {
  const ids = state.cityIndex.map(c => c.id);
  if (!ids.length) return cur;
  return ids[(ids.indexOf(cur) + 1) % ids.length];
}

function cityLabel(id) {
  return state.cityIndex.find(c => c.id === id)?.label ?? id;
}

function updateLoopStatus() {
  const el = $('loop-status');
  if (!el) return;
  if (!state.loop || state.mode !== 'studio') { el.textContent = ''; return; }
  el.textContent = state.handle
    ? t('loop_now', { city: cityLabel(state.dataset), next: cityLabel(nextCityId(state.dataset)) })
    : t('loop_armed');
}

// Build the next city's score in the current style and schedule it exactly
// at the musical end of the running piece (fx tails overlap -> gapless).
async function loopAdvance(startAtOverride) {
  if (state.building || state.next || !state.handle) return;
  state.building = true;
  try {
    const cur = state.handle;
    const st = STYLES[state.styleId];
    const cityId = nextCityId(state.dataset);
    const raw = await loadCity(cityId);
    const material = buildMaterial(raw, st.years[0], st.years[1]);
    const score = buildClimateScore(material, state.styleId, { source: 'anomaly', tempoMult: (st.fullMult ?? 1) * (LEN_MULT[state.studioLen] ?? 1), seed: 20260706 });
    if (state.handle !== cur) return;              // stopped/changed meanwhile
    const startAt = startAtOverride ?? (cur.t0 + Math.max(0.1, state.score.meta.bodyEnd - (cur.offset || 0)));
    const handle = play(score, {
      startAt,
      onEnd: () => { if (state.handle === handle && !state.next) { state.handle = null; $('btn-play').textContent = '▶ ' + t('play'); redraw(-1); updateLoopStatus(); } }
    });
    state.next = { handle, score, material, cityId };
  } catch (e) {
    console.error('loop advance failed', e);
  } finally {
    state.building = false;
  }
}

function applyToggles() {
  if (!state.handle) return;
  const on = state.mode === 'learn' ? state.toggles : { melody: 1, bass: 1, pad: 1, extremes: 1, perc: 1 };
  state.handle.setTrack('melody', !!on.melody);
  state.handle.setTrack('bass', !!on.bass);
  state.handle.setTrack('pad', !!on.pad);
  state.handle.setTrack('extremes', !!on.extremes);
  state.handle.setTrack('perc', !!on.perc);
  state.handle.setTrack('texture', true);
}

// ------------------------------------------------------------- transport --
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// Transport UI update — shared by the rAF loop (smooth) and the safety timer
// (works even when rAF is paused, e.g. hidden tabs).
function updateUI(pos) {
  const h = state.handle;
  if (!h) return;
  const frac = Math.max(0, Math.min(1, pos / h.duration));
  if (!state.seeking) {
    paintSeek(frac);
    $('time-disp').textContent = `${fmt(Math.max(0, pos))} / ${fmt(h.duration)}`;
  }
  redraw(playFracFromPos(pos));
  updateLegend(pos);
}

// Loop control runs on a timer, not on requestAnimationFrame: rAF pauses in
// background tabs, but the endless loop must keep chaining while the tab is
// hidden (audio playback exempts the page from heavy timer throttling).
// The timer only paints the UI when rAF is actually stalled — double-drawing
// at mixed cadence makes the scrolling plot judder.
function loopCheck() {
  const h = state.handle;
  if (!h) return;
  if (performance.now() - lastFrame > 600) updateUI(h.position());
  // prepare the next city ~4 s before the musical end …
  if (state.loop && state.mode === 'studio' && !state.next && !state.building
      && state.score?.meta?.bodyEnd && h.position() > state.score.meta.bodyEnd - 4) {
    loopAdvance();
  }
  // … and hand over as soon as its start time has passed (audio is already
  // sample-accurate; this only swaps UI/state)
  if (state.next && state.next.handle.position() >= 0) {
    state.handle = state.next.handle;
    state.dataset = state.next.cityId;
    state.material = state.next.material;
    state.score = state.next.score;
    state.next = null;
    applyToggles();
    updateRuleLine();
    updateLoopStatus();
  }
}
setInterval(loopCheck, 500);

let lastFrame = 0;
function tick() {
  const h = state.handle;
  if (!h) return;
  lastFrame = performance.now();
  updateUI(h.position());
  requestAnimationFrame(tick);
}

function playFracFromPos(pos) {
  const m = state.score?.meta;
  if (!m) return -1;
  if (state.mode === 'paleo') {
    const steps = m.ages.length;
    return Math.max(0, Math.min(1, (pos - m.lead) / (steps * m.stepSec)));
  }
  return Math.max(0, Math.min(1, (pos - m.lead) / (m.rows.length * m.spm)));
}

function updateLegend(pos) {
  const m = state.score?.meta;
  if (!m) return;
  if (state.mode === 'paleo') {
    const i = Math.floor((pos - m.lead) / m.stepSec);
    if (i >= 0 && i < m.ages.length) {
      const parts = m.tracks.map(tr => {
        const v = tr.raw?.[i];
        if (!Number.isFinite(v)) return null;
        const unit = state.paleoData?.[tr.dataset]?.unit || '';
        return `${PALEO_SHORT[tr.dataset] ?? tr.dataset} ${v}${unit ? ' ' + unit : ''}`;
      }).filter(Boolean);
      $('legend-live').textContent = [`${Math.round(m.ages[i])} kyr BP`, ...parts].join(' · ');
    }
    return;
  }
  const i = Math.floor((pos - m.lead) / m.spm);
  if (i >= 0 && i < m.rows.length) {
    const r = m.rows[i];
    $('legend-live').textContent = t('legend_line', {
      ym: `${r.year}-${String(r.month).padStart(2, '0')}`,
      val: (r.anomaly >= 0 ? '+' : '') + r.anomaly.toFixed(2),
      note: m.monthNotes[i]
    });
  }
}

function updateRuleLine() {
  const m = state.score?.meta;
  const el = $('legend-rule');
  if (!m || state.mode === 'paleo') { el.textContent = ''; return; }
  const r = m.mapRule;
  el.textContent = t('legend_rule', {
    lo: r.lo.toFixed(1), hi: r.hi.toFixed(1),
    range: `${r.noteLo}–${r.noteHi}`, scale: r.scale
  });
}

function redraw(frac) {
  const canvas = $('viz');
  if (state.mode === 'paleo') {
    if (state.score?.meta?.tracks) {
      const labels = state.score.meta.tracks.map(tr => t('pd_' + tr.dataset));
      drawPaleo(canvas, state.score.meta, labels, frac);
    }
  } else if (state.material) {
    drawClimate(canvas, state.material, frac, {
      labels: { monthly: t('viz_monthly'), trend: t('viz_trend') }
    });
  }
}

// ------------------------------------------------------------ wav export --
async function exportWav() {
  if (!state.score) { await buildScore().catch(() => null); }
  if (!state.score) return;
  const btn = $('btn-wav');
  btn.disabled = true; btn.textContent = t('rendering');
  try {
    const trackState = state.mode === 'learn' ? state.toggles : null;
    const blob = await renderWav(state.score, trackState);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const name = state.mode === 'paleo' ? 'paleo' :
      `${state.dataset}_${state.yearFrom}-${state.yearTo}`;
    a.download = `climate-music_${name}.wav`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  } finally {
    btn.disabled = false; btn.textContent = '⬇ ' + t('download_wav');
  }
}

// ---------------------------------------------------------------- sharing --
function encodeShare() {
  const p = new URLSearchParams();
  p.set('m', state.mode); p.set('lang', getLang());
  if (state.mode === 'studio') {
    p.set('s', state.styleId);
    if (state.loop) p.set('loop', '1');
    if (state.studioLen !== 'normal') p.set('len', state.studioLen);
  }
  else if (state.mode === 'paleo') {
    p.set('span', state.paleo.span.join('-'));
    p.set('pt', state.paleo.tempo);
    p.set('pr', state.paleo.root);
    p.set('psc', state.paleo.scaleId);
    if (state.paleo.today) p.set('ptd', '1');
    p.set('trk', state.paleo.tracks.map(tr => `${tr.dataset}.${tr.voice}.${tr.octave}.${tr.gain ?? 1}.${tr.offset ?? 0}`).join(','));
  } else {
    p.set('d', state.dataset); p.set('y', `${state.yearFrom}-${state.yearTo}`);
    p.set('src', state.source); p.set('w', state.world); p.set('tp', state.tempo);
    p.set('trk', Object.entries(state.toggles).filter(([, v]) => v).map(([k]) => k).join(','));
  }
  return location.origin + location.pathname + '#' + p.toString();
}

function decodeShare() {
  if (!location.hash || location.hash.length < 2) return;
  try {
    const p = new URLSearchParams(location.hash.slice(1));
    if (p.get('lang')) setLang(p.get('lang'));
    const m = p.get('m');
    if (m) state.mode = ['learn', 'studio', 'paleo'].includes(m) ? m : 'learn';
    if (p.get('s') && STYLES[p.get('s')]) state.styleId = p.get('s');
    state.loop = p.get('loop') === '1';
    if (p.get('len') && LEN_MULT[p.get('len')]) state.studioLen = p.get('len');
    if (p.get('d')) state.dataset = p.get('d');
    if (p.get('y')) { const [a, b] = p.get('y').split('-').map(Number); if (a && b) { state.yearFrom = a; state.yearTo = b; } }
    if (p.get('src')) state.source = p.get('src');
    if (p.get('w') && WORLD_STYLE[p.get('w')]) state.world = p.get('w');
    if (p.get('tp')) state.tempo = p.get('tp');
    if (p.get('trk') && p.get('m') === 'learn') {
      const on = p.get('trk').split(',');
      for (const k of Object.keys(state.toggles)) state.toggles[k] = on.includes(k);
    }
    if (p.get('span')) { const [a, b] = p.get('span').split('-').map(Number); if (Number.isFinite(a) && b) state.paleo.span = [a, b]; }
    if (p.get('pt')) state.paleo.tempo = p.get('pt');
    if (p.get('pr') && PALEO_ROOTS[p.get('pr')] != null) state.paleo.root = p.get('pr');
    if (p.get('psc')) state.paleo.scaleId = p.get('psc');
    state.paleo.today = p.get('ptd') === '1';
    if (p.get('trk') && p.get('m') === 'paleo') {
      state.paleo.tracks = p.get('trk').split(',').slice(0, 4).map(s => {
        const [dataset, voice, octave, gain, offset] = s.split('.');
        return { dataset, voice, octave: Number(octave) || 4, gain: Number(gain) || 1, offset: Number(offset) || 0 };
      });
      while (state.paleo.tracks.length < 4) state.paleo.tracks.push({ dataset: 'off', voice: 'pluck', octave: 5, gain: 1, offset: 0 });
    }
  } catch (e) { console.warn('share parse failed', e); }
}

async function copyShare() {
  const url = encodeShare();
  history.replaceState(null, '', '#' + url.split('#')[1]);   // reflect in address bar
  let ok = false;
  try { await navigator.clipboard.writeText(url); ok = true; } catch (e) { /* fallback below */ }
  if (!ok) {
    try {
      const ta = document.createElement('textarea');
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      ok = document.execCommand('copy');
      ta.remove();
    } catch (e) { ok = false; }
  }
  const el = $('share-msg');
  el.textContent = ok ? t('link_copied') : url;
  setTimeout(() => { el.textContent = ''; }, ok ? 2500 : 8000);
}

// -------------------------------------------------------------- UI build --
function setMode(mode) {
  state.mode = mode;
  stopPlayback();
  document.body.dataset.mode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  $('legend-live').textContent = t('legend_idle');
  $('legend-rule').textContent = '';
  prepareView();
}

async function prepareView() {
  try {
    if (isLive()) $('legend-live').textContent = t('live_loading');
    await buildScore();
    redraw(-1);
    updateRuleLine();
    if (isLive()) $('legend-live').textContent = t('legend_idle');
  } catch (e) {
    console.error(e);
    $('legend-live').textContent = t(isLive() ? 'live_error' : 'data_error');
  }
}

function fillCitySelect(results = null) {
  const sel = $('sel-city');
  sel.innerHTML = '';
  const add = (value, label) => {
    const o = document.createElement('option');
    o.value = value; o.textContent = label;
    sel.appendChild(o);
    return o;
  };
  if (results) {
    for (const r of results) add(r.value, r.label);
    if (!results.length) add('global', t('dataset_global'));
  } else {
    add('global', t('dataset_global'));
    for (const c of state.cityIndex) add(c.id, `${c.label}, ${c.country}`);
  }
  // make sure the current dataset stays selectable (e.g. live city from a link)
  if (![...sel.options].some(o => o.value === state.dataset)) {
    if (String(state.dataset).startsWith('live|')) {
      const [, , label] = state.dataset.split('|');
      add(state.dataset, `${label} · live`);
    }
  }
  sel.value = state.dataset;
  if (sel.selectedIndex < 0 && sel.options.length) sel.selectedIndex = 0;
}

// worldwide search over the full Berkeley Earth catalogue (~3500 places)
async function searchCities(q) {
  q = q.trim().toLowerCase();
  if (q.length < 2) { fillCitySelect(); return; }
  if (!state.cityAll) {
    try { state.cityAll = await loadCityIndexAll(); } catch (e) { console.error(e); return; }
  }
  const curatedByLoc = new Map(state.cityIndex.map(c => [c.location, c]));
  const results = [];
  for (const r of state.cityAll) {
    const label = `${r.l}, ${r.c}`;
    if (!label.toLowerCase().includes(q)) continue;
    const cur = curatedByLoc.get(r.loc);
    results.push(cur
      ? { value: cur.id, label }
      : { value: `live|${r.loc}|${r.l}`, label: `${label} · live` });
    if (results.length >= 80) break;
  }
  // prefix matches first, then curated before live
  results.sort((a, b) =>
    (b.label.toLowerCase().startsWith(q) - a.label.toLowerCase().startsWith(q))
    || (b.value.startsWith('live|') ? -1 : 1) - (a.value.startsWith('live|') ? -1 : 1)
    || a.label.localeCompare(b.label));
  fillCitySelect(results);
  if (results.length) {
    $('sel-city').value = results[0].value;
    state.dataset = results[0].value;
    prepareView();
  }
}

function buildStudioCards() {
  const grid = $('style-grid');
  grid.innerHTML = '';
  for (const id of STYLE_ORDER) {
    const st = STYLES[id];
    const card = document.createElement('button');
    card.className = 'style-card' + (id === state.styleId ? ' active' : '');
    card.innerHTML = `
      <span class="sc-title">${t('sty_' + id + '_t')}</span>
      <span class="sc-desc">${t('sty_' + id + '_d')}</span>
      <span class="sc-meta">${st.bpm} bpm · ${st.years[0]}–${st.years[1]} · ${t('refs')} ${st.refs}</span>`;
    card.addEventListener('click', async () => {
      state.styleId = id;
      state.dataset = st.city;
      state.yearFrom = st.years[0]; state.yearTo = st.years[1];
      document.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      await startPlayback();
    });
    grid.appendChild(card);
  }
}

function buildExperiments() {
  const defs = [
    { id: 'exp1', run: () => applyLearn({ dataset: 'berlin', yearFrom: 1880, yearTo: 2020, world: 'warm', source: 'trend', tempo: 'fast', toggles: { melody: 0, bass: 1, pad: 0, extremes: 0, perc: 0 } }) },
    { id: 'exp2', run: () => applyLearn({ dataset: 'moscow', yearFrom: 1900, yearTo: 1950, world: 'quiet', source: 'anomaly', toggles: { melody: 0, bass: 0, pad: 1, extremes: 0, perc: 0 } }) },
    {
      id: 'exp3', ab: [
        { label: 'exp3_a', run: () => applyLearn({ dataset: 'berlin', yearFrom: 1880, yearTo: 1920, world: 'quiet', source: 'anomaly', toggles: { melody: 1, bass: 1, pad: 0, extremes: 1, perc: 0 } }) },
        { label: 'exp3_b', run: () => applyLearn({ dataset: 'berlin', yearFrom: 1980, yearTo: 2020, world: 'quiet', source: 'anomaly', toggles: { melody: 1, bass: 1, pad: 0, extremes: 1, perc: 0 } }) }
      ]
    },
    { id: 'exp4', run: () => applyLearn({ dataset: 'berlin', yearFrom: 1880, yearTo: 2020, world: 'electronic', source: 'anomaly', tempo: 'fast', toggles: { melody: 0, bass: 0, pad: 0, extremes: 1, perc: 0 } }) },
    { id: 'exp5', run: () => applyLearn({ dataset: 'global', yearFrom: 1880, yearTo: 2019, world: 'warm', source: 'anomaly', tempo: 'fast', toggles: { melody: 1, bass: 1, pad: 1, extremes: 1, perc: 1 } }) },
    {
      id: 'exp6', ab: [
        { label: 'exp6_a', run: () => applyLearn({ dataset: 'singapore', yearFrom: 1900, yearTo: 2020, world: 'quiet', source: 'anomaly', tempo: 'fast', toggles: { melody: 1, bass: 1, pad: 0, extremes: 1, perc: 0 } }) },
        { label: 'exp6_b', run: () => applyLearn({ dataset: 'reykjavik', yearFrom: 1900, yearTo: 2020, world: 'quiet', source: 'anomaly', tempo: 'fast', toggles: { melody: 1, bass: 1, pad: 0, extremes: 1, perc: 0 } }) }
      ]
    }
  ];
  const wrap = $('experiments');
  wrap.innerHTML = '';
  for (const d of defs) {
    const card = document.createElement('div');
    card.className = 'exp-card';
    let inner = `<span class="exp-title">${t(d.id + '_t')}</span><span class="exp-sub">${t(d.id + '_s')}</span>`;
    card.innerHTML = inner;
    if (d.ab) {
      const row = document.createElement('div');
      row.className = 'exp-ab';
      for (const v of d.ab) {
        const b = document.createElement('button');
        b.className = 'exp-btn'; b.textContent = t(v.label);
        b.addEventListener('click', v.run);
        row.appendChild(b);
      }
      card.appendChild(row);
    } else {
      const b = document.createElement('button');
      b.className = 'exp-btn'; b.textContent = '▶ ' + t('play');
      b.addEventListener('click', d.run);
      card.appendChild(b);
    }
    wrap.appendChild(card);
  }
}

async function applyLearn(cfg) {
  Object.assign(state, {
    dataset: cfg.dataset ?? state.dataset,
    yearFrom: cfg.yearFrom ?? state.yearFrom,
    yearTo: cfg.yearTo ?? state.yearTo,
    world: cfg.world ?? state.world,
    source: cfg.source ?? state.source,
    tempo: cfg.tempo ?? 'mid'
  });
  if (cfg.toggles) for (const k of Object.keys(state.toggles)) state.toggles[k] = !!cfg.toggles[k];
  syncLearnControls();
  await startPlayback();
}

function syncLearnControls() {
  $('sel-city').value = state.dataset;
  $('rng-from').value = state.yearFrom; $('rng-to').value = state.yearTo;
  $('lbl-years').textContent = `${state.yearFrom} – ${state.yearTo}`;
  $('sel-source').value = state.source;
  $('sel-world').value = state.world;
  $('sel-tempo').value = state.tempo;
  for (const k of Object.keys(state.toggles)) {
    const el = $('tgl-' + k);
    if (el) el.checked = !!state.toggles[k];
  }
}

function buildPaleoUI() {
  // constellation cards
  const wrap = $('constellations');
  wrap.innerHTML = '';
  for (const [id, def] of Object.entries(CONSTELLATIONS)) {
    const b = document.createElement('button');
    b.className = 'exp-card pc-card' + (state.paleo.constellation === id ? ' active' : '');
    b.innerHTML = `<span class="exp-title">${t('pc_' + id + '_t')}</span><span class="exp-sub">${t('pc_' + id + '_s')}</span>`;
    b.addEventListener('click', async () => {
      state.paleo.constellation = id;
      state.paleo.span = def.span.slice();
      state.paleo.tracks = def.tracks.map(([dataset, voice, octave]) => ({ dataset, voice, octave, gain: 1, offset: 0 }));
      while (state.paleo.tracks.length < 4) state.paleo.tracks.push({ dataset: 'off', voice: 'pluck', octave: 5, gain: 1, offset: 0 });
      buildPaleoUI();
      await startPlayback();
    });
    wrap.appendChild(b);
  }
  // track rows
  const rows = $('paleo-tracks');
  rows.innerHTML = '';
  state.paleo.tracks.forEach((tr, i) => {
    const row = document.createElement('div');
    row.className = 'paleo-row';
    const dsel = document.createElement('select');
    const off = document.createElement('option'); off.value = 'off'; off.textContent = t('paleo_off');
    dsel.appendChild(off);
    for (const id of PALEO_IDS) {
      const o = document.createElement('option'); o.value = id; o.textContent = t('pd_' + id);
      dsel.appendChild(o);
    }
    dsel.value = tr.dataset;
    dsel.addEventListener('change', () => { tr.dataset = dsel.value; updatePaleoInfo(); });
    const vsel = document.createElement('select');
    for (const [v, key] of [['lead', 'voice_lead'], ['pad', 'voice_pad'], ['bass', 'voice_bass'], ['pluck', 'voice_pluck'], ['bell', 'voice_bell']]) {
      const o = document.createElement('option'); o.value = v; o.textContent = t(key); vsel.appendChild(o);
    }
    vsel.value = tr.voice;
    vsel.addEventListener('change', () => { tr.voice = vsel.value; });
    const osel = document.createElement('select');
    for (const [v, key] of [[3, 'oct_low'], [5, 'oct_mid'], [6, 'oct_high']]) {
      const o = document.createElement('option'); o.value = v; o.textContent = t(key); osel.appendChild(o);
    }
    osel.value = String([3, 5, 6].includes(tr.octave) ? tr.octave : 5);
    osel.addEventListener('change', () => { tr.octave = Number(osel.value); });

    const mkSlider = (labelKey, min, max, step, val, fmtVal, onSet) => {
      const wrap = document.createElement('label');
      wrap.className = 'paleo-slider';
      const cap = document.createElement('span');
      cap.textContent = `${t(labelKey)} ${fmtVal(val)}`;
      const inp = document.createElement('input');
      inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = val;
      inp.addEventListener('input', () => {
        onSet(Number(inp.value));
        cap.textContent = `${t(labelKey)} ${fmtVal(Number(inp.value))}`;
      });
      wrap.append(cap, inp);
      return wrap;
    };
    const gainS = mkSlider('paleo_gain', 0, 1.5, 0.1, tr.gain ?? 1, v => v.toFixed(1), v => { tr.gain = v; });
    const offS = mkSlider('paleo_offset', -50, 50, 5, tr.offset ?? 0, v => (v > 0 ? '+' : '') + v + ' kyr', v => { tr.offset = v; });

    const lbl = document.createElement('span');
    lbl.className = 'paleo-row-n'; lbl.textContent = `${t('paleo_track')} ${i + 1}`;
    row.append(lbl, dsel, vsel, osel, gainS, offS);
    rows.appendChild(row);
  });
  $('sel-span').value = state.paleo.span.join('-');
  $('sel-ptempo').value = state.paleo.tempo;
  $('sel-proot').value = state.paleo.root;
  $('sel-pscale').value = state.paleo.scaleId;
  $('tgl-today').checked = state.paleo.today;
  updatePaleoPeriods();
  buildPaleoExps();
  updatePaleoInfo();
}

// how long one orbital cycle takes to *hear* at the current tempo
function updatePaleoPeriods() {
  const [from, to] = state.paleo.span;
  const span = to - from;
  const n = Math.max(120, Math.min(440, Math.round(span / 2)));
  const stepKyr = span / n;
  const stepSec = { slow: 0.2, mid: 0.13, fast: 0.085 }[state.paleo.tempo];
  const s = p => (p / stepKyr * stepSec).toFixed(1);
  $('paleo-periods').textContent = t('paleo_periods', { p100: s(100), p41: s(41), p21: s(21) });
}

const PALEO_EXPS = [
  { id: 'pexp1', cfg: { span: [0, 800], tempo: 'mid', today: false, tracks: [{ dataset: 'lr04', voice: 'lead', octave: 5 }] } },
  { id: 'pexp2', cfg: { span: [0, 800], tempo: 'mid', today: false, tracks: [{ dataset: 'epica_co2', voice: 'bass', octave: 3 }, { dataset: 'epica_temp', voice: 'lead', octave: 5 }] } },
  { id: 'pexp3', cfg: { span: [0, 800], tempo: 'mid', today: false, tracks: [{ dataset: 'epica_co2', voice: 'bass', octave: 3, offset: 20 }, { dataset: 'epica_temp', voice: 'lead', octave: 5 }] } },
  { id: 'pexp4', cfg: { span: [10, 60], tempo: 'fast', today: false, tracks: [{ dataset: 'ngrip', voice: 'lead', octave: 5 }] } }
];

function buildPaleoExps() {
  const wrap = $('paleo-exps');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (const d of PALEO_EXPS) {
    const card = document.createElement('div');
    card.className = 'exp-card';
    card.innerHTML = `<span class="exp-title">${t(d.id + '_t')}</span><span class="exp-sub">${t(d.id + '_s')}</span>`;
    const b = document.createElement('button');
    b.className = 'exp-btn'; b.textContent = '▶ ' + t('play');
    b.addEventListener('click', async () => {
      state.paleo.span = d.cfg.span.slice();
      state.paleo.tempo = d.cfg.tempo;
      state.paleo.today = d.cfg.today;
      state.paleo.tracks = d.cfg.tracks.map(tr => ({ gain: 1, offset: 0, ...tr }));
      while (state.paleo.tracks.length < 4) state.paleo.tracks.push({ dataset: 'off', voice: 'pluck', octave: 5, gain: 1, offset: 0 });
      buildPaleoUI();
      await startPlayback();
    });
    card.appendChild(b);
    wrap.appendChild(card);
  }
}

function updatePaleoInfo() {
  const active = state.paleo.tracks.filter(tr => tr.dataset !== 'off');
  $('paleo-info').innerHTML = active.map(tr =>
    `<p><b>${t('pd_' + tr.dataset)}</b> — ${t('pd_' + tr.dataset + '_d')}</p>`).join('');
}

// ------------------------------------------------------------------ init --
function wire() {
  document.querySelectorAll('.mode-btn').forEach(b =>
    b.addEventListener('click', () => setMode(b.dataset.mode)));

  document.querySelectorAll('.lang-btn').forEach(b =>
    b.addEventListener('click', () => {
      setLang(b.dataset.lang);
      refreshTexts();
    }));

  $('btn-play').addEventListener('click', () => {
    if (state.handle) stopPlayback(); else startPlayback();
  });

  const seek = $('seek');
  seek.addEventListener('pointerdown', () => { state.seeking = true; });
  seek.addEventListener('input', () => {
    const frac = Number(seek.value) / 1000;
    paintSeek(frac);
    if (state.score) $('time-disp').textContent = `${fmt(frac * state.score.duration)} / ${fmt(state.score.duration)}`;
  });
  seek.addEventListener('change', () => {
    state.seeking = false;
    seekTo(Number(seek.value) / 1000);
  });
  seek.addEventListener('pointerup', () => { state.seeking = false; });

  document.querySelectorAll('#seg-len .seg-btn').forEach(b =>
    b.addEventListener('click', () => {
      state.studioLen = b.dataset.len;
      syncLenSeg();
      if (state.mode === 'studio' && state.handle) startPlayback();
    }));
  $('btn-wav').addEventListener('click', exportWav);
  $('btn-share').addEventListener('click', copyShare);

  $('sel-city').addEventListener('change', async e => { state.dataset = e.target.value; await prepareView(); });
  const yearInput = () => {
    let a = Number($('rng-from').value), b = Number($('rng-to').value);
    if (a > b - 5) a = b - 5;
    state.yearFrom = a; state.yearTo = b;
    $('lbl-years').textContent = `${a} – ${b}`;
  };
  $('rng-from').addEventListener('input', yearInput);
  $('rng-to').addEventListener('input', yearInput);
  $('rng-from').addEventListener('change', prepareView);
  $('rng-to').addEventListener('change', prepareView);
  $('sel-source').addEventListener('change', e => { state.source = e.target.value; });
  $('sel-world').addEventListener('change', e => { state.world = e.target.value; });
  $('sel-tempo').addEventListener('change', e => { state.tempo = e.target.value; });

  for (const k of Object.keys(state.toggles)) {
    const el = $('tgl-' + k);
    if (el) el.addEventListener('change', () => { state.toggles[k] = el.checked; applyToggles(); });
  }

  $('tgl-loop').addEventListener('change', e => { state.loop = e.target.checked; updateLoopStatus(); });

  let searchTimer = null;
  $('city-search').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => searchCities(e.target.value), 250);
  });

  $('sel-span').addEventListener('change', e => {
    const [a, b] = e.target.value.split('-').map(Number);
    state.paleo.span = [a, b];
    updatePaleoPeriods();
  });
  $('sel-ptempo').addEventListener('change', e => { state.paleo.tempo = e.target.value; updatePaleoPeriods(); });
  $('sel-proot').addEventListener('change', e => { state.paleo.root = e.target.value; });
  $('sel-pscale').addEventListener('change', e => { state.paleo.scaleId = e.target.value; });
  $('tgl-today').addEventListener('change', e => { state.paleo.today = e.target.checked; });

  window.addEventListener('resize', () => redraw(state.handle ? playFracFromPos(state.handle.position()) : -1));
}

function refreshTexts() {
  applyI18n();
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === getLang()));
  fillCitySelect();
  buildStudioCards();
  buildExperiments();
  buildPaleoUI();
  syncLearnControls();
  $('legend-live').textContent = t('legend_idle');
  $('btn-play').textContent = (state.handle ? '■ ' + t('stop') : '▶ ' + t('play'));
  $('btn-wav').textContent = '⬇ ' + t('download_wav');
  $('btn-share').textContent = '🔗 ' + t('share_link');
  $('tgl-loop').checked = state.loop;
  syncLenSeg();
  updateLoopStatus();
  updateRuleLine();
}

function syncLenSeg() {
  document.querySelectorAll('#seg-len .seg-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.len === state.studioLen));
}

async function init() {
  decodeShare();
  if (state.mode === 'studio') {
    const st = STYLES[state.styleId];
    state.dataset = st.city;
    state.yearFrom = st.years[0]; state.yearTo = st.years[1];
  }
  try { state.cityIndex = await loadCityIndex(); } catch (e) { console.error(e); }
  wire();
  refreshTexts();
  document.body.dataset.mode = state.mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === state.mode));
  await prepareView();
}

init();

// dev/debug hook (harmless in production)
window.__cms = { state, loopAdvance };
