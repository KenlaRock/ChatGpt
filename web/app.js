"use strict";

const APP_VERSION = "0.1.0-preview";
const FFT_SIZE = 2048;
const HARMONIC_COUNT = 8;

const state = {
  schema_version: "0.1.0",
  app_version: APP_VERSION,
  mode: "preview_not_truth_engine",
  sources: {
    A: { enabled: true, frequency_hz: 220, gain: 0.35, phase_deg: 0, route: "C", harmonics: [1, 0.45, 0.28, 0.18, 0.12, 0.08, 0.05, 0.03] },
    B: { enabled: true, frequency_hz: 220, gain: 0.35, phase_deg: 180, route: "C", harmonics: [1, 0.45, 0.28, 0.18, 0.12, 0.08, 0.05, 0.03] }
  },
  noise: { gain: 0, cutoff_hz: 8000 },
  intervention: { enabled: false, condition: "opposition", threshold_deg: 12, audio_multiplier: 0.25, active: false },
  visualization: { intervention_exaggeration: 4, frozen: false },
  automation: [],
  snapshot: null
};

let audio = null;
let animationId = null;
let recording = false;
let recordingStartedAt = 0;
let playbackTimers = [];

const $ = (id) => document.getElementById(id);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const toRad = (degrees) => degrees * Math.PI / 180;

function normalizePhase(degrees) {
  let value = degrees % 360;
  if (value < 0) value += 360;
  return value;
}

function angularDistance(a, b) {
  const d = Math.abs(normalizePhase(a) - normalizePhase(b));
  return Math.min(d, 360 - d);
}

function routePan(route) {
  return route === "L" ? -1 : route === "R" ? 1 : 0;
}

function createHarmonicControls(sourceId) {
  const root = $(`${sourceId}-harmonics`);
  root.innerHTML = "";
  for (let index = 0; index < HARMONIC_COUNT; index += 1) {
    const harmonic = index + 1;
    const wrapper = document.createElement("div");
    wrapper.className = "harmonic";
    const label = document.createElement("label");
    label.textContent = `H${harmonic}`;
    const output = document.createElement("output");
    output.id = `${sourceId}-h${harmonic}-out`;
    output.textContent = state.sources[sourceId].harmonics[index].toFixed(2);
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = harmonic === 1 ? "1" : "0.8";
    input.step = "0.01";
    input.value = String(state.sources[sourceId].harmonics[index]);
    input.id = `${sourceId}-h${harmonic}`;
    input.dataset.target = `sources.${sourceId}.harmonics.${index}`;
    label.append(output, input);
    wrapper.append(label);
    root.append(wrapper);
  }
}

function makePeriodicWave(context, source) {
  const real = new Float32Array(HARMONIC_COUNT + 1);
  const imag = new Float32Array(HARMONIC_COUNT + 1);
  const phase = toRad(source.phase_deg);
  source.harmonics.forEach((amplitude, index) => {
    const harmonic = index + 1;
    real[harmonic] = amplitude * Math.sin(phase);
    imag[harmonic] = amplitude * Math.cos(phase);
  });
  return context.createPeriodicWave(real, imag, { disableNormalization: false });
}

function createNoiseBuffer(context) {
  const seconds = 2;
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const channel = buffer.getChannelData(0);
  let seed = 0x5f3759df;
  for (let i = 0; i < channel.length; i += 1) {
    seed = (1664525 * seed + 1013904223) >>> 0;
    channel[i] = (seed / 0xffffffff) * 2 - 1;
  }
  return buffer;
}

