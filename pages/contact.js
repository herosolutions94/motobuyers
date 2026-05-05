import Head from "next/head";
import PageHeroBanner from "../components/PageHeroBanner";
import ContactSection from "../components/ContactSection";
import http from "@/helpers/http";
import { parse } from "cookie";
import { doObjToFormData, cmsFileUrl } from "@/helpers/helpers";
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
    .post("contact-page", doObjToFormData({ token: authToken }))
    .then((response) => response.data)
    .catch((error) => error.response.data.message);

  return { props: { result } };
};
export default function ContactPage({ result }) {
  let { meta_desc, page_title, content, site_settings } = result;

  return (
    <>
      <MetaGenerator
        page_title={page_title + " - " + site_settings?.site_name}
        meta_desc={meta_desc}
      />
      <main id="contact__page">
        <PageHeroBanner
          title={content?.banner_heading}
          subtitle=<Text string={content?.banner_text} />
        />
        <ContactSection content={content} site_settings={site_settings} />
      </main>
    </>
  );
}
