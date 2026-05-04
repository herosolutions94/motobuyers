import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Text from "./text";

export default function PageHeroBanner({ title, subtitle }) {
  return (
    <Section id="page-hero-banner">
      <Contain>
        <div className="page-hero-banner__content">
          <Heading className="page-hero-banner__title main__heading">
            {title}
          </Heading>
          {subtitle && (
            <Paragraph className="page-hero-banner__subtitle">
              {subtitle}
            </Paragraph>
          )}
        </div>
      </Contain>
      <div className="page-hero-banner__wave"></div>
    </Section>
  );
}
