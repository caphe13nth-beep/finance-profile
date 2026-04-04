import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/lib/settings-provider";
import { ToastProvider } from "@/components/toast";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { fetchAllSettings } from "@/lib/supabase/settings";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types/settings";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://financeprofile.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FinanceProfile",
    template: "%s",
  },
  description: "Professional financial advisory, market insights, and portfolio management services.",
  openGraph: {
    type: "website",
    siteName: "FinanceProfile",
    locale: "en_US",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

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

function buildThemeStyle(settings: SiteSettings): string {
  const { colors, dark_colors, border_radius } = settings.theme;
  return `
:root {
  --background: ${colors.background};
  --foreground: ${colors.text_primary};
  --primary: ${colors.primary};
  --primary-foreground: ${colors.background};
  --secondary: ${colors.secondary};
  --secondary-foreground: ${colors.text_primary};
  --muted: ${colors.secondary};
  --muted-foreground: ${colors.text_secondary};
  --accent: ${colors.accent};
  --accent-foreground: #FFFFFF;
  --card: ${colors.card_bg};
  --card-foreground: ${colors.text_primary};
  --popover: ${colors.card_bg};
  --popover-foreground: ${colors.text_primary};
  --border: ${colors.border};
  --input: ${colors.border};
  --ring: ${colors.accent};
  --chart-1: ${colors.accent};
  --chart-2: ${colors.accent_secondary};
  --chart-3: ${colors.primary};
  --chart-4: ${colors.text_secondary};
  --chart-5: ${colors.secondary};
  --radius: ${border_radius};
  --destructive: #EF4444;
}
.dark {
  --background: ${dark_colors.background};
  --foreground: ${dark_colors.text_primary};
  --primary: ${dark_colors.primary};
  --primary-foreground: ${dark_colors.background};
  --secondary: ${dark_colors.secondary};
  --secondary-foreground: ${dark_colors.text_primary};
  --muted: ${dark_colors.card_bg};
  --muted-foreground: ${dark_colors.text_secondary};
  --accent: ${dark_colors.accent};
  --accent-foreground: #FFFFFF;
  --card: ${dark_colors.card_bg};
  --card-foreground: ${dark_colors.text_primary};
  --popover: ${dark_colors.card_bg};
  --popover-foreground: ${dark_colors.text_primary};
  --border: ${dark_colors.border};
  --input: ${dark_colors.border};
  --ring: ${dark_colors.accent};
  --chart-1: ${dark_colors.accent};
  --chart-2: ${dark_colors.accent_secondary};
  --chart-3: ${dark_colors.primary};
  --chart-4: ${dark_colors.text_secondary};
  --chart-5: ${dark_colors.secondary};
  --destructive: #EF4444;
}`;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings: Awaited<ReturnType<typeof fetchAllSettings>>;
  try {
    settings = await fetchAllSettings();
  } catch {
    // Fallback: import defaults directly to prevent layout crash
    const { SETTINGS_DEFAULTS } = await import("@/lib/supabase/settings");
    settings = SETTINGS_DEFAULTS;
  }

  const themeStyle = buildThemeStyle(settings);
  const defaultTheme = settings.theme.default_dark ? "dark" : "light";

  // Build Google Fonts URL for theme fonts
  const { fonts } = settings.theme;
  const fontFamilies = [...new Set([fonts.heading, fonts.body, fonts.mono])]
    .map((f) => f.replace(/ /g, "+") + ":wght@400;500;600;700")
    .join("&family=");
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;

  // CSS to apply theme fonts to CSS variables
  const fontStyle = `
    :root {
      --font-heading: "${fonts.heading}", var(--font-space-grotesk), sans-serif;
      --font-sans: "${fonts.body}", var(--font-manrope), sans-serif;
      --font-mono: "${fonts.mono}", var(--font-jetbrains-mono), monospace;
    }
  `;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        spaceGrotesk.variable,
        manrope.variable,
        jetbrainsMono.variable
      )}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={googleFontsUrl} />
        <style dangerouslySetInnerHTML={{ __html: themeStyle + fontStyle }} />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme={defaultTheme}
          enableSystem={settings.theme.enable_dark_mode_toggle}
          disableTransitionOnChange={false}
        >
          <SettingsProvider settings={settings}>
            <ToastProvider>
              <Header />
              <main id="main-content" className="flex-1">{children}</main>
              <Footer />
            </ToastProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
