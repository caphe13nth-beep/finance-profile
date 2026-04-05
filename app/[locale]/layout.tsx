import Script from "next/script";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/lib/settings-provider";
import { ToastProvider } from "@/components/toast";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CommandPalette } from "@/components/command-palette";
import { PageTransition } from "@/components/page-transition";
import { BackToTop } from "@/components/back-to-top";
import { fetchAllSettings, SETTINGS_DEFAULTS } from "@/lib/supabase/settings";
import type { SiteSettings } from "@/types/settings";
import { routing } from "@/i18n/routing";

const THEME_SCRIPT = `
(function(){
  try {
    var theme = localStorage.getItem("theme") || "dark";
    var resolved = theme;
    if (theme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.classList.add(resolved);
  } catch(e) {
    document.documentElement.classList.add("dark");
  }
})();
`;

function safeThemeStyle(settings: SiteSettings): string {
  try {
    const { colors, dark_colors, border_radius } = settings.theme;
    return `
:root {
  --background: ${colors.background}; --foreground: ${colors.text_primary};
  --primary: ${colors.primary}; --primary-foreground: ${colors.background};
  --secondary: ${colors.secondary}; --secondary-foreground: ${colors.text_primary};
  --muted: ${colors.secondary}; --muted-foreground: ${colors.text_secondary};
  --accent: ${colors.accent}; --accent-foreground: #FFFFFF;
  --card: ${colors.card_bg}; --card-foreground: ${colors.text_primary};
  --popover: ${colors.card_bg}; --popover-foreground: ${colors.text_primary};
  --border: ${colors.border}; --input: ${colors.border}; --ring: ${colors.accent};
  --chart-1: ${colors.accent}; --chart-2: ${colors.accent_secondary};
  --chart-3: ${colors.primary}; --chart-4: ${colors.text_secondary}; --chart-5: ${colors.secondary};
  --radius: ${border_radius}; --destructive: #EF4444;
}
.dark {
  --background: ${dark_colors.background}; --foreground: ${dark_colors.text_primary};
  --primary: ${dark_colors.primary}; --primary-foreground: ${dark_colors.background};
  --secondary: ${dark_colors.secondary}; --secondary-foreground: ${dark_colors.text_primary};
  --muted: ${dark_colors.card_bg}; --muted-foreground: ${dark_colors.text_secondary};
  --accent: ${dark_colors.accent}; --accent-foreground: #FFFFFF;
  --card: ${dark_colors.card_bg}; --card-foreground: ${dark_colors.text_primary};
  --popover: ${dark_colors.card_bg}; --popover-foreground: ${dark_colors.text_primary};
  --border: ${dark_colors.border}; --input: ${dark_colors.border}; --ring: ${dark_colors.accent};
  --chart-1: ${dark_colors.accent}; --chart-2: ${dark_colors.accent_secondary};
  --chart-3: ${dark_colors.primary}; --chart-4: ${dark_colors.text_secondary}; --chart-5: ${dark_colors.secondary};
  --destructive: #EF4444;
}`;
  } catch {
    return "";
  }
}

function safeFontStyle(settings: SiteSettings): { css: string; url: string } {
  try {
    const { fonts } = settings.theme;
    const fontFamilies = [...new Set([fonts.heading, fonts.body, fonts.mono])]
      .map((f) => f.replace(/ /g, "+") + ":wght@400;500;600;700")
      .join("&family=");
    return {
      url: `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`,
      css: `:root {
        --font-heading: "${fonts.heading}", var(--font-space-grotesk), sans-serif;
        --font-sans: "${fonts.body}", var(--font-manrope), sans-serif;
        --font-mono: "${fonts.mono}", var(--font-jetbrains-mono), monospace;
      }`,
    };
  } catch {
    return { url: "", css: "" };
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Set lang attribute on html
  if (typeof document === "undefined") {
    // Server-side: we'll set it via script
  }

  const messages = await getMessages();

  let settings: SiteSettings;
  try {
    settings = await fetchAllSettings();
  } catch {
    settings = SETTINGS_DEFAULTS;
  }

  const themeStyle = safeThemeStyle(settings);
  const defaultTheme = settings.theme?.default_dark ? "dark" : "light";
  const enableSystem = settings.theme?.enable_dark_mode_toggle ?? true;
  const { url: fontUrl, css: fontCss } = safeFontStyle(settings);

  return (
    <>
      <Script
        id="set-lang"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${locale}";`,
        }}
      />
      {fontUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontUrl} />
        </>
      )}
      {(themeStyle || fontCss) && (
        <style dangerouslySetInnerHTML={{ __html: themeStyle + fontCss }} />
      )}
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
      />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <ThemeProvider
        attribute="class"
        defaultTheme={defaultTheme}
        enableSystem={enableSystem}
        disableTransitionOnChange={false}
      >
        <SettingsProvider settings={settings}>
          <NextIntlClientProvider messages={messages}>
            <ToastProvider>
              <CommandPalette />
              <BackToTop />
              <Header />
              <main id="main-content" className="flex-1">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
            </ToastProvider>
          </NextIntlClientProvider>
        </SettingsProvider>
      </ThemeProvider>
    </>
  );
}
