import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-7xl font-bold text-accent">{t("code")}</p>
      <h1 className="mt-4 font-heading text-2xl font-bold">{t("heading")}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        {t("description")}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
