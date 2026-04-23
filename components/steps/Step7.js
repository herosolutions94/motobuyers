const NEXT_STEPS = [
  {
    num: 1,
    title: "Review",
    desc: "One of our appraisers will carefully review your submission.",
  },
  {
    num: 2,
    title: "Receive Your Offer",
    desc: "We'll send you a no-hassle, fair-market offer based on your bike's condition and local demand.",
  },
  {
    num: 3,
    title: "Ask Questions or Schedule Pickup",
    desc: "You can chat with us, ask questions, or schedule an in-person appointment.",
  },
  {
    num: 4,
    title: "Get Paid",
    desc: "Accept the offer, hand off the keys, and get paid — it's that simple.",
  },
];

export default function Step7({ bikeLabel }) {
  return (
    <section className="steps__section">
      <h1 className="steps__title steps__title--italic">
        Thanks &mdash; we&apos;ve got everything we need!
      </h1>
      <p className="steps__subtitle">
        Showing: <strong>{bikeLabel}</strong>
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
            <span className="steps__confirm-note-icon">&#9203;</span>
            <div>
              <strong>Most offers are sent within 1 business day.</strong>
              <p>Submissions received after 6pm may be reviewed the next morning.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
