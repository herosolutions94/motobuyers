import Section from "./section";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Text from "./text";

export default function PageHeroBanner({ content }) {
  return (
    <Section id="page-hero-banner">
      <Contain>
        <div className="page-hero-banner__content">
          <Heading className="page-hero-banner__title main__heading">
            {content?.banner_heading}
          </Heading>
          {content?.banner_text && (
            <Paragraph className="page-hero-banner__subtitle">
              {/* {subtitle} */}
              <Text string={content?.banner_text} />
            </Paragraph>
          )}
        </div>
      </Contain>
      <div className="page-hero-banner__wave"></div>
    </Section>
  );
}
