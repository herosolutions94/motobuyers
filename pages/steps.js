import Head from "next/head";
import { useState, useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Contain from "../components/contain";
import Step1 from "../components/steps/Step1";
import Step2 from "../components/steps/Step2";
import Step3 from "../components/steps/Step3";
import Step3b from "../components/steps/Step3b";
import Step4 from "../components/steps/Step4";
import Step4b from "../components/steps/Step4b";
import Step4c from "../components/steps/Step4c";
import Step4d from "../components/steps/Step4d";
import Step5 from "../components/steps/Step5";
import Step6 from "../components/steps/Step6";
import Step7 from "../components/steps/Step7";
import Step8 from "../components/steps/Step8";

import { submitAppraisal } from "../lib/submitAppraisal";
import { saveDraft, savePhotos } from "../lib/saveDraft";
import { clearDraftSession } from "../lib/draftSession";
import { HERO_PREFILL_KEY } from "../components/HeroSection";

import http from "@/helpers/http";
import { parse } from "cookie";
import { doObjToFormData } from "@/helpers/helpers";
import MetaGenerator from "@/components/meta-generator";
import Text from "@/components/text";

export const getServerSideProps = async (context) => {
  const { req } = context;
  const cookieHeader = req.headers.cookie || "";
  const cookieValue = parse(cookieHeader);
  const authToken =
    cookieValue["authToken"] !== undefined &&
    cookieValue["authToken"] !== null &&
    cookieValue["authToken"] !== ""
      ? cookieValue["authToken"]
      : "";

  const result = await http
    .post("steps-page", doObjToFormData({ token: authToken }))
    .then((response) => response.data)
    .catch((error) => error.response.data.message);

  return { props: { result } };
};

// ─── Step IDs ────────────────────────────────────────────────────────────────
const STEP_IDS = [
  "bike-id",          // 1
  "vehicle-details",  // 2
  "cosmetic-rating",  // 3
  "cosmetic-issues",  // 3A  — skipped if cosmetic === 5
  "mech-rating",      // 4
  "mech-issues",      // 4B  — skipped if mechanical === 5
  "service-maint",    // 4C  — always shown
  "tire-mileage",     // 4D  — skipped if mileage < 1000
  "title-financial",  // 5
  "photos",           // 6
  "contact-submit",   // 7
  "thank-you",        // 8
];

// ─── Dynamic sequence builder ────────────────────────────────────────────────
function buildSequence(watchedValues) {
  const { cosmetic, mechanical, mileage } = watchedValues;
  const numMileage = parseInt(String(mileage || "0").replace(/,/g, ""), 10);

  const seq = ["bike-id", "vehicle-details", "cosmetic-rating"];
  if (cosmetic !== 5) seq.push("cosmetic-issues");
  seq.push("mech-rating");
  if (mechanical !== 5) seq.push("mech-issues");
  seq.push("service-maint");
  if (numMileage >= 1000) seq.push("tire-mileage");
  seq.push("title-financial", "photos", "contact-submit", "thank-you");
  return seq;
}

// ─── Step title (right of progress bar) ─────────────────────────────────────
const STEP_TITLE_MAP = {
  "bike-id": "Bike Details",
  "vehicle-details": "Bike Details",
  "cosmetic-rating": "Cosmetic Condition",
  "cosmetic-issues": "Cosmetic Issues",
  "mech-rating": "Mechanical Condition",
  "mech-issues": "Mechanical Issue",
  "service-maint": "Service and Maintenance Items",
  "tire-mileage": "Tire Millage",
  "title-financial": "Title and Financial Info",
  photos: "Photos",
  "contact-submit": "Contact Info",
  "thank-you": "Submission Complete",
};

// ─── Step label (left of progress bar) ──────────────────────────────────────
const STEP_LABEL_MAP = {
  "bike-id": "Step 1 of 6",
  "vehicle-details": "Step 1 of 6",
  "cosmetic-rating": "Step 2 of 6",
  "cosmetic-issues": "Step 2 of 6",
  "mech-rating": "Step 3 of 6",
  "mech-issues": "Step 3 of 6",
  "service-maint": "Step 3 of 6",
  "tire-mileage": "Step 3 of 6",
  "title-financial": "Step 4 of 6",
  photos: "Step 5 of 6",
  "contact-submit": "Step 6 of 6",
  "thank-you": "Done",
};

// ─── Progress % per step ID ──────────────────────────────────────────────────
const PROGRESS_MAP = {
  "bike-id": 8,
  "vehicle-details": 17,
  "cosmetic-rating": 27,
  "cosmetic-issues": 36,
  "mech-rating": 45,
  "mech-issues": 54,
  "service-maint": 63,
  "tire-mileage": 72,
  "title-financial": 81,
  photos: 88,
  "contact-submit": 94,
  "thank-you": 100,
};

export default function StepsPage({ result }) {
  let { meta_desc, page_title, content, site_settings, thank_steps } = result;

  const methods = useForm({
    mode: "onTouched",
    defaultValues: {
      // Step 1
      tab: "vin",
      vin: "",
      vehicleIdentified: "",
      year: "",
      make: "",
      vinModel: "",
      model: "",
      customMake: "",
      // Step 2
      mileage: "",
      zip: "",
      ridden: "",
      email: "",
      // Step 3
      cosmetic: null,
      // Step 3A
      cosmeticIssues: [],
      cosmeticOtherChecked: false,
      cosmeticOtherText: "",
      noIssues: false,
      // Step 4
      mechanical: null,
      // Step 4B
      mechanicalIssues: [],
      mechOtherChecked: false,
      mechOtherText: "",
      mechNoIssues: false,
      // Step 4C
      serviceItems: [],
      serviceOtherChecked: false,
      serviceOtherText: "",
      serviceCircleOption: "",
      // Step 4D
      frontTireMiles: 0,
      rearTireMiles: 0,
      frontTireNotSure: false,
      rearTireNotSure: false,
      // Step 5
      titleType: "",
      hasLoan: "",
      payoffAmount: "",
      notSurePayoff: false,
      askingPrice: "",
      notSurePrice: false,
      // Step 5B
      photos: [],
      // Step 6
      firstName: "",
      phone: "",
      contactEmail: "",
      notes: "",
    },
  });

  const { watch, trigger, handleSubmit } = methods;
  const watchedValues = watch(["cosmetic", "mechanical", "mileage"]);
  const valuesObj = {
    cosmetic: watchedValues[0],
    mechanical: watchedValues[1],
    mileage: watchedValues[2],
  };

  const sequence = buildSequence(valuesObj);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ─── Read hero prefill from sessionStorage on mount ──────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HERO_PREFILL_KEY);
      if (!raw) return;
      sessionStorage.removeItem(HERO_PREFILL_KEY);

      const prefill = JSON.parse(raw);

      Object.entries(prefill).forEach(([key, value]) => {
        methods.setValue(key, value, { shouldValidate: false });
      });

      const freshSeq = buildSequence({
        cosmetic: null,
        mechanical: null,
        mileage: "",
      });
      const step2Index = freshSeq.indexOf("vehicle-details");
      if (step2Index > 0) setCurrentIndex(step2Index);
    } catch {
      // Silently ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStepId = sequence[currentIndex];
  const progress = PROGRESS_MAP[currentStepId] ?? 0;
  const isLastStep = currentStepId === "thank-you";
  const isSubmitStep = currentStepId === "contact-submit";
  const isPhotosStep = currentStepId === "photos";

  // ─── Validation rules per step ───────────────────────────────────────────
  const STEP_FIELDS = {
    "bike-id": async (vals) => {
      const tab = vals.tab;
      if (tab === "vin") return await trigger("vin");
      const yr = vals.year;
      if (yr === "before-2003" || (yr && parseInt(yr, 10) < 2003)) return false;

      const rhfValid = await trigger(["year", "make", "model"]);

      if (vals.make === "other" && !vals.customMake?.trim()) {
        methods.setError("customMake", {
          type: "manual",
          message: "Please enter the make",
        });
        return false;
      }
      methods.clearErrors("customMake");

      return rhfValid;
    },
    "vehicle-details": () => trigger(["mileage", "zip", "ridden", "email"]),
    "cosmetic-rating": () => trigger("cosmetic"),
    "cosmetic-issues": () => {
      const vals = methods.getValues();
      const hasSelection =
        vals.cosmeticIssues?.length > 0 ||
        vals.cosmeticOtherChecked ||
        vals.noIssues;
      if (!hasSelection) {
        methods.setError("cosmeticIssues", {
          type: "manual",
          message:
            "Please select at least one option or choose 'No cosmetic issues'",
        });
        return false;
      }
      methods.clearErrors("cosmeticIssues");
      return true;
    },
    "mech-rating": () => trigger("mechanical"),
    "mech-issues": () => {
      const vals = methods.getValues();
      const hasSelection =
        vals.mechanicalIssues?.length > 0 ||
        vals.mechOtherChecked ||
        vals.mechNoIssues;
      if (!hasSelection) {
        methods.setError("mechanicalIssues", {
          type: "manual",
          message:
            "Please select at least one option or choose 'No mechanical issues'",
        });
        return false;
      }
      methods.clearErrors("mechanicalIssues");
      return true;
    },
    "service-maint": () => {
      const vals = methods.getValues();
      const hasSelection =
        vals.serviceItems?.length > 0 ||
        vals.serviceOtherChecked ||
        vals.serviceCircleOption;
      if (!hasSelection) {
        methods.setError("serviceItems", {
          type: "manual",
          message: "Please select at least one option",
        });
        return false;
      }
      methods.clearErrors("serviceItems");
      return true;
    },
    "tire-mileage": () => {
      const vals = methods.getValues();
      const frontDone = vals.frontTireNotSure || vals.frontTireMiles > 0;
      const rearDone  = vals.rearTireNotSure  || vals.rearTireMiles  > 0;
      if (!frontDone || !rearDone) {
        methods.setError("tireMileage", {
          type: "manual",
          message:
            "Please set the mileage or toggle \"I don't know\" for each tire",
        });
        return false;
      }
      methods.clearErrors("tireMileage");
      return true;
    },
    "title-financial": () => trigger(["titleType", "hasLoan"]),
    photos: () => true,
    "contact-submit": () => trigger(["firstName", "phone", "contactEmail"]),
    "thank-you": () => true,
  };

  // ─── goNext: validate → save draft → advance ──────────────────────────────
  const goNext = useCallback(async () => {
    const validate = STEP_FIELDS[currentStepId];
    const valid = validate ? await validate(methods.getValues()) : true;
    if (!valid) return;

    const formData = methods.getValues();

    // ── Save draft for current step ──────────────────────────────────────────
    try {
      // Photos step: upload files to Supabase Storage + appraisal_photos table
      if (currentStepId === "photos") {
        await savePhotos(formData.photos ?? []);
      }
      // All steps (including photos for current_page update): save partial row
      await saveDraft(currentStepId, formData);
    } catch (err) {
      // Non-fatal: log but don't block the user from continuing
      console.error("[goNext] saveDraft error:", err);
    }

    setCurrentIndex((i) => Math.min(i + 1, sequence.length - 1));
  }, [currentStepId, sequence.length, methods]);

  // ─── goBack: save draft for current step (data may have changed) then go back
  const goBack = useCallback(async () => {
    const formData = methods.getValues();

    // Only PATCH steps (not bike-id, which is the create step)
    if (currentStepId !== "bike-id") {
      try {
        await saveDraft(currentStepId, formData);
      } catch (err) {
        console.error("[goBack] saveDraft error:", err);
      }
    }

    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, [currentStepId, methods]);

  // ─── Start Over: reset form, clear draft session, jump back to Step 1 ─────
  const handleStartOver = useCallback(() => {
    methods.reset();
    clearDraftSession();
    setCurrentIndex(0);
  }, [methods]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const { appraisalId } = await submitAppraisal(data);
      setCurrentIndex(sequence.length - 1);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = async () => {
    if (isSubmitStep) {
      handleSubmit(onSubmit)();
    } else {
      goNext();
    }
  };

  const allValues = watch();

  const bikeLabel = (() => {
    const tab = allValues.tab;
    if (tab === "vin" && allValues.year && allValues.make) {
      const m = allValues.vinModel || "";
      return [allValues.year, allValues.make, m].filter(Boolean).join(" • ");
    }
    if (tab === "manual" && allValues.year && allValues.make && allValues.model) {
      return `${allValues.year} • ${allValues.make} • ${allValues.model}`;
    }
    if (allValues.vin) return `VIN: ${allValues.vin}`;
    return "Your Motorcycle";
  })();

  const hasPhotos = (allValues.photos || []).length > 0;

  const centerLabel = (() => {
    const v = allValues;
    if (v.tab === "vin") {
      if (!v.vehicleIdentified) return "";
      return [v.vehicleIdentified, v.vinModel].filter(Boolean).join(" • ");
    }
    const displayMake = v.make === "other" ? v.customMake : v.make;
    return [v.year, displayMake, v.model].filter(Boolean).join(" • ");
  })();

  const isStepValid = (() => {
    const v = allValues;
    if (currentStepId === "bike-id") {
      if (v.tab === "vin") return !!v.vin;
      const yr = v.year;
      if (!yr || yr === "before-2003" || parseInt(yr, 10) < 2003) return false;
      if (!v.make) return false;
      if (v.make === "other" && !v.customMake) return false;
      return !!v.model;
    }
    if (currentStepId === "vehicle-details")
      return !!(v.mileage && v.zip && v.ridden && v.email);
    if (currentStepId === "cosmetic-rating")
      return v.cosmetic !== null && v.cosmetic !== undefined;
    if (currentStepId === "cosmetic-issues")
      return !!(
        v.cosmeticIssues?.length ||
        v.cosmeticOtherChecked ||
        v.noIssues
      );
    if (currentStepId === "mech-rating")
      return v.mechanical !== null && v.mechanical !== undefined;
    if (currentStepId === "mech-issues")
      return !!(
        v.mechanicalIssues?.length ||
        v.mechOtherChecked ||
        v.mechNoIssues
      );
    if (currentStepId === "service-maint")
      return !!(
        v.serviceItems?.length ||
        v.serviceOtherChecked ||
        v.serviceCircleOption
      );
    if (currentStepId === "tire-mileage") {
      return (
        (v.frontTireNotSure || v.frontTireMiles > 0) &&
        (v.rearTireNotSure  || v.rearTireMiles  > 0)
      );
    }
    if (currentStepId === "title-financial")
      return !!(v.titleType && v.hasLoan);
    if (currentStepId === "contact-submit")
      return !!(v.firstName && v.phone && v.contactEmail);
    return true;
  })();

  const continueBtnLabel =
    currentStepId === "bike-id"
      ? "Get my Offer"
      : isPhotosStep
        ? hasPhotos
          ? "Continue"
          : "Skip for now"
        : isSubmitStep
          ? "Submit for Appraisal"
          : "Continue";

  return (
    <FormProvider {...methods}>
      <MetaGenerator
        page_title={page_title + " - " + site_settings?.site_name}
        meta_desc={meta_desc}
      />
      <main id="steps__page">
        {/* Progress Bar */}
        <div className="steps__progress-bar">
          <Contain>
            <div className="steps__progress-data">
              <div className="left">{STEP_LABEL_MAP[currentStepId] ?? ""}</div>
              <div className="center">{centerLabel}</div>
              <div className="right">{STEP_TITLE_MAP[currentStepId] ?? ""}</div>
            </div>
            <div className="steps__progress-track">
              <div
                className="steps__progress-fill"
                style={{ width: `${progress}%` }}
              />
              <div
                className="steps__progress-bike"
                style={{ left: `${progress}%` }}
              />
            </div>
          </Contain>
        </div>

        {/* Step Content */}
        <Contain className="!z-[auto]">
          {currentStepId === "bike-id" && (
            <Step1 bikeLabel={bikeLabel} content={content} />
          )}
          {currentStepId === "vehicle-details" && (
            <Step2 bikeLabel={bikeLabel} content={content} />
          )}
          {currentStepId === "cosmetic-rating" && (
            <Step3 bikeLabel={bikeLabel} content={content} />
          )}
          {currentStepId === "cosmetic-issues" && (
            <Step3b bikeLabel={bikeLabel} content={content} />
          )}
          {currentStepId === "mech-rating" && (
            <Step4 bikeLabel={bikeLabel} content={content} />
          )}
          {currentStepId === "mech-issues" && (
            <Step4b bikeLabel={bikeLabel} content={content} />
          )}
          {currentStepId === "service-maint" && (
            <Step4c bikeLabel={bikeLabel} content={content} />
          )}
          {currentStepId === "tire-mileage" && (
            <Step4d bikeLabel={bikeLabel} content={content} />
          )}
          {currentStepId === "title-financial" && (
            <Step5 bikeLabel={bikeLabel} content={content} />
          )}
          {currentStepId === "photos" && <Step6 content={content} />}
          {currentStepId === "contact-submit" && (
            <Step7 bikeLabel={bikeLabel} content={content} />
          )}
          {currentStepId === "thank-you" && (
            <Step8
              bikeLabel={bikeLabel}
              content={content}
              thank_steps={thank_steps}
              firstName={allValues.firstName}
              onStartOver={handleStartOver}
            />
          )}
        </Contain>

        {/* Footer Nav */}
        {!isLastStep && (
          <div className="steps__footer-nav">
            <Contain>
              <div className="steps__footer-nav-inner">
                {currentIndex > 0 ? (
                  <button
                    className="steps__btn-back"
                    onClick={goBack}
                    aria-label="Back"
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <path
                        d="M15 18l-6-6 6-6"
                        stroke="#231f20"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : (
                  <span />
                )}
                <button
                  className="steps__btn-continue"
                  onClick={handleContinue}
                  disabled={!isStepValid || submitting}
                  style={
                    !isStepValid || submitting
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : {}
                  }
                >
                  {submitting ? "Submitting…" : continueBtnLabel}
                </button>
              </div>
              {submitError && (
                <p
                  className="steps__field-error"
                  style={{ textAlign: "center", marginTop: "0.75rem" }}
                >
                  {submitError}
                </p>
              )}
            </Contain>
          </div>
        )}
      </main>
    </FormProvider>
  );
}