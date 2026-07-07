// data.js — loading of the bundled JSON data and derivation of the musical
// material: trend, seasonal cycle, statistics and event flags per month.

const cache = new Map();

async function fetchJson(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('fetch failed: ' + url);
  const json = await res.json();
  cache.set(url, json);
  return json;
}

export const loadCityIndex = () => fetchJson('data/cities.json');
export const loadCity = id => fetchJson(`data/cities/${id}.json`);
export const loadGlobal = () => fetchJson('data/global.json');
export const loadPaleo = () => fetchJson('data/paleo.json');
// full Berkeley Earth catalogue (~3500 cities), scraped index: [{l, c, loc}]
export const loadCityIndexAll = () => fetchJson('data/cities-all.json');

// ---- live loading of any Berkeley Earth city (CORS-enabled mirror) --------
const BERKELEY_URL = 'https://data.berkeleyearth.org/auto/Local/TAVG/Text/%s-TAVG-Trend.txt';

export async function loadCityLive(location, label, country) {
  const key = 'live:' + location;
  if (cache.has(key)) return cache.get(key);
  const res = await fetch(BERKELEY_URL.replace('%s', location));
  if (!res.ok) throw new Error('Berkeley Earth fetch failed: ' + location);
  const text = await res.text();
  const lines = text.split('\n');

  // monthly climatology ("monthly absolute temperature" block)
  let normals = null;
  const ni = lines.findIndex(l => /monthly absolute temperature/i.test(l));
  if (ni >= 0) {
    for (let k = ni + 1; k < Math.min(lines.length, ni + 9); k++) {
      if (/^%%\s*[-0-9]/.test(lines[k])) {
        const nums = lines[k].replace(/^%%/, '').trim().split(/\s+/).map(Number).filter(Number.isFinite);
        if (nums.length >= 12) normals = nums.slice(0, 12);
        break;
      }
    }
  }

  const year = [], month = [], anomaly = [], unc = [], ten = [];
  for (const l of lines) {
    if (!/^\s*\d{4}\s+\d{1,2}\s/.test(l)) continue;
    const p = l.trim().split(/\s+/).map(Number);
    if (!Number.isFinite(p[2])) continue;              // anomaly missing
    year.push(p[0]); month.push(p[1]); anomaly.push(p[2]);
    unc.push(Number.isFinite(p[3]) ? p[3] : null);
    ten.push(Number.isFinite(p[8]) ? p[8] : null);     // 10-year moving average
  }
  if (!year.length) throw new Error('no data rows for ' + location);

  const raw = {
    id: key, label, country, location,
    source: `Berkeley Earth, ${location} (TAVG, live)`,
    normals, first_year: year[0], last_year: year[year.length - 1],
    year, month, anomaly, unc, ten
  };
  cache.set(key, raw);
  return raw;
}

const quantile = (arr, q) => {
  const s = arr.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (!s.length) return NaN;
  const pos = (s.length - 1) * q, lo = Math.floor(pos);
  return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (pos - lo);
};

const mean = arr => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

function rollingMean(values, window) {
  const half = Math.floor(window / 2), out = new Array(values.length);
  let sum = 0, cnt = 0;
  // simple O(n·w) is fine for <4000 points
  for (let i = 0; i < values.length; i++) {
    let s = 0, c = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(values.length - 1, i + half); j++) {
      if (Number.isFinite(values[j])) { s += values[j]; c++; }
    }
    out[i] = c ? s / c : NaN;
  }
  return out;
}

// Build the "material": one object per month with values and event flags.
// Works for both city records (Berkeley) and the global record (HadCRUT).
export function buildMaterial(raw, yearFrom, yearTo) {
  const idx = [];
  for (let i = 0; i < raw.year.length; i++) {
    if (raw.year[i] >= yearFrom && raw.year[i] <= yearTo && Number.isFinite(raw.anomaly[i])) idx.push(i);
  }
  const anomaly = idx.map(i => raw.anomaly[i]);
  const years = idx.map(i => raw.year[i]);
  const months = idx.map(i => raw.month[i]);

  // trend: use Berkeley 10-year column when present, else rolling 121-month mean
  let trend;
  if (raw.ten) {
    trend = idx.map(i => raw.ten[i]);
    const fallback = rollingMean(anomaly, 121);
    trend = trend.map((v, k) => Number.isFinite(v) ? v : fallback[k]);
  } else {
    trend = rollingMean(anomaly, 121);
  }

  // seasonal cycle: monthly normals if present (city), else mean anomaly by month
  let normals = raw.normals;
  if (!normals || !normals.every(Number.isFinite)) {
    normals = Array.from({ length: 12 }, (_, m) => mean(anomaly.filter((_, k) => months[k] === m + 1)));
  }
  const nLo = Math.min(...normals), nHi = Math.max(...normals);
  const seasonNorm = months.map(m => nHi > nLo ? (normals[m - 1] - nLo) / (nHi - nLo) : 0.5);

  const m0 = mean(anomaly);
  const sd = Math.sqrt(mean(anomaly.map(a => (a - m0) * (a - m0)))) || 1;
  const q96 = quantile(anomaly, 0.96);
  const jumps = anomaly.map((a, k) => k ? Math.abs(a - anomaly[k - 1]) : 0);
  const jq96 = quantile(jumps.slice(1), 0.96);

  // warm runs: >= 3 consecutive months above mean + 0.9 sd
  const warm = anomaly.map(a => a > m0 + 0.9 * sd);
  const runStart = new Array(anomaly.length).fill(false);
  for (let k = 0; k < warm.length;) {
    if (!warm[k]) { k++; continue; }
    let e = k; while (e < warm.length && warm[e]) e++;
    if (e - k >= 3) runStart[k] = true;
    k = e;
  }

  const rows = anomaly.map((a, k) => ({
    year: years[k], month: months[k],
    anomaly: a,
    trend: trend[k],
    season: seasonNorm[k],                       // 0..1 within the annual cycle
    unc: raw.unc ? raw.unc[idx[k]] : null,
    nh: raw.nh_abs ? raw.nh_abs[idx[k]] : null,  // global record only
    sh: raw.sh_abs ? raw.sh_abs[idx[k]] : null,
    hot: a > m0 + 1.5 * sd,
    record: a >= q96,
    cold: a < m0 - 1.2 * sd,
    jump: k > 0 && jumps[k] >= jq96,
    runStart: runStart[k]
  }));

  return {
    rows,
    stats: {
      mean: m0, sd,
      lo: quantile(anomaly, 0.02), hi: quantile(anomaly, 0.98),
      trendLo: quantile(trend, 0.02), trendHi: quantile(trend, 0.98),
      yearFrom: years[0], yearTo: years[years.length - 1]
    },
    label: raw.label || 'Global', source: raw.source
  };
}

// Interpolate a paleo series onto a regular age grid (kyr). NaN outside coverage.
export function paleoOnGrid(series, grid) {
  const { age, value } = series;
  return grid.map(g => {
    if (g < age[0] || g > age[age.length - 1]) return NaN;
    // binary search
    let lo = 0, hi = age.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; (age[mid] <= g ? lo = mid : hi = mid); }
    const a0 = age[lo], a1 = age[hi], v0 = value[lo], v1 = value[hi];
    if (!Number.isFinite(v0) || !Number.isFinite(v1)) return NaN;
    return a1 > a0 ? v0 + (v1 - v0) * (g - a0) / (a1 - a0) : v0;
  });
}

export { quantile };
