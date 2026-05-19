import { parseMileage, parseCurrency } from "@/helpers/helpers";
import { supabase } from "./supabaseClient";

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
  const row = {
    // Step 1
    entry_path: formData.tab || "vin",
    vin: formData.vin || null,
    vin_decoded: false,
    year: formData.year || null,
    make: formData.make || null,
    model: formData.model || null,
    custom_make: formData.customMake || null,

    // vehicle_identified: formData.vehicleIdentified || null,
    // vin_model: formData.vinModel || null,

    // Step 2
    mileage: parseMileage(formData.mileage),
    zip_code: formData.zip || null,
    recent_ride:
      formData.ridden === "yes"
        ? true
        : formData.ridden === "no"
          ? false
          : null,
    // email: formData.email || null,

    // Step 3
    cosmetic_rating: formData.cosmetic ?? null,

    // Step 3A
    // cosmetic_issues: formData.cosmeticIssues ?? [],
    cosmetic_issues:
      formData.cosmeticIssues
        ?.map((issue) => COSMETIC_ISSUES.indexOf(issue))
        .filter((index) => index !== -1) ?? [],

    cosmetic_other: formData.cosmeticOtherChecked
      ? formData.cosmeticOtherText || null
      : null,
    cosmetic_exclusive: formData.noIssues ?? false,

    // Step 4
    mechanical_rating: formData.mechanical ?? null,

    // Step 4B
    // mechanical_issues: formData.mechanicalIssues ?? [],
    mechanical_issues:
      formData.mechanicalIssues
        ?.map((issue) => MECHANICAL_ISSUES.indexOf(issue))
        .filter((index) => index !== -1) ?? [],

    mechanical_other: formData.mechOtherChecked
      ? formData.mechOtherText || null
      : null,
    mechanical_exclusive: formData.mechNoIssues ?? false,

    // Step 4C
    // service_issues: formData.serviceItems ?? [],
    service_issues:
      formData.serviceItems
        ?.map((item) => SERVICE_ISSUES.indexOf(item))
        .filter((index) => index !== -1) ?? [],

    service_other: formData.serviceOtherChecked
      ? formData.serviceOtherText || null
      : null,
    service_exclusive: formData.serviceCircleOption || null,

    // Step 4D
    front_tire_value: formData.frontTireNotSure
      ? null
      : (formData.frontTireMiles ?? null),
    front_tire_unknown: formData.frontTireNotSure ?? false,
    rear_tire_value: formData.rearTireNotSure
      ? null
      : (formData.rearTireMiles ?? null),
    rear_tire_unknown: formData.rearTireNotSure ?? false,

    // Step 5
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

    // Step 6 — Contact
    full_name: formData.firstName || null,
    phone: formData.phone || null,
    email: formData.contactEmail || null,
    notes: formData.notes || null,

    vin_input: formData.vin || null,
    submitted_vin: formData.vin || null,
    vin_year: formData.year || null,
    vin_make: formData.make || null,
    vin_model: formData.model || null,
    manual_year: formData.year || null,
    manual_make: formData.make || null,
    manual_model: formData.model || null,
    manual_custom_make: formData.customMake || null,
    status: "submitted",
  };

  const response = await fetch("/api/submit-appraisal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(row),
  });

  const result = await response.json();

  if (!result.success) {
    console.error(result.error);
    throw new Error("Failed to save your appraisal.");
  }

  const appraisalId = result.data.id;

  // const { data: inserted, error: insertError } = await supabase
  //   .from("intake_submissions")
  //   .insert(row)
  //   .select("id")
  //   .single();

  // if (insertError) {
  //   console.error("Supabase insert error:", insertError);
  //   throw new Error("Failed to save your appraisal. Please try again.");
  // }

  // const appraisalId = inserted.id;

  /* =========================
   CALL LARAVEL EMAIL API
========================= */
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}api/appraisal-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.firstName,
          email: formData.contactEmail,
          phone: formData.phone,
        }),
      },
    );
  } catch (err) {
    console.error("Email API error:", err);
  }
  /* ========================= */

  const photos = formData.photos ?? [];
  if (photos.length === 0) return { appraisalId };

  const photoRows = [];

  await Promise.all(
    photos.map(async (photo) => {
      const file = photo.file;
      if (!file) return;

      const ext = file.name.split(".").pop();
      const storagePath = `${appraisalId}/${photo.id}.${ext}`;

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

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      photoRows.push({
        submission_id: appraisalId,
        storage_bucket: "intake-photos",
        storage_path: storagePath,
        // public_url: urlData?.publicUrl ?? null,
        original_filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        status: "uploaded",
      });
    }),
  );

  if (photoRows.length > 0) {
    const { error: photoError } = await supabase
      .from("appraisal_photos")
      .insert(photoRows);

    if (photoError) {
      console.error("Failed to save photo records:", photoError);
    }
  }

  return { appraisalId };
}
