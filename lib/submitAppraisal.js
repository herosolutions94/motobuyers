import { supabase } from "./supabaseClient";
import { getSubmissionId, clearSubmissionData } from "./draftSession";

export async function submitAppraisal(formData) {
  const appraisalId = getSubmissionId();

  if (!appraisalId) {
    throw new Error("No draft submission found. Please restart the form.");
  }

  const finalUpdate = {
    status: "submitted",
    submitted_at: new Date().toISOString(),
    current_page: "thanks",
    route_variant:"desktop",
    last_active_at: new Date().toISOString(),

    full_name: formData.firstName || null,
    phone: formData.phone || null,
    email: formData.contactEmail || null,
    notes: formData.notes || null,
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

  // Email API
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}api/appraisal-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.firstName,
          email: formData.contactEmail,
          phone: formData.phone,
        }),
      },
    );
  } catch (err) {
    console.error("[submitAppraisal] Email API error:", err);
  }
  clearSubmissionData();
  return { appraisalId };
}
