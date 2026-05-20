import { parseMileage, parseCurrency } from "@/helpers/helpers";
import { supabase } from "./supabaseClient";
import { getSubmissionId } from "./draftSession";

const BUCKET = "intake-photos";

const COSMETIC_ISSUES = [
  "Scratches or scuffs",
  "Dent or ding",
  "Cracked fairing or panel",
  "Faded paint",
];
const MECHANICAL_ISSUES = [
  "Engine or transmission issue",
  "Electrical issue",
  "Fluid leak",
  "Warning light on dash",
  "Starting problem",
  "Unusual noise or vibration",
  "Overheating or stalling",
];
const SERVICE_ISSUES = [
  "Valve adjustment or major service",
  "Fork seals",
  "Chain or sprockets",
  "Brake pads or rotors",
  "Battery or charging system",
];

export async function submitAppraisal(formData) {
  // ── The row already exists (created at Step 1 and updated at each step).
  //    On final submit we only need to:
  //      1. Mark status = submitted + set submitted_at
  //      2. Save any contact fields not yet persisted (belt-and-suspenders)
  //      3. Upload photos that haven't been uploaded yet
  //      4. Fire the email API
  // ─────────────────────────────────────────────────────────────────────────
  const appraisalId = getSubmissionId();

  if (!appraisalId) {
    throw new Error(
      "No draft submission found. Please restart the form."
    );
  }

  // ── Final update: status + contact fields (in case saveDraft missed them) ──
  const finalUpdate = {
    status:       "submitted",
    submitted_at: new Date().toISOString(),
    current_page: "thanks",

    // Contact — belt-and-suspenders
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
    console.error(result.error);
    throw new Error("Failed to save your appraisal.");
  }

  // ── Email API ────────────────────────────────────────────────────────────
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
    console.error("Email API error:", err);
  }

  // ── Photos: upload any that weren't uploaded during the draft phase ────────
  const photos = formData.photos ?? [];
  if (photos.length === 0) return { appraisalId };

  // Fetch already-saved paths so we don't double-upload
  const { data: existingPhotos } = await supabase
    .from("appraisal_photos")
    .select("storage_path")
    .eq("submission_id", appraisalId);

  const existingPaths = new Set((existingPhotos ?? []).map((p) => p.storage_path));

  const photoRows = [];

  await Promise.all(
    photos.map(async (photo) => {
      const file = photo.file;
      if (!file) return;

      const ext          = file.name.split(".").pop();
      const storagePath  = `drafts/${appraisalId}/${photo.id}.${ext}`;

      // Skip if already uploaded
      if (existingPaths.has(storagePath)) return;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(`Failed to upload ${file.name}:`, uploadError);
        return;
      }

      photoRows.push({
        submission_id:     appraisalId,
        storage_bucket:    BUCKET,
        storage_path:      storagePath,
        original_filename: file.name,
        mime_type:         file.type,
        size_bytes:        file.size,
        status:            "uploaded",
      });
    })
  );

  if (photoRows.length > 0) {
    const { error: photoError } = await supabase
      .from("appraisal_photos")
      .insert(photoRows);

    if (photoError) {
      console.error("Failed to save photo records:", photoError);
    }
  }

  // Update photo counts
  const totalUploaded = (existingPhotos?.length ?? 0) + photoRows.length;
  await supabase
    .from("intake_submissions")
    .update({
      photo_count:          photos.length,
      uploaded_photo_count: totalUploaded,
    })
    .eq("id", appraisalId);

  return { appraisalId };
}