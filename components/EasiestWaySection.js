import { useState } from "react";
import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";

import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";

export default function EasiestWaySection({ content }) {
  const [active, setActive] = useState(0);

  const items = [2, 3, 4];

  const CARDS = items.map((i) => ({
    title: content?.[`sec2_card_heading${i}`],
    desc: content?.[`sec2_card_text${i}`],
    icon: cmsFileUrl(content?.[`image${i}`]),
  }));

  const prev = () => setActive((i) => (i === 0 ? CARDS.length - 1 : i - 1));

  const next = () => setActive((i) => (i === CARDS.length - 1 ? 0 : i + 1));

  return (
    <Section id="easiest-way">
      <Contain>
        <div className="easiest__header">
          <Heading as="h2" className="easiest__title">
            <Text string={content?.section2_heading} />
          </Heading>

          <Paragraph className="easiest__subtitle">
            <Text string={content?.section2_text} />
          </Paragraph>
        </div>

        {/* Desktop grid */}
        <div className="easiest__grid">
          {CARDS.slice(0, 3).map((card, idx) => (
            <div key={`desktop-${idx}`} className="easiest__card">
              <div className="easiest__icon">
                <img src={card.icon} alt={card.title} />
              </div>

              <Heading as="h3" className="easiest__card-title">
                {card.title}
              </Heading>

              <Paragraph className="easiest__card-desc">
                {card.desc?.length > 120
                  ? card.desc.slice(0, 120) + "........"
                  : card.desc}
              </Paragraph>
            </div>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="easiest__carousel">
          <div className="easiest__track">
            {CARDS.map((card, idx) => (
              <div
                key={`mobile-${idx}`}
                className={`easiest__slide${
                  active === idx ? " easiest__slide--active" : ""
                }`}
              >
                <div className="easiest__card">
                  <div className="easiest__icon">
                    <img src={card.icon} alt={card.title} />
                  </div>

                  <Heading as="h3" className="easiest__card-title">
                    {card.title}
                  </Heading>

                  <Paragraph className="easiest__card-desc">
                    {card.desc?.length > 120
                      ? card.desc.slice(0, 120) + "........"
                      : card.desc}
                  </Paragraph>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div
          className="easiest__dots"
          role="tablist"
          aria-label="Slide navigation"
        >
          {CARDS.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              className={`easiest__dot${
                active === idx ? " easiest__dot--active" : ""
              }`}
              onClick={() => setActive(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              role="tab"
              aria-selected={active === idx}
            />
          ))}
        </div>
      </Contain>
    </Section>
  );
}
