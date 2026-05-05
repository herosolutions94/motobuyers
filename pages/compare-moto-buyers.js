import Head from "next/head";
import PageHeroBanner from "../components/PageHeroBanner";
import ComparisonSection from "../components/ComparisonTableSection";
import HowItWorksCtaSection from "../components/HowItWorksCtaSection";
import EasiestWaySection from "../components/EasiestWaySection";
import ReadyToRideSection from "../components/ReadyToRideSection";
import http from "@/helpers/http";
import { parse } from "cookie";
import { doObjToFormData, cmsFileUrl } from "@/helpers/helpers";
import MetaGenerator from "@/components/meta-generator";

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
    .post("compare-page", doObjToFormData({ token: authToken }))
    .then((response) => response.data)
    .catch((error) => error.response.data.message);

  return { props: { result } };
};

export default function CompareMotoBuyers({ result }) {
  let {
    meta_desc,
    page_title,
    content,
    comparisons,
    site_settings,
  } = result;
  return (
    <>
      <MetaGenerator
        page_title={page_title + " - " + site_settings?.site_name}
        meta_desc={meta_desc}
      />
      <main id="compare__page">
        <PageHeroBanner title={content?.banner_heading} />
        <ComparisonSection page={'compare'} content={content} comparisons={comparisons} />
        <EasiestWaySection content={content} />
        <HowItWorksCtaSection content={content} />
        <ReadyToRideSection content={content} />
      </main>
    </>
  );
}