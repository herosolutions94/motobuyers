import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";

// ─── Custom Select (same pattern as steps) ───────────────────────────────────
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

// ─── Data (mirrors Step1 exactly) ────────────────────────────────────────────
// const YEAR_OPTIONS = [
//   ...Array.from({ length: 23 }, (_, i) => 2025 - i),
//   { separator: true },
//   { value: "before-2003", label: "Before 2003", italic: true },
// ];

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
  "BMW",
  "Can-Am",
  "Ducati",
  "Harley-Davidson",
  "Honda",
  "Indian",
  "Kawasaki",
  "KTM",
  "Royal Enfield",
  "Suzuki",
  "Triumph",
  "Vespa",
  "Yamaha",
  "Zero Motorcycles",
  { separator: true },
  { value: "other", label: "Other", italic: true },
];

// ─── NHTSA VIN decode ────────────────────────────────────────────────────────
async function decodeVin(vin) {
  const res = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`,
  );
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  const r = data.Results?.[0] ?? {};
  return {
    year: r.ModelYear || "",
    make: r.Make
      ? r.Make.charAt(0).toUpperCase() + r.Make.slice(1).toUpperCase()
      : "",
    model: r.Model || "",
  };
}

function isValidVin(vin) {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function VinHelpModal({ onClose }) {
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
          Where to find your VIN?
        </h2>
        <p className="steps__modal-subtitle">
          You can usually find the VIN on the steering neck, engine casing, or
          registration documents.
        </p>
        <div className="steps__vin-cards">
          <div className="steps__vin-card">
            <p className="steps__vin-card-title">Steering neck</p>
            <p className="steps__vin-card-desc">
              Stamped on the front of the frame, just behind the handlebars.
            </p>
            <img
              src="/images/bikes.png"
              alt="Steering neck location"
              className="steps__vin-card-img"
            />
          </div>
          <div className="steps__vin-card">
            <p className="steps__vin-card-title">Engine casing</p>
            <p className="steps__vin-card-desc">
              Engraved on the side of the engine
            </p>
            <img
              src="/images/bikes.png"
              alt="Engine casing location"
              className="steps__vin-card-img"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Unsupported Year Banner ──────────────────────────────────────────────────
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
// function UnsupportedYearBanner() {
//   return (
//     <div className="steps__unsupported-banner" style={{ marginTop: "1rem" }}>
//       <div className="steps__unsupported-icon">
//         <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
//           <circle cx="12" cy="12" r="10" stroke="var(--color-red)" strokeWidth="2" />
//           <line x1="12" y1="7" x2="12" y2="13" stroke="var(--color-red)" strokeWidth="2.2" strokeLinecap="round" />
//           <circle cx="12" cy="17" r="1.2" fill="var(--color-red)" />
//         </svg>
//       </div>
//       <div>
//         <p className="steps__unsupported-title">We currently only buy motorcycles from 2003 or newer.</p>
//         <p className="steps__unsupported-desc">Unfortunately we can&apos;t make an offer on this bike at this time.</p>
//       </div>
//     </div>
//   );
// }

// ─── SESSION STORAGE KEY ─────────────────────────────────────────────────────
export const HERO_PREFILL_KEY = "motobuyers_step1_prefill";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HeroSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("vin");
  const [showVinHelp, setShowVinHelp] = useState(false);
  const [formError, setFormError] = useState("");

  // VIN path state
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

  // Year & Make path state
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const vinValid = isValidVin(vinValue);
  const isUnsupportedYear =
    year && (year === "before-2003" || parseInt(year, 10) < 2003);

  // ── Auto-decode VIN when it becomes valid ──────────────────────────────────
  useEffect(() => {
    if (!vinValid || vinValue === lastDecodedVin.current) return;

    lastDecodedVin.current = vinValue;
    setVinDecoding(true);
    setVinDecodeError("");
    setVinDecodeSuccess(false);
    setVinDecoded({ year: "", make: "", vinModel: "", vehicleIdentified: "" });

    decodeVin(vinValue)
      .then(({ year, make, model }) => {
        const identified = [year, make, model].filter(Boolean).join(" ");
        if (!identified) {
          setVinDecodeError(
            "VIN not recognized. Try switching to Year and Make.",
          );
          setVinDecodeSuccess(false);
          return;
        }
        setVinDecoded({
          year,
          make,
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

  // ── Handle GET YOUR OFFER click ────────────────────────────────────────────
  const handleSubmit = () => {
    setFormError("");

    if (activeTab === "vin") {
      // Must have a valid VIN that decoded successfully
      if (!vinValid) {
        setFormError("Please enter a valid 17-character VIN.");
        return;
      }
      if (vinDecoding) {
        setFormError("Please wait — decoding your VIN.");
        return;
      }
      if (!vinDecodeSuccess) {
        setFormError("VIN not recognized. Try switching to Year and Make.");
        return;
      }

      // Write prefill to sessionStorage and navigate
      sessionStorage.setItem(
        HERO_PREFILL_KEY,
        JSON.stringify({
          tab: "vin",
          vin: vinValue,
          vehicleIdentified: vinDecoded.vehicleIdentified,
          year: vinDecoded.year,
          make: vinDecoded.make,
          vinModel: vinDecoded.vinModel,
        }),
      );
    } else {
      // Year & Make path — all three required, year must be supported
      if (!year) {
        setFormError("Please select a year.");
        return;
      }
      if (isUnsupportedYear) {
        setFormError("We only accept motorcycles from 2003 or newer.");
        return;
      }
      if (!make) {
        setFormError("Please select a make.");
        return;
      }
      if (!model.trim()) {
        setFormError("Please enter the model.");
        return;
      }

      sessionStorage.setItem(
        HERO_PREFILL_KEY,
        JSON.stringify({
          tab: "make",
          year,
          make,
          model,
        }),
      );
    }

    router.push("/steps");
  };

  return (
    <>
      <Section id="hero">
        <div
          className="hero__bg"
          style={{ backgroundImage: "url(/images/hero-bg.png)" }}
        />
        <Contain>
          <div className="hero__content">
            <Heading className="hero__title">
              Sell Your Motorcycle Just Got Easier
            </Heading>
            <Paragraph className="hero__subtitle">
              Answer a few questions about your motorcycle to get a customized
              offer from one of our appraisers.
            </Paragraph>
          </div>

          <div className="hero__inner">
            <div className="hero__left">
              <div className="hero__bikes" aria-hidden="true">
                <img src="/images/bikes.png" alt="Motorcycles" />
              </div>
              <div
                className="hero__play"
                aria-label="Watch video"
                role="button"
                tabIndex="0"
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
                {/* Tabs */}
                <div className="steps__tabs">
                  <button
                    className={`steps__tab${activeTab === "vin" ? " steps__tab--active" : ""}`}
                    type="button"
                    onClick={() => {
                      setActiveTab("vin");
                      setFormError("");
                    }}
                  >
                    VIN
                  </button>
                  <button
                    className={`steps__tab${activeTab === "make" ? " steps__tab--active" : ""}`}
                    type="button"
                    onClick={() => {
                      setActiveTab("make");
                      setFormError("");
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
                          setFormError("");
                          lastDecodedVin.current = "";
                        }}
                      />
                      {/* Spinner */}
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
                      {/* Green check */}
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
                      {/* Red X */}
                      {/* {vinValid && !vinDecoding && vinDecodeError && (
                        <span className="steps__input-valid-icon">
                          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <circle cx="12" cy="12" r="10" fill="#dc2626" />
                            <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                            <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                          </svg>
                        </span>
                      )} */}
                    </div>

                    {/* VIN decode error */}
                    {vinDecodeError && (
                      <p
                        className="steps__field-error"
                        style={{ marginTop: "0.4rem" }}
                      >
                        {vinDecodeError}
                      </p>
                    )}

                    {/* Where to find VIN link */}
                    <button
                      type="button"
                      className="steps__vin-link"
                      onClick={() => setShowVinHelp(true)}
                    >
                      Where to find your VIN
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

                    {/* Vehicle Identified — only shown on success */}
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
                {activeTab === "make" && (
                  <div className="steps__tab-content">
                    <label className="steps__field-label !mb-[0]">Year</label>
                    <CustomSelect
                      value={year}
                      onChange={(v) => {
                        setYear(v);
                        setFormError("");
                      }}
                      options={YEAR_OPTIONS}
                      placeholder="Choose year"
                    />

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
                          value={make}
                          onChange={(v) => {
                            setMake(v);
                            setFormError("");
                          }}
                          options={MAKE_OPTIONS}
                          placeholder="Choose make"
                        />

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
                            setFormError("");
                          }}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Global form error */}
                {formError && (
                  <p
                    className="steps__field-error"
                    style={{ marginTop: "0.6rem" }}
                  >
                    {formError}
                  </p>
                )}

                <button
                  className="form__submit-btn"
                  type="button"
                  style={{ marginTop: "20px" }}
                  onClick={handleSubmit}
                >
                  GET YOUR OFFER
                </button>
              </div>
            </div>
          </div>
        </Contain>
      </Section>

      {showVinHelp && <VinHelpModal onClose={() => setShowVinHelp(false)} />}
    </>
  );
}
