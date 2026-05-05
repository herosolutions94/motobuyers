import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Section from "./section";
import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";

export default function VisitTipsSection({ content }) {
  const cards = [1, 2, 3];

  return (
    <Section id="visit-tips">
      <Contain>
        <div className="visit-tips__grid">
          {/* Top-left: text only */}
          <div className="visit-tips__text">
            <Heading as="h2" className="visit-tips__title">
              {content?.section2_heading}
            </Heading>
            <Paragraph className="visit-tips__desc">
              <Text string={content?.section2_text} />
            </Paragraph>
          </div>

          {/* Top-right: card 1 */}
          {cards.map((i) => (
            <div key={i} className="visit-tips__card">
              <img
                src={cmsFileUrl(content?.[`image${i}`])}
                alt={`cards_image${i}`}
                className="visit-tips__icon"
                aria-hidden="true"
              />
              <div className="visit-tips__card-body">
                <Heading as="h4" className="visit-tips__card-title">
                  {content?.[`sec2_card_heading${i}`]}
                </Heading>
                <Paragraph className="visit-tips__card-desc">
                  {content?.[`sec2_card_text${i}`]}
                </Paragraph>
              </div>
            </div>
          ))}
        </div>
      </Contain>
    </Section>
  );
}
