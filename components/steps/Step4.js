import { useFormContext, Controller } from "react-hook-form";

const MECHANICAL_RATINGS = [
  {
    stars: 5,
    label: "Excellent",
    desc: "No known mechanical issues. Runs as expected with no warning signs.",
  },
  {
    stars: 4,
    label: "Very Good",
    desc: "Runs well. No major issues, but may be due for inspection or minor service soon.",
  },
  {
    stars: 3,
    label: "Good",
    desc: "Rideable with minor symptoms, such as shifting quirks or startup hesitation.",
  },
  {
    stars: 2,
    label: "Fair",
    desc: "Known issues affect reliability or ridability, such as stalling, electrical faults, or overheating.",
  },
  {
    stars: 1,
    label: "Poor",
    desc: "Not running or has major mechanical problems, such as severe engine or transmission failure.",
  },
];

function Stars({ count }) {
  return (
    <span className="steps__stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`steps__star ${i < count ? "steps__star--filled" : ""}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function Step4() {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <section className="steps__section">
      <h1 className="steps__title">
        How would you rate the mechanical condition?
      </h1>
      <p className="steps__subtitle">
        Engine, transmission, electronics, and how the bike runs overall.
      </p>

      <div className="steps__single-col">
        <Controller
          name="mechanical"
          control={control}
          rules={{ required: "Please select a mechanical condition rating" }}
          render={({ field }) => (
            <div className="steps__rating-list">
              {MECHANICAL_RATINGS.map((r) => {
                const isActive = field.value === r.stars;
                return (
                  <button
                    key={r.stars}
                    type="button"
                    className={`steps__rating-card ${isActive ? "steps__rating-card--active" : ""}`}
                    onClick={() => field.onChange(r.stars)}
                  >
                    <div className="steps__rating-content">
                      <div className="steps__rating-header">
                        <Stars count={r.stars} />
                        <span className="steps__rating-title">{r.label}</span>
                      </div>
                      <span className="steps__rating-desc">{r.desc}</span>
                    </div>
                    <span className="steps__rating-radio">
                      {isActive && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          width="14"
                          height="14"
                        >
                          <polyline
                            points="4,12 9,17 20,6"
                            stroke="#fff"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.mechanical && (
          <p className="steps__field-error" style={{ marginTop: "0.5rem" }}>
            {errors.mechanical.message}
          </p>
        )}
      </div>
    </section>
  );
}
