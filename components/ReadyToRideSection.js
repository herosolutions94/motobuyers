import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";
import Link from "next/link";

export default function ReadyToRideSection({ content }) {
  return (
    <Section id="ready-to-ride">
      <Contain>
        <div className="ready-to-ride__inner">
          <div className="ready-to-ride__text">
            <Heading className="ready-to-ride__title">
              {content?.section4_heading}
            </Heading>
            <Paragraph className="ready-to-ride__desc">
              <Text string={content?.section4_text} />
            </Paragraph>
            <div className="cta__btn_wrap ready-to-ride__btns">
              <Link
                href={
                  content?.section4_btn1_link ? content.section4_btn1_link : "/"
                }
                className="cta__btn cta__btn--primary"
                type="button"
              >
                {content?.section4_btn1_txt}
              </Link>
              <Link
                href={
                  content?.section4_btn2_link ? content.section4_btn2_link : "/"
                }
                className="cta__btn cta__btn--dark"
                type="button"
              >
                {content?.section4_btn2_txt}
              </Link>
            </div>
          </div>
          <div className="ready-to-ride__visual">
            <img src={cmsFileUrl(content?.image5)} alt="Motorcycles" />
          </div>
        </div>
      </Contain>
    </Section>
  );
}
