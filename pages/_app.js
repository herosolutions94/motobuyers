import React from "react";
import { parse } from "cookie";
import http from "../helpers/http";
import NextNProgress from "nextjs-progressbar";
import Layout from "../components/layout";
import "../styles/css/tailwind.min.css";
import "../styles/scss/final.generic.scss";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { doObjToFormData } from "@/helpers/helpers";

export default function App({
  Component,
  pageProps,
  siteSettings,
  headerServices,
}) {
  const renderWithLayout =
    Component.getLayout ||
    ((page) => (
      <>
        <Provider store={store}>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontSize: "14px",
              },
            }}
          />
          <NextNProgress color="#ee2524ff" />
          <Layout siteSettings={siteSettings} headerServices={headerServices}>
            {page}
          </Layout>
        </Provider>
      </>
    ));

  return renderWithLayout(<Component {...pageProps} />);
}

App.getInitialProps = async ({ ctx }) => {
  const cookies = parse(ctx?.req?.headers?.cookie || "");
  const authToken = cookies?.authToken || "";
  const siteSettings = await http
    .post("site-settings", doObjToFormData({ token: authToken }))
    .then((response) => response?.data?.site_settings)
    .catch((error) => error?.response?.data?.message);
  return { siteSettings };
};
