import { useState } from "react";
import Section from "./section";
import Heading from "./heading";
import Paragraph from "./paragraph";
import Contain from "./contain";
import { formatDate } from "@/helpers/helpers";

import Text from "@/components/text";
import { cmsFileUrl } from "@/helpers/helpers";
import Link from "next/link";

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

export default function TestimonialsSection({ page, content, testimonials }) {
  const [currentPage, setCurrentPage] = useState(0);
  // const testimonials = [
  //   {
  //     name: "Samarth Asthana",
  //     review:
  //       "Sold my bike in less than 24 hours! The offer was fair and the process was smooth.",
  //     avatar: "test__avatar--blue",
  //     date: "3 weeks ago",
  //     rating: 5,
  //   },
  //   {
  //     name: "Linda M",
  //     review:
  //       "Highly recommend. I didn't have to worry about paperwork or meeting strangers.",
  //     avatar: "test__avatar--purple",
  //     date: "3 weeks ago",
  //     rating: 5,
  //   },
  //   {
  //     name: "James R",
  //     review:
  //       "Way easier than listing it myself. Quick appraisal, honest pricing, and no tire-kickers!",
  //     avatar: "test__avatar--green",
  //     date: "3 weeks ago",
  //     rating: 5,
  //   },
  // ];

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
                        {/* <svg
                          className="test__google-icon"
                          viewBox="0 0 24 24"
                          aria-label="Google"
                          role="img"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg> */}
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
            </div>

            {/* <div
              className="test__pagination"
              role="navigation"
              aria-label="Testimonial navigation"
            >
              <button
                className="test__page-btn test__page-btn--prev"
                aria-label="Previous testimonials"
              >
                <svg
                  className="test__page-icon"
                  viewBox="0 0 19 19"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 4L7 9.5L12 15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                className="test__page-btn test__page-btn--next"
                aria-label="Next testimonials"
              >
                <svg
                  className="test__page-icon"
                  viewBox="0 0 19 19"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 4L12 9.5L7 15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div> */}
          </div>
        </Contain>
      </Section>
    </>
  );
}
