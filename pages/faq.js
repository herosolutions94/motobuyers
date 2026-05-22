import Head from "next/head";
import PageHeroBanner from "../components/PageHeroBanner";
import FaqSection from "../components/FaqSection";
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
    .post("faqs-page", doObjToFormData({ token: authToken }))
    .then((response) => response.data)
    .catch((error) => error.response.data.message);

  return { props: { result } };
};
 
export default function FAQsPage({ result }) {
  let { meta_desc, page_title, content, site_settings, faq_categories } =
    result;
  const FAQ_GROUPS =
    faq_categories?.map((category) => {
      return {
        groupTitle: category?.name,
        items: category?.category_faqs?.map((faq) => ({
          question: faq?.question,
          answer: faq?.answer,
        })),
      };
    }) || [];

  return (
    <>
      <MetaGenerator
        page_title={page_title + " - " + site_settings?.site_name}
        meta_desc={meta_desc}
      />
      <main id="faq__page">
        <PageHeroBanner
          title={content?.banner_heading}
          // subtitle=<Text string={content?.banner_text} />
        />
        <FaqSection FAQ_GROUPS={FAQ_GROUPS} />
      </main>
    </>
  );
}
