import { trackTelemetry } from "./telemetry";

const SYNC_DEVICE_KEY = "northstar.sync.device.v1";

function getSyncEndpoint() {
  return import.meta.env.VITE_SYNC_ENDPOINT || "";
}

function getDeviceId() {
  try {
    const existing = localStorage.getItem(SYNC_DEVICE_KEY);
    if (existing) return existing;
    const next = globalThis.crypto?.randomUUID?.() || `device-${Date.now()}`;
    localStorage.setItem(SYNC_DEVICE_KEY, next);
    return next;
  } catch {
    return "device-unknown";
  }
}

function normalizeServerDeck(payload) {
  if (!payload?.deck || !Array.isArray(payload.deck.slides)) return null;
  return {
    ...payload.deck,
    sync: {
      revision: Number(payload.revision || payload.deck?.sync?.revision || 0),
      updatedAt: Number(payload.updatedAt || payload.deck?.sync?.updatedAt || Date.now()),
      updatedBy: payload.updatedBy || payload.deck?.sync?.updatedBy || "unknown",
    },
  };
}

function mergeConflict(localDeck, remoteDeck) {
  const localUpdatedAt = Number(localDeck?.sync?.updatedAt || 0);
  const remoteUpdatedAt = Number(remoteDeck?.sync?.updatedAt || 0);
  if (remoteUpdatedAt > localUpdatedAt) {
    return { winner: "remote", deck: remoteDeck };
  }
  return { winner: "local", deck: localDeck };
}

export function isSyncEnabled() {
  return Boolean(getSyncEndpoint());
}

export async function pullDeckFromServer(deckId) {
  const endpoint = getSyncEndpoint();
  if (!endpoint) return { ok: false, reason: "disabled" };

  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/decks/${encodeURIComponent(deckId)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 404) return { ok: false, reason: "not_found" };
    if (!response.ok) return { ok: false, reason: `http_${response.status}` };

    const payload = await response.json();
    const deck = normalizeServerDeck(payload);
    if (!deck) return { ok: false, reason: "invalid_payload" };
    trackTelemetry("sync_pull_success", { revision: deck.sync?.revision || 0 });
    return { ok: true, deck };
  } catch (error) {
    trackTelemetry("sync_pull_error", { message: error?.message || "unknown" });
    return { ok: false, reason: "network_error", error };
  }
}

export async function pushDeckToServer(deck) {
  const endpoint = getSyncEndpoint();
  if (!endpoint) return { ok: false, reason: "disabled" };

  const syncDeck = {
    ...deck,
    sync: {
      revision: Number(deck?.sync?.revision || 0) + 1,
      updatedAt: Date.now(),
      updatedBy: getDeviceId(),
    },
  };

  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/decks/${encodeURIComponent(deck.id || "active")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deck: syncDeck,
        revision: syncDeck.sync.revision,
        updatedAt: syncDeck.sync.updatedAt,
        updatedBy: syncDeck.sync.updatedBy,
      }),
    });

    if (response.status === 409) {
      const payload = await response.json().catch(() => null);
      const remoteDeck = normalizeServerDeck(payload || {});
      if (!remoteDeck) return { ok: false, reason: "conflict_no_remote" };
      const merged = mergeConflict(syncDeck, remoteDeck);
      trackTelemetry("sync_conflict", { winner: merged.winner });
      return { ok: false, reason: "conflict", ...merged };
    }

    if (!response.ok) {
      trackTelemetry("sync_push_error", { status: response.status });
      return { ok: false, reason: `http_${response.status}` };
    }

    trackTelemetry("sync_push_success", { revision: syncDeck.sync.revision });
    return { ok: true, deck: syncDeck };
  } catch (error) {
    trackTelemetry("sync_push_error", { message: error?.message || "unknown" });
    return { ok: false, reason: "network_error", error };
  }
}
