import Link from "next/link";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Section from "./section";
import { cmsFileUrl } from "@/helpers/helpers";
import Text from "./text";


export default function CtaSection({content}) {
  return (
    <>
      <Section id="cta">
        <div
          className="cta__bg"
          style={{
            backgroundImage: "url(/images/moto_app_background.png)",
          }}
        ></div>
        <Contain>
          <div className="cta__inner">
            <div className="cta__text">
              <Heading className="main__heading">
                {content?.section4_heading}
              </Heading>
              <Paragraph className="cta__desc">
                <Text string={content?.section4_text} />
              </Paragraph>
              <div className="cta__btn_wrap !mt-[3rem]">
                <Link
                  href={content?.section4_btn1_link}
                  className="cta__btn cta__btn--primary"
                >
                  {content?.section4_btn1_txt}
                </Link>
                <Link
                  href={content?.section4_btn2_link}
                  className="cta__btn cta__btn--dark"
                >
                  {content?.section4_btn2_txt}
                </Link>
                <Link
                  href={content?.section4_btn3_link}
                  className="cta__btn cta__btn--white"
                >
                  {content?.section4_btn3_txt}
                </Link>
              </div>
            </div>
            <div className="cta__visual">
              {/* <img src="/images/moto__app.png" alt="" /> */}
               <img src={cmsFileUrl(content?.image16)} alt="moto__app" />
            </div>
          </div>
        </Contain>
      </Section>
    </>
  );
}
