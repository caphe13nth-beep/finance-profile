"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteSettings } from "@/types/settings";

const SettingsContext = createContext<SiteSettings | null>(null);

/**
 * Wraps the app with site settings from Supabase.
 * Settings are fetched server-side in the root layout
 * and passed as props — no client-side fetching needed.
 */
export function SettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Access site settings from any client component.
 * Must be used within a SettingsProvider.
 */
export function useSettings(): SiteSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
