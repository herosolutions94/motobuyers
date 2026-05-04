import React from "react";
import Head from "next/head";
import { cmsFileUrl } from "../helpers/helpers";

export default function MetaGenerator({ page_title, meta_desc = false }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  return (
    <>
      {page_title && meta_desc !== false && (
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=2, user-scalable=yes"
          />
          <title>{page_title}</title>
          <meta name="title" content={meta_desc.meta_title} />
          <meta name="description" content={meta_desc.meta_description} />
          <meta name="keywords" content={meta_desc.meta_keywords} />

          <meta property="og:type" content={meta_desc.og_type} />
          <meta property="og:url" content={url} />
          <meta property="og:title" content={meta_desc.og_title} />
          <meta property="og:description" content={meta_desc.og_description} />
          <meta property="og:image" content={cmsFileUrl(meta_desc.og_image)} />

          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={url} />
          <meta property="twitter:title" content={meta_desc.og_title} />
          <meta
            property="twitter:description"
            content={meta_desc.og_description}
          />
          <meta
            property="twitter:image"
            content={cmsFileUrl(meta_desc.twitter_image)}
          />
        </Head>
      )}
      {page_title && meta_desc === false && (
        <Head>
          <title>{page_title}</title>
          <meta name="title" content={page_title} />
          <meta name="description" content={page_title} />
          <meta name="keywords" content={page_title} />

          <meta property="og:type" content="website" />
          <meta property="og:url" content={url} />
          <meta property="og:title" content={page_title} />
          <meta property="og:description" content={page_title} />
          <meta property="og:image" content="/images/thumbnail.png" />

          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={url} />
          <meta property="twitter:title" content={page_title} />
          <meta property="twitter:description" content={page_title} />
          <meta property="twitter:image" content="/images/thumbnail.png" />
        </Head>
      )}
    </>
  );
}
