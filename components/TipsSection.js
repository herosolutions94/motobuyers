import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Section from "./section";
import Text from "./text";
import { cmsFileUrl } from "@/helpers/helpers";
import Link from "next/link";

export default function TipsSection({ content }) {
  const tips = [12, 13, 14, 15];
  return (
    <>
      <Section id="tips">
        <div
          className="tips__bg"
          style={{
            backgroundImage: "url(/images/personalize_offer_background.png)",
          }}
        ></div>
        <Contain>
          <div className="content text-center !mb-[4rem]">
            <Heading className="main__heading !mb-[2rem]">
              {content?.section3_heading}
            </Heading>
            <Paragraph className="tips__subtitle">
              <Text string={content?.section3_text} />
            </Paragraph>
          </div>
          <div className="tips__grid">
            {/* {tips.map((tip, idx) => ( */}
            {tips.map((i) => (
              <div key={i} className="tips__card">
                <img
                  src={cmsFileUrl(content?.[`image${i}`])}
                  alt={`tips_image${i}`}
                  className="tips__card-img"
                  aria-hidden="true"
                />
                <div className="tips__card-body">
                  <p className="tips__card-label">
                    {content?.[`sec3_card_heading${i}`]}
                  </p>
                  <p className="tips__card-desc">
                    {content?.[`sec3_card_text${i}`]}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="cta__btn_wrap justify-center">
            <Link
              href={
                content?.section3_btn_link ? content.section3_btn_link : "/"
              }
              className="cta__btn"
              type="button"
            >
              {content?.section3_btn_txt}
            </Link>
          </div>
        </Contain>
      </Section>
    </>
  );
}
