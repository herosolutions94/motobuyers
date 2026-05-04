import { cmsFileUrl } from "@/helpers/helpers";
import Contain from "./contain";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Section from "./section";
import Text from "./text";

export default function ComparisonSection({ content, comparisons }) {
  return (
    <>
      <Section id="compare">
        <div
          className="compare__bg"
          style={{
            backgroundImage: "url(/images/buyer_sale_background.png)",
          }}
          // style={{ backgroundImage: `url(${cmsFileUrl(content?.image9)})` }}
        ></div>
        <Contain>
          <div className="content text-center !mb-[5rem]">
            <Heading className="main__heading">
              {content?.section2_heading}
            </Heading>
            <Paragraph className="cmp__subtitle">
              <Text string={content?.section2_text} parse={true} />
            </Paragraph>
          </div>
          <div className="compare_image">
            <img src={cmsFileUrl(content?.image10)} alt="Motorcycles" />
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
              {comparisons?.map((item, idx) => {
                const renderStatus = (value) => {
                  if (value === "yes" || value === "Yes") {
                    return (
                      <img
                        src="/images/icon-check.svg"
                        alt="Yes"
                        className="cmp__check"
                      />
                    );
                  }

                  if (value === "no" || value === "No") {
                    return (
                      <img
                        src="/images/icon-cross.svg"
                        alt="No"
                        className="cmp__cross"
                      />
                    );
                  }

                  // show actual value (e.g. "May be", "Maybe", "pending", etc.)
                  return <span className="cmp__maybe">{value}</span>;
                };
                return (
                  <div key={item.id ?? idx} className="cmp__row" role="row">
                    <div className="cmp__feat" role="cell">
                      <img
                        src={cmsFileUrl(item.image)}
                        alt=""
                        className="cmp__feat-icon"
                        aria-hidden="true"
                      />
                      <span className="cmp__feat-label">{item.title}</span>
                    </div>

                    {/* Moto Buyers (txt1) */}
                    <div className="cmp__cell cmp__cell--highlight" role="cell">
                      {renderStatus(item.txt1)}
                    </div>

                    {/* Private Sale (txt2) */}
                    <div className="cmp__cell" role="cell">
                      {renderStatus(item.txt2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Contain>
      </Section>
    </>
  );
}
