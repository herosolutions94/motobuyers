import Head from "next/head";
import PageHeroBanner from "../components/PageHeroBanner";
import QuoteStepsSection from "../components/QuoteStepsSection";
import QuoteDisagreeSection from "../components/QuoteDisagreeSection";
import CtaSection from "../components/CtaSection";

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
    .post("quote-page", doObjToFormData({ token: authToken }))
    .then((response) => response.data)
    .catch((error) => error.response.data.message);

  return { props: { result } };
};

export default function QuotePage({ result }) {
  let {
    meta_desc,
    page_title,
    content,
    site_settings,
    quote_steps,
  } = result;
  return (
    <>
      <MetaGenerator
        page_title={page_title + " - " + site_settings?.site_name}
        meta_desc={meta_desc}
      />
      <main id="quote__page">
        <PageHeroBanner
          title={content?.banner_heading}
          subtitle=<Text string={content?.banner_text} />
        />
        <QuoteStepsSection content={content} quote_steps={quote_steps} />
        <QuoteDisagreeSection content={content} />
        <CtaSection page={"quote"} content={content} />
      </main>
    </>
  );
}
