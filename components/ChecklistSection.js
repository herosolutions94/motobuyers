import Link from "next/link";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Section from "./section";
import { cmsFileUrl } from "@/helpers/helpers";
import Text from "@/components/text";

export default function ChecklistSection({ content, appointment_tips }) {
  console.log("appointment_tips", appointment_tips);

  return (
    <Section id="checklist">
      <Contain>
        <div className="checklist__header">
          <Heading as="h2" className="checklist__title">
            {content?.section1_heading}
          </Heading>
          <Link
            href={content?.section1_btn_link ? content.section1_btn_link : "/"}
            className="cta__btn cta__btn--primary"
          >
            {content?.section1_btn_txt}
          </Link>
        </div>

        <div className="checklist__grid">
          {appointment_tips.map((item, idx) => (
            <div key={idx} className="checklist__card">
              <img
                src={cmsFileUrl(item?.image)}
                alt={item?.title}
                className="checklist__icon"
                aria-hidden="true"
              />
              <Heading as="h4" className="checklist__card-title">
                {item?.title}
              </Heading>
              <Paragraph className="checklist__card-desc">
                <Text string={item?.txt1} />
              </Paragraph>
            </div>
          ))}
        </div>
      </Contain>
    </Section>
  );
}
