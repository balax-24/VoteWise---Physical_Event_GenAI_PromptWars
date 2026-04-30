/**
 * @file Centralized environment variable validation.
 * All `import.meta.env.VITE_*` reads are consolidated here so the rest of the
 * codebase imports validated constants instead of scattering raw reads.
 * @module config/env
 */

/**
 * Returns `true` when a VITE_* value looks like a real key
 * (i.e. not empty, not a placeholder).
 * @param {string|undefined} value
 * @param {string[]}         placeholders - Placeholder substrings to reject
 * @returns {boolean}
 */
const isValid = (value, placeholders = ['your_', 'YOUR_', 'xxx', 'placeholder']) =>
  Boolean(value) && !placeholders.some((p) => value.toLowerCase().includes(p.toLowerCase()));

/* ── Gemini ───────────────────────────────────── */
/** @type {string} Gemini API key */
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';
/** @type {boolean} Whether the Gemini key is usable */
export const HAS_GEMINI = isValid(GEMINI_API_KEY);

/* ── Firebase ─────────────────────────────────── */
/** @type {string} */
export const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY ?? '';
/** @type {string} */
export const FIREBASE_AUTH_DOMAIN = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '';
/** @type {string} */
export const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '';
/** @type {string} */
export const FIREBASE_STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '';
/** @type {string} */
export const FIREBASE_MESSAGING_SENDER_ID = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '';
/** @type {string} */
export const FIREBASE_APP_ID = import.meta.env.VITE_FIREBASE_APP_ID ?? '';
/** @type {boolean} Whether all required Firebase keys are present */
export const HAS_FIREBASE = isValid(FIREBASE_API_KEY);

/* ── Google Maps ──────────────────────────────── */
/** @type {string} */
export const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY ?? '';
/** @type {boolean} */
export const HAS_MAPS = isValid(MAPS_API_KEY);

/* ── Google Analytics ─────────────────────────── */
/** @type {string} GA4 Measurement ID */
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? '';
/** @type {boolean} */
export const HAS_ANALYTICS = isValid(GA_MEASUREMENT_ID);

/* ── Dev-time warnings ────────────────────────── */
if (import.meta.env.DEV) {
  const missing = [];
  if (!HAS_GEMINI)    missing.push('VITE_GEMINI_API_KEY');
  if (!HAS_FIREBASE)  missing.push('VITE_FIREBASE_API_KEY');
  if (!HAS_MAPS)      missing.push('VITE_MAPS_API_KEY');
  if (!HAS_ANALYTICS) missing.push('VITE_GA_MEASUREMENT_ID');

  if (missing.length > 0) {
    console.warn(
      `[VoteWise] Missing or placeholder env vars: ${missing.join(', ')}.\n` +
      'Copy .env.example → .env and fill in real keys. The app will degrade gracefully.'
    );
  }
}
