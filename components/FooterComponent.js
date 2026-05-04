import Link from "next/link";
import Contain from "./contain";
import Heading from "./heading";
import {
  cmsFileUrl,
  makeExternalUrl,
  doObjToFormData,
} from "@/helpers/helpers";
import http from "@/helpers/http";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Text from "./text";

export default function FooterComponent({ siteSettings }) {
  const [IsFormProcessing, setIsFormProcessing] = useState(false);
  const date = new Date();
  let year = date.getFullYear();

  const {
    register,
    watch,
    reset,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm();
  const watchAllFields = watch();

  const handleSubscribe = async (frmData) => {
    setIsFormProcessing(true);

    try {
      const response = await http.post(
        "save-newsletter",
        doObjToFormData(frmData),
      );
      const data = response.data;

      if (data?.status === 1) {
        // toast.success(data?.msg);
        toast.success(<Text string={data?.msg} parse={true} />);

        setTimeout(() => {
          reset();
        }, 1000);
      } else {
        toast.error(<Text string={data?.msg} parse={true} />);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = error?.response?.data?.msg || "An error occurred";
      toast.error(<Text string={errorMsg} parse={true} />);
    } finally {
      setIsFormProcessing(false);
    }
  };
  return (
    <footer id="footer">
      <div
        className="footer__bg"
        style={{ backgroundImage: "url(/images/footer_background.png)" }}
      ></div>
      <Contain>
        <div className="footer__top">
          <div className="footer__col">
            <div className="footer__logo">
              {/* <img src="/images/footer_logo.png" alt="" /> */}
              <img
                src={cmsFileUrl(siteSettings?.site_logo2)}
                alt={siteSettings?.site_name}
              />
            </div>
            <div className="footer__contact">
              <div className="footer__contact-item">
                <img
                  src="/images/contact__map_pin.svg"
                  alt=""
                  className="footer__contact-icon"
                  aria-hidden="true"
                />
                <span>
                  {/* 7696 Broadway, Suite C<br />
                  Lemon Grove, CA 91945 */}
                  {siteSettings?.site_address}
                </span>
              </div>
              <div className="footer__contact-item">
                <img
                  src="/images/contact__phone.svg"
                  alt=""
                  className="footer__contact-icon"
                  aria-hidden="true"
                />
                <span>
                  <Link href={`tel:${siteSettings?.site_phone}`}>
                    {siteSettings?.site_phone}
                  </Link>
                </span>
              </div>
              <div className="footer__contact-item">
                <img
                  src="/images/contact__email.svg"
                  alt=""
                  className="footer__contact-icon"
                  aria-hidden="true"
                />
                <span>
                  <Link href={`mailto:${siteSettings?.site_email}`}>
                    {siteSettings?.site_email}
                  </Link>
                </span>
              </div>
            </div>
          </div>
          <div className="footer__col">
            <Heading as="h6" className="footer__col-title">
              Quick Links
            </Heading>
            <div className="footer__link_wrap">
              <Link href="/" className="footer__link">
                Home
              </Link>
            </div>
            <div className="footer__link_wrap">
              <Link href="/how-it-works" className="footer__link">
                How It Works
              </Link>
            </div>
            <div className="footer__link_wrap">
              <Link href="/compare-moto-buyers" className="footer__link">
                Compare Moto Buyers
              </Link>
            </div>
          </div>
          <div className="footer__col">
            <Heading as="h6" className="footer__col-title">
              More Links
            </Heading>
            <div className="footer__link_wrap">
              <Link href="/contact" className="footer__link">
                Contact Us
              </Link>
            </div>
            <div className="footer__link_wrap">
              <Link href="/faq" className="footer__link">
                FAQ
              </Link>
            </div>
            <div className="footer__link_wrap">
              <Link href="/appointment-tips" className="footer__link">
                Appointment Tips
              </Link>
            </div>
            {/* <div className="footer__link_wrap">
              <Link href="/our-appraisals" className="footer__link">
                Our Appraisals
              </Link>
            </div> */}
          </div>
          <div className="footer__col">
            <Heading as="h6" className="footer__col-title">
              Signup for Newsletters
            </Heading>
            <form
              className="footer__nl-form"
              // onSubmit={(e) => e.preventDefault()}
              method="POST"
              onSubmit={handleSubmit(handleSubscribe)}
              aria-label="Newsletter signup"
            >
              <div className="footer__nl-bg" aria-hidden="true"></div>
              <div className="footer__nl-send-bg" aria-hidden="true"></div>
              <input
                className="footer__nl-input"
                type="text"
                placeholder="Enter your email address"
                aria-label="Your email address"
                defaultValue={watchAllFields?.email}
                {...register("email", {
                  required: "Email is required.",
                  pattern: {
                    value:
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    message: "Please enter a valid email",
                  },
                })}
              />
              <button
                className="footer__nl-send-btn"
                type="submit"
                aria-label="Subscribe to newsletter"
                disabled={IsFormProcessing}
              >
                <svg
                  className="footer__nl-send-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polyline points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {IsFormProcessing && <i className="spinner"></i>}
              </button>
            </form>

            <div className="footer__follow">
              <p className="footer__follow-label">Follow Us</p>

              <div className="footer__social-row">
                {siteSettings?.site_facebook && (
                  <div className="footer__social-icon" aria-label="Facebook">
                    <Link
                      href={
                        siteSettings?.site_facebook
                          ? makeExternalUrl(siteSettings?.site_facebook)
                          : "#"
                      }
                      target="_blank"
                    >
                      <img src="/images/social__facebook.svg" alt="Facebook" />
                    </Link>
                  </div>
                )}
                {siteSettings?.site_instagram && (
                  <div className="footer__social-icon" aria-label="Instagram">
                    <Link
                      href={
                        siteSettings?.site_instagram
                          ? makeExternalUrl(siteSettings?.site_instagram)
                          : "#"
                      }
                      target="_blank"
                    >
                      <img
                        src="/images/social__instagram.svg"
                        alt="Instagram"
                      />
                    </Link>
                  </div>
                )}
                {siteSettings?.site_twitter && (
                  <div className="footer__social-icon" aria-label="Twitter / X">
                    <Link
                      href={
                        siteSettings?.site_twitter
                          ? makeExternalUrl(siteSettings?.site_twitter)
                          : "#"
                      }
                      target="_blank"
                    >
                      <img src="/images/social__twitter.svg" alt="Twitter" />
                    </Link>
                  </div>
                )}
                {siteSettings?.site_linkedin && (
                  <div className="footer__social-icon" aria-label="LinkedIn">
                    <Link
                      href={
                        siteSettings?.site_linkedin
                          ? makeExternalUrl(siteSettings?.site_linkedin)
                          : "#"
                      }
                      target="_blank"
                    >
                      <img src="/images/social__linkedin.svg" alt="LinkedIn" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <div className="footer__bottom-inner">
            <p className="footer__copyright">
              Copyright © {year}, {siteSettings?.site_copyright}{" "}
              <span className="brand">{siteSettings?.site_name}</span>
            </p>
          </div>
        </div>
      </Contain>
    </footer>
  );
}
