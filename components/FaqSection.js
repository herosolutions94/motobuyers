import { useState } from "react";
import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Text from "./text";

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq__item${open ? " faq__item--open" : ""}`}>
      <button className="faq__question" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <span className="faq__icon">
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 15l7-7 7 7"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 9l-7 7-7-7"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </button>
      {open && (
        <p className="faq__answer">
          {" "}
          <Text string={answer} />
        </p>
      )}
    </div>
  );
}

export default function FaqSection({ FAQ_GROUPS }) {
  return (
    <Section id="faq">
      <Contain>
        {FAQ_GROUPS.map((group) => (
          <div key={group.groupTitle} className="faq__group">
            <Heading as="h2" className="faq__group-title">
              {group.groupTitle}
            </Heading>
            <div className="faq__list">
              {group.items.map((item) => (
                <FaqItem key={item.question} {...item} />
              ))}
            </div>
          </div>
        ))}
      </Contain>
    </Section>
  );
}
