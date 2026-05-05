import Text from "../text";

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

export default function Step8({ bikeLabel, content, thank_steps, firstName }) {
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
        {/* Showing: <strong>{bikeLabel}</strong> */}
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
            {/* <span className="steps__confirm-note-icon">&#9203;</span> */}
            <div>
              <p>
                {" "}
                <Text string={content?.step6_txt2} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
