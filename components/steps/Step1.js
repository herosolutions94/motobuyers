import { useState, useRef, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import Text from "../text";
import { cmsFileUrl } from "@/helpers/helpers";

// ─── Custom Select ───────────────────────────────────────────────────────────
// Each option can be: a plain value, or { value, label, italic, disabled, separator }
function CustomSelect({ value, onChange, options, placeholder, error }) {
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
    (o) =>
      !o?.separator && !o?.disabled && String(o?.value ?? o) === String(value),
  );
  const label = selected ? (selected.label ?? selected) : null;

  return (
    <div className="steps__custom-select" ref={ref}>
      <button
        type="button"
        className={`steps__custom-select__trigger${label ? " steps__custom-select__trigger--has-value" : ""}${open ? " steps__custom-select__trigger--open" : ""}${error ? " steps__input--error" : ""}`}
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
            const isDisabled = opt?.disabled;
            const isItalic = opt?.italic;
            return (
              <div
                key={v}
                className={[
                  "steps__custom-select__option",
                  v === String(value)
                    ? "steps__custom-select__option--selected"
                    : "",
                  isDisabled ? "steps__custom-select__option--disabled" : "",
                  isItalic ? "steps__custom-select__option--italic" : "",
                ]
                  .join(" ")
                  .trim()}
                onMouseDown={() => {
                  if (isDisabled) return;
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

// ─── Data ────────────────────────────────────────────────────────────────────
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
    make: r.Make || "", // return raw — matchMakeToOption handles casing
    model: r.Model || "",
  };
}

// Match raw API make (e.g. "HARLEY-DAVIDSON") to the exact option value
// in MAKE_OPTIONS using case-insensitive comparison.
// Returns the matched option string, or "other" if no match found.
function matchMakeToOption(rawMake) {
  if (!rawMake) return "";
  const normalized = rawMake.trim().toLowerCase();
  const match = MAKE_OPTIONS.find((o) => {
    if (!o || o.separator) return false;
    const v = String(o?.value ?? o);
    return v.toLowerCase() === normalized;
  });
  if (match) return String(match?.value ?? match);
  return "other";
}

function isValidVin(vin) {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

// ─── Modals ──────────────────────────────────────────────────────────────────
function VinErrorModal({ onClose }) {
  return (
    <div className="steps__modal-overlay" onClick={onClose}>
      <div className="steps__modal" onClick={(e) => e.stopPropagation()}>
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
        <div className="steps__modal-icon steps__modal-icon--warn">
          <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
            <path
              d="M12 2l2.4 2.4L17 3l1 2.7 2.9.3-.3 2.9L23 11l-1.7 2.4.9 2.8-2.8.9-.3 2.9-2.9-.3L14 22l-2-1.7L10 22l-1.9-2.2-2.9.3-.3-2.9-2.8-.9.9-2.8L1 11l1.7-2.1-.3-2.9 2.9-.3L6.9 3l2.7 1z"
              stroke="var(--color-red)"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="13"
              stroke="var(--color-red)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16.5" r="1" fill="var(--color-red)" />
          </svg>
        </div>
        <h2 className="steps__modal-title">
          Uh-Oh, We Can&apos;t Decode This VIN Number
        </h2>
        <div className="steps__modal-rules">
          <p>
            <span className="steps__modal-check">✓</span> A VIN cannot include
            letters I, O, Q
          </p>
          <p>
            <span className="steps__modal-check">✓</span> A VIN is made up of 17
            characters
          </p>
        </div>
        <p className="steps__modal-hint">
          Please try again or enter make &amp; model instead
        </p>
      </div>
    </div>
  );
}

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

// ─── Unsupported Year Banner ─────────────────────────────────────────────────
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

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Step1({ content }) {
  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useFormContext();

  const activeTab = watch("tab") || "vin";
  const vinValue = watch("vin") || "";
  const yearValue = watch("year") || "";
  const vinValid = isValidVin(vinValue);

  const [showVinError, setShowVinError] = useState(false);
  const [showVinHelp, setShowVinHelp] = useState(false);

  // VIN decode state
  const [vinDecoding, setVinDecoding] = useState(false);
  const [vinDecodeError, setVinDecodeError] = useState("");
  const [vinDecodeSuccess, setVinDecodeSuccess] = useState(false);
  const lastDecodedVin = useRef("");
  // Only true after the user has actually typed in the VIN field this session.
  // Prevents re-firing the API when navigating back to Step 1 with a
  // previously valid VIN already in the form.
  const userHasTyped = useRef(false);

  const handleTab = (tab) => setValue("tab", tab, { shouldValidate: false });

  const handleVinBlur = () => {
    if (vinValue && !vinValid) setShowVinError(true);
  };

  // On mount: if we already have a valid VIN + vehicleIdentified in form state
  // (e.g. user navigated back), restore the success state WITHOUT re-calling the API.
  useEffect(() => {
    const existingIdentified = watch("vehicleIdentified");
    if (vinValid && existingIdentified && !vinDecodeSuccess) {
      setVinDecodeSuccess(true);
      lastDecodedVin.current = vinValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire the NHTSA API only when the user has actively typed a valid VIN
  useEffect(() => {
    // Skip if the user hasn't typed anything this render cycle
    if (!userHasTyped.current) return;
    if (!vinValid || vinValue === lastDecodedVin.current) return;

    lastDecodedVin.current = vinValue;
    setVinDecoding(true);
    setVinDecodeError("");
    setVinDecodeSuccess(false);
    setValue("vehicleIdentified", "");
    setValue("year", "");
    setValue("make", "");
    setValue("vinModel", "");

    decodeVin(vinValue)
      .then(({ year, make, model }) => {
        const matchedMake = matchMakeToOption(make);
        const displayMake =
          matchedMake && matchedMake !== "other" ? matchedMake : make;
        // vehicleIdentified = year + make only (model has its own separate field)
        const identified = [year, displayMake].filter(Boolean).join(" ");
        if (!identified) {
          setVinDecodeError(
            "VIN not recognized. Try switching to Year and Make.",
          );
          setVinDecodeSuccess(false);
          return;
        }
        setValue("vehicleIdentified", identified);
        setValue("year", year);
        setValue("make", matchedMake); // sets Year & Make tab dropdown
        // If make wasn't in the list, pre-fill customMake with the raw value
        if (matchedMake === "other") {
          setValue("customMake", make);
        } else {
          setValue("customMake", "");
        }
        setValue("vinModel", model); // model goes to its own editable field
        setVinDecodeError("");
        setVinDecodeSuccess(true);
      })
      .catch(() => {
        setVinDecodeError(
          "VIN not recognized. Try switching to Year and Make.",
        );
        setVinDecodeSuccess(false);
        setValue("vehicleIdentified", "");
      })
      .finally(() => setVinDecoding(false));
  }, [vinValid, vinValue, setValue]);

  // Year gate: block "before-2003" sentinel OR any numeric year < 2003
  const isUnsupportedYear =
    activeTab === "make" &&
    yearValue &&
    (yearValue === "before-2003" || parseInt(yearValue, 10) < 2003);

  return (
    <div className="steps__section">
      <h1 className="steps__title"> {content?.step1_heading}</h1>
      <p className="steps__subtitle">
        <Text string={content?.step1_txt} />
      </p>

      <div className="steps__single-col">
        {/* Tabs */}
        <div className="steps__tabs">
          <button
            className={`steps__tab ${activeTab === "vin" ? "steps__tab--active" : ""}`}
            type="button"
            onClick={() => handleTab("vin")}
          >
            VIN
          </button>
          <button
            className={`steps__tab ${activeTab === "make" ? "steps__tab--active" : ""}`}
            type="button"
            onClick={() => handleTab("make")}
          >
            Year and Make
          </button>
        </div>

        {/* ── VIN Tab ── */}
        {activeTab === "vin" && (
          <div className="steps__tab-content">
            <label className="steps__field-label !mb-[0]">Enter your VIN</label>
            <div className="steps__input-icon-wrap">
              <input
                {...register("vin", {
                  validate: (v) =>
                    isValidVin(v) || "Please enter a valid 17-character VIN",
                })}
                type="text"
                className={`steps__input${vinValid && vinDecodeSuccess ? " steps__input--valid" : ""}${errors.vin || vinDecodeError ? " steps__input--error" : ""}`}
                placeholder="17 character VIN"
                maxLength={17}
                onBlur={handleVinBlur}
                onChange={(e) => {
                  // Mark that the user has actively typed — enables API decode
                  userHasTyped.current = true;
                  // Reset decode state when user edits the VIN
                  setVinDecodeError("");
                  setVinDecodeSuccess(false);
                  lastDecodedVin.current = "";
                  setValue("vin", e.target.value.toUpperCase(), {
                    shouldValidate: true,
                  });
                }}
              />
              {/* Spinning while decoding */}
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
              {/* Green check on success */}
              {vinValid && !vinDecoding && vinDecodeSuccess && (
                <span className="steps__input-valid-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
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
              {/* Red X on failure */}
              {vinValid && !vinDecoding && vinDecodeError && (
                <span className="steps__input-valid-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
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
            {errors.vin && (
              <p className="steps__field-error">{errors.vin.message}</p>
            )}

            {/* API decode error — shown inline below the input */}
            {vinDecodeError && !errors.vin && (
              <p className="steps__field-error" style={{ marginTop: "0.4rem" }}>
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

            {/* Vehicle Identified + Model — only shown after a successful decode */}
            {vinDecodeSuccess && (
              <>
                <label
                  className="steps__field-label !mb-[0]"
                  style={{ marginTop: "1rem" }}
                >
                  Vehicle identified
                </label>
                <input
                  {...register("vehicleIdentified")}
                  type="text"
                  className="steps__input steps__input--readonly"
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
                  {...register("vinModel")}
                  type="text"
                  className="steps__input"
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
            <Controller
              name="year"
              control={control}
              rules={{
                required: "Please select a year",
                validate: (v) =>
                  (v !== "before-2003" && parseInt(v, 10) >= 2003) ||
                  "We currently only accept motorcycles from 2003 or newer",
              }}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={YEAR_OPTIONS}
                  placeholder="Choose year"
                  error={!!errors.year}
                />
              )}
            />
            {errors.year && (
              <p className="steps__field-error">{errors.year.message}</p>
            )}

            {/* Unsupported year — hard block, hide rest of form */}
            {isUnsupportedYear && <UnsupportedYearBanner />}

            {!isUnsupportedYear && (
              <>
                <label
                  className="steps__field-label !mb-[0]"
                  style={{ marginTop: "1.2rem" }}
                >
                  Make
                </label>
                <Controller
                  name="make"
                  control={control}
                  rules={{ required: "Please select a make" }}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={(v) => {
                        field.onChange(v);
                        // Clear customMake when switching away from Other
                        if (v !== "other") setValue("customMake", "");
                      }}
                      options={MAKE_OPTIONS}
                      placeholder="Choose make"
                      error={!!errors.make}
                    />
                  )}
                />
                {errors.make && (
                  <p className="steps__field-error">{errors.make.message}</p>
                )}

                {/* "Enter Make" free-text — shown only when Other is selected */}
                {watch("make") === "other" && (
                  <>
                    <label
                      className="steps__field-label !mb-[0]"
                      style={{ marginTop: "1rem" }}
                    >
                      Enter Make
                    </label>
                    <input
                      {...register("customMake", {
                        required: "Please enter the make",
                      })}
                      type="text"
                      className={`steps__input${errors.customMake ? " steps__input--error" : ""}`}
                      placeholder="e.g. Aprilia, MV Agusta, Benelli…"
                      autoFocus
                    />
                    {errors.customMake && (
                      <p className="steps__field-error">
                        {errors.customMake.message}
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
                  {...register("model", { required: "Please enter the model" })}
                  type="text"
                  className={`steps__input${errors.model ? " steps__input--error" : ""}`}
                  placeholder="e.g. CBR600RR, Ninja 650, MT-07…"
                />
                {errors.model && (
                  <p className="steps__field-error">{errors.model.message}</p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showVinError && <VinErrorModal onClose={() => setShowVinError(false)} />}
      {showVinHelp && (
        <VinHelpModal onClose={() => setShowVinHelp(false)} content={content} />
      )}
    </div>
  );
}
