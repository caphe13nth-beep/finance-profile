"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { TickerBar } from "@/components/ticker-bar";
import { useSettings } from "@/lib/settings-provider";
import { cn } from "@/lib/utils";
import type { PageVisibility } from "@/types/settings";

const NAV_KEYS: { tKey: string; href: string; visKey: keyof PageVisibility | null }[] = [
  { tKey: "home", href: "/", visKey: null },
  { tKey: "about", href: "/about", visKey: "about" },
  { tKey: "services", href: "/services", visKey: "services" },
  { tKey: "portfolio", href: "/portfolio", visKey: "portfolio" },
  { tKey: "blog", href: "/blog", visKey: "blog" },
  { tKey: "insights", href: "/insights", visKey: "market_insights" },
  { tKey: "resources", href: "/resources", visKey: "resources" },
  { tKey: "tools", href: "/tools", visKey: "tools" },
  { tKey: "contact", href: "/contact", visKey: "contact" },
];

export function Header() {
  const t = useTranslations("Nav");
  const { page_visibility, section_visibility, site_identity } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = useMemo(
    () =>
      NAV_KEYS
        .filter((link) => link.visKey === null || page_visibility[link.visKey])
        .map((link) => ({ label: t(link.tKey), href: link.href })),
    [page_visibility, t]
  );

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {section_visibility.finance_ticker && <TickerBar />}

      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border transition-colors duration-200",
          scrolled ? "bg-background/80 backdrop-blur-lg" : "bg-background"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight">
              {site_identity.site_name}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted md:hidden"
              aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile slide-in panel */}
      <nav
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full w-72 flex-col bg-background border-l border-border shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="font-heading text-lg font-bold tracking-tight">{t("menu")}</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
            aria-label={t("closeMenu")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="border-t border-border px-4 py-4">
          <p className="text-xs text-muted-foreground">
            {site_identity.footer_text}
          </p>
        </div>
      </nav>
    </>
  );
}
