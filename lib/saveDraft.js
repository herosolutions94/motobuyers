import { parseMileage, parseCurrency } from "@/helpers/helpers";
import {
  getOrCreateSessionId,
  setSubmissionId,
  getSubmissionId,
} from "./draftSession";

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
      const hasVinData = !!formData.vin;

      return {
        ...base,
        ...extraMeta,
        status: "draft",
        route_variant:"desktop",
        entry_path: formData.tab || "vin",

        year: activeYear,
        make: activeMake,
        model: activeModel,
        custom_make: activeCMake,

        vin: hasVinData ? formData.vin || null : null,
        vin_decoded: hasVinData ? !!formData.vehicleIdentified : false,
        vin_input: hasVinData ? formData.vin || null : null,
        submitted_vin: hasVinData ? formData.vin || null : null,
        vin_year: hasVinData ? formData.vinYear || null : null,
        vin_make: hasVinData ? formData.vinMake || null : null,
        vin_model: hasVinData ? formData.vinModel || null : null,

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

export async function saveDraft(currentPageId, nextPageId, formData) {
  const sessionId = getOrCreateSessionId();

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

  partial.current_page = PAGE_MAP[nextPageId] ?? nextPageId;

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

export async function savePhotos(photos = []) {
  // Photos are uploaded instantly when added in Step6.
}
