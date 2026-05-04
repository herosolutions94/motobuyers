import { parseMileage, parseCurrency } from "@/helpers/helpers";
import { supabase } from "./supabaseClient";

const BUCKET = "appraisal-photos";

export async function submitAppraisal(formData) {
  const row = {
    // Step 1
    entry_tab: formData.tab || "vin",
    vin: formData.vin || null,
    vehicle_identified: formData.vehicleIdentified || null,
    vin_model: formData.vinModel || null,
    year: formData.year || null,
    make: formData.make || null,
    model: formData.model || null,
    custom_make: formData.customMake || null,

    // Step 2
    mileage: parseMileage(formData.mileage),
    zip: formData.zip || null,
    ridden_last_30_days:
      formData.ridden === "yes"
        ? true
        : formData.ridden === "no"
          ? false
          : null,
    email: formData.email || null,

    // Step 3
    cosmetic_rating: formData.cosmetic ?? null,

    // Step 3A
    cosmetic_issues: formData.cosmeticIssues ?? [],
    cosmetic_other_text: formData.cosmeticOtherChecked
      ? formData.cosmeticOtherText || null
      : null,
    no_cosmetic_issues: formData.noIssues ?? false,

    // Step 4
    mechanical_rating: formData.mechanical ?? null,

    // Step 4B
    mechanical_issues: formData.mechanicalIssues ?? [],
    mechanical_other_text: formData.mechOtherChecked
      ? formData.mechOtherText || null
      : null,
    no_mechanical_issues: formData.mechNoIssues ?? false,

    // Step 4C
    service_items: formData.serviceItems ?? [],
    service_other_text: formData.serviceOtherChecked
      ? formData.serviceOtherText || null
      : null,
    service_circle_option: formData.serviceCircleOption || null,

    // Step 4D
    front_tire_miles: formData.frontTireNotSure
      ? null
      : (formData.frontTireMiles ?? null),
    front_tire_not_sure: formData.frontTireNotSure ?? false,
    rear_tire_miles: formData.rearTireNotSure
      ? null
      : (formData.rearTireMiles ?? null),
    rear_tire_not_sure: formData.rearTireNotSure ?? false,

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
    not_sure_payoff: formData.notSurePayoff ?? false,
    asking_price: formData.notSurePrice
      ? null
      : parseCurrency(formData.askingPrice),
    not_sure_price: formData.notSurePrice ?? false,

    // Step 6 — Contact
    first_name: formData.firstName || null,
    phone: formData.phone || null,
    contact_email: formData.contactEmail || null,
    notes: formData.notes || null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("appraisals")
    .insert(row)
    .select("id")
    .single();

  if (insertError) {
    console.error("Supabase insert error:", insertError);
    throw new Error("Failed to save your appraisal. Please try again.");
  }

  const appraisalId = inserted.id;

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
        appraisal_id: appraisalId,
        storage_path: storagePath,
        public_url: urlData?.publicUrl ?? null,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
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
