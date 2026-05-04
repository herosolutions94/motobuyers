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
  console.log("result", result);

  let { meta_desc, page_title, content, site_settings } = result;

  return (
    <>
      {/* <Head>
        <title>Contact us – MotoBuyers</title>
        <meta
          name="description"
          content="A simple process. A real offer. A smooth ride to instant cash."
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </Head> */}
      <MetaGenerator
        page_title={page_title + " - " + site_settings?.site_name}
        meta_desc={meta_desc}
      />
      <main id="contact__page">
        <PageHeroBanner
          content={content}
          // title={content?.sec1_card_text2}
          // subtitle="Selling your motorcycle has never been easier — and we're excited to make it a smooth ride for you!"
        />
        <ContactSection content={content} site_settings={site_settings} />
      </main>
    </>
  );
}
