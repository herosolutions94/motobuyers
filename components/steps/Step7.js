const NEXT_STEPS = [
  {
    num: 1,
    title: "Review",
    desc: "Our team reviews the information and any photos you uploaded.",
  },
  {
    num: 2,
    title: "Reach out",
    desc: "We contact you if we need anything else to finish the appraisal.",
  },
  {
    num: 3,
    title: "Offer",
    desc: "You receive an offer and can decide if you want to move forward.",
  },
  {
    num: 4,
    title: "Schedule",
    desc: "If it is a fit, we coordinate the next step and paperwork.",
  },
];

export default function Step7({ bikeLabel, firstName }) {
  const name = firstName ? firstName.trim() : "";

  return (
    <div className="steps__section">
      <h1 className="steps__title steps__title--italic">
        {name ? (
          <>Thank you, {name} &mdash; we&apos;ve got everything we need!</>
        ) : (
          <>Thanks &mdash; we&apos;ve got everything we need!</>
        )}
      </h1>
      <p className="steps__subtitle">
        {/* Showing: <strong>{bikeLabel}</strong> */}
        Your motorcycle details have been submitted.
      </p>

      <div className="steps__single-col">
        <div className="steps__form-card">
          <ol className="steps__confirm-list">
            {NEXT_STEPS.map((s) => (
              <li key={s.num} className="steps__confirm-item">
                <span className="steps__confirm-num">{s.num}</span>
                <div>
                  <strong className="steps__confirm-title">{s.title}</strong>
                  <p className="steps__confirm-desc">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="steps__confirm-note">
            {/* <span className="steps__confirm-note-icon">&#9203;</span> */}
            <div>
              <p>
                Need help right away? Contact MotoBuyers support and include
                your phone number so we can find your submission quickly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