function buildAudioGraph() {
  const context = new AudioContext({ latencyHint: "interactive" });
  const master = context.createGain();
  master.gain.value = 0.75;

  const splitter = context.createChannelSplitter(2);
  const analyserL = context.createAnalyser();
  const analyserR = context.createAnalyser();
  analyserL.fftSize = FFT_SIZE;
  analyserR.fftSize = FFT_SIZE;

  master.connect(context.destination);
  master.connect(splitter);
  splitter.connect(analyserL, 0);
  splitter.connect(analyserR, 1);

  const sources = {};
  for (const sourceId of ["A", "B"]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const panner = context.createStereoPanner();
    oscillator.frequency.value = state.sources[sourceId].frequency_hz;
    oscillator.setPeriodicWave(makePeriodicWave(context, state.sources[sourceId]));
    gain.gain.value = state.sources[sourceId].gain;
    panner.pan.value = routePan(state.sources[sourceId].route);
    oscillator.connect(gain).connect(panner).connect(master);
    oscillator.start();
    sources[sourceId] = { oscillator, gain, panner };
  }

  const noiseSource = context.createBufferSource();
  const noiseFilter = context.createBiquadFilter();
  const noiseGain = context.createGain();
  noiseSource.buffer = createNoiseBuffer(context);
  noiseSource.loop = true;
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = state.noise.cutoff_hz;
  noiseGain.gain.value = state.noise.gain;
  noiseSource.connect(noiseFilter).connect(noiseGain).connect(master);
  noiseSource.start();

  return { context, master, splitter, analyserL, analyserR, sources, noiseSource, noiseFilter, noiseGain };
}

async function toggleAudio() {
  if (!audio) {
    audio = buildAudioGraph();
    await audio.context.resume();
    $("audioToggle").textContent = "Stoppa ljud";
    $("audioToggle").classList.add("active");
    $("audioStatus").textContent = `Ljud: aktivt @ ${audio.context.sampleRate} Hz`;
    animate();
  } else {
    cancelAnimationFrame(animationId);
    await audio.context.close();
    audio = null;
    $("audioToggle").textContent = "Starta ljud";
    $("audioToggle").classList.remove("active");
    $("audioStatus").textContent = "Ljud: av";
  }
}

function updateAudioGraph() {
  if (!audio) return;
  const now = audio.context.currentTime;
  for (const sourceId of ["A", "B"]) {
    const sourceState = state.sources[sourceId];
    const node = audio.sources[sourceId];
    node.oscillator.frequency.setTargetAtTime(sourceState.frequency_hz, now, 0.012);
    node.oscillator.setPeriodicWave(makePeriodicWave(audio.context, sourceState));
    node.panner.pan.setTargetAtTime(routePan(sourceState.route), now, 0.01);
  }
  audio.noiseGain.gain.setTargetAtTime(state.noise.gain, now, 0.02);
  audio.noiseFilter.frequency.setTargetAtTime(state.noise.cutoff_hz, now, 0.02);
  applyIntervention();
}

function applyIntervention() {
  if (!audio) return;
  const a = state.sources.A.phase_deg;
  const b = state.sources.B.phase_deg;
  const distance = angularDistance(a, b);
  const error = state.intervention.condition === "opposition" ? Math.abs(180 - distance) : distance;
  const active = state.intervention.enabled && error <= state.intervention.threshold_deg;
  state.intervention.active = active;
  const multiplier = active ? state.intervention.audio_multiplier : 1;
  const now = audio.context.currentTime;
  for (const sourceId of ["A", "B"]) {
    const sourceState = state.sources[sourceId];
    const enabled = sourceState.enabled ? 1 : 0;
    const applied = sourceState.gain * enabled * (sourceId === "B" ? multiplier : 1);
    audio.sources[sourceId].gain.gain.setTargetAtTime(applied, now, 0.008);
  }
  $("metric-intervention").textContent = active ? `ACTIVE ×${multiplier.toFixed(2)}` : "inactive";
}

function setPath(object, path, value) {
  const parts = path.split(".");
  const last = parts.pop();
  const parent = parts.reduce((current, key) => current[key], object);
  parent[last] = value;
}

function coerceInputValue(input) {
  if (input.type === "checkbox") return input.checked;
  if (input.type === "range" || input.type === "number") return Number(input.value);
  return input.value;
}

function eventTargetForInput(input) {
  if (input.dataset.target) return input.dataset.target;
  const enabledMatch = input.id.match(/^([AB])-enabled$/);
  if (enabledMatch) return `sources.${enabledMatch[1]}.enabled`;
  if (input.id === "intervention-enabled") return "intervention.enabled";
  return null;
}

