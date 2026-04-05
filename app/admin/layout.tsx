import Script from "next/script";
import { createClient } from "@/lib/supabase/server";
import { fetchAllSettings, SETTINGS_DEFAULTS } from "@/lib/supabase/settings";
import { ThemeProvider } from "@/components/theme-provider";
import { siteMetadata } from "@/lib/metadata";
import type { SiteSettings } from "@/types/settings";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = siteMetadata({
  title: "Admin",
  path: "/admin",
  noIndex: true,
});

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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth safety net (proxy handles primary redirect)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch theme settings
  let settings: SiteSettings;
  try {
    settings = await fetchAllSettings();
  } catch {
    settings = SETTINGS_DEFAULTS;
  }

  const themeStyle = safeThemeStyle(settings);
  const defaultTheme = settings.theme?.default_dark ? "dark" : "light";
  const enableSystem = settings.theme?.enable_dark_mode_toggle ?? true;

  // Login page — render without sidebar but with theme
  const isLoginPage = !user;

  return (
    <>
      {themeStyle && (
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
      )}
      <Script
        id="admin-theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
      />
      <ThemeProvider
        attribute="class"
        defaultTheme={defaultTheme}
        enableSystem={enableSystem}
        disableTransitionOnChange={false}
      >
        {isLoginPage ? (
          <>{children}</>
        ) : (
          <div className="flex min-h-screen flex-col lg:flex-row">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        )}
      </ThemeProvider>
    </>
  );
}
