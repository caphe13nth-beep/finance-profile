"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateSetting } from "@/app/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Check } from "lucide-react";
import type { ThemeSettings, ThemeColors } from "@/types/settings";

// ── Presets ─────────────────────────────────────────
interface Preset {
  name: string;
  description: string;
  preview: { bg: string; accent: string; card: string; text: string };
  theme: ThemeSettings;
}

const PRESETS: Preset[] = [
  {
    name: "Corporate Finance",
    description: "Navy + Gold + Space Grotesk",
    preview: { bg: "#0F172A", accent: "#D4A373", card: "#1E293B", text: "#F8FAFC" },
    theme: {
      preset: "corporate-finance",
      colors: { primary: "#0F172A", secondary: "#E2E8F0", background: "#F8FAFC", accent: "#10B981", accent_secondary: "#D4A373", card_bg: "#FFFFFF", text_primary: "#0F172A", text_secondary: "#64748B", border: "#E2E8F0" },
      dark_colors: { primary: "#F8FAFC", secondary: "#334155", background: "#0F172A", accent: "#10B981", accent_secondary: "#D4A373", card_bg: "#1E293B", text_primary: "#F8FAFC", text_secondary: "#94A3B8", border: "rgba(248,250,252,0.1)" },
      fonts: { heading: "Space Grotesk", body: "Manrope", mono: "JetBrains Mono" },
      border_radius: "0.625rem", enable_dark_mode_toggle: true, default_dark: true,
    },
  },
  {
    name: "Modern Fintech",
    description: "Dark blue + Cyan + Sora",
    preview: { bg: "#0B1120", accent: "#06B6D4", card: "#1A2332", text: "#E2E8F0" },
    theme: {
      preset: "modern-fintech",
      colors: { primary: "#0B1120", secondary: "#CBD5E1", background: "#F1F5F9", accent: "#06B6D4", accent_secondary: "#8B5CF6", card_bg: "#FFFFFF", text_primary: "#0B1120", text_secondary: "#64748B", border: "#E2E8F0" },
      dark_colors: { primary: "#E2E8F0", secondary: "#334155", background: "#0B1120", accent: "#06B6D4", accent_secondary: "#8B5CF6", card_bg: "#1A2332", text_primary: "#E2E8F0", text_secondary: "#94A3B8", border: "rgba(226,232,240,0.1)" },
      fonts: { heading: "Sora", body: "Inter", mono: "Fira Code" },
      border_radius: "0.75rem", enable_dark_mode_toggle: true, default_dark: true,
    },
  },
  {
    name: "Minimal Personal",
    description: "Clean white + Coral + Playfair Display",
    preview: { bg: "#FAFAFA", accent: "#F97066", card: "#FFFFFF", text: "#18181B" },
    theme: {
      preset: "minimal-personal",
      colors: { primary: "#18181B", secondary: "#F4F4F5", background: "#FAFAFA", accent: "#F97066", accent_secondary: "#F59E0B", card_bg: "#FFFFFF", text_primary: "#18181B", text_secondary: "#71717A", border: "#E4E4E7" },
      dark_colors: { primary: "#FAFAFA", secondary: "#3F3F46", background: "#18181B", accent: "#F97066", accent_secondary: "#F59E0B", card_bg: "#27272A", text_primary: "#FAFAFA", text_secondary: "#A1A1AA", border: "rgba(250,250,250,0.1)" },
      fonts: { heading: "Playfair Display", body: "Lato", mono: "JetBrains Mono" },
      border_radius: "0.5rem", enable_dark_mode_toggle: true, default_dark: false,
    },
  },
  {
    name: "Warm Creative",
    description: "Earthy + Amber + DM Serif Display",
    preview: { bg: "#FEF7ED", accent: "#D97706", card: "#FFFFFF", text: "#422006" },
    theme: {
      preset: "warm-creative",
      colors: { primary: "#422006", secondary: "#FDE68A", background: "#FEF7ED", accent: "#D97706", accent_secondary: "#059669", card_bg: "#FFFFFF", text_primary: "#422006", text_secondary: "#92400E", border: "#FDE68A" },
      dark_colors: { primary: "#FEF3C7", secondary: "#78350F", background: "#1C1917", accent: "#F59E0B", accent_secondary: "#10B981", card_bg: "#292524", text_primary: "#FEF3C7", text_secondary: "#D6D3D1", border: "rgba(254,243,199,0.1)" },
      fonts: { heading: "DM Serif Display", body: "DM Sans", mono: "IBM Plex Mono" },
      border_radius: "0.75rem", enable_dark_mode_toggle: true, default_dark: false,
    },
  },
  {
    name: "Dark Luxe",
    description: "Black + Gold + Cormorant Garamond",
    preview: { bg: "#09090B", accent: "#EAB308", card: "#18181B", text: "#FAFAF9" },
    theme: {
      preset: "dark-luxe",
      colors: { primary: "#09090B", secondary: "#D4D4D8", background: "#FAFAF9", accent: "#EAB308", accent_secondary: "#A855F7", card_bg: "#FFFFFF", text_primary: "#09090B", text_secondary: "#71717A", border: "#D4D4D8" },
      dark_colors: { primary: "#FAFAF9", secondary: "#3F3F46", background: "#09090B", accent: "#EAB308", accent_secondary: "#A855F7", card_bg: "#18181B", text_primary: "#FAFAF9", text_secondary: "#A1A1AA", border: "rgba(250,250,249,0.1)" },
      fonts: { heading: "Cormorant Garamond", body: "Nunito Sans", mono: "Source Code Pro" },
      border_radius: "0.25rem", enable_dark_mode_toggle: true, default_dark: true,
    },
  },
];

