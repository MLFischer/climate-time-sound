// engine.js — Web Audio synthesis engine.
// A score is a plain list of events; the engine can play it live (chunked
// scheduling) or render it offline to a WAV file with the identical graph.
//
// Event: { t, dur, track, voice, f | fs[], vel, pan, bright, send:{delay,verb},
//          accent, slide, open, punch, drive, duck }

let ctx = null;
export function audioContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// ---------------------------------------------------------------- helpers --
function noiseBuffer(ac) {
  if (ac._cmsNoise) return ac._cmsNoise;
  const len = 2 * ac.sampleRate;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  ac._cmsNoise = buf;
  return buf;
}

function impulseResponse(ac, seconds, decayPow) {
  const len = Math.max(1, Math.floor(seconds * ac.sampleRate));
  const buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const w = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decayPow);
      lp += 0.28 * (w - lp);              // darken the tail
      d[i] = lp;
    }
  }
  return buf;
}

function shaperCurve(drive) {
  const n = 1024, c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.tanh(x * drive) / Math.tanh(drive);
  }
  return c;
}

const stopAll = (nodes, when) => nodes.forEach(n => { try { n.stop(when); } catch (e) { /* already stopped */ } });

// ------------------------------------------------------------------ session -
// Builds the mixer graph in any BaseAudioContext (live or offline).
export function buildSession(ac, style = {}) {
  const master = ac.createGain(); master.gain.value = 0.9;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 3;
  comp.attack.value = 0.012; comp.release.value = 0.18;
  const limiter = ac.createDynamicsCompressor();
  limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20;
  limiter.attack.value = 0.001; limiter.release.value = 0.06;
  master.connect(comp); comp.connect(limiter); limiter.connect(ac.destination);

  // ducked bus (pads, bass, fx returns) — kicks push it down for the pump
  const duck = ac.createGain(); duck.connect(master);

  // tempo-synced feedback delay
  const delayIn = ac.createGain();
  const delay = ac.createDelay(2.5); delay.delayTime.value = style.delayTime ?? 0.4;
  const fb = ac.createGain(); fb.gain.value = style.delayFb ?? 0.45;
  const dLp = ac.createBiquadFilter(); dLp.type = 'lowpass'; dLp.frequency.value = 2200;
  const dOut = ac.createGain(); dOut.gain.value = 0.9;
  delayIn.connect(delay); delay.connect(dLp); dLp.connect(fb); fb.connect(delay);
  dLp.connect(dOut); dOut.connect(duck);

  // reverb
  const verbIn = ac.createGain();
  const conv = ac.createConvolver();
  conv.buffer = impulseResponse(ac, style.verbSec ?? 2.6, style.verbDecay ?? 2.6);
  const vOut = ac.createGain(); vOut.gain.value = 0.8;
  verbIn.connect(conv); conv.connect(vOut); vOut.connect(duck);

  // per-track gains for live decomposition (learn mode)
  const tracks = {};
  for (const id of ['melody', 'bass', 'pad', 'perc', 'extremes', 'texture']) {
    const g = ac.createGain();
    g.connect(id === 'pad' || id === 'bass' || id === 'texture' ? duck : master);
    tracks[id] = g;
  }

  return { ac, master, duck, delayIn, verbIn, tracks, duckDepth: style.duck ?? 0 };
}

// ------------------------------------------------------------------ voices --
// Every voice writes into `out` starting at `when`; envelopes self-release.

function vKick(s, out, when, e) {
  const ac = s.ac, dur = e.dur ?? 0.4;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const punch = e.punch ?? 0.6;
  const f0 = 45 + 130 * punch, f1 = 42;
  osc.frequency.setValueAtTime(f0, when);
  osc.frequency.exponentialRampToValueAtTime(f1, when + 0.055 + 0.05 * punch);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(e.vel, when + 0.002);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  let chain = g;
  if (e.drive) {
    const ws = ac.createWaveShaper(); ws.curve = shaperCurve(1 + e.drive * 4);
    g.connect(ws); chain = ws;
  }
  osc.connect(g); chain.connect(out);
  // click transient
  const nb = ac.createBufferSource(); nb.buffer = noiseBuffer(ac);
  const nf = ac.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 1400;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(e.vel * (0.15 + 0.4 * punch), when);
  ng.gain.exponentialRampToValueAtTime(0.001, when + 0.02);
  nb.connect(nf); nf.connect(ng); ng.connect(out);
  osc.start(when); nb.start(when);
  stopAll([osc, nb], when + dur + 0.05);
  // sidechain pump
  if (s.duckDepth > 0) {
    const d = s.duck.gain;
    d.cancelScheduledValues(when);
    d.setValueAtTime(1, when);
    d.linearRampToValueAtTime(1 - s.duckDepth, when + 0.012);
    d.setTargetAtTime(1, when + 0.03, 0.11);
  }
}

