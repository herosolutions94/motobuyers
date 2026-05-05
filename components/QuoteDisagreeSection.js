import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Text from "./text";
import { cmsFileUrl } from "@/helpers/helpers";

const CARDS = [
  {
    title: "Book Value Isn't Everything",
    desc: "Some people might believe their motorcycle is worth more based on online \"book values.\" While those numbers can be helpful as a general guide, they don't account for local market conditions, your bike's actual condition, or current demand.",
    icon: "/images/quote-offer-1.png",
  },
  {
    title: "Your Loan Balance vs. Bike Value",
    desc: "Still paying off your motorcycle? It's important to understand that your loan balance doesn't determine your bike's value. What you owe and what your bike is worth are two entirely separate figures.",
    icon: "/images/quote-offer-2.png",
  },
  {
    title: "Wishing for More?",
    desc: "It's natural to hope for the highest possible amount when selling your motorcycle. Some sellers think they can get more through private sales, but that comes with more time, effort, and uncertainty.",
    icon: "/images/quote-offer-3.png",
  },
];

export default function QuoteDisagreeSection({ content }) {
  const CARDS = [1, 2, 3];

  return (
    <Section id="quote-disagree">
      <div className="quote-disagree__wave"></div>
      <Contain>
        <div className="disagree__header">
          <Heading as="h2" className="disagree__title">
            {content?.section2_heading}
          </Heading>
          <Paragraph className="disagree__subtitle">
            <Text string={content?.section2_text} />
          </Paragraph>
        </div>
        <div className="disagree__cards">
          {CARDS.map((i) => (
            <div key={i} className="disagree__card">
              <div className="disagree__icon">
                <img
                  src={cmsFileUrl(content?.[`image${i}`])}
                  alt={content?.[`sec2_card_heading${i}`]}
                />
              </div>
              <Heading as="h3" className="disagree__card-title">
                {content?.[`sec2_card_heading${i}`]}
              </Heading>
              <Paragraph className="disagree__card-desc">
                {content?.[`sec2_card_text${i}`]}
              </Paragraph>
            </div>
          ))}
        </div>
      </Contain>
    </Section>
  );
}
