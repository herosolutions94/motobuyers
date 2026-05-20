// ─── saveDraft ────────────────────────────────────────────────────────────────
// Builds the appropriate partial row for the current step and either
//   • POSTs  to /api/submit-appraisal  (step 1 — creates the row)
//   • PATCHes to /api/submit-appraisal (all other steps — updates the row)
//
// All field names match the intake_submissions schema exactly.

import { parseMileage, parseCurrency } from "@/helpers/helpers";
import {
  getOrCreateSessionId,
  setSubmissionId,
  getSubmissionId,
} from "./draftSession";

// ── Issue index arrays (must mirror submitAppraisal.js) ──────────────────────
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

// ── current_page map ─────────────────────────────────────────────────────────
const PAGE_MAP = {
  "bike-id":         "entry",
  "vehicle-details": "details",
  "cosmetic-rating": "cosmetic",
  "cosmetic-issues": "cosmeticIssues",
  "mech-rating":     "mechanical",
  "mech-issues":     "mechanicalIssues",
  "service-maint":   "service",
  "tire-mileage":    "tires",
  "title-financial": "titleLoan",
  photos:            "photos",
  "contact-submit":  "contact",
  "thank-you":       "thanks",
};

// ── Build partial row per step ────────────────────────────────────────────────
function buildPartialRow(stepId, formData, sessionId) {
  const base = {
    current_page: PAGE_MAP[stepId] ?? stepId,
    session_id:   sessionId,
  };

  switch (stepId) {
    // ── Step 1: bike-id ──────────────────────────────────────────────────────
    case "bike-id":
      return {
        ...base,
        status:       "draft",
        entry_path:   formData.tab || "vin",
        vin:          formData.vin || null,
        vin_decoded:  false,
        year:         formData.year || null,
        make:         formData.make || null,
        model:        formData.tab === "vin" ? (formData.vinModel || null) : (formData.model || null),
        custom_make:  formData.customMake || null,
        // vin-specific mirrors
        vin_input:    formData.vin || null,
        submitted_vin: formData.vin || null,
        vin_year:     formData.tab === "vin" ? (formData.year || null) : null,
        vin_make:     formData.tab === "vin" ? (formData.make || null) : null,
        vin_model:    formData.tab === "vin" ? (formData.vinModel || null) : null,
        // manual mirrors
        manual_year:       formData.tab === "manual" ? (formData.year || null) : null,
        manual_make:       formData.tab === "manual" ? (formData.make || null) : null,
        manual_model:      formData.tab === "manual" ? (formData.model || null) : null,
        manual_custom_make: formData.tab === "manual" ? (formData.customMake || null) : null,
      };

    // ── Step 2: vehicle-details ───────────────────────────────────────────────
    case "vehicle-details":
      return {
        ...base,
        mileage:     parseMileage(formData.mileage),
        zip_code:    formData.zip || null,
        recent_ride:
          formData.ridden === "yes"
            ? true
            : formData.ridden === "no"
            ? false
            : null,
        email: formData.email || null,
      };

    // ── Step 3: cosmetic-rating ───────────────────────────────────────────────
    case "cosmetic-rating":
      return {
        ...base,
        cosmetic_rating: formData.cosmetic ?? null,
      };

    // ── Step 3B: cosmetic-issues ──────────────────────────────────────────────
    case "cosmetic-issues":
      return {
        ...base,
        cosmetic_issues:
          (formData.cosmeticIssues ?? [])
            .map((issue) => COSMETIC_ISSUES.indexOf(issue))
            .filter((idx) => idx !== -1),
        cosmetic_other:     formData.cosmeticOtherChecked ? (formData.cosmeticOtherText || null) : null,
        cosmetic_exclusive: formData.noIssues ?? false,
      };

    // ── Step 4: mech-rating ───────────────────────────────────────────────────
    case "mech-rating":
      return {
        ...base,
        mechanical_rating: formData.mechanical ?? null,
      };

    // ── Step 4B: mech-issues ──────────────────────────────────────────────────
    case "mech-issues":
      return {
        ...base,
        mechanical_issues:
          (formData.mechanicalIssues ?? [])
            .map((issue) => MECHANICAL_ISSUES.indexOf(issue))
            .filter((idx) => idx !== -1),
        mechanical_other:     formData.mechOtherChecked ? (formData.mechOtherText || null) : null,
        mechanical_exclusive: formData.mechNoIssues ?? false,
      };

    // ── Step 4C: service-maint ────────────────────────────────────────────────
    case "service-maint":
      return {
        ...base,
        service_issues:
          (formData.serviceItems ?? [])
            .map((item) => SERVICE_ISSUES.indexOf(item))
            .filter((idx) => idx !== -1),
        service_other:     formData.serviceOtherChecked ? (formData.serviceOtherText || null) : null,
        service_exclusive: formData.serviceCircleOption || null,
      };

    // ── Step 4D: tire-mileage ─────────────────────────────────────────────────
    case "tire-mileage":
      return {
        ...base,
        front_tire_value:   formData.frontTireNotSure ? null : (formData.frontTireMiles ?? null),
        front_tire_unknown: formData.frontTireNotSure ?? false,
        rear_tire_value:    formData.rearTireNotSure  ? null : (formData.rearTireMiles  ?? null),
        rear_tire_unknown:  formData.rearTireNotSure  ?? false,
      };

    // ── Step 5: title-financial ───────────────────────────────────────────────
    case "title-financial":
      return {
        ...base,
        title_type:    formData.titleType || null,
        has_loan:
          formData.hasLoan === "yes"
            ? true
            : formData.hasLoan === "no"
            ? false
            : null,
        payoff_amount:  formData.notSurePayoff ? null : parseCurrency(formData.payoffAmount),
        payoff_unknown: formData.notSurePayoff ?? false,
        asking_price:        formData.notSurePrice ? null : parseCurrency(formData.askingPrice),
        asking_price_unknown: formData.notSurePrice ?? false,
      };

    // ── Step 6: photos — only updates current_page; photo rows are handled
    //    separately in savePhotos() below ──────────────────────────────────────
    case "photos":
      return { ...base };

    // ── Step 7: contact-submit ────────────────────────────────────────────────
    case "contact-submit":
      return {
        ...base,
        full_name: formData.firstName || null,
        phone:     formData.phone     || null,
        email:     formData.contactEmail || null,
        notes:     formData.notes     || null,
      };

    // ── Step 8 / thank-you ────────────────────────────────────────────────────
    case "thank-you":
      return {
        ...base,
        status:       "submitted",
        submitted_at: new Date().toISOString(),
      };

    default:
      return base;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * saveDraft(stepId, formData)
 *
 * Step 1  → POST  (creates the row, stores returned id in localStorage)
 * Others  → PATCH (updates the existing row by id)
 *
 * Returns { submissionId } on success, throws on error.
 */
export async function saveDraft(stepId, formData) {
  const sessionId = getOrCreateSessionId();
  const partial   = buildPartialRow(stepId, formData, sessionId);

  const isCreate = stepId === "bike-id";
  const method   = isCreate ? "POST" : "PATCH";

  // For PATCH we need the existing row id
  const submissionId = isCreate ? null : getSubmissionId();
  if (!isCreate && !submissionId) {
    // Guard: if id is missing for some reason, skip silently
    console.warn("[saveDraft] No submission id found for PATCH – skipping.");
    return { submissionId: null };
  }

  const url = isCreate
    ? "/api/submit-appraisal"
    : `/api/submit-appraisal?id=${submissionId}`;

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });

  const result = await response.json();

  if (!result.success) {
    console.error("[saveDraft] API error:", result.error);
    throw new Error(result.error || "Failed to save draft.");
  }

  // On create, persist the new row id
  if (isCreate && result.data?.id) {
    setSubmissionId(result.data.id);
    return { submissionId: result.data.id };
  }

  return { submissionId: submissionId ?? result.data?.id ?? null };
}

