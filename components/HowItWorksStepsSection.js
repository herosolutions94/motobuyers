import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";

import Image from "next/image";

import http from "@/helpers/http";
import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";

const steps = [
  {
    num: "01",
    title: "Tell Us About Your Motorcycle",
    desc: "Start by giving us a few key details about your motorcycle, like the year, make, model & mileage.",
    img: "/images/hiw-step-1.svg",
    alt: "Tell us about your motorcycle",
  },
  {
    num: "02",
    title: "Get a Personalized Offer",
    desc: "Once we have your info, one of our expert appraisers will evaluate your bike and send you a customized offer.",
    img: "/images/hiw-step-2.svg",
    alt: "Get a personalized offer",
  },
  {
    num: "03",
    title: "Schedule a Visit",
    desc: "Just make an appointment and ride on in! Our offer are good for 10 days.",
    img: "/images/hiw-step-3.svg",
    alt: "Schedule a visit",
  },
  {
    num: "04",
    title: "Get Paid",
    desc: "We'll do a quick on-site review to make sure everything checks out. Then we'll pay you on the spot, it's that easy!",
    img: "/images/hiw-step-4.svg",
    alt: "Get paid",
  },
];

export default function HowItWorksStepsSection({ content, all_steps }) {
  return (
    <>
      <Section id="hiw-steps">
        <Contain>
          <Heading className="hiw-steps__heading">
            <Text string={content?.section1_heading} />
          </Heading>
          <div className="hiw-steps__list">
            {all_steps.map((step, idx) => (
              <div
                key={step?.order_no}
                className={`hiw-steps__item ${idx % 2 !== 0 ? "hiw-steps__item--reverse" : ""}`}
              >
                <div className="hiw-steps__body">
                  <div className="hiw-steps__content">
                    <div className="hiw-steps__badge">0{step?.order_no}</div>
                    <Heading
                      as="h3"
                      className="hiw-steps__title !mb-0 !ps-[1rem]"
                    >
                      <Text string={step?.title} />
                    </Heading>
                  </div>
                  <Paragraph className="hiw-steps__desc">
                    <Text string={step?.txt1} />
                  </Paragraph>
                </div>
                <div className="hiw-steps__media">
                  <img
                    src={cmsFileUrl(step?.image, "images")}
                    alt={step?.title}
                  />
                </div>
              </div>
            ))}
          </div>
        </Contain>
      </Section>
    </>
  );
}