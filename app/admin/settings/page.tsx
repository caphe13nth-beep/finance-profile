import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Globe,
  Layout,
  Eye,
  FileText,
  BarChart3,
  Link as LinkIcon,
  Search,
  Palette,
} from "lucide-react";

const SETTINGS_PAGES = [
  { label: "Site Identity", href: "/admin/settings/general", icon: Globe, description: "Name, tagline, logo, site mode, footer text" },
  { label: "Theme", href: "/admin/settings/theme", icon: Palette, description: "Colors, fonts, presets, border radius" },
  { label: "Page Visibility", href: "/admin/settings/pages", icon: Layout, description: "Toggle which pages appear in navigation" },
  { label: "Section Toggles", href: "/admin/settings/sections", icon: Eye, description: "Toggle homepage sections on or off" },
  { label: "Hero Content", href: "/admin/settings/hero", icon: FileText, description: "Heading, subheading, CTAs, background style" },
  { label: "Stats Bar", href: "/admin/settings/stats", icon: BarChart3, description: "KPI cards — add, edit, reorder" },
  { label: "Now Section", href: "/admin/settings/now", icon: FileText, description: "What you're currently working on" },
  { label: "Social Links", href: "/admin/settings/social", icon: LinkIcon, description: "LinkedIn, Twitter, YouTube, and more" },
  { label: "SEO Defaults", href: "/admin/settings/seo", icon: Search, description: "Title template, description, analytics IDs" },
];

export default function AdminSettingsIndex() {
  return (
    <AdminShell title="Settings" description="Configure your site">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_PAGES.map(({ label, href, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
              <Icon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground">{label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
