const DECK_STORAGE_KEY = "northstar.deck.v1";

export function loadDeckFromStorage() {
  try {
    const raw = localStorage.getItem(DECK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.slides || !Array.isArray(parsed.slides)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDeckToStorage(deck) {
  localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(deck));
}

export function clearDeckStorage() {
  localStorage.removeItem(DECK_STORAGE_KEY);
}

export { DECK_STORAGE_KEY };
