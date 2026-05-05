import Head from "next/head";
import HeroSection from "../components/HeroSection";
import HowItWorksSection from "../components/HowItWorksSection";
import ComparisonSection from "../components/ComparisonTableSection";
import TipsSection from "../components/TipsSection";
import CtaSection from "../components/CtaSection";
import TestimonialsSection from "../components/TestimonialsSection";

import http from "@/helpers/http";
import { parse } from "cookie";
import { doObjToFormData } from "@/helpers/helpers";
import MetaGenerator from "@/components/meta-generator";
import Text from "@/components/text";

export const getServerSideProps = async (context) => {
  const { req } = context;
  const cookieHeader = req.headers.cookie || "";
  const cookieValue = parse(cookieHeader);
  const authToken =
    cookieValue["authToken"] !== undefined &&
    cookieValue["authToken"] !== null &&
    cookieValue["authToken"] !== ""
      ? cookieValue["authToken"]
      : "";

  const result = await http
    .post("home-page", doObjToFormData({ token: authToken }))
    .then((response) => response.data)
    .catch((error) => error.response.data.message);

  return { props: { result } };
};

export default function Final({ result }) {
  let {
    meta_desc,
    page_title,
    content,
    site_settings,
    comparisons,
    testimonials,
  } = result;
  return (
    <>
      <MetaGenerator
        page_title={page_title + " - " + site_settings?.site_name}
        meta_desc={meta_desc}
      />
      <main id="home__page">
        <HeroSection content={content} />
        <HowItWorksSection content={content} />
        <ComparisonSection
          page={"home"}
          content={content}
          comparisons={comparisons}
        />
        <TipsSection content={content} />
        <CtaSection page={"home"} content={content} />
        <TestimonialsSection
          page={"home"}
          content={content}
          testimonials={testimonials}
        />
      </main>
    </>
  );
}
