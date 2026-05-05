import { useFormContext, Controller } from "react-hook-form";

const COSMETIC_RATINGS = [
  {
    stars: 5,
    label: "Excellent",
    desc: "Like-new condition. All original fairings and paint. Never dropped, scratched, or blemished.",
  },
  {
    stars: 4,
    label: "Very Good",
    desc: "Normal use only. Light swirls, belt marks, or small chips. Never dropped.",
  },
  {
    stars: 3,
    label: "Good",
    desc: "Minor cosmetic damage from a light drop, such as rash on bar ends or fairings. No cracked panels.",
  },
  {
    stars: 2,
    label: "Fair",
    desc: "Moderate drop or accident damage. Visible rash, cracks, or panels that may need replacement.",
  },
  {
    stars: 1,
    label: "Poor",
    desc: "Unrepaired crash damage. Bent parts, broken panels, or major cosmetic body issues.",
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

export default function Step3({ content }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="steps__section">
      <h1 className="steps__title">{content?.step3_heading}</h1>

      <div className="steps__single-col">
        <Controller
          name="cosmetic"
          control={control}
          rules={{ required: "Please select a condition rating" }}
          render={({ field }) => (
            <div className="steps__rating-list">
              {COSMETIC_RATINGS.map((r) => {
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
        {errors.cosmetic && (
          <p className="steps__field-error" style={{ marginTop: "0.5rem" }}>
            {errors.cosmetic.message}
          </p>
        )}
      </div>
    </div>
  );
}
