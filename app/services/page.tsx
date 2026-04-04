import { notFound } from "next/navigation";
import { getServices } from "@/lib/supabase/queries";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { ServiceCard } from "@/components/services/service-card";
import { siteMetadata } from "@/lib/metadata";
import { JsonLd, serviceSchema } from "@/lib/json-ld";

export const metadata = siteMetadata({
  title: "Services",
  description: "Professional financial advisory and portfolio management services.",
  path: "/services",
});

export const revalidate = 3600;

export default async function ServicesPage() {
  const settings = await fetchAllSettings();
  if (!settings.page_visibility.services) notFound();

  const { data: services } = await getServices();
  const items = services ?? [];

  return (
    <>
    <JsonLd data={serviceSchema(items)} />
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            What I Offer
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Services
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Tailored financial solutions to help you grow, protect, and optimize your wealth.
          </p>
        </div>

        {items.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-muted-foreground">
            Services coming soon. Check back shortly.
          </p>
        )}
      </div>
    </section>
    </>
  );
}