// ── Font options ────────────────────────────────────
const HEADING_FONTS = [
  "Space Grotesk", "Sora", "Playfair Display", "DM Serif Display",
  "Cormorant Garamond", "Inter", "Poppins", "Raleway", "Montserrat",
  "Lora", "Merriweather", "Outfit", "Plus Jakarta Sans", "Libre Baskerville", "Oswald",
];

const BODY_FONTS = [
  "Manrope", "Inter", "Lato", "DM Sans", "Nunito Sans", "Open Sans",
  "Roboto", "Source Sans 3", "Work Sans", "Rubik", "Karla", "Mulish",
  "Libre Franklin", "IBM Plex Sans", "Figtree",
];

const MONO_FONTS = [
  "JetBrains Mono", "Fira Code", "Source Code Pro", "IBM Plex Mono",
  "Roboto Mono", "Space Mono", "Ubuntu Mono", "Inconsolata",
];

// ── Styles ──────────────────────────────────────────
const labelCls = "text-xs font-medium text-muted-foreground";
const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

const COLOR_KEYS: { key: keyof ThemeColors; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "background", label: "Background" },
  { key: "accent", label: "Accent" },
  { key: "accent_secondary", label: "Accent Secondary" },
  { key: "card_bg", label: "Card Background" },
  { key: "text_primary", label: "Text Primary" },
  { key: "text_secondary", label: "Text Secondary" },
  { key: "border", label: "Border" },
];

