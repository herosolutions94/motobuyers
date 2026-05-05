import Link from "next/link";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Section from "./section";
import { cmsFileUrl } from "@/helpers/helpers";
import Text from "./text";

export default function CtaSection({ page, content }) {
  let heading = "";
  let text = "";

  if (page === "home" || page === "tips") {
    heading = content?.section4_heading;
    text = content?.section4_text;
  } else if (page === "quote") {
    heading = content?.section3_heading;
    text = content?.section3_text;
  } else {
    heading = "Ready to sell your motorcycle the smart way?";
    text =
      "Whether you've got questions or you're ready toet started, we're here to help.";
  }

  let btn1Text = "";
  let btn1Link = "";
  let btn2Text = "";
  let btn2Link = "";
  let btn3Text = "";
  let btn3Link = "";

  if (page === "home" || page === "tips") {
    btn1Text = content?.section4_btn1_txt;
    btn1Link = content?.section4_btn1_link;

    btn2Text = content?.section4_btn2_txt;
    btn2Link = content?.section4_btn2_link;

    btn3Text = content?.section4_btn3_txt;
    btn3Link = content?.section4_btn3_link;
  } else {
    btn1Text = content?.section3_btn1_txt;
    btn1Link = content?.section3_btn1_link;

    btn2Text = content?.section3_btn2_txt;
    btn2Link = content?.section3_btn2_link;

    btn3Text = content?.section3_btn3_txt;
    btn3Link = content?.section3_btn3_link;
  }

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
              <Heading className="main__heading">{heading}</Heading>
              <Paragraph className="cta__desc">
                <Text string={text} />
              </Paragraph>
              <div className="cta__btn_wrap !mt-[3rem]">
                <Link
                  href={btn1Link || "/"}
                  className="cta__btn cta__btn--primary"
                >
                  {btn1Text}
                </Link>

                <Link
                  href={btn2Link || "/"}
                  className="cta__btn cta__btn--dark"
                >
                  {btn2Text}
                </Link>

                <Link
                  href={btn3Link || "/"}
                  className="cta__btn cta__btn--white"
                >
                  {btn3Text}
                </Link>
              </div>
              {/* <div className="cta__btn_wrap !mt-[3rem]">
                <Link
                  href={
                    content?.section4_btn1_link
                      ? content.section4_btn1_link
                      : "/"
                  }
                  className="cta__btn cta__btn--primary"
                >
                  {content?.section4_btn1_txt}
                </Link>
                <Link
                  href={
                    content?.section4_btn2_link
                      ? content.section4_btn2_link
                      : "/"
                  }
                  className="cta__btn cta__btn--dark"
                >
                  {content?.section4_btn2_txt}
                </Link>
                <Link
                  href={
                    content?.section4_btn3_link
                      ? content.section4_btn3_link
                      : "/"
                  }
                  className="cta__btn cta__btn--white"
                >
                  {content?.section4_btn3_txt}
                </Link>
              </div> */}
            </div>
            <div className="cta__visual">
              {/* <img src="/images/moto__app.png" alt="" /> */}
              {/* <img
                src={cmsFileUrl(
                  page === "home" ? content?.image16 : content?.image4,
                )}
                alt="moto__app"
              /> */}
              <img
                src={cmsFileUrl(
                  page === "home"
                    ? content?.image16
                    : page === "tips"
                      ? content?.image4
                      : content?.image4,
                )}
                alt="moto__app"
              />
            </div>
          </div>
        </Contain>
      </Section>
    </>
  );
}