function vHat(s, out, when, e) {
  const ac = s.ac, open = e.open ? 0.28 : 0.045;
  const nb = ac.createBufferSource(); nb.buffer = noiseBuffer(ac);
  nb.loop = true; nb.loopEnd = 2;
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7500;
  const g = ac.createGain();
  g.gain.setValueAtTime(e.vel, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + open);
  nb.connect(hp); hp.connect(g); g.connect(out);
  nb.start(when, Math.random() * 1.5); stopAll([nb], when + open + 0.02);
}

function vClap(s, out, when, e) {
  const ac = s.ac;
  const nb = ac.createBufferSource(); nb.buffer = noiseBuffer(ac); nb.loop = true;
  const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 1.2;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, when);
  for (let i = 0; i < 3; i++) {                       // three micro bursts
    const tt = when + i * 0.011;
    g.gain.setValueAtTime(e.vel * (1 - i * 0.25), tt);
    g.gain.exponentialRampToValueAtTime(e.vel * 0.15, tt + 0.009);
  }
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.22);
  nb.connect(bp); bp.connect(g); g.connect(out);
  nb.start(when, Math.random()); stopAll([nb], when + 0.3);
}

function vSnare(s, out, when, e) {
  const ac = s.ac;
  const nb = ac.createBufferSource(); nb.buffer = noiseBuffer(ac); nb.loop = true;
  const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = e.metal ? 2600 : 1900; bp.Q.value = 0.9;
  const g = ac.createGain();
  g.gain.setValueAtTime(e.vel, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + (e.metal ? 0.28 : 0.16));
  const osc = ac.createOscillator(); osc.frequency.value = 190;
  const og = ac.createGain();
  og.gain.setValueAtTime(e.vel * 0.5, when);
  og.gain.exponentialRampToValueAtTime(0.001, when + 0.08);
  nb.connect(bp); bp.connect(g); g.connect(out);
  osc.connect(og); og.connect(out);
  nb.start(when, Math.random()); osc.start(when);
  stopAll([nb, osc], when + 0.35);
}

function vShaker(s, out, when, e) {
  const ac = s.ac;
  const nb = ac.createBufferSource(); nb.buffer = noiseBuffer(ac); nb.loop = true;
  const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 5600; bp.Q.value = 2;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(e.vel, when + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.09);
  nb.connect(bp); bp.connect(g); g.connect(out);
  nb.start(when, Math.random()); stopAll([nb], when + 0.15);
}

function vRide(s, out, when, e) {
  const ac = s.ac;
  const nb = ac.createBufferSource(); nb.buffer = noiseBuffer(ac); nb.loop = true;
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5200;
  const g = ac.createGain();
  g.gain.setValueAtTime(e.vel, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 1.1);
  nb.connect(hp); hp.connect(g); g.connect(out);
  nb.start(when, Math.random()); stopAll([nb], when + 1.2);
}

