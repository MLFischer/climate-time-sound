// app.js — UI wiring: modes, controls, playback sync, experiments, sharing.

import { t, setLang, getLang, applyI18n } from './i18n.js';
import { loadCityIndex, loadCity, loadGlobal, loadPaleo, buildMaterial } from './data.js';
import { play, renderWav } from './engine.js';
import { STYLES, STYLE_ORDER, buildClimateScore, buildPaleoScore } from './score.js';
import { drawClimate, drawPaleo } from './viz.js';

const $ = id => document.getElementById(id);

const state = {
  mode: 'learn',
  dataset: 'berlin', yearFrom: 1970, yearTo: 2020,
  source: 'anomaly', world: 'warm', tempo: 'mid',
  toggles: { melody: true, bass: true, pad: true, extremes: true, perc: true },
  styleId: 'downtempo',
  paleo: {
    span: [0, 800], tempo: 'mid', constellation: 'iceages',
    tracks: [
      { dataset: 'lr04', voice: 'lead', octave: 5 },
      { dataset: 'epica_co2', voice: 'bass', octave: 3 },
      { dataset: 'epica_temp', voice: 'pad', octave: 4 },
      { dataset: 'off', voice: 'pluck', octave: 5 }
    ]
  },
  material: null, score: null, handle: null, paleoData: null, cityIndex: []
};

const WORLD_STYLE = { quiet: 'neoclassic', warm: 'downtempo', electronic: 'driving', wide: 'ambient' };
// learn-mode tempo: months per second matter more than bpm — long windows
// need fast month rates; the score builder thins the beat automatically.
const TEMPO_MULT = { slow: 1, mid: 0.5, fast: 0.25 };

const PALEO_IDS = ['lr04', 'epica_co2', 'epica_temp', 'vostok_co2', 'vostok_temp', 'chew_k',
  'bosumtwi', 'geob1016_sst', 'enso_pc1', 'ngrip', 'sanbao', 'geob1028_nam', 'kl15_cati',
  'ecc', 'obl', 'prec'];

const CONSTELLATIONS = {
  iceages: { span: [0, 800], tracks: [['lr04', 'lead', 5], ['epica_co2', 'bass', 3], ['epica_temp', 'pad', 4]] },
  milank: { span: [0, 800], tracks: [['ecc', 'pad', 3], ['obl', 'pad', 4], ['prec', 'pluck', 6], ['lr04', 'lead', 5]] },
  africa: { span: [0, 500], tracks: [['chew_k', 'pluck', 6], ['kl15_cati', 'pluck', 5], ['lr04', 'pad', 3]] },
  do: { span: [10, 60], tracks: [['ngrip', 'lead', 5], ['ngrip', 'bass', 3]] },
  monsoon: { span: [127, 387], tracks: [['sanbao', 'pluck', 6], ['prec', 'pad', 3]] },
  enso: { span: [12, 205], tracks: [['enso_pc1', 'lead', 5], ['geob1016_sst', 'pad', 3]] }
};

// ------------------------------------------------------------------ audio --
function stopPlayback() {
  if (state.handle) { state.handle.stop(); state.handle = null; }
  $('btn-play').textContent = '▶ ' + t('play');
}

async function buildScore() {
  if (state.mode === 'paleo') {
    if (!state.paleoData) state.paleoData = await loadPaleo();
    const tracks = state.paleo.tracks.map(tr => ({
      ...tr, series: tr.dataset !== 'off' ? state.paleoData[tr.dataset] : null
    }));
    const stepSec = { slow: 0.2, mid: 0.13, fast: 0.085 }[state.paleo.tempo];
    state.score = buildPaleoScore(tracks, {
      from: state.paleo.span[0], to: state.paleo.span[1], stepSec
    });
    state.material = null;
    return;
  }
  const raw = state.dataset === 'global' ? await loadGlobal() : await loadCity(state.dataset);
  state.material = buildMaterial(raw, state.yearFrom, state.yearTo);
  const styleId = state.mode === 'studio' ? state.styleId : WORLD_STYLE[state.world];
  const tempoMult = state.mode === 'studio' ? 1 : TEMPO_MULT[state.tempo];
  state.score = buildClimateScore(state.material, styleId, {
    source: state.mode === 'studio' ? 'anomaly' : state.source,
    tempoMult, seed: 20260706
  });
}