// ── Component ───────────────────────────────────────
export default function AdminThemePage() {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  async function load() {
    const { data: row } = await createClient()
      .from("site_settings").select("value").eq("key", "theme").single();
    if (row) setTheme(row.value as ThemeSettings);
  }

  useEffect(() => { load(); }, []);

  if (!theme) return <AdminShell title="Theme"><p className="text-muted-foreground">Loading...</p></AdminShell>;

  function set<K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) {
    setTheme((t) => t ? { ...t, [key]: value } : t);
  }

  function setColor(mode: "colors" | "dark_colors", key: keyof ThemeColors, value: string) {
    setTheme((t) => t ? { ...t, [mode]: { ...t[mode], [key]: value } } : t);
  }

  function setFont(key: keyof ThemeSettings["fonts"], value: string) {
    setTheme((t) => t ? { ...t, fonts: { ...t.fonts, [key]: value } } : t);
  }

  function applyPreset(preset: Preset) {
    setTheme(preset.theme);
  }

  function save() {
    start(async () => {
      await updateSetting("theme", theme);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <AdminShell
      title="Theme"
      description="Colors, fonts, and visual style"
      actions={
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle2 className="h-4 w-4" /> Saved</span>}
          <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50">
            {pending ? "Saving..." : "Save Theme"}
          </button>
        </div>
      }
    >
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* ── Presets ──────────────────────────────── */}
          <div>
            <h3 className="font-heading text-lg font-bold">Presets</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRESETS.map((preset) => {
                const active = theme.preset === preset.theme.preset;
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={`relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all ${
                      active ? "border-accent shadow-lg" : "border-border hover:border-accent/40"
                    }`}
                  >
                    {active && (
                      <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    {/* Color preview strip */}
                    <div className="flex h-16">
                      <div className="flex-1" style={{ background: preset.preview.bg }} />
                      <div className="flex-1" style={{ background: preset.preview.card }} />
                      <div className="flex-1" style={{ background: preset.preview.accent }} />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold">{preset.name}</p>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Light Colors ─────────────────────────── */}
          <div>
            <h3 className="font-heading text-lg font-bold">Light Mode Colors</h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {COLOR_KEYS.map(({ key, label }) => (
                <div key={`light-${key}`}>
                  <label className={labelCls}>{label}</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="color"
                      value={theme.colors[key].startsWith("rgba") ? "#000000" : theme.colors[key]}
                      onChange={(e) => setColor("colors", key, e.target.value)}
                      className="h-9 w-9 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
                    />
                    <input
                      value={theme.colors[key]}
                      onChange={(e) => setColor("colors", key, e.target.value)}
                      className="h-9 flex-1 rounded-md border border-input bg-background px-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dark Colors ──────────────────────────── */}
          <div>
            <h3 className="font-heading text-lg font-bold">Dark Mode Colors</h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {COLOR_KEYS.map(({ key, label }) => (
                <div key={`dark-${key}`}>
                  <label className={labelCls}>{label}</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="color"
                      value={theme.dark_colors[key].startsWith("rgba") ? "#000000" : theme.dark_colors[key]}
                      onChange={(e) => setColor("dark_colors", key, e.target.value)}
                      className="h-9 w-9 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
                    />
                    <input
                      value={theme.dark_colors[key]}
                      onChange={(e) => setColor("dark_colors", key, e.target.value)}
                      className="h-9 flex-1 rounded-md border border-input bg-background px-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Fonts ────────────────────────────────── */}
          <div>
            <h3 className="font-heading text-lg font-bold">Fonts</h3>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Heading</label>
                <select value={theme.fonts.heading} onChange={(e) => setFont("heading", e.target.value)} className={inputCls}>
                  {HEADING_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Body</label>
                <select value={theme.fonts.body} onChange={(e) => setFont("body", e.target.value)} className={inputCls}>
                  {BODY_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Monospace</label>
                <select value={theme.fonts.mono} onChange={(e) => setFont("mono", e.target.value)} className={inputCls}>
                  {MONO_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Border Radius ────────────────────────── */}
          <div>
            <h3 className="font-heading text-lg font-bold">Border Radius</h3>
            <div className="mt-3 flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.125"
                value={parseFloat(theme.border_radius)}
                onChange={(e) => set("border_radius", `${e.target.value}rem`)}
                className="flex-1 accent-accent"
              />
              <span className="w-16 rounded bg-muted px-2 py-1 text-center font-mono text-sm">
                {theme.border_radius}
              </span>
            </div>
          </div>

          {/* ── Toggles ──────────────────────────────── */}
          <div>
            <h3 className="font-heading text-lg font-bold">Dark Mode</h3>
            <div className="mt-3 space-y-3">
              <label className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Show dark/light toggle</p>
                  <p className="text-xs text-muted-foreground">Allow visitors to switch themes</p>
                </div>
                <Switch checked={theme.enable_dark_mode_toggle} onCheckedChange={(v) => set("enable_dark_mode_toggle", v)} />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Default to dark mode</p>
                  <p className="text-xs text-muted-foreground">New visitors see dark mode first</p>
                </div>
                <Switch checked={theme.default_dark} onCheckedChange={(v) => set("default_dark", v)} />
              </label>
            </div>
          </div>
        </div>

        {/* ── Live Preview ───────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="font-heading text-lg font-bold">Preview</h3>

            {/* Light preview */}
            <div className="mt-3 overflow-hidden rounded-xl border border-border" style={{ background: theme.colors.background, color: theme.colors.text_primary, borderRadius: theme.border_radius }}>
              <div className="px-4 py-2 text-xs font-medium" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                Light Mode
              </div>
              <div className="p-4 space-y-3">
                <div className="rounded-lg p-3" style={{ background: theme.colors.card_bg, border: `1px solid ${theme.colors.border}`, borderRadius: theme.border_radius }}>
                  <p className="text-sm font-bold" style={{ fontFamily: theme.fonts.heading, color: theme.colors.text_primary }}>
                    Heading Font
                  </p>
                  <p className="mt-1 text-xs" style={{ fontFamily: theme.fonts.body, color: theme.colors.text_secondary }}>
                    Body text in {theme.fonts.body}
                  </p>
                  <p className="mt-1 font-mono text-xs" style={{ fontFamily: theme.fonts.mono, color: theme.colors.accent }}>
                    mono: {theme.fonts.mono}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="rounded px-3 py-1.5 text-xs font-semibold text-white" style={{ background: theme.colors.accent, borderRadius: theme.border_radius }}>
                    Primary CTA
                  </div>
                  <div className="rounded px-3 py-1.5 text-xs font-semibold" style={{ background: theme.colors.accent_secondary, color: "#fff", borderRadius: theme.border_radius }}>
                    Secondary
                  </div>
                </div>
                <div className="flex gap-2">
                  {[theme.colors.primary, theme.colors.secondary, theme.colors.accent, theme.colors.accent_secondary, theme.colors.text_secondary].map((c, i) => (
                    <div key={i} className="h-6 flex-1 rounded" style={{ background: c, borderRadius: theme.border_radius }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Dark preview */}
            <div className="mt-3 overflow-hidden rounded-xl border border-border" style={{ background: theme.dark_colors.background, color: theme.dark_colors.text_primary, borderRadius: theme.border_radius }}>
              <div className="px-4 py-2 text-xs font-medium" style={{ borderBottom: `1px solid ${theme.dark_colors.border}` }}>
                Dark Mode
              </div>
              <div className="p-4 space-y-3">
                <div className="rounded-lg p-3" style={{ background: theme.dark_colors.card_bg, border: `1px solid ${theme.dark_colors.border}`, borderRadius: theme.border_radius }}>
                  <p className="text-sm font-bold" style={{ fontFamily: theme.fonts.heading, color: theme.dark_colors.text_primary }}>
                    Heading Font
                  </p>
                  <p className="mt-1 text-xs" style={{ fontFamily: theme.fonts.body, color: theme.dark_colors.text_secondary }}>
                    Body text in {theme.fonts.body}
                  </p>
                  <p className="mt-1 font-mono text-xs" style={{ fontFamily: theme.fonts.mono, color: theme.dark_colors.accent }}>
                    mono: {theme.fonts.mono}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="rounded px-3 py-1.5 text-xs font-semibold text-white" style={{ background: theme.dark_colors.accent, borderRadius: theme.border_radius }}>
                    Primary CTA
                  </div>
                  <div className="rounded px-3 py-1.5 text-xs font-semibold" style={{ background: theme.dark_colors.accent_secondary, color: "#fff", borderRadius: theme.border_radius }}>
                    Secondary
                  </div>
                </div>
                <div className="flex gap-2">
                  {[theme.dark_colors.primary, theme.dark_colors.secondary, theme.dark_colors.accent, theme.dark_colors.accent_secondary, theme.dark_colors.text_secondary].map((c, i) => (
                    <div key={i} className="h-6 flex-1 rounded" style={{ background: c, borderRadius: theme.border_radius }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
