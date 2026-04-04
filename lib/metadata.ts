import type { Metadata } from "next";

const SITE_NAME = "FinanceProfile";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://financeprofile.com";
const DEFAULT_DESCRIPTION =
  "Professional financial advisory, market insights, and portfolio management services.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

export function siteMetadata({
  title,
  description,
  path = "",
  ogImage,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${path}`;
  const image = ogImage ?? DEFAULT_OG_IMAGE;

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [image],
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

export function articleMetadata({
  title,
  description,
  slug,
  image,
  publishedAt,
  tags,
}: {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  publishedAt?: string | null;
  tags?: string[] | null;
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}/blog/${slug}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      ...(publishedAt && { publishedTime: publishedAt }),
      ...(tags?.length && { tags }),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}
