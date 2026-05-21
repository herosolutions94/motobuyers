// ─── saveDraft ────────────────────────────────────────────────────────────────
// Builds the appropriate partial row for the current step and either
//   • POSTs  to /api/submit-appraisal  (step 1 — creates the row)
//   • PATCHes to /api/submit-appraisal (all other steps — updates the row)
//
// All column names match the intake_submissions schema exactly.
// No dependency on the old submitAppraisal / appraisal_photos flow.

import { parseMileage, parseCurrency } from "@/helpers/helpers";
import {
  getOrCreateSessionId,
  setSubmissionId,
  getSubmissionId,
} from "./draftSession";
import { supabase } from "./supabaseClient";

// ── Issue index arrays ────────────────────────────────────────────────────────
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

// ── current_page map ──────────────────────────────────────────────────────────
// Each entry maps a stepId to the current_page value that should be stored
// when the user is ON that step (i.e. after arriving at it).
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

// ── Build partial row ─────────────────────────────────────────────────────────
// currentPageId  = the step the user is currently ON (stored as current_page)
// formData       = full RHF values
// sessionId      = from localStorage
// extraMeta      = { landing_url, user_agent } — only passed on create
function buildPartialRow(currentPageId, formData, sessionId, extraMeta = {}) {
  const base = {
    current_page:   PAGE_MAP[currentPageId] ?? currentPageId,
    session_id:     sessionId,
    last_active_at: new Date().toISOString(),
    // form_state: always keep a full snapshot so admin can inspect it
    form_state: JSON.stringify(buildFormSnapshot(formData)),
  };

  switch (currentPageId) {
    // ── Step 1: bike-id ───────────────────────────────────────────────────────
    // This is the CREATE step. year / make / model stored based on active tab.
    case "bike-id": {
      const isVin    = formData.tab === "vin";
      const isManual = formData.tab === "manual";

      // Primary fields reflect the ACTIVE tab only
      // VIN tab:    year/make come from VIN decode results (stored in year/make)
      // Manual tab: year/make come from manualYear/manualMake (isolated fields)
      const activeYear  = isVin ? (formData.year     || null) : (formData.manualYear || null);
      const activeMake  = isVin ? (formData.make     || null) : (formData.manualMake || null);
      const activeModel = isVin ? (formData.vinModel || null) : (formData.model      || null);
      const activeCMake = isVin ? null                        : (formData.customMake || null);

      return {
        ...base,
        ...extraMeta,
        status:      "draft",
        entry_path:  formData.tab || "vin",

        // Primary fields — reflect active tab
        year:        activeYear,
        make:        activeMake,
        model:       activeModel,
        custom_make: activeCMake,

        // VIN-specific columns — only filled when VIN tab was used
        vin:           formData.vin || null,
        vin_decoded:   isVin && !!formData.vehicleIdentified,
        vin_input:     formData.vin || null,
        submitted_vin: isVin ? (formData.vin || null) : null,
        vin_year:      isVin ? (formData.year    || null) : null,
        vin_make:      isVin ? (formData.make    || null) : null,
        vin_model:     isVin ? (formData.vinModel|| null) : null,

        // Manual-specific columns — only filled when manual tab was used
        manual_year:        isManual ? (formData.manualYear || null) : null,
        manual_make:        isManual ? (formData.manualMake || null) : null,
        manual_model:       isManual ? (formData.model      || null) : null,
        manual_custom_make: isManual ? (formData.customMake || null) : null,
      };
    }

    // ── Step 2: vehicle-details ───────────────────────────────────────────────
    case "vehicle-details":
      return {
        ...base,
        mileage:     parseMileage(formData.mileage),
        zip_code:    formData.zip    || null,
        recent_ride:
          formData.ridden === "yes" ? true
          : formData.ridden === "no"  ? false
          : null,
        // Step 2 email goes into the main email column
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
        cosmetic_other:     formData.cosmeticOtherChecked
                              ? (formData.cosmeticOtherText || null)
                              : null,
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
        mechanical_other:     formData.mechOtherChecked
                                ? (formData.mechOtherText || null)
                                : null,
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
        service_other:     formData.serviceOtherChecked
                             ? (formData.serviceOtherText || null)
                             : null,
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
        title_type: formData.titleType || null,
        has_loan:
          formData.hasLoan === "yes" ? true
          : formData.hasLoan === "no"  ? false
          : null,
        payoff_amount:        formData.notSurePayoff ? null : parseCurrency(formData.payoffAmount),
        payoff_unknown:       formData.notSurePayoff ?? false,
        asking_price:         formData.notSurePrice  ? null : parseCurrency(formData.askingPrice),
        asking_price_unknown: formData.notSurePrice  ?? false,
      };

    // ── Step 6: photos — current_page + counts updated; actual rows handled
    //    by savePhotos() ─────────────────────────────────────────────────────
    case "photos":
      return {
        ...base,
        photo_count: (formData.photos ?? []).length,
      };

    // ── Step 7: contact-submit ────────────────────────────────────────────────
    case "contact-submit":
      return {
        ...base,
        full_name: formData.firstName    || null,
        phone:     formData.phone        || null,
        // contactEmail is the RHF field in Step 7; store it in the email col
        email:     formData.contactEmail || null,
        notes:     formData.notes        || null,
      };

    // ── thank-you: final status update handled by submitAppraisal, not here ──
    default:
      return base;
  }
}

