import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import { cmsFileUrl } from "@/helpers/helpers";
import Text from "./text";
import {
  getOrCreateSessionId,
  setSubmissionId,
  getSubmissionId,
  saveFormState,
  saveStepIndex,
} from "@/lib/draftSession";

// ─── Custom Select ────────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(
    (o) => !o?.separator && String(o?.value ?? o) === String(value),
  );
  const label = selected ? (selected.label ?? selected) : null;

  return (
    <div className="steps__custom-select" ref={ref}>
      <button
        type="button"
        className={`steps__custom-select__trigger${label ? " steps__custom-select__trigger--has-value" : ""}${open ? " steps__custom-select__trigger--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="steps__custom-select__label">
          {label ?? placeholder}
        </span>
        <span
          className={`steps__custom-select__chevron${open ? " steps__custom-select__chevron--open" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <polyline
              points="6 9 12 15 18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {open && (
        <div className="steps__custom-select__dropdown">
          {options.map((opt, idx) => {
            if (opt?.separator) {
              return (
                <div
                  key={`sep-${idx}`}
                  className="steps__custom-select__separator"
                />
              );
            }
            const v = String(opt?.value ?? opt);
            const l = opt?.label ?? opt;
            const isItalic = opt?.italic;
            return (
              <div
                key={v}
                className={[
                  "steps__custom-select__option",
                  v === String(value)
                    ? "steps__custom-select__option--selected"
                    : "",
                  isItalic ? "steps__custom-select__option--italic" : "",
                ]
                  .join(" ")
                  .trim()}
                onMouseDown={() => {
                  onChange(v);
                  setOpen(false);
                }}
              >
                {l}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2003;

const YEAR_OPTIONS = [
  ...Array.from(
    { length: CURRENT_YEAR - MIN_YEAR + 2 },
    (_, i) => CURRENT_YEAR + 1 - i,
  ),
  { separator: true },
  { value: "before-2003", label: "Before 2003", italic: true },
];

const MAKE_OPTIONS = [
  "Aprilia",
  "BMW",
  "CFMOTO",
  "Ducati",
  "Harley-Davidson",
  "Honda",
  "Husqvarna",
  "Indian",
  "Kawasaki",
  "KTM",
  "Moto Guzzi",
  "Moto Morini",
  "MV Agusta",
  "Royal Enfield",
  "Suzuki",
  "Triumph",
  "Vespa",
  "Yamaha",
  "Zero Motorcycles",
  { separator: true },
  { value: "other", label: "Other", italic: true },
];

// ─── NHTSA VIN decode ──────────────────────────────────────────────────────────
async function decodeVin(vin) {
  const res = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`,
  );
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  const r = data.Results?.[0] ?? {};
  return { year: r.ModelYear || "", make: r.Make || "", model: r.Model || "" };
}

function matchMakeToOption(rawMake) {
  if (!rawMake) return "";
  const normalized = rawMake.trim().toLowerCase();
  const match = MAKE_OPTIONS.find((o) => {
    if (!o || o.separator) return false;
    return String(o?.value ?? o).toLowerCase() === normalized;
  });
  if (match) return String(match?.value ?? match);
  return "other";
}

function isValidVin(vin) {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

// ─── PAGE_MAP (mirrors saveDraft) ─────────────────────────────────────────────
const PAGE_MAP = {
  "bike-id": "entry",
  "vehicle-details": "details",
};

// ─── VinHelpModal ─────────────────────────────────────────────────────────────
function VinHelpModal({ onClose, content }) {
  return (
    <div className="steps__modal-overlay" onClick={onClose}>
      <div
        className="steps__modal steps__modal--wide"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="steps__modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <h2 className="steps__modal-title steps__modal-title--left">
          {content?.tab1_popup_heading}
        </h2>
        <p className="steps__modal-subtitle">
          <Text string={content?.tab1_popup_txt} />
        </p>
        <div className="steps__vin-cards">
          <div className="steps__vin-card">
            <p className="steps__vin-card-title">
              {content?.popup_card_heading3}
            </p>
            <p className="steps__vin-card-desc">{content?.popup_card_text3}</p>
            <img
              src={cmsFileUrl(content?.image3)}
              alt="Steering neck location"
              className="steps__vin-card-img"
            />
          </div>
          <div className="steps__vin-card">
            <p className="steps__vin-card-title">
              {content?.popup_card_heading4}
            </p>
            <p className="steps__vin-card-desc">{content?.popup_card_text4}</p>
            <img
              src={cmsFileUrl(content?.image4)}
              alt="Engine casing location"
              className="steps__vin-card-img"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoModal({ onClose, videoUrl }) {
  return (
    <div className="steps__modal-overlay" onClick={onClose}>
      <div
        className="steps__modal steps__modal--wide !p-[0]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="steps__modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <div className="video__wrapper">
          <video
            src={videoUrl}
            controls
            autoPlay
            style={{ width: "100%", borderRadius: "8px" }}
          />
        </div>
      </div>
    </div>
  );
}

function UnsupportedYearBanner() {
  return (
    <div className="steps__unsupported-banner">
      <p className="steps__unsupported-label">OUTSIDE OUR CURRENT RANGE</p>
      <h3 className="steps__unsupported-heading">
        We are not currently buying motorcycles from before 2003.
      </h3>
      <p className="steps__unsupported-desc">
        We are sorry, and we really appreciate your interest in MotoBuyers. If
        you would like to check another motorcycle, you can start over below.
      </p>
    </div>
  );
}

// ─── SESSION STORAGE KEY ──────────────────────────────────────────────────────
export const HERO_PREFILL_KEY = "motobuyers_step1_prefill";

// ─── Build Supabase row for bike-id ──────────────────────────────────────────
function buildBikeIdRow(formState, sessionId) {
  const isVin = formState.tab === "vin";
  const isManual = formState.tab === "manual";

  const activeYear = isVin ? formState.year : formState.manualYear;

  const activeMake = isVin
    ? formState.make
    : formState.manualMake === "other"
      ? formState.customMake
      : formState.manualMake;

  const activeModel = isVin ? formState.vinModel : formState.model;
  const activeCMake = isVin ? null : formState.customMake || null;

  const hasVinData = !!formState.vin;

  return {
    // next step is always vehicle-details
    current_page: PAGE_MAP["vehicle-details"],
    session_id: sessionId,
    last_active_at: new Date().toISOString(),
    status: "draft",
    entry_path: formState.tab || "vin",
    landing_url: typeof window !== "undefined" ? window.location.href : null,
    referrer:
      typeof document !== "undefined" ? document.referrer || null : null,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,

    // Primary columns — reflect active tab
    year: activeYear,
    make: activeMake,
    model: activeModel,
    custom_make: activeCMake,

    // VIN columns — preserved whenever any VIN data exists in form state
    vin: hasVinData ? formState.vin || null : null,
    vin_decoded: hasVinData ? !!formState.vehicleIdentified : false,
    vin_input: hasVinData ? formState.vin || null : null,
    submitted_vin: hasVinData ? formState.vin || null : null,
    vin_year: hasVinData ? formState.year || null : null,
    vin_make: hasVinData ? formState.make || null : null,
    vin_model: hasVinData ? formState.vinModel || null : null,

    // Manual columns — only when manual tab was active
    manual_year: isManual ? formState.manualYear || null : null,
    manual_make: isManual ? formState.manualMake || null : null,
    manual_model: isManual ? formState.model || null : null,
    manual_custom_make: isManual ? formState.customMake || null : null,

    form_state: JSON.stringify({
      tab: formState.tab,
      vin: formState.vin,
      year: formState.year,
      make: formState.make,
      model: formState.model,
      vinModel: formState.vinModel,
      customMake: formState.customMake,
      manualYear: formState.manualYear,
      manualMake: formState.manualMake,
    }),
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HeroSection({ content }) {
  const router = useRouter();

  const [showVideo, setShowVideo] = useState(false);
  const [activeTab, setActiveTab] = useState("vin");
  const [showVinHelp, setShowVinHelp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // VIN tab state
  const [vinValue, setVinValue] = useState("");
  const [vinDecoding, setVinDecoding] = useState(false);
  const [vinDecodeError, setVinDecodeError] = useState("");
  const [vinDecodeSuccess, setVinDecodeSuccess] = useState(false);
  const [vinDecoded, setVinDecoded] = useState({
    year: "",
    make: "",
    vinModel: "",
    vehicleIdentified: "",
  });
  const lastDecodedVin = useRef("");

  // Manual tab state
  const [manualYear, setManualYear] = useState("");
  const [manualMake, setManualMake] = useState("");
  const [customMake, setCustomMake] = useState("");
  const [model, setModel] = useState("");

  // Field errors
  const [errors, setErrors] = useState({
    year: "",
    make: "",
    model: "",
    customMake: "",
  });

  const vinValid = isValidVin(vinValue);
  const isUnsupportedYear =
    manualYear &&
    (manualYear === "before-2003" || parseInt(manualYear, 10) < 2003);

  // ── Auto-decode VIN ────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "vin") return;
    if (!vinValid || vinValue === lastDecodedVin.current) return;

    lastDecodedVin.current = vinValue;
    setVinDecoding(true);
    setVinDecodeError("");
    setVinDecodeSuccess(false);
    setVinDecoded({ year: "", make: "", vinModel: "", vehicleIdentified: "" });

    decodeVin(vinValue)
      .then(({ year, make, model }) => {
        const matchedMake = matchMakeToOption(make);
        const displayMake =
          matchedMake && matchedMake !== "other" ? matchedMake : make;
        const identified = [year, displayMake].filter(Boolean).join(" ");

        if (!identified) {
          setVinDecodeError(
            "VIN not recognized. Try switching to Year and Make.",
          );
          setVinDecodeSuccess(false);
          return;
        }

        setVinDecoded({
          year,
          make: matchedMake,
          vinModel: model,
          vehicleIdentified: identified,
        });
        setVinDecodeError("");
        setVinDecodeSuccess(true);
      })
      .catch(() => {
        setVinDecodeError(
          "VIN not recognized. Try switching to Year and Make.",
        );
        setVinDecodeSuccess(false);
      })
      .finally(() => setVinDecoding(false));
  }, [vinValid, vinValue]);

  // ── Build form state object (matches RHF shape in steps.jsx) ──────────────
  const buildFormStateObj = useCallback(() => {
    if (activeTab === "vin") {
      return {
        tab: "vin",

        vin: vinValue,
        vehicleIdentified: vinDecoded.vehicleIdentified,

        year: vinDecoded.year || "",
        make: vinDecoded.make || "",
        vinModel: vinDecoded.vinModel || "",

        // manual MUST be empty
        model: "",
        customMake: "",
        manualYear: "",
        manualMake: "",
      };
    }

    return {
      tab: "manual",

      vin: "", // IMPORTANT: clear VIN context
      vehicleIdentified: "",

      year: manualYear || "",
      make: manualMake === "other" ? customMake : manualMake,
      model: model || "",

      customMake: manualMake === "other" ? customMake : "",

      manualYear: manualYear || "",
      manualMake: manualMake || "",
      vinModel: "",
    };
  }, [
    activeTab,
    vinValue,
    vinDecoded,
    model,
    customMake,
    manualYear,
    manualMake,
  ]);

  // ── Core submit logic (shared between button click and Enter key) ──────────
  const doSubmit = useCallback(async () => {
    if (submitting) return;

    const newErrors = { year: "", make: "", model: "", customMake: "" };

    // Validate
    if (activeTab === "vin") {
      if (!vinValid) {
        setVinDecodeError("Please enter a valid 17-character VIN.");
        return;
      }
      if (vinDecoding) {
        setVinDecodeError("Please wait — decoding your VIN.");
        return;
      }
      if (!vinDecodeSuccess) {
        setVinDecodeError(
          "VIN not recognized. Try switching to Year and Make.",
        );
        return;
      }
    } else {
      if (!manualYear) newErrors.year = "Please select a year.";
      if (isUnsupportedYear)
        newErrors.year = "We only accept motorcycles from 2003 or newer.";
      if (!manualMake) newErrors.make = "Please select a make.";
      if (manualMake === "other" && !customMake.trim())
        newErrors.customMake = "Please enter the make.";
      if (!model.trim()) newErrors.model = "Please enter the model.";

      if (Object.values(newErrors).some((e) => e)) {
        setErrors(newErrors);
        return;
      }
    }

    setSubmitting(true);

    try {
      const formState = buildFormStateObj();
      if (formState.tab === "vin") {
        formState.manualYear = "";
        formState.manualMake = "";
        formState.model = "";
      } else {
        formState.vin = "";
        formState.vinModel = "";
      }
      const sessionId = getOrCreateSessionId();
      const existingId = getSubmissionId();
      const isCreate = !existingId;
      const method = isCreate ? "POST" : "PATCH";
      const url = isCreate
        ? "/api/submit-appraisal"
        : `/api/submit-appraisal?id=${existingId}`;

      const row = buildBikeIdRow(formState, sessionId);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });

      const result = await response.json();

      if (!result.success) {
        console.error("[HeroSection] API error:", result.error);
        // Don't block navigation for a draft-save failure
      } else if (isCreate && result.data?.id) {
        setSubmissionId(result.data.id);
      }

      // Persist to localStorage for refresh restore on /steps
      const stepIndex = 1; // "vehicle-details" is index 1 in the default sequence
      saveFormState({ ...formState, photos: [] });
      saveStepIndex(stepIndex);

      // Also write sessionStorage for the steps.jsx mount handler
      sessionStorage.setItem(HERO_PREFILL_KEY, JSON.stringify(formState));
    } catch (err) {
      console.error("[HeroSection] Submit error:", err);
      // Fall through — still navigate
      const formState = buildFormStateObj();
      sessionStorage.setItem(HERO_PREFILL_KEY, JSON.stringify(formState));
    } finally {
      setSubmitting(false);
    }

    router.push("/steps");
  }, [
    submitting,
    activeTab,
    vinValid,
    vinDecoding,
    vinDecodeSuccess,
    manualYear,
    manualMake,
    customMake,
    model,
    isUnsupportedYear,
    buildFormStateObj,
    router,
  ]);

  // ── Enter key: submit the hero form ───────────────────────────────────────
  // Skip if focused element is a button (let it handle its own Enter/Space)
  // or a textarea.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Enter") return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "textarea" || tag === "button") return;
      e.preventDefault();
      doSubmit();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [doSubmit]);

  return (
    <>
      <Section id="hero">
        <div
          className="hero__bg"
          style={{ backgroundImage: `url(${cmsFileUrl(content?.image1)})` }}
        />
        <Contain>
          <div className="hero__content">
            <Heading className="hero__title">{content?.banner_heading}</Heading>
            <Paragraph className="hero__subtitle">
              <Text string={content?.banner_text} parse={true} />
            </Paragraph>
          </div>

          <div className="hero__inner">
            <div className="hero__left">
              <div className="hero__bikes" aria-hidden="true">
                <img src={cmsFileUrl(content?.image2)} alt="Motorcycles" />
              </div>
              <div
                className="hero__play"
                aria-label="Watch video"
                role="button"
                tabIndex="0"
                onClick={() => setShowVideo(true)}
              >
                <div className="hero__play-inner">
                  <img
                    src="/images/play-button.svg"
                    alt="Play"
                    className="hero__play-icon"
                  />
                </div>
              </div>
            </div>

            <div className="hero__right">
              <div
                className="hero__form-card"
                role="form"
                aria-label="Get your motorcycle offer"
              >
                <div
                  id="steps__page"
                  style={{
                    minHeight: "unset",
                    background: "none",
                    paddingBottom: 0,
                  }}
                >
                  {/* ── Tabs ── */}
                  <div className="steps__tabs">
                    <button
                      className={`steps__tab${activeTab === "vin" ? " steps__tab--active" : ""}`}
                      type="button"
                      onClick={() => {
                        setActiveTab("vin");

                        // isolate manual state (IMPORTANT)
                        setManualYear("");
                        setManualMake("");
                        setCustomMake("");
                        setModel("");
                        setErrors({
                          year: "",
                          make: "",
                          model: "",
                          customMake: "",
                        });
                      }}
                    >
                      VIN
                    </button>
                    <button
                      className={`steps__tab${activeTab === "manual" ? " steps__tab--active" : ""}`}
                      type="button"
                      onClick={() => {
                        setActiveTab("manual");

                        // isolate VIN state (IMPORTANT)
                        setVinValue("");
                        setVinDecoded({
                          year: "",
                          make: "",
                          vinModel: "",
                          vehicleIdentified: "",
                        });

                        setVinDecodeError("");
                        setVinDecodeSuccess(false);
                      }}
                    >
                      Year and Make
                    </button>
                  </div>

                  {/* ── VIN Tab ── */}
                  {activeTab === "vin" && (
                    <div className="steps__tab-content">
                      <label className="steps__field-label !mb-[0]">
                        Enter your VIN
                      </label>
                      <div className="steps__input-icon-wrap">
                        <input
                          type="text"
                          className={`steps__input${vinValid && vinDecodeSuccess ? " steps__input--valid" : ""}${vinDecodeError ? " steps__input--error" : ""}`}
                          placeholder="17 character VIN"
                          value={vinValue}
                          maxLength={17}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase();
                            setVinValue(v);
                            setVinDecodeError("");
                            setVinDecodeSuccess(false);
                            lastDecodedVin.current = "";
                          }}
                        />
                        {vinValid && vinDecoding && (
                          <span className="steps__input-valid-icon">
                            <svg
                              className="steps__vin-spinner"
                              viewBox="0 0 24 24"
                              fill="none"
                              width="20"
                              height="20"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="#d1d5db"
                                strokeWidth="2.5"
                              />
                              <path
                                d="M12 2a10 10 0 0 1 10 10"
                                stroke="var(--color-red, #dc2626)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                        )}
                        {vinValid && !vinDecoding && vinDecodeSuccess && (
                          <span className="steps__input-valid-icon">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              width="20"
                              height="20"
                            >
                              <circle cx="12" cy="12" r="10" fill="#22c55e" />
                              <polyline
                                points="7,12 10.5,15.5 17,9"
                                stroke="#fff"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                        {vinValid && !vinDecoding && vinDecodeError && (
                          <span className="steps__input-valid-icon">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              width="20"
                              height="20"
                            >
                              <circle cx="12" cy="12" r="10" fill="#dc2626" />
                              <line
                                x1="8"
                                y1="8"
                                x2="16"
                                y2="16"
                                stroke="#fff"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              />
                              <line
                                x1="16"
                                y1="8"
                                x2="8"
                                y2="16"
                                stroke="#fff"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                        )}
                      </div>

                      {vinDecodeError && (
                        <p
                          className="steps__field-error"
                          style={{ marginTop: "0.4rem" }}
                        >
                          {vinDecodeError}
                        </p>
                      )}

                      <button
                        type="button"
                        className="steps__vin-link"
                        onClick={() => setShowVinHelp(true)}
                      >
                        {content?.tab1_popup_label}
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          width="16"
                          height="16"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <line
                            x1="12"
                            y1="8"
                            x2="12"
                            y2="12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <circle cx="12" cy="16" r="1" fill="currentColor" />
                        </svg>
                      </button>

                      {vinDecodeSuccess && (
                        <>
                          <label
                            className="steps__field-label !mb-[0]"
                            style={{ marginTop: "1rem" }}
                          >
                            Vehicle identified
                          </label>
                          <input
                            type="text"
                            className="steps__input steps__input--readonly"
                            value={vinDecoded.vehicleIdentified}
                            readOnly
                          />
                          <label
                            className="steps__field-label !-mb-[10px]"
                            style={{ marginTop: "1.2rem" }}
                          >
                            Model
                          </label>
                          <p className="steps__field-hint !mb-[0]">
                            Pre-filled from VIN — update if needed
                          </p>
                          <input
                            type="text"
                            className="steps__input"
                            value={vinDecoded.vinModel}
                            onChange={(e) =>
                              setVinDecoded((prev) => ({
                                ...prev,
                                vinModel: e.target.value,
                              }))
                            }
                            placeholder="Enter model"
                          />
                        </>
                      )}
                    </div>
                  )}

                  {/* ── Year & Make Tab ── */}
                  {activeTab === "manual" && (
                    <div className="steps__tab-content">
                      <label className="steps__field-label !mb-[0]">Year</label>
                      <CustomSelect
                        value={manualYear}
                        onChange={(v) => {
                          setManualYear(v);
                          setErrors((p) => ({ ...p, year: "" }));
                        }}
                        options={YEAR_OPTIONS}
                        placeholder="Choose year"
                      />
                      {errors.year && (
                        <p className="steps__field-error">{errors.year}</p>
                      )}
                      {isUnsupportedYear && <UnsupportedYearBanner />}

                      {!isUnsupportedYear && (
                        <>
                          <label
                            className="steps__field-label !mb-[0]"
                            style={{ marginTop: "1.2rem" }}
                          >
                            Make
                          </label>
                          <CustomSelect
                            value={manualMake}
                            onChange={(v) => {
                              setManualMake(v);
                              setErrors((p) => ({ ...p, make: "" }));
                              if (v !== "other") setCustomMake("");
                            }}
                            options={MAKE_OPTIONS}
                            placeholder="Choose make"
                          />
                          {errors.make && (
                            <p className="steps__field-error">{errors.make}</p>
                          )}

                          {manualMake === "other" && (
                            <>
                              <label
                                className="steps__field-label !mb-[0]"
                                style={{ marginTop: "1rem" }}
                              >
                                Enter Make
                              </label>
                              <input
                                type="text"
                                className="steps__input"
                                placeholder="e.g. Aprilia, MV Agusta, Benelli…"
                                value={customMake}
                                autoFocus
                                onChange={(e) => {
                                  setCustomMake(e.target.value);
                                  setErrors((p) => ({ ...p, customMake: "" }));
                                }}
                              />
                              {errors.customMake && (
                                <p className="steps__field-error">
                                  {errors.customMake}
                                </p>
                              )}
                            </>
                          )}

                          <label
                            className="steps__field-label !mb-[0]"
                            style={{ marginTop: "1.2rem" }}
                          >
                            Model
                          </label>
                          <input
                            type="text"
                            className="steps__input"
                            placeholder="e.g. CBR600RR, Ninja 650, MT-07…"
                            value={model}
                            onChange={(e) => {
                              setModel(e.target.value);
                              setErrors((p) => ({ ...p, model: "" }));
                            }}
                          />
                          {errors.model && (
                            <p className="steps__field-error">{errors.model}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <button
                    className="form__submit-btn"
                    type="button"
                    style={{ marginTop: "20px" }}
                    onClick={doSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Please wait…" : content?.form_btn_heading}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Contain>
      </Section>

      {showVinHelp && (
        <VinHelpModal onClose={() => setShowVinHelp(false)} content={content} />
      )}
      {showVideo && (
        <VideoModal
          onClose={() => setShowVideo(false)}
          videoUrl={cmsFileUrl(content?.video1, "videos")}
        />
      )}
    </>
  );
}
