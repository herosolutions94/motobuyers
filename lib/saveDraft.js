// ─── saveDraft ────────────────────────────────────────────────────────────────
// Builds the appropriate partial row for the current step and either
//   • POSTs  to /api/submit-appraisal  (step 1 — creates the row, ONLY if no id exists yet)
//   • PATCHes to /api/submit-appraisal (all other steps, OR step 1 if row already exists)
//
// Tab logic for bike-id:
//   VIN tab active    → year/make/model from VIN decode; vin_* filled; manual_* null
//   Manual tab active → year/make/model from manual fields; manual_* filled;
//                       vin_* PRESERVED from form state if user had decoded a VIN earlier

import { parseMileage, parseCurrency } from "@/helpers/helpers";
import {
  getOrCreateSessionId,
  setSubmissionId,
  getSubmissionId,
} from "./draftSession";

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
const PAGE_MAP = {
  "bike-id": "entry",
  "vehicle-details": "details",
  "cosmetic-rating": "cosmetic",
  "cosmetic-issues": "cosmeticIssues",
  "mech-rating": "mechanical",
  "mech-issues": "mechanicalIssues",
  "service-maint": "service",
  "tire-mileage": "tires",
  "title-financial": "titleLoan",
  photos: "photos",
  "contact-submit": "contact",
  "thank-you": "thanks",
};

