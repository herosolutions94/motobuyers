import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";

const QUOTE_STEPS = [
  {
    step: "Step 1",
    title: "Establishing the Trade-In Baseline",
    desc: "We review recent auction and trade-in trends to understand what dealers are paying for similar motorcycles. This baseline considers industry costs like reconditioning, transportation, fees, and the typical margins a wholesaler expects.",
    img: "/images/quote-step-1.png",
    alt: "Establishing the trade-in baseline",
  },
  {
    step: "Step 2",
    title: "Assessing Private Market Value",
    desc: "Book values can be generic, so we dig deeper by analyzing local listings and recent private sale prices for bikes like yours. This research gives us a realistic picture of your motorcycle's retail potential, helping us gauge how competitive the market is right now.",
    img: "/images/quote-step-2.png",
    alt: "Assessing private market value",
  },
  {
    step: "Step 3",
    title: "Delivering Your Initial Offer",
    desc: "Using both the trade-in baseline and the private market analysis, we craft an initial quote that falls between these two values. Where your offer lands depends on your bike's condition, demand, and overall marketability.",
    img: "/images/quote-step-3.png",
    alt: "Delivering your initial offer",
  },
  {
    step: "Step 4",
    title: "Finalizing the Offer with an Inspection",
    desc: "Your initial quote is based on the data you provide, but before we finalize, our appraiser will conduct a brief inspection (and possibly a test ride). This helps us verify details and adjust the offer if necessary.",
    img: "/images/quote-step-4.png",
    alt: "Finalizing the offer with an inspection",
  },
];

export default function QuoteStepsSection({ content, quote_steps }) {
  return (
    <Section id="quote-steps">
      <Contain>
        <div className="quote-steps__header">
          <Heading as="h2" className="quote-steps__title">
            {content?.section1_heading}
          </Heading>
          <Paragraph className="quote-steps__subtitle">
            <Text string={content?.section1_text} />
          </Paragraph>
        </div>
        <div className="quote-steps__list">
          {quote_steps.map((step, idx) => (
            <div
              key={step?.id}
              className={`quote-steps__item${idx % 2 !== 0 ? " quote-steps__item--reverse" : ""}`}
            >
              <div className="quote-steps__body">
                <span className="quote-steps__badge">
                  {"Step " + step?.order_no}
                </span>
                <Heading as="h3" className="quote-steps__name">
                  {step?.title}
                </Heading>
                <Paragraph className="quote-steps__desc">
                  {" "}
                  <Text string={step?.txt1} />
                </Paragraph>
              </div>

              <div className="quote-steps__media">
                <img src={cmsFileUrl(step?.image)} alt={step?.title} />
              </div>
            </div>
          ))}
        </div>
      </Contain>
    </Section>
  );
}
