import { useState } from "react";
import Slider from "react-slick";
import Section from "./section";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Contain from "./contain";
import { formatDate } from "@/helpers/helpers";

import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";

const avatarColors = [
  "test__avatar--green",
  "test__avatar--purple",
  "test__avatar--blue",
];

const getAvatarColor = (name = "") => {
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    avatarColors.length;

  return avatarColors[index];
};

export default function TestimonialsSection({
  page,
  content,
  testimonials = [],
}) {
  const [currentPage, setCurrentPage] = useState(0);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    // adaptiveHeight: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    beforeChange: (_, next) => setCurrentPage(next),
  };

  let heading = "";
  let text = "";

  if (page === "home") {
    heading = content?.section5_heading;
    text = content?.section5_text;
  } else if (page === "work") {
    heading = content?.section4_heading;
    text = content?.section4_text;
  } else if (page === "tips") {
    heading = content?.section5_heading;
    text = content?.section5_text;
  } else {
    heading = "Trusted by Real Riders";
    text =
      "Thousands of motorcycle owners have trusted MotoBuyers for a fast, fair, and hassle-free selling experience. Don't just take our word for it — see what real riders are saying!";
  }

  return (
    <>
      <Section id="testimonials">
        <Contain>
          <div className="content text-center max-w-[73rem] !mx-[auto] !mb-[4rem]">
            <Heading className="main__heading"> {heading}</Heading>
            <Paragraph className="test__subtitle !mt-[2rem]">
              <Text string={text} />
            </Paragraph>
          </div>
          <div className="test__inner">
            <div className="test__cards">
              <Slider {...sliderSettings}>
                {testimonials.map((testimonial, idx) => (
                  <div key={idx} className="test__card">
                    <div
                      className={`test__avatar ${
                        testimonial?.image
                          ? ""
                          : getAvatarColor(testimonial?.name)
                      }`}
                      aria-label="User avatar"
                      role="img"
                    >
                      {testimonial?.image ? (
                        <img
                          src={cmsFileUrl(testimonial?.image, "testimonials")}
                          alt={testimonial?.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="test__avatar-initials">
                          {(testimonial?.name || "User")
                            .split(" ")
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="test__card-data">
                      <div className="test__card-name">
                        <Text string={testimonial?.name} />
                      </div>
                      <Paragraph className="test__card-review">
                        <Text string={testimonial?.message} />
                      </Paragraph>
                      <div className="test__card-footer">
                        <div className="test__card-meta">
                          <span className="test__date">
                            {formatDate(testimonial?.created_at)}
                          </span>
                        </div>
                        <div
                          className="test__stars"
                          aria-label={`${testimonial?.ratings || 0} out of 5 stars`}
                        >
                          {Array.from({ length: 5 }, (_, i) => {
                            const rating = Number(testimonial?.ratings) || 0;

                            if (i < Math.floor(rating)) {
                              // Full star
                              return (
                                <svg
                                  key={i}
                                  className="test__star"
                                  viewBox="0 0 22 21"
                                  fill="#FFD700"
                                >
                                  <path d="M11 1l2.7 8.3H22l-7 5.1 2.7 8.2L11 17.5l-6.7 5.1 2.7-8.2-7-5.1h8.3z" />
                                </svg>
                              );
                            }

                            if (i < rating) {
                              // Half star
                              return (
                                <svg
                                  key={i}
                                  className="test__star"
                                  viewBox="0 0 22 21"
                                >
                                  <defs>
                                    <linearGradient id={`halfGrad-${i}`}>
                                      <stop offset="50%" stopColor="#FFD700" />
                                      <stop offset="50%" stopColor="#E5E7EB" />
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d="M11 1l2.7 8.3H22l-7 5.1 2.7 8.2L11 17.5l-6.7 5.1 2.7-8.2-7-5.1h8.3z"
                                    fill={`url(#halfGrad-${i})`}
                                  />
                                </svg>
                              );
                            }

                            // Empty star
                            return (
                              <svg
                                key={i}
                                className="test__star"
                                viewBox="0 0 22 21"
                                fill="#E5E7EB"
                              >
                                <path d="M11 1l2.7 8.3H22l-7 5.1 2.7 8.2L11 17.5l-6.7 5.1 2.7-8.2-7-5.1h8.3z" />
                              </svg>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </Contain>
      </Section>
    </>
  );
}
