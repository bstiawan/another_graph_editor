import { serializeAppState, deserializeAppState } from "./serialization";
import { TestCases, Settings, Randomizer } from "../types";

// Key for URL param
const DATA_KEY = "data";

// Export app state to URL (replace current URL)
export function exportToUrl(
  testCases: TestCases,
  settings: Settings,
  randomizer?: Randomizer
) {
  const appState = serializeAppState(testCases, settings, randomizer);
  const json = JSON.stringify(appState);
  const encoded = encodeURIComponent(json);
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const newUrl = `${baseUrl}?${DATA_KEY}=${encoded}`;
  window.history.replaceState(null, '', newUrl);
}

// Import app state from URL (returns null if not present or invalid)
export function importFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(DATA_KEY);
  if (!encoded) return null;
  try {
    const json = decodeURIComponent(encoded);
    const data = JSON.parse(json);
    return deserializeAppState(data);
  } catch (e) {
    console.error('Failed to parse data from URL:', e);
    return null;
  }
}

// Remove data param from URL
export function clearUrl() {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState(null, '', baseUrl);
}

// Get raw data param (for diagnostics)
export function getUrlData() {
  const params = new URLSearchParams(window.location.search);
  return params.get(DATA_KEY);
} 