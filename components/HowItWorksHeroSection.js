import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Image from "next/image";

import http from "@/helpers/http";
import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";

export default function HowItWorksHeroSection({ content }) {
  return (
    <>
      <Section id="hiw-hero">
        <div
          className="hiw-hero__bg"
          style={{ backgroundImage: "url(/images/hiw-hero__bg.png)" }}
        ></div>
        <Contain>
          <div className="hiw-hero__images">
            <img
              src={cmsFileUrl(content?.image1, "images")}
              alt={content?.banner_heading}
            />
          </div>
          <div className="hiw-hero__content">
            <Heading className="hiw-hero__title">
              <Text string={content?.banner_heading} />
            </Heading>
            <Paragraph className="hiw-hero__subtitle">
              <Text string={content?.banner_text} />
            </Paragraph>
          </div>
        </Contain>
      </Section>
    </>
  );
}