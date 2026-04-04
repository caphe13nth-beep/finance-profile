const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://financeprofile.com";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function personSchema({
  name,
  title,
  bio,
  photoUrl,
  skills,
}: {
  name: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
  skills: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: SITE_URL,
    ...(title && { jobTitle: title }),
    ...(bio && { description: bio }),
    ...(photoUrl && { image: photoUrl }),
    ...(skills.length > 0 && { knowsAbout: skills }),
    sameAs: [
      "https://linkedin.com",
      "https://x.com",
      "https://youtube.com",
    ],
  };
}

export function articleSchema({
  title,
  description,
  slug,
  image,
  publishedAt,
  authorName,
  authorImage,
}: {
  title: string;
  description: string;
  slug: string;
  image: string | null;
  publishedAt: string | null;
  authorName: string;
  authorImage: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${SITE_URL}/blog/${slug}`,
    ...(image && { image }),
    ...(publishedAt && { datePublished: publishedAt }),
    author: {
      "@type": "Person",
      name: authorName,
      ...(authorImage && { image: authorImage }),
    },
    publisher: {
      "@type": "Person",
      name: authorName,
    },
  };
}

export function faqSchema(
  items: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function serviceSchema(
  services: {
    title: string;
    description: string | null;
    price: number | null;
  }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((s, i) => ({
      "@type": "Service",
      position: i + 1,
      name: s.title,
      ...(s.description && { description: s.description }),
      provider: {
        "@type": "Person",
        name: "FinanceProfile",
        url: SITE_URL,
      },
      ...(s.price != null && {
        offers: {
          "@type": "Offer",
          price: s.price,
          priceCurrency: "USD",
        },
      }),
    })),
  };
}

export function reviewSchema(
  testimonials: {
    name: string;
    company: string | null;
    quote: string;
  }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FinanceProfile",
    url: SITE_URL,
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: t.name,
        ...(t.company && {
          worksFor: { "@type": "Organization", name: t.company },
        }),
      },
      reviewBody: t.quote,
    })),
  };
}
