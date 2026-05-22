// ─── submitAppraisal ──────────────────────────────────────────────────────────
// Called only on final form submit (Step 7 → "Submit for Appraisal").
// The row already exists in Supabase (created at Step 1, updated at each step).
// This function:
//   1. PATCHes status = submitted, submitted_at, final contact fields
//   2. Fires the Laravel email API
//   3. Ensures any remaining un-uploaded photos are handled

import { supabase } from "./supabaseClient";
import { getSubmissionId, clearSubmissionData } from "./draftSession";
// import { savePhotos } from "./saveDraft";

export async function submitAppraisal(formData) {
  const appraisalId = getSubmissionId();

  if (!appraisalId) {
    throw new Error("No draft submission found. Please restart the form.");
  }

  // ── Final PATCH: status + contact (belt-and-suspenders) ──────────────────
  const finalUpdate = {
    status:       "submitted",
    submitted_at: new Date().toISOString(),
    current_page: "thanks",
    last_active_at: new Date().toISOString(),

    // Contact fields — may already be saved from goNext on Step 7, but
    // we re-send them here to guarantee they're in the row on submit.
    full_name: formData.firstName    || null,
    phone:     formData.phone        || null,
    email:     formData.contactEmail || null,
    notes:     formData.notes        || null,
  };

  const response = await fetch(`/api/submit-appraisal?id=${appraisalId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(finalUpdate),
  });

  const result = await response.json();

  if (!result.success) {
    console.error("[submitAppraisal] PATCH error:", result.error);
    throw new Error("Failed to save your appraisal.");
  }

  // ── Email API ─────────────────────────────────────────────────────────────
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}api/appraisal-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:  formData.firstName,
          email: formData.contactEmail,
          phone: formData.phone,
        }),
      }
    );
  } catch (err) {
    console.error("[submitAppraisal] Email API error:", err);
  }

  // ── Ensure photos are uploaded (catch-all for any that weren't saved yet) ─
  // await savePhotos(formData.photos ?? []);

  // ── Clear localStorage: remove submission id + form state + step index.
  //    session_id is intentionally kept. ────────────────────────────────────
  clearSubmissionData();

  return { appraisalId };
}