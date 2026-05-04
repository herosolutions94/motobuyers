import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Section from "./section";

import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";
import Link from "next/link";

export default function ComparisonSection({ content, comparisons }) {
  const features = [
    {
      icon: "/images/cmp-icon-1.svg",
      label: "Get an offer in minutes",
      motoBuyers: true,
      privateSale: false,
    },
    {
      icon: "/images/cmp-icon-2.svg",
      label: "We handle Paperwork",
      motoBuyers: true,
      privateSale: false,
    },
    {
      icon: "/images/cmp-icon-3.svg",
      label: "Secure transactions",
      motoBuyers: true,
      privateSale: "maybe",
    },
    {
      icon: "/images/cmp-icon-4.svg",
      label: "Will try to beat other offers",
      motoBuyers: true,
      privateSale: false,
    },
    {
      icon: "/images/cmp-icon-5.svg",
      label: "Transparent quote process",
      motoBuyers: true,
      privateSale: false,
    },
    {
      icon: "/images/cmp-icon-6.svg",
      label: "Full customer support",
      motoBuyers: true,
      privateSale: false,
    },
  ];

  return (
    <>
      <Section id="compare">
        <div
          className="compare__bg"
          style={{
            backgroundImage: "url(/images/buyer_sale_background.png)",
          }}
        ></div>
        <Contain>
          <div className="content text-center !mb-[5rem]">
            <Heading className="main__heading">
              <Text string={content?.section1_heading} />
            </Heading>
            <Paragraph className="cmp__subtitle">
              <Text string={content?.section1_text} />
            </Paragraph>
          </div>
          <div className="compare_image">
            <img
              src={cmsFileUrl(content?.image1, "images")}
              alt={content?.section1_heading}
            />
          </div>
          <div className="cmp__inner">
            <div
              className="cmp__table"
              role="table"
              aria-label="Feature comparison table"
            >
              {/* Header */}
              <div className="cmp__head" role="row">
                <div
                  className="cmp__head-cell cmp__head-cell--feat"
                  role="columnheader"
                >
                  Features
                </div>
                <div
                  className="cmp__head-cell cmp__head-cell--moto"
                  role="columnheader"
                >
                  Moto Buyers
                </div>
                <div
                  className="cmp__head-cell cmp__head-cell--priv"
                  role="columnheader"
                >
                  Private Sale
                </div>
              </div>

              {/* Rows */}
              {comparisons.map((feature, idx) => (
                <div key={idx} className="cmp__row" role="row">
                  <div className="cmp__feat" role="cell">
                    <img
                      src={cmsFileUrl(feature?.image, "images")}
                      alt={feature?.title}
                      className="cmp__feat-icon"
                      aria-hidden="true"
                    />
                    <span className="cmp__feat-label">
                      <Text string={feature?.title} />
                    </span>
                  </div>
                  <div className="cmp__cell cmp__cell--highlight" role="cell">
                    {feature.motoBuyers ? (
                      <img
                        src="/images/icon-check.svg"
                        alt="Yes"
                        className="cmp__check"
                      />
                    ) : null}
                  </div>
                  <div className="cmp__cell" role="cell">
                    {feature.privateSale === true ? (
                      <img
                        src="/images/icon-check.svg"
                        alt="Yes"
                        className="cmp__check"
                      />
                    ) : feature.privateSale === "maybe" ? (
                      <span className="cmp__maybe">May be</span>
                    ) : (
                      <img
                        src="/images/icon-cross.svg"
                        alt="No"
                        className="cmp__cross"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Contain>
      </Section>
    </>
  );
}
