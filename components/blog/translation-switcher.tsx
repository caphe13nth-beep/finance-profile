"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";

interface Translation {
  id: string;
  slug: string;
  locale: string;
  title: string;
}

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

const LOCALE_FLAGS: Record<string, string> = {
  en: "🇺🇸",
  vi: "🇻🇳",
};

export function TranslationSwitcher({
  translations,
}: {
  translations: Translation[];
}) {
  const currentLocale = useLocale();

  // Only show if there are translations in other locales
  const others = translations.filter((t) => t.locale !== currentLocale);
  if (others.length === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        Also in:
      </span>
      {others.map((t) => (
        <Link
          key={t.id}
          href={`/blog/${t.slug}`}
          locale={t.locale}
          className="inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
        >
          <span>{LOCALE_FLAGS[t.locale] ?? ""}</span>
          {LOCALE_LABELS[t.locale] ?? t.locale}
        </Link>
      ))}
    </div>
  );
}
