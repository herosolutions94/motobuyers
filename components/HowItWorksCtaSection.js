import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Section from "./section";

import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";
import Link from "next/link";

export default function HowItWorksCtaSection({ content }) {
  return (
    <Section id="hiw-cta">
      <Contain>
        <div className="hiw-cta__inner">
          <div className="hiw-cta__text">
            <Heading className="hiw-cta__title">
              <Text string={content?.section3_heading} />
            </Heading>
            <Paragraph className="hiw-cta__desc">
              <Text string={content?.section3_text} />
            </Paragraph>
          </div>
          <div className="cta__btn_wrap">
            {/* <button className="cta__btn" type="button">
              <Text string={content?.section3_heading} />
            </button> */}

            <Link href={content?.section3_btn_link} className="cta__btn">
              <Text string={content?.section3_btn_txt} />
            </Link>
          </div>
        </div>
      </Contain>
      <div className="hiw-cta__wave"></div>
    </Section>
  );
}
