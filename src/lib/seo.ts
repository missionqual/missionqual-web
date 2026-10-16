import type { Metadata } from "next";

export const SITE_NAME = "MISSIONQUAL";
export const SITE_URL = "https://missionqual.com";
export const DEFAULT_OG_IMAGE = "/og-default.png";

type PageMetadataInput = {
  title: string;
  description: string;
  /** Path of the page, e.g. "/guide". */
  path: string;
};

export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const image = new URL(DEFAULT_OG_IMAGE, SITE_URL).toString();
  // The root layout's title template only applies to `title`, so social
  // titles get the suffix here.
  const socialTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
  };
}