// ── Lightweight form snapshot stored in form_state column ────────────────────
function buildFormSnapshot(f) {
  return {
    tab:              f.tab,
    vin:              f.vin,
    year:             f.year,
    make:             f.make,
    model:            f.model,
    vinModel:         f.vinModel,
    customMake:       f.customMake,
    manualYear:       f.manualYear,
    manualMake:       f.manualMake,
    zip:              f.zip,
    email:            f.email,
    mileage:          f.mileage,
    ridden:           f.ridden,
    cosmetic:         f.cosmetic,
    cosmeticIssues:   f.cosmeticIssues,
    noIssues:         f.noIssues,
    mechanical:       f.mechanical,
    mechanicalIssues: f.mechanicalIssues,
    mechNoIssues:     f.mechNoIssues,
    serviceItems:     f.serviceItems,
    serviceCircleOption: f.serviceCircleOption,
    frontTireMiles:   f.frontTireMiles,
    rearTireMiles:    f.rearTireMiles,
    frontTireNotSure: f.frontTireNotSure,
    rearTireNotSure:  f.rearTireNotSure,
    titleType:        f.titleType,
    hasLoan:          f.hasLoan,
    payoffAmount:     f.payoffAmount,
    notSurePayoff:    f.notSurePayoff,
    askingPrice:      f.askingPrice,
    notSurePrice:     f.notSurePrice,
    firstName:        f.firstName,
    phone:            f.phone,
    contactEmail:     f.contactEmail,
    notes:            f.notes,
    photoCount:       (f.photos ?? []).length,
  };
}

// ─── Main export: saveDraft ───────────────────────────────────────────────────
/**
 * saveDraft(currentPageId, nextPageId, formData)
 *
 * currentPageId  = step the user is ON right now (data being saved)
 * nextPageId     = step the user is GOING TO (stored as current_page)
 * formData       = full RHF getValues() snapshot
 *
 * Step bike-id → POST (creates row, stores id in localStorage)
 * All others   → PATCH (updates row by id)
 */
export async function saveDraft(currentPageId, nextPageId, formData) {
  const sessionId = getOrCreateSessionId();

  // Collect browser metadata on create only
  const extraMeta = currentPageId === "bike-id"
    ? {
        landing_url: typeof window !== "undefined" ? window.location.href : null,
        user_agent:  typeof navigator !== "undefined" ? navigator.userAgent : null,
      }
    : {};

  // Build row with next page as current_page (reflects where user IS going)
  const partial = buildPartialRow(
    currentPageId,
    formData,
    sessionId,
    extraMeta,
  );

  // Override current_page to be the DESTINATION step
  partial.current_page = PAGE_MAP[nextPageId] ?? nextPageId;

  const isCreate    = currentPageId === "bike-id";
  const method      = isCreate ? "POST" : "PATCH";
  const submissionId = isCreate ? null : getSubmissionId();

  if (!isCreate && !submissionId) {
    console.warn("[saveDraft] No submission id for PATCH – skipping.");
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

  if (isCreate && result.data?.id) {
    setSubmissionId(result.data.id);
    return { submissionId: result.data.id };
  }

  return { submissionId: submissionId ?? result.data?.id ?? null };
}

// ─── savePhotos ───────────────────────────────────────────────────────────────
// 1. Insert pending rows into intake_photos (status = "pending")
// 2. Upload file to Supabase Storage drafts/<submissionId>/
// 3. Update the row status to "uploaded"
// 4. Update photo_count / uploaded_photo_count on intake_submissions
//
// Photos that already have a storage_path (uploaded previously) are skipped.

const BUCKET = "intake-photos";

export async function savePhotos(photos = []) {
  const submissionId = getSubmissionId();
  if (!submissionId || photos.length === 0) return;

  // Fetch already-recorded paths so we never double-insert
  const { data: existingRows } = await supabase
    .from("intake_photos")
    .select("storage_path")
    .eq("submission_id", submissionId);

  const existingPaths = new Set((existingRows ?? []).map((r) => r.storage_path));

  let uploadedCount = existingRows?.length ?? 0;

  await Promise.all(
    photos.map(async (photo) => {
      const file = photo.file;
      if (!file) return; // already-uploaded photo (no File object)

      const ext         = file.name.split(".").pop();
      const storagePath = `drafts/${submissionId}/${photo.id}.${ext}`;

      if (existingPaths.has(storagePath)) return; // already done

      // ── 1. Insert a "pending" row first ──────────────────────────────────
      const { data: insertedRow, error: insertErr } = await supabase
        .from("intake_photos")
        .insert({
          submission_id:     submissionId,
          storage_bucket:    BUCKET,
          storage_path:      storagePath,
          original_filename: file.name,
          mime_type:         file.type,
          size_bytes:        file.size,
          status:            "pending",
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error("[savePhotos] Insert error:", insertErr);
        return;
      }

      // ── 2. Upload to Supabase Storage ────────────────────────────────────
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadErr) {
        console.error("[savePhotos] Upload error:", uploadErr);
        // Leave the row as "pending" — can retry later
        return;
      }

      // ── 3. Mark row as uploaded ──────────────────────────────────────────
      await supabase
        .from("intake_photos")
        .update({ status: "uploaded" })
        .eq("id", insertedRow.id);

      uploadedCount += 1;
    })
  );

  // ── 4. Update counts on intake_submissions ────────────────────────────────
  await supabase
    .from("intake_submissions")
    .update({
      photo_count:          photos.length,
      uploaded_photo_count: uploadedCount,
    })
    .eq("id", submissionId);
}