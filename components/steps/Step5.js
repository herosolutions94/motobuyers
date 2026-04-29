import { useFormContext, Controller } from "react-hook-form";

const TITLE_TYPES = [
  "Clean",
  "Salvage",
  "True mileage unknown",
  "Other or not sure",
];

function CircleBox({ active }) {
  return (
    <span className="steps__radio-box">
      {active && <span className="steps__radio-dot" />}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 10" fill="none" width="12" height="10">
      <polyline
        points="1,5 4.5,8.5 11,1"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Step5() {
  const {
    watch,
    setValue,
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const titleType = watch("titleType");
  const hasLoan = watch("hasLoan");
  const notSurePayoff = watch("notSurePayoff");
  const notSurePrice = watch("notSurePrice");
  const showLoan = hasLoan === "yes";

  return (
    <div className="steps__section">
      <h1 className="steps__title">Title and financial details</h1>

      <div className="steps__single-col">
        {/* ── Card 1: Title type ── */}
        <div className="steps__form-card">
          <p className="steps__field-label steps__field-label--lg">
            Title type
          </p>
          <Controller
            name="titleType"
            control={control}
            rules={{ required: "Please select a title type" }}
            render={({ field }) => (
              <div className="steps__option-list">
                {TITLE_TYPES.map((t) => {
                  const active = field.value === t;
                  return (
                    <label
                      key={t}
                      className={`steps__checkbox-row ${active ? "steps__checkbox-row--active" : ""}`}
                      onClick={() => field.onChange(t)}
                    >
                      <CircleBox active={active} />
                      <span className="steps__checkbox-label">{t}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
          {errors.titleType && (
            <p className="steps__field-error">{errors.titleType.message}</p>
          )}
        </div>

        {/* ── Card 2: Loan ── */}
        <div className="steps__form-card" style={{ marginTop: "2rem" }}>
          <p className="steps__field-label steps__field-label--lg">
            Do you have a loan on this bike?
          </p>

          <Controller
            name="hasLoan"
            control={control}
            rules={{ required: "Please select yes or no" }}
            render={({ field }) => (
              <div className="steps__yesno">
                {["Yes", "No"].map((opt) => {
                  const val = opt.toLowerCase();
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`steps__yesno-btn ${field.value === val ? "steps__yesno-btn--active" : ""}`}
                      onClick={() => {
                        field.onChange(val);
                        setValue("payoffAmount", "");
                        setValue("notSurePayoff", false);
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.hasLoan && (
            <p className="steps__field-error">{errors.hasLoan.message}</p>
          )}

          {/* Payoff amount — visible when loan = yes */}
          {showLoan && (
            <div className="steps__fin-reveal" style={{ marginTop: "2rem" }}>
              <p className="steps__field-label">Payoff amount</p>
              <div className="steps__amount-row">
                <div
                  className={`steps__amount-input-wrap ${!notSurePayoff && watch("payoffAmount") ? "steps__amount-input-wrap--active" : ""} ${notSurePayoff ? "steps__amount-input-wrap--disabled" : ""}`}
                >
                  <span className="steps__amount-dollar">$</span>
                  <input
                    {...register("payoffAmount")}
                    type="text"
                    inputMode="numeric"
                    className="steps__amount-input"
                    placeholder="Enter amount"
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                      setValue("payoffAmount", onlyNumbers, {
                        shouldValidate: true,
                      });
                    }}
                    disabled={notSurePayoff}
                  />
                </div>
                <button
                  type="button"
                  className={`steps__not-sure-btn ${notSurePayoff ? "steps__not-sure-btn--active" : ""}`}
                  onClick={() => {
                    setValue("notSurePayoff", !notSurePayoff);
                    setValue("payoffAmount", "");
                  }}
                >
                  <span className={`steps__not-sure-icon ${notSurePayoff ? "steps__not-sure-icon--active" : ""}`}>
                    {notSurePayoff && (
                      <CheckIcon />
                    )}
                  </span>
                  Not sure
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Card 3: Asking price ── */}
        <div className="steps__form-card" style={{ marginTop: "2rem" }}>
          <p className="steps__field-label steps__field-label--lg">
            Asking price
          </p>
          <div className="steps__amount-row">
            <div
              className={`steps__amount-input-wrap ${!notSurePrice && watch("askingPrice") ? "steps__amount-input-wrap--active" : ""} ${notSurePrice ? "steps__amount-input-wrap--disabled" : ""}`}
            >
              <span className="steps__amount-dollar">$</span>
              <input
                {...register("askingPrice")}
                type="text"
                inputMode="numeric"
                className="steps__amount-input"
                placeholder="Enter amount"
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                  setValue("askingPrice", onlyNumbers, {
                    shouldValidate: true,
                  });
                }}
                disabled={notSurePrice}
              />
            </div>
            <button
              type="button"
              className={`steps__not-sure-btn ${notSurePrice ? "steps__not-sure-btn--active" : ""}`}
              onClick={() => {
                setValue("notSurePrice", !notSurePrice);
                setValue("askingPrice", "");
              }}
            >
              <span className={`steps__not-sure-icon ${notSurePrice ? "steps__not-sure-icon--active" : ""}`}>
                {notSurePrice && (
                  <CheckIcon />
                )}
              </span>
              Not sure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
