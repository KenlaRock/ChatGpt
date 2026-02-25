const TELEMETRY_KEY = "northstar.telemetry.v1";

function readTelemetry() {
  try {
    const raw = localStorage.getItem(TELEMETRY_KEY);
    if (!raw) return { counters: {}, lastEvents: [] };
    const parsed = JSON.parse(raw);
    return {
      counters: parsed?.counters && typeof parsed.counters === "object" ? parsed.counters : {},
      lastEvents: Array.isArray(parsed?.lastEvents) ? parsed.lastEvents : [],
    };
  } catch {
    return { counters: {}, lastEvents: [] };
  }
}

function writeTelemetry(payload) {
  try {
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(payload));
  } catch {
    // ignore telemetry write errors
  }
}

export function trackTelemetry(event, detail = {}) {
  const telemetry = readTelemetry();
  telemetry.counters[event] = (telemetry.counters[event] || 0) + 1;
  telemetry.lastEvents = [
    {
      event,
      at: Date.now(),
      detail,
    },
    ...telemetry.lastEvents,
  ].slice(0, 40);
  writeTelemetry(telemetry);
}

export function getTelemetrySnapshot() {
  return readTelemetry();
}

export function clearTelemetrySnapshot() {
  try {
    localStorage.removeItem(TELEMETRY_KEY);
  } catch {
    // ignore
  }
}