function vSub(s, out, when, e) {
  const ac = s.ac, dur = e.dur ?? 0.5;
  const o1 = ac.createOscillator(); o1.frequency.value = e.f;
  const o2 = ac.createOscillator(); o2.frequency.value = e.f * 2;
  const g = ac.createGain(), g2 = ac.createGain(); g2.gain.value = 0.18;
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(e.vel, when + 0.02);
  g.gain.setValueAtTime(e.vel, when + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(out);
  o1.start(when); o2.start(when); stopAll([o1, o2], when + dur + 0.05);
}

function vAcid(s, out, when, e) {
  const ac = s.ac, dur = e.dur ?? 0.22;
  const osc = ac.createOscillator(); osc.type = 'sawtooth';
  if (e.slide) {
    osc.frequency.setValueAtTime(e.slide, when);
    osc.frequency.exponentialRampToValueAtTime(e.f, when + Math.min(0.09, dur * 0.5));
  } else osc.frequency.value = e.f;
  const flt = ac.createBiquadFilter(); flt.type = 'lowpass';
  flt.Q.value = e.accent ? 14 : 9;
  const base = 180 + (e.bright ?? 0.4) * 900;
  const peak = base + (e.accent ? 3800 : 2100) * (0.35 + (e.bright ?? 0.4));
  flt.frequency.setValueAtTime(peak, when);
  flt.frequency.exponentialRampToValueAtTime(base, when + dur * 0.85);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(e.vel * (e.accent ? 1.25 : 1), when + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  const ws = ac.createWaveShaper(); ws.curve = shaperCurve(1.6);
  osc.connect(flt); flt.connect(g); g.connect(ws); ws.connect(out);
  osc.start(when); stopAll([osc], when + dur + 0.05);
}

function vStab(s, out, when, e) {           // detuned saw chord, dub stabs
  const ac = s.ac, dur = e.dur ?? 0.4;
  const flt = ac.createBiquadFilter(); flt.type = 'lowpass'; flt.Q.value = 2.2;
  const cf = 500 + (e.bright ?? 0.3) * 1400;
  flt.frequency.setValueAtTime(cf, when);
  flt.frequency.exponentialRampToValueAtTime(Math.max(220, cf * 0.4), when + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(e.vel, when + 0.006);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  const oscs = [];
  for (const f of e.fs) for (const det of [-6, 6]) {
    const o = ac.createOscillator(); o.type = 'sawtooth';
    o.frequency.value = f; o.detune.value = det;
    o.connect(flt); oscs.push(o);
  }
  flt.connect(g); g.connect(out);
  oscs.forEach(o => o.start(when)); stopAll(oscs, when + dur + 0.05);
}

function vPad(s, out, when, e) {
  const ac = s.ac, dur = e.dur ?? 3;
  const flt = ac.createBiquadFilter(); flt.type = 'lowpass';
  flt.frequency.value = 320 + (e.bright ?? 0.35) * 2400; flt.Q.value = 0.6;
  const lfo = ac.createOscillator(); lfo.frequency.value = 0.11;
  const lg = ac.createGain(); lg.gain.value = 120;
  lfo.connect(lg); lg.connect(flt.frequency);
  const g = ac.createGain();
  const atk = Math.min(1.4, dur * 0.35), rel = Math.min(2, dur * 0.45);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(e.vel, when + atk);
  g.gain.setValueAtTime(e.vel, when + dur - rel);
  g.gain.linearRampToValueAtTime(0, when + dur);
  const oscs = [];
  const fs = e.fs || [e.f];
  for (const f of fs) {
    for (const det of [-7, 7]) {
      const o = ac.createOscillator(); o.type = 'sawtooth';
      o.frequency.value = f; o.detune.value = det; o.connect(flt); oscs.push(o);
    }
    const su = ac.createOscillator(); su.frequency.value = f / 2;
    const sg = ac.createGain(); sg.gain.value = 0.4;
    su.connect(sg); sg.connect(flt); oscs.push(su);
  }
  flt.connect(g); g.connect(out);
  oscs.push(lfo);
  oscs.forEach(o => o.start(when)); stopAll(oscs, when + dur + 0.1);
}

function vPluck(s, out, when, e) {
  const ac = s.ac, dur = e.dur ?? 0.5;
  const o1 = ac.createOscillator(); o1.type = 'triangle'; o1.frequency.value = e.f;
  const o2 = ac.createOscillator(); o2.frequency.value = e.f * 2; o2.detune.value = 4;
  const flt = ac.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 1400 + (e.bright ?? 0.4) * 2400;
  const g = ac.createGain(), g2 = ac.createGain(); g2.gain.value = 0.25;
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(e.vel, when + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  o1.connect(flt); o2.connect(g2); g2.connect(flt); flt.connect(g); g.connect(out);
  o1.start(when); o2.start(when); stopAll([o1, o2], when + dur + 0.05);
}

function vBell(s, out, when, e) {           // simple 2-op FM bell
  const ac = s.ac, dur = e.dur ?? 1.6;
  const car = ac.createOscillator(); car.frequency.value = e.f;
  const mod = ac.createOscillator(); mod.frequency.value = e.f * 3.47;
  const mg = ac.createGain();
  mg.gain.setValueAtTime(e.f * 2.6, when);
  mg.gain.exponentialRampToValueAtTime(1, when + dur * 0.7);
  mod.connect(mg); mg.connect(car.frequency);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(e.vel, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  car.connect(g); g.connect(out);
  car.start(when); mod.start(when); stopAll([car, mod], when + dur + 0.05);
}

function vPiano(s, out, when, e) {          // stylised felt piano
  const ac = s.ac, dur = e.dur ?? 1.8;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(e.vel, when + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  const flt = ac.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 3800;
  const partials = [[1, 1], [2.003, 0.38], [3.02, 0.12]];
  const oscs = partials.map(([r, a]) => {
    const o = ac.createOscillator(); o.frequency.value = e.f * r;
    const og = ac.createGain(); og.gain.setValueAtTime(a, when);
    og.gain.exponentialRampToValueAtTime(a * 0.05, when + dur * 0.8);
    o.connect(og); og.connect(flt); return o;
  });
  const nb = ac.createBufferSource(); nb.buffer = noiseBuffer(ac);   // hammer
  const ng = ac.createGain();
  ng.gain.setValueAtTime(e.vel * 0.08, when);
  ng.gain.exponentialRampToValueAtTime(0.001, when + 0.015);
  nb.connect(ng); ng.connect(flt);
  flt.connect(g); g.connect(out);
  oscs.forEach(o => o.start(when)); nb.start(when);
  stopAll([...oscs, nb], when + dur + 0.05);
}

function vDrone(s, out, when, e) {
  const ac = s.ac, dur = e.dur ?? 6;
  const flt = ac.createBiquadFilter(); flt.type = 'lowpass';
  flt.frequency.value = 180 + (e.bright ?? 0.2) * 500; flt.Q.value = 1.5;
  const lfo = ac.createOscillator(); lfo.frequency.value = 0.05;
  const lg = ac.createGain(); lg.gain.value = 90;
  lfo.connect(lg); lg.connect(flt.frequency);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(e.vel, when + dur * 0.4);
  g.gain.linearRampToValueAtTime(0, when + dur);
  const oscs = [lfo];
  for (const [mult, det] of [[1, -4], [1, 4], [0.5, 0]]) {
    const o = ac.createOscillator(); o.type = 'sawtooth';
    o.frequency.value = e.f * mult; o.detune.value = det;
    o.connect(flt); oscs.push(o);
  }
  flt.connect(g); g.connect(out);
  oscs.forEach(o => o.start(when)); stopAll(oscs, when + dur + 0.1);
}

function vRiser(s, out, when, e) {
  const ac = s.ac, dur = e.dur ?? 2;
  const nb = ac.createBufferSource(); nb.buffer = noiseBuffer(ac); nb.loop = true;
  const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(350, when);
  bp.frequency.exponentialRampToValueAtTime(4200, when + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(e.vel, when + dur);
  g.gain.linearRampToValueAtTime(0, when + dur + 0.05);
  nb.connect(bp); bp.connect(g); g.connect(out);
  nb.start(when, Math.random()); stopAll([nb], when + dur + 0.1);
}

function vImpact(s, out, when, e) {
  const ac = s.ac, dur = e.dur ?? 1.8;
  const osc = ac.createOscillator();
  osc.frequency.setValueAtTime(e.f ?? 110, when);
  osc.frequency.exponentialRampToValueAtTime(40, when + 0.4);
  const g = ac.createGain();
  g.gain.setValueAtTime(e.vel, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  const nb = ac.createBufferSource(); nb.buffer = noiseBuffer(ac);
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(e.vel * 0.5, when);
  ng.gain.exponentialRampToValueAtTime(0.001, when + 0.5);
  osc.connect(g); g.connect(out);
  nb.connect(lp); lp.connect(ng); ng.connect(out);
  osc.start(when); nb.start(when); stopAll([osc, nb], when + dur + 0.05);
}

function vVinyl(s, out, when, e) {          // continuous crackle texture
  const ac = s.ac, dur = e.dur ?? 10;
  const nb = ac.createBufferSource(); nb.buffer = noiseBuffer(ac); nb.loop = true;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(e.vel, when + 1);
  g.gain.setValueAtTime(e.vel, when + dur - 1);
  g.gain.linearRampToValueAtTime(0, when + dur);
  nb.connect(hp); hp.connect(lp); lp.connect(g); g.connect(out);
  nb.start(when); stopAll([nb], when + dur + 0.1);
}

const VOICES = {
  kick: vKick, hat: vHat, clap: vClap, snare: vSnare, shaker: vShaker, ride: vRide,
  sub: vSub, acid: vAcid, stab: vStab, pad: vPad, pluck: vPluck, bell: vBell,
  piano: vPiano, drone: vDrone, riser: vRiser, impact: vImpact, vinyl: vVinyl
};

// -------------------------------------------------------------- scheduling --
export function scheduleEvent(session, ev, t0) {
  const ac = session.ac;
  const fn = VOICES[ev.voice];
  if (!fn) return;
  const track = session.tracks[ev.track] || session.master;
  // per-event bus so fx sends tap only this event, not the whole track
  const bus = ac.createGain();
  if (ev.pan && ac.createStereoPanner) {
    const p = ac.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, ev.pan));
    bus.connect(p); p.connect(track);
  } else {
    bus.connect(track);
  }
  const when = t0 + ev.t;
  fn(session, bus, when, ev);
  if (ev.send) {
    if (ev.send.delay) { const g = ac.createGain(); g.gain.value = ev.send.delay; bus.connect(g); g.connect(session.delayIn); }
    if (ev.send.verb) { const g = ac.createGain(); g.gain.value = ev.send.verb; bus.connect(g); g.connect(session.verbIn); }
  }
}

// Live playback with chunked lookahead. Returns a handle with stop() and
// position() (seconds since score start, can be negative before start).
// `startAt` (absolute AudioContext time) allows gapless chaining of scores.
export function play(score, { onEnd, startAt } = {}) {
  const ac = audioContext();
  const session = buildSession(ac, score.mix);
  const t0 = startAt && startAt > ac.currentTime + 0.05 ? startAt : ac.currentTime + 0.12;
  const events = score.events.slice().sort((a, b) => a.t - b.t);
  let i = 0, stopped = false;

  const timer = setInterval(() => {
    if (stopped) return;
    const horizon = ac.currentTime - t0 + 1.8;
    while (i < events.length && events[i].t < horizon) {
      scheduleEvent(session, events[i], t0);
      i++;
    }
    if (ac.currentTime - t0 > score.duration + 0.5) handle.stop(true);
  }, 200);
  // schedule the first chunk immediately
  while (i < events.length && events[i].t < 1.8) { scheduleEvent(session, events[i], t0); i++; }

  const handle = {
    session,
    t0,
    duration: score.duration,
    position: () => ac.currentTime - t0,
    setTrack(id, on) {
      const g = session.tracks[id];
      if (g) g.gain.setTargetAtTime(on ? 1 : 0, ac.currentTime, 0.02);
    },
    stop(ended = false) {
      if (stopped) return;
      stopped = true;
      clearInterval(timer);
      session.master.gain.setTargetAtTime(0, ac.currentTime, 0.06);
      setTimeout(() => { try { session.master.disconnect(); } catch (e) {} }, 400);
      if (onEnd) onEnd(ended);
    }
  };
  return handle;
}

// ------------------------------------------------------------- WAV export --
export async function renderWav(score, trackState = null, sampleRate = 44100) {
  const dur = score.duration + 1.5;
  const oc = new OfflineAudioContext(2, Math.ceil(dur * sampleRate), sampleRate);
  const session = buildSession(oc, score.mix);
  if (trackState) for (const [id, on] of Object.entries(trackState)) {
    if (session.tracks[id]) session.tracks[id].gain.value = on ? 1 : 0;
  }
  for (const ev of score.events) scheduleEvent(session, ev, 0.1);
  const buf = await oc.startRendering();
  return encodeWav(buf);
}

function encodeWav(buffer) {
  const nCh = 2, sr = buffer.sampleRate, n = buffer.length;
  const bytes = 44 + n * nCh * 2;
  const ab = new ArrayBuffer(bytes), dv = new DataView(ab);
  const wStr = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  wStr(0, 'RIFF'); dv.setUint32(4, bytes - 8, true); wStr(8, 'WAVE');
  wStr(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
  dv.setUint16(22, nCh, true); dv.setUint32(24, sr, true);
  dv.setUint32(28, sr * nCh * 2, true); dv.setUint16(32, nCh * 2, true); dv.setUint16(34, 16, true);
  wStr(36, 'data'); dv.setUint32(40, n * nCh * 2, true);
  const L = buffer.getChannelData(0), R = buffer.getChannelData(1);
  let o = 44;
  for (let i = 0; i < n; i++) {
    dv.setInt16(o, Math.max(-1, Math.min(1, L[i])) * 32767, true); o += 2;
    dv.setInt16(o, Math.max(-1, Math.min(1, R[i])) * 32767, true); o += 2;
  }
  return new Blob([ab], { type: 'audio/wav' });
}
