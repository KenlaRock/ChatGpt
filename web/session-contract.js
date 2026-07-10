"use strict";

function buildAutomationTracks(sampleRate) {
  const grouped = new Map();
  for (const event of state.automation) {
    if (!grouped.has(event.target)) grouped.set(event.target, []);
    grouped.get(event.target).push({
      sample: Math.max(0, Math.round(event.t_ms * sampleRate / 1000)),
      value: event.value
    });
  }
  return Array.from(grouped, ([target, keys]) => ({
    target,
    curve: "step",
    coordinate_space: "none",
    keys
  }));
}

exportSession = function exportPreviewSession() {
  const sampleRate = audio?.context.sampleRate ?? 48000;
  const payload = {
    document_type: "nullforge_preview_session",
    schema_version: state.schema_version,
    app_version: APP_VERSION,
    exported_at: new Date().toISOString(),
    mode: state.mode,
    sample_rate_hz: sampleRate,
    state: {
      sources: state.sources,
      noise: state.noise,
      intervention: state.intervention,
      visualization: state.visualization
    },
    automation_events: state.automation,
    automation_tracks: buildAutomationTracks(sampleRate),
    snapshot: state.snapshot,
    limitations: [
      "Web Audio scheduling and browser DSP are not the deterministic Rust truth engine.",
      "Visual exaggeration is presentation-only unless an explicit Intervention State audio multiplier is active."
    ]
  };
  downloadJson(`nullforge-preview-session-${Date.now()}.json`, payload);
};

importSession = async function importPreviewSession(file) {
  const parsed = JSON.parse(await file.text());
  const imported = parsed.state ?? parsed;
  if (!imported.sources || !imported.noise || !imported.intervention || !imported.visualization) {
    throw new Error("Filen saknar nödvändiga NullForge Preview-fält.");
  }
  state.sources = imported.sources;
  state.noise = imported.noise;
  state.intervention = imported.intervention;
  state.visualization = imported.visualization;
  state.automation = Array.isArray(parsed.automation_events)
    ? parsed.automation_events
    : Array.isArray(parsed.automation)
      ? parsed.automation
      : [];
  state.snapshot = parsed.snapshot ?? null;
  syncControlsFromState();
  $("recordStatus").textContent = `Automation: ${state.automation.length} events`;
  $("snapshotOutput").textContent = state.snapshot
    ? JSON.stringify(state.snapshot, null, 2)
    : "Ingen snapshot i importerad session.";
};