// ── Build partial row ─────────────────────────────────────────────────────────
function buildPartialRow(currentPageId, formData, sessionId, extraMeta = {}) {
  const base = {
    current_page: PAGE_MAP[currentPageId] ?? currentPageId,
    session_id: sessionId,
    last_active_at: new Date().toISOString(),
    form_state: JSON.stringify(buildFormSnapshot(formData)),
  };

  switch (currentPageId) {
    // ── Step 1: bike-id ───────────────────────────────────────────────────────
    case "bike-id": {
      const isVin = formData.tab === "vin";
      const isManual = formData.tab === "manual";

      // ── Primary columns: strictly reflect the ACTIVE tab ──────────────────
      // VIN tab    → take from VIN-decode results (year, make, vinModel)
      // Manual tab → take from isolated manual fields (manualYear, manualMake, model)
      const activeYear = isVin
        ? formData.vinYear || null
        : formData.manualYear || null;

      const activeMake = isVin
        ? formData.vinMake || null
        : formData.manualMake || null;

      const activeModel = isVin
        ? formData.vinModel || null
        : formData.manualModel || null;
      const activeCMake = isVin ? null : formData.customMake || null;

      // ── VIN columns ───────────────────────────────────────────────────────
      // Filled whenever vin data exists in form state — this covers two cases:
      //   1. User stayed on VIN tab and decoded a VIN (hasVinData = true, isVin = true)
      //   2. User decoded a VIN then SWITCHED to manual tab (hasVinData = true, isVin = false)
      // In case 2 the primary columns reflect the manual input, but vin_* columns
      // still preserve the VIN the user entered so it's not lost in the DB.
      const hasVinData = !!formData.vin;

      return {
        ...base,
        ...extraMeta,
        status: "draft",
        entry_path: formData.tab || "vin",

        // Primary columns — always reflect the active tab
        year: activeYear,
        make: activeMake,
        model: activeModel,
        custom_make: activeCMake,

        // VIN columns — preserved whenever any VIN data exists
        vin: hasVinData ? formData.vin || null : null,
        vin_decoded: hasVinData ? !!formData.vehicleIdentified : false,
        vin_input: hasVinData ? formData.vin || null : null,
        submitted_vin: hasVinData ? formData.vin || null : null,
        vin_year: hasVinData ? formData.vinYear || null : null,
        vin_make: hasVinData ? formData.vinMake || null : null,
        vin_model: hasVinData ? formData.vinModel || null : null,

        // Manual columns — only when manual tab was the active tab
        // Manual values hamesha preserve karo agar form state me mojood hain
        manual_year: formData.manualYear || null,
        manual_make: formData.manualMake || null,
        manual_model: formData.manualModel || null,
        manual_custom_make: formData.customMake || null,
      };
    }

    // ── Step 2: vehicle-details ───────────────────────────────────────────────
    case "vehicle-details":
      return {
        ...base,
        mileage: parseMileage(formData.mileage),
        zip_code: formData.zip || null,
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
      return { ...base, cosmetic_rating: formData.cosmetic ?? null };

    // ── Step 3B: cosmetic-issues ──────────────────────────────────────────────
    case "cosmetic-issues":
      return {
        ...base,
        cosmetic_issues: (formData.cosmeticIssues ?? [])
          .map((issue) => COSMETIC_ISSUES.indexOf(issue))
          .filter((idx) => idx !== -1),
        cosmetic_other: formData.cosmeticOtherChecked
          ? formData.cosmeticOtherText || null
          : null,
        cosmetic_exclusive: formData.noIssues ?? false,
      };

    // ── Step 4: mech-rating ───────────────────────────────────────────────────
    case "mech-rating":
      return { ...base, mechanical_rating: formData.mechanical ?? null };

    // ── Step 4B: mech-issues ──────────────────────────────────────────────────
    case "mech-issues":
      return {
        ...base,
        mechanical_issues: (formData.mechanicalIssues ?? [])
          .map((issue) => MECHANICAL_ISSUES.indexOf(issue))
          .filter((idx) => idx !== -1),
        mechanical_other: formData.mechOtherChecked
          ? formData.mechOtherText || null
          : null,
        mechanical_exclusive: formData.mechNoIssues ?? false,
      };

    // ── Step 4C: service-maint ────────────────────────────────────────────────
    case "service-maint":
      return {
        ...base,
        service_issues: (formData.serviceItems ?? [])
          .map((item) => SERVICE_ISSUES.indexOf(item))
          .filter((idx) => idx !== -1),
        service_other: formData.serviceOtherChecked
          ? formData.serviceOtherText || null
          : null,
        service_exclusive: formData.serviceCircleOption || null,
      };

    // ── Step 4D: tire-mileage ─────────────────────────────────────────────────
    case "tire-mileage":
      return {
        ...base,
        front_tire_value: formData.frontTireNotSure
          ? null
          : (formData.frontTireMiles ?? null),
        front_tire_unknown: formData.frontTireNotSure ?? false,
        rear_tire_value: formData.rearTireNotSure
          ? null
          : (formData.rearTireMiles ?? null),
        rear_tire_unknown: formData.rearTireNotSure ?? false,
      };

    // ── Step 5: title-financial ───────────────────────────────────────────────
    case "title-financial":
      return {
        ...base,
        title_type: formData.titleType || null,
        has_loan:
          formData.hasLoan === "yes"
            ? true
            : formData.hasLoan === "no"
              ? false
              : null,
        payoff_amount: formData.notSurePayoff
          ? null
          : parseCurrency(formData.payoffAmount),
        payoff_unknown: formData.notSurePayoff ?? false,
        asking_price: formData.notSurePrice
          ? null
          : parseCurrency(formData.askingPrice),
        asking_price_unknown: formData.notSurePrice ?? false,
      };

    // ── Step 6: photos ────────────────────────────────────────────────────────
    case "photos":
      return { ...base, photo_count: (formData.photos ?? []).length };

    // ── Step 7: contact-submit ────────────────────────────────────────────────
    case "contact-submit":
      return {
        ...base,
        full_name: formData.firstName || null,
        phone: formData.phone || null,
        email: formData.contactEmail || null,
        notes: formData.notes || null,
      };

    default:
      return base;
  }
}

// ── Lightweight form snapshot ─────────────────────────────────────────────────
function buildFormSnapshot(f) {
  return {
    tab: f.tab,
    vin: f.vin,
    year: f.year,
    make: f.make,
    model: f.model,

    vinYear: f.vinYear,
    vinMake: f.vinMake,
    vinModel: f.vinModel,

    manualYear: f.manualYear,
    manualMake: f.manualMake,
    manualModel: f.manualModel,
    customMake: f.customMake,
    zip: f.zip,
    email: f.email,
    mileage: f.mileage,
    ridden: f.ridden,
    cosmetic: f.cosmetic,
    cosmeticIssues: f.cosmeticIssues,
    noIssues: f.noIssues,
    mechanical: f.mechanical,
    mechanicalIssues: f.mechanicalIssues,
    mechNoIssues: f.mechNoIssues,
    serviceItems: f.serviceItems,
    serviceCircleOption: f.serviceCircleOption,
    frontTireMiles: f.frontTireMiles,
    rearTireMiles: f.rearTireMiles,
    frontTireNotSure: f.frontTireNotSure,
    rearTireNotSure: f.rearTireNotSure,
    titleType: f.titleType,
    hasLoan: f.hasLoan,
    payoffAmount: f.payoffAmount,
    notSurePayoff: f.notSurePayoff,
    askingPrice: f.askingPrice,
    notSurePrice: f.notSurePrice,
    firstName: f.firstName,
    phone: f.phone,
    contactEmail: f.contactEmail,
    notes: f.notes,
    photoCount: (f.photos ?? []).length,
  };
}

// ─── Main export: saveDraft ───────────────────────────────────────────────────
/**
 * saveDraft(currentPageId, nextPageId, formData)
 *
 * currentPageId = step the user is ON right now (data being saved)
 * nextPageId    = step the user is GOING TO (stored as current_page)
 * formData      = full RHF getValues() snapshot
 *
 * For bike-id:
 *   - POST  if no submission ID exists yet (first time through Step 1)
 *   - PATCH if a submission ID already exists (user went back and is re-proceeding)
 * All other steps → always PATCH.
 */
export async function saveDraft(currentPageId, nextPageId, formData) {
  const sessionId = getOrCreateSessionId();

  // Collect browser metadata on create only
  const extraMeta =
    currentPageId === "bike-id"
      ? {
          landing_url:
            typeof window !== "undefined" ? window.location.href : null,
          referrer:
            typeof document !== "undefined" ? document.referrer || null : null,
          user_agent:
            typeof navigator !== "undefined" ? navigator.userAgent : null,
        }
      : {};

  const partial = buildPartialRow(
    currentPageId,
    formData,
    sessionId,
    extraMeta,
  );

  // Override current_page to be the DESTINATION step
  partial.current_page = PAGE_MAP[nextPageId] ?? nextPageId;

  // ── Determine POST vs PATCH ───────────────────────────────────────────────
  // POST only when: we are on bike-id AND no submission row exists yet.
  // If the user navigated back to bike-id and is proceeding again, PATCH.
  const existingSubmissionId = getSubmissionId();
  const isCreate = currentPageId === "bike-id" && !existingSubmissionId;
  const method = isCreate ? "POST" : "PATCH";
  const submissionId = isCreate ? null : existingSubmissionId || null;

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

// ─── savePhotos (no-op — photos are uploaded instantly in Step6) ──────────────
export async function savePhotos(photos = []) {
  // Photos are uploaded instantly when added in Step6.
}