async function startPlayback() {
  stopPlayback();
  $('legend-live').textContent = t('loading');
  try { await buildScore(); } catch (e) {
    console.error(e); $('legend-live').textContent = t('data_error'); return;
  }
  redraw(-1);
  updateRuleLine();
  const handle = play(state.score, { onEnd: () => { if (state.handle === handle) { state.handle = null; $('btn-play').textContent = '▶ ' + t('play'); redraw(-1); } } });
  state.handle = handle;
  applyToggles();
  $('btn-play').textContent = '■ ' + t('stop');
  requestAnimationFrame(tick);
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

function tick() {
  const h = state.handle;
  if (!h) return;
  const pos = h.position();
  const frac = Math.max(0, Math.min(1, pos / h.duration));
  $('bar-fill').style.width = (frac * 100) + '%';
  $('time-disp').textContent = `${fmt(Math.max(0, pos))} / ${fmt(h.duration)}`;
  redraw(playFracFromPos(pos));
  updateLegend(pos);
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
      $('legend-live').textContent = `${Math.round(m.ages[i])} kyr BP`;
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
    drawClimate(canvas, state.material, frac);
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
  if (state.mode === 'studio') p.set('s', state.styleId);
  else if (state.mode === 'paleo') {
    p.set('span', state.paleo.span.join('-'));
    p.set('pt', state.paleo.tempo);
    p.set('trk', state.paleo.tracks.map(tr => `${tr.dataset}.${tr.voice}.${tr.octave}`).join(','));
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
    if (p.get('trk') && p.get('m') === 'paleo') {
      state.paleo.tracks = p.get('trk').split(',').slice(0, 4).map(s => {
        const [dataset, voice, octave] = s.split('.');
        return { dataset, voice, octave: Number(octave) || 4 };
      });
      while (state.paleo.tracks.length < 4) state.paleo.tracks.push({ dataset: 'off', voice: 'pluck', octave: 5 });
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
    await buildScore();
    redraw(-1);
    updateRuleLine();
  } catch (e) { console.error(e); }
}

function fillCitySelect() {
  const sel = $('sel-city');
  sel.innerHTML = '';
  const og = document.createElement('option');
  og.value = 'global'; og.textContent = t('dataset_global');
  sel.appendChild(og);
  for (const c of state.cityIndex) {
    const o = document.createElement('option');
    o.value = c.id; o.textContent = `${c.label}, ${c.country}`;
    sel.appendChild(o);
  }
  sel.value = state.dataset;
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
      state.paleo.tracks = def.tracks.map(([dataset, voice, octave]) => ({ dataset, voice, octave }));
      while (state.paleo.tracks.length < 4) state.paleo.tracks.push({ dataset: 'off', voice: 'pluck', octave: 5 });
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
    const lbl = document.createElement('span');
    lbl.className = 'paleo-row-n'; lbl.textContent = `${t('paleo_track')} ${i + 1}`;
    row.append(lbl, dsel, vsel, osel);
    rows.appendChild(row);
  });
  $('sel-span').value = state.paleo.span.join('-');
  $('sel-ptempo').value = state.paleo.tempo;
  updatePaleoInfo();
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

  $('sel-span').addEventListener('change', e => {
    const [a, b] = e.target.value.split('-').map(Number);
    state.paleo.span = [a, b];
  });
  $('sel-ptempo').addEventListener('change', e => { state.paleo.tempo = e.target.value; });

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
  updateRuleLine();
}

async function init() {
  decodeShare();
  try { state.cityIndex = await loadCityIndex(); } catch (e) { console.error(e); }
  wire();
  refreshTexts();
  document.body.dataset.mode = state.mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === state.mode));
  await prepareView();
}

init();
