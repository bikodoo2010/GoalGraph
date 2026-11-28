import { emptyData } from "./model.js";
import { normalizeImportedData } from "./security.js";

const DATA_KEY = "goalgraph:v2:data";
const OLD_DATA_KEY = "goalgraph:v1";
const LOCALE_KEY = "goalgraph:v2:locale";

export function loadData() {
  try {
    const current = localStorage.getItem(DATA_KEY);
    if (current) return { data: normalizeImportedData(JSON.parse(current)), migrated: false };

    // Migrate the previous app's localStorage backup without deleting the old copy.
    const legacy = localStorage.getItem(OLD_DATA_KEY);
    if (legacy) {
      try {
        const data = normalizeImportedData(JSON.parse(legacy));
        const result = saveData(data);
        if (result.ok) return { data, migrated: true };
      } catch {
        // Keep running with an empty plan if legacy data is malformed.
      }
    }
    return { data: emptyData(), migrated: false };
  } catch {
    return { data: emptyData(), migrated: false, error: "storage-unavailable" };
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.name === "QuotaExceededError" ? "quota" : "storage" };
  }
}

export function loadLocale() {
  try { return localStorage.getItem(LOCALE_KEY) ?? "kk"; }
  catch { return "kk"; }
}

export function saveLocale(locale) {
  try { localStorage.setItem(LOCALE_KEY, locale); }
  catch { /* Language selection still works for this tab. */ }
}

export function clearData() {
  try {
    localStorage.removeItem(DATA_KEY);
    localStorage.removeItem(OLD_DATA_KEY);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
