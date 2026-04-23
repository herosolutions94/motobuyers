import { useRef } from "react";
import { useFormContext, Controller } from "react-hook-form";

const COSMETIC_ISSUES = [
  "Scratches or scuffs",
  "Dent or ding",
  "Cracked fairing or panel",
  "Faded paint",
];

const CheckIcon = () => (
  <svg viewBox="0 0 12 10" fill="none" width="12" height="10">
    <polyline points="1,5 4.5,8.5 11,1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Step3b() {
  const { watch, setValue, formState: { errors } } = useFormContext();
  const inputRef = useRef(null);

  const selected = watch("cosmeticIssues") || [];
  const otherChecked = watch("cosmeticOtherChecked") || false;
  const otherText = watch("cosmeticOtherText") || "";
  const noIssues = watch("noIssues") || false;

  const toggle = (issue) => {
    const updated = selected.includes(issue)
      ? selected.filter((i) => i !== issue)
      : [...selected, issue];
    setValue("cosmeticIssues", updated, { shouldValidate: true });
    setValue("noIssues", false);
  };

  const toggleOther = () => {
    const next = !otherChecked;
    setValue("cosmeticOtherChecked", next);
    setValue("noIssues", false);
    if (next) setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleNoIssues = () => {
    setValue("cosmeticIssues", []);
    setValue("cosmeticOtherChecked", false);
    setValue("cosmeticOtherText", "");
    setValue("noIssues", true);
  };

  return (
    <section className="steps__section">
      <h1 className="steps__title">What cosmetic issues should we know about?</h1>
      <p className="steps__subtitle">Select all that apply, or let us know if none of these fit.</p>

      <div className="steps__single-col">
        <div className="steps__checkbox-list">
          {COSMETIC_ISSUES.map((issue) => {
            const checked = selected.includes(issue);
            return (
              <label
                key={issue}
                className={`steps__checkbox-row ${checked ? "steps__checkbox-row--active" : ""}`}
                onClick={() => toggle(issue)}
              >
                <span className="steps__checkbox-box">{checked && <CheckIcon />}</span>
                <span className="steps__checkbox-label">{issue}</span>
              </label>
            );
          })}

          {/* Other row */}
          <label
            className={`steps__checkbox-row ${otherChecked ? "steps__checkbox-row--active" : ""}`}
            onClick={toggleOther}
          >
            <span className="steps__checkbox-box">{otherChecked && <CheckIcon />}</span>
            {otherChecked ? (
              <input
                ref={inputRef}
                type="text"
                className="steps__checkbox-other-input"
                placeholder="Describe the issue..."
                value={otherText}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  setValue("cosmeticOtherText", e.target.value);
                  setValue("noIssues", false);
                }}
              />
            ) : (
              <span className="steps__checkbox-label">Other</span>
            )}
          </label>
        </div>

        {/* OR divider */}
        <div className="steps__vin-or" style={{ margin: "1.6rem 0" }}>
          <span>OR</span>
        </div>

        {/* No cosmetic issues */}
        <label
          className={`steps__checkbox-row ${noIssues ? "steps__checkbox-row--active" : ""}`}
          onClick={handleNoIssues}
        >
          <span className="steps__radio-box">
            {noIssues && <span className="steps__radio-dot" />}
          </span>
          <span className="steps__checkbox-label">No cosmetic issues</span>
        </label>

        {errors.cosmeticIssues && (
          <p className="steps__field-error" style={{ marginTop: "0.75rem" }}>
            {errors.cosmeticIssues.message}
          </p>
        )}
      </div>
    </section>
  );
}