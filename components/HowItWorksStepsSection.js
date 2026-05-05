import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";

import Image from "next/image";

import http from "@/helpers/http";
import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";

export default function HowItWorksStepsSection({ content, all_steps }) {
  return (
    <>
      <Section id="hiw-steps">
        <Contain>
          <Heading className="hiw-steps__heading">
            {content?.section1_heading}
          </Heading>
          <div className="hiw-steps__list">
            {all_steps.map((step, idx) => (
              <div
                key={step?.id}
                className={`hiw-steps__item ${idx % 2 !== 0 ? "hiw-steps__item--reverse" : ""}`}
              >
                <div className="hiw-steps__body">
                  <div className="hiw-steps__content">
                    <div className="hiw-steps__badge">0{step?.order_no}</div>
                    <Heading
                      as="h3"
                      className="hiw-steps__title !mb-0 !ps-[1rem]"
                    >
                      {step?.title}
                    </Heading>
                  </div>
                  <Paragraph className="hiw-steps__desc">
                    <Text string={step?.txt1} />
                  </Paragraph>
                </div>
                <div className="hiw-steps__media">
                  <img src={cmsFileUrl(step?.image)} alt={step?.title} />
                </div>
              </div>
            ))}
          </div>
        </Contain>
      </Section>
    </>
  );
}
