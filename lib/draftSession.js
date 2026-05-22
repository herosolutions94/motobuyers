// ─── Draft Session Helpers ────────────────────────────────────────────────────
// Manages session_id and submission_id in localStorage.
// session_id  → persists forever (survives "Start Over")
// submission_id → cleared only after a successful final submit

const SESSION_ID_KEY    = "motobuyers_session_id";
const SUBMISSION_ID_KEY = "motobuyers_submission_id";
// Stores the full RHF form values so the form can be restored on refresh
const FORM_STATE_KEY    = "motobuyers_form_state";
// Stores the current step index so we can jump back to the right step on refresh
const STEP_INDEX_KEY    = "motobuyers_step_index";

// ── UUID generator ────────────────────────────────────────────────────────────
function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── session_id ────────────────────────────────────────────────────────────────

/** Return existing session_id from localStorage, or create + store a new one. */
export function getOrCreateSessionId() {
  try {
    const existing = localStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const id = generateUUID();
    localStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch {
    return generateUUID();
  }
}

// ── submission_id ─────────────────────────────────────────────────────────────

/** Persist the Supabase row id so later steps can UPDATE the same row. */
export function setSubmissionId(id) {
  try {
    localStorage.setItem(SUBMISSION_ID_KEY, id);
  } catch { /* ignore */ }
}

/** Return the stored Supabase row id, or null if not yet created. */
export function getSubmissionId() {
  try {
    return localStorage.getItem(SUBMISSION_ID_KEY) || null;
  } catch {
    return null;
  }
}

// ── form state (for refresh restore) ─────────────────────────────────────────

/** Persist the entire RHF form values object. */
export function saveFormState(values) {
  try {
    // photos contain File objects which can't be serialised — strip them
    const sanitised = {
      ...values,
      photos: (values.photos ?? []).map(({ file, ...rest }) => rest),
    };
    localStorage.setItem(FORM_STATE_KEY, JSON.stringify(sanitised));
  } catch { /* ignore */ }
}

/** Return the stored form values, or null. */
export function loadFormState() {
  try {
    const raw = localStorage.getItem(FORM_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── step index (for refresh restore) ─────────────────────────────────────────

/** Persist the current step index. */
export function saveStepIndex(index) {
  try {
    localStorage.setItem(STEP_INDEX_KEY, String(index));
  } catch { /* ignore */ }
}

/** Return the stored step index, or null. */
export function loadStepIndex() {
  try {
    const raw = localStorage.getItem(STEP_INDEX_KEY);
    return raw !== null ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

// ── clear helpers ─────────────────────────────────────────────────────────────

/**
 * Called on final submit:
 * removes submission_id, form state, and step index.
 * Deliberately keeps session_id.
 */
export function clearSubmissionData() {
  try {
    localStorage.removeItem(SUBMISSION_ID_KEY);
    localStorage.removeItem(FORM_STATE_KEY);
    localStorage.removeItem(STEP_INDEX_KEY);
  } catch { /* ignore */ }
}

/**
 * Called on "Start Over":
 * clears everything including session_id so the next run is completely fresh.
 */
export function clearDraftSession() {
  try {
    // localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(SUBMISSION_ID_KEY);
    localStorage.removeItem(FORM_STATE_KEY);
    localStorage.removeItem(STEP_INDEX_KEY);
  } catch { /* ignore */ }
}