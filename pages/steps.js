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
import Step5b from "../components/steps/Step5b";
import Step6 from "../components/steps/Step6";
import Step7 from "../components/steps/Step7";

import { submitAppraisal } from "../lib/submitAppraisal";
import { HERO_PREFILL_KEY } from "../components/HeroSection";

// ─── Step IDs ────────────────────────────────────────────────────────────────
const STEP_IDS = [
  "bike-id",        // 1
  "vehicle-details",// 2
  "cosmetic-rating",// 3
  "cosmetic-issues",// 3A  — skipped if cosmetic === 5
  "mech-rating",    // 4
  "mech-issues",    // 4B  — skipped if mechanical === 5
  "service-maint",  // 4C  — always shown
  "tire-mileage",   // 4D  — skipped if mileage < 1000
  "title-financial",// 5
  "photos",         // 6
  "contact-submit", // 7
  "thank-you",      // 8
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
  "photos": 88,
  "contact-submit": 94,
  "thank-you": 100,
};

export default function StepsPage() {
  const methods = useForm({
    mode: "onTouched",
    defaultValues: {
      // Step 1
      tab: "vin",
      vin: "",
      vehicleIdentified: "",
      year: "",
      make: "",
      vinModel: "",   // model from VIN path (pre-filled, editable)
      model: "",      // model from Year & Make path (free-text, required)
      customMake: "", // free-text make when "Other" is selected
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

  // ─── Read hero prefill from sessionStorage on mount ─────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HERO_PREFILL_KEY);
      if (!raw) return;
      sessionStorage.removeItem(HERO_PREFILL_KEY); // consume once

      const prefill = JSON.parse(raw);

      // Populate all relevant RHF fields
      Object.entries(prefill).forEach(([key, value]) => {
        methods.setValue(key, value, { shouldValidate: false });
      });

      // Jump straight to Step 2 ("vehicle-details")
      // We need to find its index in the current sequence.
      // Build a fresh sequence with the incoming values so skip-logic is correct.
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

  // ─── Validation rules per step ──────────────────────────────────────────
  const STEP_FIELDS = {
    "bike-id": async (vals) => {
      const tab = vals.tab;
      if (tab === "vin") return await trigger("vin");
      // Hard block on unsupported year — don't even try to advance
      const yr = vals.year;
      if (yr === "before-2003" || (yr && parseInt(yr, 10) < 2003)) return false;
      const fields = ["year", "make", "model"];
      if (vals.make === "other") fields.push("customMake");
      return await trigger(fields);
    },
    "vehicle-details": () => trigger(["mileage", "zip", "ridden", "email"]),
    "cosmetic-rating": () => trigger("cosmetic"),
    // Must pick at least one checkbox OR one circle option
    "cosmetic-issues": () => {
      const vals = methods.getValues();
      const hasSelection =
        (vals.cosmeticIssues?.length > 0) ||
        vals.cosmeticOtherChecked ||
        vals.noIssues;
      if (!hasSelection) {
        methods.setError("cosmeticIssues", { type: "manual", message: "Please select at least one option or choose 'No cosmetic issues'" });
        return false;
      }
      methods.clearErrors("cosmeticIssues");
      return true;
    },
    "mech-rating": () => trigger("mechanical"),
    // Must pick at least one checkbox OR no-issues
    "mech-issues": () => {
      const vals = methods.getValues();
      const hasSelection =
        (vals.mechanicalIssues?.length > 0) ||
        vals.mechOtherChecked ||
        vals.mechNoIssues;
      if (!hasSelection) {
        methods.setError("mechanicalIssues", { type: "manual", message: "Please select at least one option or choose 'No mechanical issues'" });
        return false;
      }
      methods.clearErrors("mechanicalIssues");
      return true;
    },
    // Must pick at least one service item OR one circle option
    "service-maint": () => {
      const vals = methods.getValues();
      const hasSelection =
        (vals.serviceItems?.length > 0) ||
        vals.serviceOtherChecked ||
        vals.serviceCircleOption;
      if (!hasSelection) {
        methods.setError("serviceItems", { type: "manual", message: "Please select at least one option" });
        return false;
      }
      methods.clearErrors("serviceItems");
      return true;
    },
    "tire-mileage": () => true,
    "title-financial": () => trigger(["titleType", "hasLoan"]),
    "photos": () => true,
    "contact-submit": () => trigger(["firstName", "phone", "contactEmail"]),
    "thank-you": () => true,
  };

  const goNext = useCallback(async () => {
    const validate = STEP_FIELDS[currentStepId];
    const valid = validate ? await validate(methods.getValues()) : true;
    if (!valid) return;
    setCurrentIndex((i) => Math.min(i + 1, sequence.length - 1));
  }, [currentStepId, sequence.length]);

  const goBack = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const { appraisalId } = await submitAppraisal(data);
      console.log("=== MotoBuyers Submission saved ===", appraisalId, data);
      setCurrentIndex(sequence.length - 1); // go to thank-you
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
    if (tab === "make" && allValues.year && allValues.make && allValues.model) {
      return `${allValues.year} • ${allValues.make} • ${allValues.model}`;
    }
    if (allValues.vin) return `VIN: ${allValues.vin}`;
    return "Your Motorcycle";
  })();

  const hasPhotos = (allValues.photos || []).length > 0;

  const continueBtnLabel = isPhotosStep
    ? hasPhotos ? "Continue" : "Skip for now"
    : isSubmitStep
      ? "Submit for Appraisal"
      : "Continue";

  return (
    <FormProvider {...methods}>
      <Head>
        <title>Get My Offer – MotoBuyers</title>

        <meta name="description" content="A simple process. A real offer. A smooth ride to instant cash." />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <main id="steps__page">
        {/* Progress Bar */}
        <div className="steps__progress-bar">
          <Contain>
            <div className="steps__progress-track">
              <div className="steps__progress-fill" style={{ width: `${progress}%` }} />
              <div className="steps__progress-bike" style={{ left: `${progress}%` }}>
                <img src="/images/sakootar.png" alt="motorcycle" />
              </div>
            </div>
          </Contain>
        </div>

        {/* Step Content */}
        <Contain>
          {currentStepId === "bike-id" && <Step1 bikeLabel={bikeLabel} />}
          {currentStepId === "vehicle-details" && <Step2 bikeLabel={bikeLabel} />}
          {currentStepId === "cosmetic-rating" && <Step3 bikeLabel={bikeLabel} />}
          {currentStepId === "cosmetic-issues" && <Step3b bikeLabel={bikeLabel} />}
          {currentStepId === "mech-rating" && <Step4 bikeLabel={bikeLabel} />}
          {currentStepId === "mech-issues" && <Step4b bikeLabel={bikeLabel} />}
          {currentStepId === "service-maint" && <Step4c bikeLabel={bikeLabel} />}
          {currentStepId === "tire-mileage" && <Step4d bikeLabel={bikeLabel} />}
          {currentStepId === "title-financial" && <Step5 bikeLabel={bikeLabel} />}
          {currentStepId === "photos" && <Step5b />}
          {currentStepId === "contact-submit" && <Step6 bikeLabel={bikeLabel} />}
          {currentStepId === "thank-you" && <Step7 bikeLabel={bikeLabel} firstName={allValues.firstName} />}
        </Contain>

        {/* Footer Nav */}
        {!isLastStep && (
          <div className="steps__footer-nav">
            <Contain>
              <div className="steps__footer-nav-inner">
                {currentIndex > 0 ? (
                  <button className="steps__btn-back" onClick={goBack} aria-label="Back">
                    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <path d="M15 18l-6-6 6-6" stroke="#231f20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <span />
                )}
                <button
                  className="steps__btn-continue"
                  onClick={handleContinue}
                  disabled={submitting}
                  style={submitting ? { opacity: 0.7, cursor: "not-allowed" } : {}}
                >
                  {submitting ? "Submitting…" : continueBtnLabel}
                </button>
              </div>
              {submitError && (
                <p className="steps__field-error" style={{ textAlign: "center", marginTop: "0.75rem" }}>
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

export async function getServerSideProps() {
  return { props: {} };
}