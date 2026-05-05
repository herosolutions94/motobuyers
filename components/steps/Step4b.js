import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import Text from "../text";

const MECHANICAL_ISSUES = [
  "Engine or transmission issue",
  "Electrical issue",
  "Fluid leak",
  "Warning light on dash",
  "Starting problem",
  "Unusual noise or vibration",
  "Overheating or stalling",
];

const CheckIcon = () => (
  <svg viewBox="0 0 12 10" fill="none" width="12" height="10">
    <polyline points="1,5 4.5,8.5 11,1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Step4b({content}) {
  const { watch, setValue, getValues, formState: { errors } } = useFormContext();
  const inputRef = useRef(null);
  const [overflowAt, setOverflowAt] = useState(() => {
    const checked = getValues("mechOtherChecked");
    const text = getValues("mechOtherText");
    return checked && text ? text.length : null;
  });
  const isExpanded = overflowAt !== null;

  const selected = watch("mechanicalIssues") || [];
  const otherChecked = watch("mechOtherChecked") || false;
  const otherText = watch("mechOtherText") || "";
  const noIssues = watch("mechNoIssues") || false;

  const toggle = (issue) => {
    const updated = selected.includes(issue)
      ? selected.filter((i) => i !== issue)
      : [...selected, issue];
    setValue("mechanicalIssues", updated);
    setValue("mechNoIssues", false);
  };

  const toggleOther = () => {
    const next = !otherChecked;
    setValue("mechOtherChecked", next);
    setValue("mechNoIssues", false);
    if (!next) setOverflowAt(null);
    if (next) setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleNoIssues = () => {
    setValue("mechanicalIssues", []);
    setValue("mechOtherChecked", false);
    setValue("mechOtherText", "");
    setValue("mechNoIssues", true);
    setOverflowAt(null);
  };

  return (
    <div className="steps__section">
      <h1 className="steps__title">{content?.step4b_heading}</h1>
      <p className="steps__subtitle"><Text string={content?.step4b_txt} /></p>

      <div className="steps__single-col">
        <div className="steps__checkbox-list">
          {MECHANICAL_ISSUES.map((issue) => {
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
              isExpanded ? (
                <textarea
                  ref={inputRef}
                  className="steps__checkbox-other-input"
                  placeholder="Describe the issue..."
                  value={otherText}
                  rows={4}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setValue("mechOtherText", e.target.value);
                    setValue("mechNoIssues", false);
                    if (e.target.value.length < overflowAt) setOverflowAt(null);
                  }}
                />
              ) : (
                <input
                  ref={inputRef}
                  type="text"
                  className="steps__checkbox-other-input"
                  placeholder="Describe the issue..."
                  value={otherText}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setValue("mechOtherText", e.target.value);
                    setValue("mechNoIssues", false);
                    if (inputRef.current && inputRef.current.scrollWidth > inputRef.current.clientWidth) {
                      setOverflowAt(e.target.value.length);
                    }
                  }}
                />
              )
            ) : (
              <span className="steps__checkbox-label">Other</span>
            )}
          </label>
        </div>

        {/* OR divider */}
        <div className="steps__vin-or" style={{ margin: "1.6rem 0" }}>
          <span>OR</span>
        </div>

        {/* No mechanical issues */}
        <label
          className={`steps__checkbox-row ${noIssues ? "steps__checkbox-row--active" : ""}`}
          onClick={handleNoIssues}
        >
          <span className="steps__radio-box">
            {noIssues && <span className="steps__radio-dot" />}
          </span>
          <span className="steps__checkbox-label">No mechanical issues</span>
        </label>

        {errors.mechanicalIssues && (
          <p className="steps__field-error" style={{ marginTop: "0.75rem" }}>
            {errors.mechanicalIssues.message}
          </p>
        )}
      </div>
    </div>
  );
}