function recordEvent(target, value) {
  if (!recording) return;
  state.automation.push({
    t_ms: Math.max(0, performance.now() - recordingStartedAt),
    target,
    value
  });
  $("recordStatus").textContent = `Automation: ${state.automation.length} events`;
}

function refreshOutputs() {
  for (const sourceId of ["A", "B"]) {
    $(`${sourceId}-frequency-out`).textContent = `${state.sources[sourceId].frequency_hz.toFixed(0)} Hz`;
    $(`${sourceId}-gain-out`).textContent = state.sources[sourceId].gain.toFixed(2);
    $(`${sourceId}-phase-out`).textContent = `${state.sources[sourceId].phase_deg.toFixed(0)}°`;
    for (let i = 0; i < HARMONIC_COUNT; i += 1) {
      $(`${sourceId}-h${i + 1}-out`).textContent = state.sources[sourceId].harmonics[i].toFixed(2);
    }
  }
  $("noise-gain-out").textContent = state.noise.gain.toFixed(3);
  $("noise-cutoff-out").textContent = `${state.noise.cutoff_hz.toFixed(0)} Hz`;
  $("intervention-threshold-out").textContent = `${state.intervention.threshold_deg.toFixed(0)}°`;
  $("intervention-audio-out").textContent = state.intervention.audio_multiplier.toFixed(2);
  $("intervention-visual-out").textContent = state.visualization.intervention_exaggeration.toFixed(1);
}

function syncControlsFromState() {
  for (const sourceId of ["A", "B"]) {
    $(`${sourceId}-enabled`).checked = state.sources[sourceId].enabled;
    $(`${sourceId}-frequency`).value = state.sources[sourceId].frequency_hz;
    $(`${sourceId}-gain`).value = state.sources[sourceId].gain;
    $(`${sourceId}-phase`).value = state.sources[sourceId].phase_deg;
    $(`${sourceId}-route`).value = state.sources[sourceId].route;
    state.sources[sourceId].harmonics.forEach((value, index) => {
      $(`${sourceId}-h${index + 1}`).value = value;
    });
  }
  $("noise-gain").value = state.noise.gain;
  $("noise-cutoff").value = state.noise.cutoff_hz;
  $("intervention-enabled").checked = state.intervention.enabled;
  $("intervention-condition").value = state.intervention.condition;
  $("intervention-threshold").value = state.intervention.threshold_deg;
  $("intervention-audio").value = state.intervention.audio_multiplier;
  $("intervention-visual").value = state.visualization.intervention_exaggeration;
  refreshOutputs();
  updateAudioGraph();
}

function bindControls() {
  document.querySelectorAll("input, select").forEach((input) => {
    if (input.id === "importSession") return;
    input.addEventListener("input", () => {
      const target = eventTargetForInput(input);
      if (!target) return;
      const value = coerceInputValue(input);
      setPath(state, target, value);
      recordEvent(target, value);
      refreshOutputs();
      updateAudioGraph();
    });
  });
}

function rms(values) {
  let sum = 0;
  for (const value of values) sum += value * value;
  return Math.sqrt(sum / values.length);
}

function correlation(a, b) {
  let dot = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  const denominator = Math.sqrt(aa * bb);
  return denominator > 1e-12 ? dot / denominator : 0;
}

function liveMetrics(left, right) {
  const mid = new Float32Array(left.length);
  const side = new Float32Array(left.length);
  const reference = new Float32Array(left.length);
  for (let i = 0; i < left.length; i += 1) {
    mid[i] = (left[i] + right[i]) * 0.5;
    side[i] = (left[i] - right[i]) * 0.5;
    reference[i] = (Math.abs(left[i]) + Math.abs(right[i])) * 0.5;
  }
  const rmsL = rms(left);
  const rmsR = rms(right);
  const rmsM = rms(mid);
  const rmsS = rms(side);
  const ref = rms(reference);
  const nullDb = ref > 1e-12 ? 20 * Math.log10(Math.max(rmsM / ref, 1e-12)) : -240;
  return { rmsL, rmsR, rmsM, rmsS, corr: correlation(left, right), nullDb };
}

function setMetric(id, value, digits = 4) {
  $(id).textContent = Number.isFinite(value) ? value.toFixed(digits) : "—";
}

