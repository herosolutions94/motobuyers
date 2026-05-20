// ─── Draft Session Helpers ────────────────────────────────────────────────────
// Manages session_id and submission_id in localStorage so every step
// can update the same Supabase row throughout the form.

const SESSION_ID_KEY  = "motobuyers_session_id";
const SUBMISSION_ID_KEY = "motobuyers_submission_id";

// ── Imports ───────────────────────────────────────────────────────────────────
// We use the browser's crypto.randomUUID() where available, and fall back to
// a manual v4 generator so this module works in all environments.
function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Manual RFC-4122 v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Getters / setters ─────────────────────────────────────────────────────────

/** Return existing session_id from localStorage, or create + store a new one. */
export function getOrCreateSessionId() {
  try {
    const existing = localStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const id = generateUUID();
    localStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch {
    // localStorage may be blocked (SSR, private mode, etc.)
    return generateUUID();
  }
}

/** Persist the Supabase row id so later steps can UPDATE the same row. */
export function setSubmissionId(id) {
  try {
    localStorage.setItem(SUBMISSION_ID_KEY, id);
  } catch {
    // ignore
  }
}

/** Return the stored Supabase row id, or null if not yet created. */
export function getSubmissionId() {
  try {
    return localStorage.getItem(SUBMISSION_ID_KEY) || null;
  } catch {
    return null;
  }
}

/** Clear both keys — call this after a successful "Start Over". */
export function clearDraftSession() {
  try {
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(SUBMISSION_ID_KEY);
  } catch {
    // ignore
  }
}