// ─── savePhotos ───────────────────────────────────────────────────────────────
// Upload photos to Supabase Storage under drafts/<submissionId>/...
// and insert rows into appraisal_photos.
// Called from steps.js when the user leaves the photos step.
import { supabase } from "./supabaseClient";

const BUCKET = "intake-photos";

export async function savePhotos(photos = []) {
  const submissionId = getSubmissionId();
  if (!submissionId || photos.length === 0) return;

  const photoRows = [];

  await Promise.all(
    photos.map(async (photo) => {
      const file = photo.file;
      if (!file) return;

      const ext = file.name.split(".").pop();
      // Store under drafts/ folder inside the bucket
      const storagePath = `drafts/${submissionId}/${photo.id}.${ext}`;

      // Check if already uploaded (user navigated back and forward)
      if (photo.storagePath) return; // already saved

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(`[savePhotos] Failed to upload ${file.name}:`, uploadError);
        return;
      }

      photoRows.push({
        submission_id:     submissionId,
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
    const { error } = await supabase.from("appraisal_photos").insert(photoRows);
    if (error) console.error("[savePhotos] Photo insert error:", error);
  }

  // Update photo_count on main row
  const { error: countErr } = await supabase
    .from("intake_submissions")
    .update({
      photo_count:          photos.length,
      uploaded_photo_count: photoRows.length,
    })
    .eq("id", submissionId);

  if (countErr) console.error("[savePhotos] Count update error:", countErr);
}