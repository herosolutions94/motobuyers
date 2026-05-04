import React from "react";
import Head from "next/head";
import { cmsFileUrl } from "@/helpers/helpers";

export default function SiteMaster({siteSettings}) {
  return (
    <Head>
      <title>MotoBuyers</title>
      <meta name="title" content="MotoBuyers" />
      <meta name="description" content="MotoBuyers" />
      <link rel="icon" href={cmsFileUrl(siteSettings?.site_icon)} />
    </Head>
  );
}
