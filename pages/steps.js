import { useState, useCallback, useEffect, useRef } from "react";
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
import {
  clearDraftSession,
  getSubmissionId,
  saveFormState,
  loadFormState,
  saveStepIndex,
  loadStepIndex,
} from "../lib/draftSession";
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
  "bike-id",
  "vehicle-details",
  "cosmetic-rating",
  "cosmetic-issues",
  "mech-rating",
  "mech-issues",
  "service-maint",
  "tire-mileage",
  "title-financial",
  "photos",
  "contact-submit",
  "thank-you",
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
  "tire-mileage": "Tire Mileage",
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

// ─── Default form values ─────────────────────────────────────────────────────
const DEFAULT_VALUES = {
  // Step 1
  tab: "vin",
  vin: "",
  vehicleIdentified: "",

  // Active primary fields
  year: "",
  make: "",
  model: "",

  // VIN isolated fields
  vinYear: "",
  vinMake: "",
  vinModel: "",

  // Manual isolated fields
  manualYear: "",
  manualMake: "",
  manualModel: "",   // FIX: was missing from DEFAULT_VALUES

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
  // Step 6
  photos: [],
  // Step 7
  firstName: "",
  phone: "",
  contactEmail: "",
  notes: "",
};

export default function StepsPage({ result }) {
  let { meta_desc, page_title, content, site_settings, thank_steps } = result;

  const methods = useForm({
    mode: "onTouched",
    defaultValues: DEFAULT_VALUES,
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
  const restoredRef = useRef(false);

  // ─── Mount: restore form + step from localStorage if a draft exists ───────
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const doRestore = async () => {
      let heroPrefill = null;
      try {
        const raw = sessionStorage.getItem(HERO_PREFILL_KEY);
        if (raw) {
          sessionStorage.removeItem(HERO_PREFILL_KEY);
          heroPrefill = JSON.parse(raw);
        }
      } catch {
        /* ignore */
      }

      const submissionId = getSubmissionId();
      const savedState = submissionId ? loadFormState() : null;
      const savedIndex = submissionId ? loadStepIndex() : null;

      if (savedState) {
        Object.entries(savedState).forEach(([key, value]) => {
          if (key !== "photoCount") {
            methods.setValue(key, value ?? DEFAULT_VALUES[key] ?? "", {
              shouldValidate: false,
            });
          }
        });

        if (savedState.tab === "manual") {
          const resolvedModel =
            savedState.manualModel || savedState.model || "";
          methods.setValue("manualModel", resolvedModel, { shouldValidate: false });
          methods.setValue("model", resolvedModel, { shouldValidate: false });
        }
      }

     
      if (heroPrefill) {
        Object.entries(heroPrefill).forEach(([key, value]) => {
          methods.setValue(key, value, { shouldValidate: false });
        });

        if (heroPrefill.tab === "manual" && heroPrefill.manualModel) {
          methods.setValue("model", heroPrefill.manualModel, { shouldValidate: false });
        }

        // Jump to vehicle-details (Step 2)
        const freshSeq = buildSequence({
          cosmetic: null,
          mechanical: null,
          mileage: savedState?.mileage || "",
        });
        const step2Idx = freshSeq.indexOf("vehicle-details");
        if (step2Idx > 0) {
          setCurrentIndex(step2Idx);
          saveStepIndex(step2Idx);
        }
        return;
      }

      // ── No hero prefill — restore the saved step index ────────────────────
      if (savedIndex !== null && savedIndex > 0) {
        setCurrentIndex(savedIndex);
      }
    };

    doRestore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auto-sync: email (Step 2) → contactEmail (Step 7) ───────────────────
  const emailValue = watch("email");
  useEffect(() => {
    const current = methods.getValues("contactEmail");
    if (emailValue && !current) {
      methods.setValue("contactEmail", emailValue, { shouldValidate: false });
    }
  }, [emailValue, methods]);

  const currentStepId = sequence[currentIndex];
  const progress = PROGRESS_MAP[currentStepId] ?? 0;
  const isLastStep = currentStepId === "thank-you";
  const isSubmitStep = currentStepId === "contact-submit";
  const isPhotosStep = currentStepId === "photos";

  // ─── Validation rules per step ────────────────────────────────────────────
  const STEP_FIELDS = {
    "bike-id": async (vals) => {
      const tab = vals.tab;
      if (tab === "vin") return await trigger("vin");
      const yr = vals.manualYear;
      if (yr === "before-2003" || (yr && parseInt(yr, 10) < 2003)) return false;
      const rhfValid = await trigger([
        "manualYear",
        "manualMake",
        "manualModel",
      ]);
      if (vals.manualMake === "other" && !vals.customMake?.trim()) {
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
      const ok =
        vals.cosmeticIssues?.length > 0 ||
        vals.cosmeticOtherChecked ||
        vals.noIssues;
      if (!ok) {
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
      const ok =
        vals.mechanicalIssues?.length > 0 ||
        vals.mechOtherChecked ||
        vals.mechNoIssues;
      if (!ok) {
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
      const ok =
        vals.serviceItems?.length > 0 ||
        vals.serviceOtherChecked ||
        vals.serviceCircleOption;
      if (!ok) {
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
      const frontOk = vals.frontTireNotSure || vals.frontTireMiles > 0;
      const rearOk = vals.rearTireNotSure || vals.rearTireMiles > 0;
      if (!frontOk || !rearOk) {
        methods.setError("tireMileage", {
          type: "manual",
          message:
            'Please set the mileage or toggle "I don\'t know" for each tire',
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

  // ─── persist helpers ──────────────────────────────────────────────────────
  const persistLocally = useCallback((formData, stepIndex) => {
    saveFormState(formData);
    saveStepIndex(stepIndex);
  }, []);

  // ─── goNext ───────────────────────────────────────────────────────────────
  const goNext = useCallback(async () => {
    const validate = STEP_FIELDS[currentStepId];
    const valid = validate ? await validate(methods.getValues()) : true;
    if (!valid) return;

    const formData = methods.getValues();
    const nextIndex = Math.min(currentIndex + 1, sequence.length - 1);
    const nextStepId = sequence[nextIndex];

    if (currentStepId === "photos") {
      try {
        await savePhotos(formData.photos ?? []);
      } catch (err) {
        console.error("[goNext] savePhotos error:", err);
      }
    }

    try {
      await saveDraft(currentStepId, nextStepId, formData);
    } catch (err) {
      console.error("[goNext] saveDraft error:", err);
    }

    persistLocally(formData, nextIndex);
    setCurrentIndex(nextIndex);
  }, [currentStepId, currentIndex, sequence, methods, persistLocally]);

  // ─── goBack ───────────────────────────────────────────────────────────────
  const goBack = useCallback(async () => {
    const formData = methods.getValues();
    const prevIndex = Math.max(currentIndex - 1, 0);
    const prevStepId = sequence[prevIndex];

    if (currentStepId !== "bike-id") {
      try {
        await saveDraft(currentStepId, prevStepId, formData);
      } catch (err) {
        console.error("[goBack] saveDraft error:", err);
      }
    }

    persistLocally(formData, prevIndex);
    setCurrentIndex(prevIndex);
  }, [currentStepId, currentIndex, sequence, methods, persistLocally]);

  // ─── Start Over ───────────────────────────────────────────────────────────
  const handleStartOver = useCallback(() => {
    methods.reset(DEFAULT_VALUES);
    clearDraftSession();
    setCurrentIndex(0);
  }, [methods]);

  // ─── Final submit ─────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitAppraisal(data);
      setCurrentIndex(sequence.length - 1);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = useCallback(async () => {
    if (isSubmitStep) {
      handleSubmit(onSubmit)();
    } else {
      goNext();
    }
  }, [isSubmitStep, handleSubmit, goNext]);

  // ─── Enter key: advance step ──────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Enter") return;
      if (isLastStep || submitting) return;

      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "textarea" || tag === "button") return;

      e.preventDefault();
      handleContinue();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isLastStep, submitting, handleContinue]);

  // ─── Derived display values ───────────────────────────────────────────────
  const allValues = watch();

  const bikeLabel = (() => {
    const tab = allValues.tab;
    if (tab === "vin" && allValues.year && allValues.make) {
      const m = allValues.vinModel || "";
      return [allValues.year, allValues.make, m].filter(Boolean).join(" • ");
    }
    if (
      tab === "manual" &&
      allValues.manualYear &&
      allValues.manualMake &&
      allValues.manualModel
    ) {
      const displayMake =
        allValues.manualMake === "other"
          ? allValues.customMake
          : allValues.manualMake;
      return [allValues.manualYear, displayMake, allValues.manualModel]
        .filter(Boolean)
        .join(" • ");
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
    const displayMake = v.manualMake === "other" ? v.customMake : v.manualMake;
    return [v.manualYear, displayMake, v.manualModel]
      .filter(Boolean)
      .join(" • ");
  })();

  const isStepValid = (() => {
    const v = allValues;
    if (currentStepId === "bike-id") {
      if (v.tab === "vin") return !!v.vin;
      const yr = v.manualYear;
      if (!yr || yr === "before-2003" || parseInt(yr, 10) < 2003) return false;
      if (!v.manualMake) return false;
      if (v.manualMake === "other" && !v.customMake) return false;
      // FIX: check manualModel (not model) for the manual tab
      return !!v.manualModel;
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
    if (currentStepId === "tire-mileage")
      return (
        (v.frontTireNotSure || v.frontTireMiles > 0) &&
        (v.rearTireNotSure || v.rearTireMiles > 0)
      );
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