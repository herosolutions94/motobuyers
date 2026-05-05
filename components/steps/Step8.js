import Text from "../text";

export default function Step8({
  bikeLabel,
  content,
  thank_steps,
  firstName,
  onStartOver,
}) {
  const name = firstName ? firstName.trim() : "";

  return (
    <div className="steps__section">
      <h1 className="steps__title steps__title--italic">
        {name ? (
          <>
            {content?.step7_heading}, {name} &mdash;{" "}
            {content?.step7_heading_aft}
          </>
        ) : (
          <>
            {content?.step7_heading} &mdash; {content?.step7_heading_aft}
          </>
        )}
      </h1>
      <p className="steps__subtitle">
        <Text string={content?.step7_txt} />
      </p>

      <div className="steps__single-col">
        <div className="steps__form-card">
          <ol className="steps__confirm-list">
            {thank_steps.map((s) => (
              <li key={s?.id} className="steps__confirm-item">
                <span className="steps__confirm-num">{s?.order_no}</span>
                <div>
                  <strong className="steps__confirm-title">{s?.title}</strong>
                  <p className="steps__confirm-desc">{s?.txt1}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="steps__confirm-note">
            <div>
              <p>
                <Text string={content?.step6_txt2} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Start Over ── */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          type="button"
          className="steps__btn-continue"
          onClick={onStartOver}
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
