import { trackTelemetry } from "./telemetry";

const DECK_STORAGE_KEY = "northstar.deck.v1";
const DECK_STORAGE_META_KEY = "northstar.deck.meta.v1";
const DB_NAME = "northstar-deck-db";
const DB_STORE = "deck";
const DB_RECORD_KEY = "active";

function parseDeck(raw) {
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return parsed?.slides && Array.isArray(parsed.slides) ? parsed : null;
}

function openDeckDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Kunde inte öppna IndexedDB"));
  });
}

async function loadDeckFromIndexedDb() {
  const db = await openDeckDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const store = tx.objectStore(DB_STORE);
    const req = store.get(DB_RECORD_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error("Kunde inte läsa IndexedDB"));
  });
}

async function saveDeckToIndexedDb(deck) {
  const db = await openDeckDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(deck, DB_RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Kunde inte spara till IndexedDB"));
  });
}

async function clearDeckIndexedDb() {
  const db = await openDeckDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(DB_RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Kunde inte rensa IndexedDB"));
  });
}

export async function loadDeckFromStorage() {
  try {
    const metaRaw = localStorage.getItem(DECK_STORAGE_META_KEY);
    const meta = metaRaw ? JSON.parse(metaRaw) : null;

    if (meta?.storage === "indexeddb") {
      const dbDeck = await loadDeckFromIndexedDb();
      if (dbDeck?.slides && Array.isArray(dbDeck.slides)) {
        trackTelemetry("storage_load_indexeddb", { reason: "meta" });
        return dbDeck;
      }
    }

    const parsed = parseDeck(localStorage.getItem(DECK_STORAGE_KEY));
    if (parsed) {
      trackTelemetry("storage_load_local", { reason: "available" });
      return parsed;
    }

    const dbDeck = await loadDeckFromIndexedDb();
    if (dbDeck?.slides && Array.isArray(dbDeck.slides)) {
      trackTelemetry("storage_load_indexeddb", { reason: "fallback" });
      return dbDeck;
    }
    return null;
  } catch (error) {
    trackTelemetry("storage_load_error", { message: error?.message || "unknown" });
    return null;
  }
}

export async function saveDeckToStorage(deck, opts = {}) {
  const onProgress = opts.onProgress || (() => {});
  onProgress(15);
  const payload = JSON.stringify(deck);
  onProgress(50);

  try {
    localStorage.setItem(DECK_STORAGE_KEY, payload);
    localStorage.setItem(DECK_STORAGE_META_KEY, JSON.stringify({ storage: "local", savedAt: Date.now() }));
    trackTelemetry("storage_save_local_success");
    onProgress(100);
    return { ok: true, storage: "local" };
  } catch (error) {
    await saveDeckToIndexedDb(deck);
    localStorage.removeItem(DECK_STORAGE_KEY);
    localStorage.setItem(DECK_STORAGE_META_KEY, JSON.stringify({ storage: "indexeddb", savedAt: Date.now() }));
    trackTelemetry("storage_save_indexeddb_fallback", {
      name: error?.name || "Error",
      message: error?.message || "unknown",
    });
    onProgress(100);
    return { ok: true, storage: "indexeddb", warning: error };
  }
}

export async function clearDeckStorage() {
  localStorage.removeItem(DECK_STORAGE_KEY);
  localStorage.removeItem(DECK_STORAGE_META_KEY);
  try {
    await clearDeckIndexedDb();
  } catch {
    // ignore
  }
}

export { DECK_STORAGE_KEY };
