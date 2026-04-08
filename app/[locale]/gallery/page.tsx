import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPhotoGallery } from "@/lib/supabase/queries";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { PhotoGalleryFull } from "@/components/home/photo-gallery";
import { siteMetadata } from "@/lib/metadata";

export const metadata = siteMetadata({
  title: "Gallery",
  description: "Photo gallery — moments and memories.",
  path: "/gallery",
});

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const settings = await fetchAllSettings();
  if (!settings.section_visibility.photo_gallery) notFound();

  const t = await getTranslations("Home");
  const { data: photos } = await getPhotoGallery();

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {t("galleryLabel")}
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            {t("galleryHeading")}
          </h1>
        </div>

        <div className="mt-8">
          <PhotoGalleryFull photos={photos ?? []} />
        </div>
      </div>
    </section>
  );
}
