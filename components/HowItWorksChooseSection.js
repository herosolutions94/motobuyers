import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Section from "./section";

import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";

export default function HowItWorksChooseSection({ content }) {
  const items = [2, 3, 4, 5];

  return (
    <>
      <Section id="why-choose">
        <div
          className="why-choose__bg"
          style={{
            backgroundImage: "url(/images/why_choose_us_background.png)",
          }}
        ></div>

        <Contain>
          <div className="content text-center !mb-[4rem]">
            <Heading className="main__heading">
              <Text string={content?.section2_heading} />
            </Heading>

            <Paragraph className="why__subtitle">
              <Text string={content?.section2_text} />
            </Paragraph>
          </div>

          <div className="why__grid">
            {items.map((i) => (
              <div key={`feature-${i}`} className="why__card">
                <img
                  src={cmsFileUrl(content?.[`image${i}`])}
                  alt={content?.[`sec2_card_heading${i}`] || `image${i}`}
                  className="why__icon"
                />

                <Heading as="h4" className="why__title">
                  {content?.[`sec2_card_heading${i}`]}
                </Heading>

                <Paragraph className="why__desc">
                  {content?.[`sec2_card_text${i}`]}
                </Paragraph>
              </div>
            ))}
          </div>
        </Contain>
      </Section>
    </>
  );
}
