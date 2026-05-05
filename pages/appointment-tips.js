import Head from "next/head";
import PageHeroBanner from "../components/PageHeroBanner";
import ChecklistSection from "../components/ChecklistSection";
import VisitTipsSection from "../components/VisitTipsSection";
import CtaSection from "../components/CtaSection";
import TestimonialsSection from "../components/TestimonialsSection";
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
    .post("appointment-tips-page", doObjToFormData({ token: authToken }))
    .then((response) => response.data)
    .catch((error) => error.response.data.message);

  return { props: { result } };
};

// const FAQ_GROUPS = [
//   {
//     groupTitle: "Questions About Your Appointment",
//     items: [
//       {
//         question: "What should I expect from my appointment?",
//         answer:
//           "Our team will meet with you at a convenient location to inspect your motorcycle. The process is quick, professional, and stress-free.",
//       },
//       {
//         question: "Will my offer change after inspection?",
//         answer:
//           "In most cases, the offer remains the same. However, if the bike's condition differs significantly from what was described, a small adjustment may be made.",
//       },
//       {
//         question: "What do I need to bring to my appointment?",
//         answer:
//           "Please bring a valid government-issued photo ID, the motorcycle title, and any relevant service records you may have.",
//       },
//       {
//         question: "Will I need to deal with paperwork?",
//         answer:
//           "We handle all the paperwork for you. Our team will walk you through every document so you know exactly what you're signing.",
//       },
//       {
//         question: "My bike isn't paid off. What should I bring with me?",
//         answer:
//           "If your bike still has a loan on it, bring your lender's contact information and your most recent loan statement. We'll help coordinate paying off the remaining balance as part of the transaction.",
//       },
//     ],
//   },
// ];

export default function AppointmentTipsPage({ result }) {
  let {
    meta_desc,
    page_title,
    content,
    site_settings,
    appointment_tips,
    faq_category,
    testimonials,
  } = result;

  const FAQ_GROUPS =
    faq_category?.map((category) => {
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
      <main id="tips__page">
        <PageHeroBanner
          title={content?.banner_heading}
          subtitle=<Text string={content?.banner_text} />
        />
        <ChecklistSection
          content={content}
          appointment_tips={appointment_tips}
        />
        <VisitTipsSection content={content} />
        <FaqSection FAQ_GROUPS={FAQ_GROUPS} />
        <CtaSection page={'tips'} content={content} />
        <TestimonialsSection
          page={"tips"}
          content={content}
          testimonials={testimonials}
        />
      </main>
    </>
  );
}