function drawGrid(ctx, width, height) {
  ctx.strokeStyle = "#172229";
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i += 1) {
    const x = width * i / 8;
    const y = height * i / 8;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  ctx.strokeStyle = "#32424c";
  ctx.beginPath(); ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height); ctx.stroke();
}

function drawScope(canvas, left, right) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.fillStyle = "#05080a"; ctx.fillRect(0, 0, width, height); drawGrid(ctx, width, height);
  const draw = (values, color, offset) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i < values.length; i += 2) {
      const x = i / (values.length - 1) * width;
      const y = offset - values[i] * height * 0.21;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  draw(left, "#52d7ff", height * 0.31);
  draw(right, "#ff625a", height * 0.69);
}

function drawVector(canvas, left, right) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.fillStyle = "#05080a"; ctx.fillRect(0, 0, width, height); drawGrid(ctx, width, height);
  const exaggeration = state.intervention.active ? state.visualization.intervention_exaggeration : 1;
  ctx.strokeStyle = state.intervention.active ? "#ff3b30" : "#76f7bf";
  ctx.globalAlpha = 0.75; ctx.lineWidth = 1.4; ctx.beginPath();
  for (let i = 0; i < left.length; i += 2) {
    const x = width / 2 + clamp(left[i] * exaggeration, -1, 1) * width * 0.43;
    const y = height / 2 - clamp(right[i] * exaggeration, -1, 1) * height * 0.43;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke(); ctx.globalAlpha = 1;
}

function drawPhase(canvas) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.fillStyle = "#05080a"; ctx.fillRect(0, 0, width, height); drawGrid(ctx, width, height);
  const cx = width / 2, cy = height / 2, radius = Math.min(width, height) * 0.38;
  ctx.strokeStyle = "#32424c"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
  const draw = (sourceId, color) => {
    const source = state.sources[sourceId];
    const angle = toRad(source.phase_deg - 90);
    const visualGain = source.gain * (state.intervention.active && sourceId === "B" ? state.visualization.intervention_exaggeration : 1);
    const length = radius * clamp(visualGain / 0.8, 0.1, 1.2);
    const x = cx + Math.cos(angle) * length;
    const y = cy + Math.sin(angle) * length;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.font = "bold 24px system-ui"; ctx.fillText(sourceId, x + 12, y - 12);
  };
  draw("A", "#52d7ff"); draw("B", "#ff625a");
  ctx.fillStyle = "#8ca0ad"; ctx.font = "18px ui-monospace";
  ctx.fillText(`Δφ ${angularDistance(state.sources.A.phase_deg, state.sources.B.phase_deg).toFixed(1)}°`, 20, 32);
}

function animate() {
  if (!audio) return;
  const left = new Float32Array(audio.analyserL.fftSize);
  const right = new Float32Array(audio.analyserR.fftSize);
  audio.analyserL.getFloatTimeDomainData(left);
  audio.analyserR.getFloatTimeDomainData(right);
  applyIntervention();
  const metrics = liveMetrics(left, right);
  if (!state.visualization.frozen) {
    drawScope($("scopeCanvas"), left, right);
    drawVector($("vectorCanvas"), left, right);
    drawPhase($("phaseCanvas"));
    setMetric("metric-rms-l", metrics.rmsL);
    setMetric("metric-rms-r", metrics.rmsR);
    setMetric("metric-rms-m", metrics.rmsM);
    setMetric("metric-rms-s", metrics.rmsS);
    setMetric("metric-corr", metrics.corr);
    setMetric("metric-null", metrics.nullDb, 2);
  }
  animationId = requestAnimationFrame(animate);
}

function createSnapshot() {
  const snapshot = {
    schema_version: state.schema_version,
    app_version: APP_VERSION,
    captured_at: new Date().toISOString(),
    audio_context: audio ? { sample_rate: audio.context.sampleRate, current_time_s: audio.context.currentTime } : null,
    truth_state: {
      sources: structuredClone(state.sources),
      noise: structuredClone(state.noise)
    },
    interaction_state: {
      phase_distance_deg: angularDistance(state.sources.A.phase_deg, state.sources.B.phase_deg),
      intervention_condition_met: state.intervention.active
    },
    intervention_state: structuredClone(state.intervention),
    visualization_state: structuredClone(state.visualization),
    evidence_class: "PREVIEW_SNAPSHOT_NOT_DETERMINISTIC_EVIDENCE"
  };
  state.snapshot = snapshot;
  $("snapshotOutput").textContent = JSON.stringify(snapshot, null, 2);
}

