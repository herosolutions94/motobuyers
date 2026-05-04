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

export default function Final() {
  return (
    <>
      <Head>
        <title>MotoBuyers – Sell Your Motorcycle Just Got Easier</title>
        <meta
          name="description"
          content="Get a customized offer for your motorcycle from one of our appraisers."
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <main id="home__page">
        <HeroSection />
        <HowItWorksSection />
        <ComparisonSection />
        <TipsSection />
        <CtaSection />
        <TestimonialsSection />
      </main>
    </>
  );
}
