import { notFound } from "next/navigation";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { ContactForm } from "@/components/contact/contact-form";
import { FaqAccordion } from "@/components/contact/faq-accordion";
import { FAQ_ITEMS } from "@/lib/faq-data";
import { SocialLinks } from "@/components/contact/social-links";
import { siteMetadata } from "@/lib/metadata";
import { JsonLd, faqSchema } from "@/lib/json-ld";

export const metadata = siteMetadata({
  title: "Contact",
  description: "Get in touch for financial advisory, consultations, or inquiries.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await fetchAllSettings();
  if (!settings.page_visibility.contact) notFound();
  return (
    <>
    <JsonLd data={faqSchema(FAQ_ITEMS)} />
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Contact
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Let&apos;s Connect
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question or interested in working together? Send me a message
            and I&apos;ll get back to you within one business day.
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-5">
          {/* Form — wider column */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>

          {/* Sidebar — social + info */}
          <div className="lg:col-span-2">
            <SocialLinks />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <FaqAccordion />
        </div>
      </div>
    </section>
    </>
  );
}
