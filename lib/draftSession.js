const SESSION_ID_KEY = "motobuyers_session_id";
const SUBMISSION_ID_KEY = "motobuyers_submission_id";
const FORM_STATE_KEY = "motobuyers_form_state";
const STEP_INDEX_KEY = "motobuyers_step_index";

function generateUUID() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

export function setSubmissionId(id) {
  try {
    localStorage.setItem(SUBMISSION_ID_KEY, id);
  } catch {
    /* ignore */
  }
}

export function getSubmissionId() {
  try {
    return localStorage.getItem(SUBMISSION_ID_KEY) || null;
  } catch {
    return null;
  }
}

export function saveFormState(values) {
  try {
    const sanitised = {
      ...values,
      photos: (values.photos ?? []).map(({ file, ...rest }) => rest),
    };
    localStorage.setItem(FORM_STATE_KEY, JSON.stringify(sanitised));
  } catch {
    /* ignore */
  }
}

export function loadFormState() {
  try {
    const raw = localStorage.getItem(FORM_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStepIndex(index) {
  try {
    localStorage.setItem(STEP_INDEX_KEY, String(index));
  } catch {
    /* ignore */
  }
}

export function loadStepIndex() {
  try {
    const raw = localStorage.getItem(STEP_INDEX_KEY);
    return raw !== null ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

export function clearSubmissionData() {
  try {
    localStorage.removeItem(SUBMISSION_ID_KEY);
    localStorage.removeItem(FORM_STATE_KEY);
    localStorage.removeItem(STEP_INDEX_KEY);
  } catch {
    /* ignore */
  }
}

export function clearDraftSession() {
  try {
    // localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(SUBMISSION_ID_KEY);
    localStorage.removeItem(FORM_STATE_KEY);
    localStorage.removeItem(STEP_INDEX_KEY);
  } catch {
    /* ignore */
  }
}
