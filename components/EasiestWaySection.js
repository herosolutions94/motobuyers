import { useState } from "react";
import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Text from "./text";
import { cmsFileUrl } from "@/helpers/helpers";

export default function EasiestWaySection({ content }) {
  const CARDS = [2, 3, 4];
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i === 0 ? CARDS.length - 1 : i - 1));

  const next = () => setActive((i) => (i === CARDS.length - 1 ? 0 : i + 1));

  return (
    <Section id="easiest-way">
      <Contain>
        <div className="easiest__header">
          <Heading as="h2" className="easiest__title">
            {content?.section2_heading}
          </Heading>
          <Paragraph className="easiest__subtitle">
            <Text string={content?.section2_text} />
          </Paragraph>
        </div>

        {/* Desktop grid — shows 3 at a time */}
        <div className="easiest__grid">
          {/* {CARDS.slice(0, 3).map((card, idx) => ( */}
          {CARDS.map((i) => (
            <div key={i} className="easiest__card">
              <div className="easiest__icon">
                <img
                  src={cmsFileUrl(content?.[`image${i}`])}
                  alt={content?.[`sec2_card_heading${i}`]}
                />
              </div>
              <Heading as="h3" className="easiest__card-title">
                {content?.[`sec2_card_heading${i}`]}
              </Heading>
              <Paragraph className="easiest__card-desc">
                {content?.[`sec2_card_text${i}`]}
              </Paragraph>
            </div>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="easiest__carousel">
          <div className="easiest__track">
            {CARDS.map((i, index) => (
              <div
                key={i}
                className={`easiest__slide${active === index ? " easiest__slide--active" : ""}`}
              >
                <div className="easiest__card">
                  <div className="easiest__icon">
                    <img
                      src={cmsFileUrl(content?.[`image${i}`])}
                      alt={content?.[`sec2_card_heading${i}`]}
                    />
                  </div>
                  <Heading as="h3" className="easiest__card-title">
                    {content?.[`sec2_card_heading${i}`]}
                  </Heading>
                  <Paragraph className="easiest__card-desc">
                    {content?.[`sec2_card_text${i}`]}
                  </Paragraph>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {CARDS.length > 3 && (
          <div
            className="easiest__dots"
            role="tablist"
            aria-label="Slide navigation"
          >
            {CARDS.map((_, i) => (
              <button
                key={i}
                className={`easiest__dot${active === i ? " easiest__dot--active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                role="tab"
                aria-selected={active === i}
              />
            ))}
          </div>
        )}
      </Contain>
    </Section>
  );
}