function toggleFreeze() {
  state.visualization.frozen = !state.visualization.frozen;
  $("freezeToggle").classList.toggle("active", state.visualization.frozen);
  $("freezeToggle").textContent = state.visualization.frozen ? "Frigör snapshot" : "Lås snapshot";
  if (state.visualization.frozen) createSnapshot();
}

function toggleRecording() {
  recording = !recording;
  $("recordToggle").classList.toggle("active", recording);
  $("recordToggle").textContent = recording ? "Stoppa inspelning" : "Spela in automation";
  if (recording) {
    recordingStartedAt = performance.now();
    state.automation = [];
  }
  $("recordStatus").textContent = `Automation: ${state.automation.length} events${recording ? " • REC" : ""}`;
}

function clearAutomation() {
  playbackTimers.forEach(clearTimeout);
  playbackTimers = [];
  state.automation = [];
  $("recordStatus").textContent = "Automation: 0 events";
}

function playAutomation() {
  playbackTimers.forEach(clearTimeout);
  playbackTimers = [];
  for (const event of state.automation) {
    playbackTimers.push(setTimeout(() => {
      setPath(state, event.target, event.value);
      syncControlsFromState();
    }, event.t_ms));
  }
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportSession() {
  const payload = {
    schema_version: state.schema_version,
    app_version: APP_VERSION,
    exported_at: new Date().toISOString(),
    mode: state.mode,
    state: {
      sources: state.sources,
      noise: state.noise,
      intervention: state.intervention,
      visualization: state.visualization
    },
    automation: state.automation,
    snapshot: state.snapshot,
    limitations: [
      "Web Audio scheduling and browser DSP are not the deterministic Rust truth engine.",
      "Visual exaggeration is presentation-only unless an explicit Intervention State audio multiplier is active."
    ]
  };
  downloadJson(`nullforge-preview-session-${Date.now()}.json`, payload);
}

async function importSession(file) {
  const parsed = JSON.parse(await file.text());
  const imported = parsed.state ?? parsed;
  if (!imported.sources || !imported.noise || !imported.intervention || !imported.visualization) {
    throw new Error("Filen saknar nödvändiga NullForge Preview-fält.");
  }
  state.sources = imported.sources;
  state.noise = imported.noise;
  state.intervention = imported.intervention;
  state.visualization = imported.visualization;
  state.automation = Array.isArray(parsed.automation) ? parsed.automation : [];
  state.snapshot = parsed.snapshot ?? null;
  syncControlsFromState();
  $("recordStatus").textContent = `Automation: ${state.automation.length} events`;
  $("snapshotOutput").textContent = state.snapshot ? JSON.stringify(state.snapshot, null, 2) : "Ingen snapshot i importerad session.";
}

function initialize() {
  createHarmonicControls("A");
  createHarmonicControls("B");
  bindControls();
  syncControlsFromState();
  $("audioToggle").addEventListener("click", () => toggleAudio().catch(console.error));
  $("freezeToggle").addEventListener("click", toggleFreeze);
  $("recordToggle").addEventListener("click", toggleRecording);
  $("playAutomation").addEventListener("click", playAutomation);
  $("clearAutomation").addEventListener("click", clearAutomation);
  $("exportSession").addEventListener("click", exportSession);
  $("importSession").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (!file) return;
    importSession(file).catch((error) => alert(error.message));
  });
  drawScope($("scopeCanvas"), new Float32Array(FFT_SIZE), new Float32Array(FFT_SIZE));
  drawVector($("vectorCanvas"), new Float32Array(FFT_SIZE), new Float32Array(FFT_SIZE));
  drawPhase($("phaseCanvas"));
}

document.addEventListener("DOMContentLoaded", initialize);
