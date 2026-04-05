"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Settings,
  FileText,
  Briefcase,
  Users,
  Mail,
  MessageSquare,
  Eye,
  Clock,
  FolderOpen,
  Image as ImageIcon,
  Heart,
  HardDrive,
  Send,
  Download,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog Posts", href: "/admin/posts", icon: FileText },
      { label: "Case Studies", href: "/admin/case-studies", icon: Briefcase },
      { label: "Services", href: "/admin/services", icon: Briefcase },
      { label: "Insights", href: "/admin/insights", icon: Eye },
      { label: "Resources", href: "/admin/resources", icon: Download },
      { label: "Testimonials", href: "/admin/testimonials", icon: Users },
      { label: "Media", href: "/admin/media", icon: Eye },
      { label: "Timeline", href: "/admin/timeline", icon: Clock },
    ],
  },
  {
    label: "Personal",
    items: [
      { label: "Profile", href: "/admin/profile", icon: User },
      { label: "Projects", href: "/admin/projects", icon: FolderOpen },
      { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      { label: "Hobbies", href: "/admin/hobbies", icon: Heart },
    ],
  },
  {
    label: "Audience",
    items: [
      { label: "Contacts", href: "/admin/contacts", icon: MessageSquare },
      { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
      { label: "Newsletter", href: "/admin/newsletter", icon: Send },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Media Library", href: "/admin/media-library", icon: HardDrive },
    ],
  },
];

function SidebarContent({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto px-2 py-3">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-4">
          {!collapsed && (
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
          )}
          {section.items.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                className={cn(
                  "mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────── */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <span className="font-heading text-sm font-bold">Admin</span>
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* ── Mobile overlay ─────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile slide-in drawer ─────────────────────── */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-3">
          <Link href="/admin" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="font-heading text-sm font-bold">Admin</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <SidebarContent
          pathname={pathname}
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
        />

        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View site
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Desktop sidebar ────────────────────────────── */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
            {!collapsed && (
              <span className="font-heading text-sm font-bold tracking-tight">
                Admin
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <SidebarContent pathname={pathname} collapsed={collapsed} />

        <div className="border-t border-border p-3">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
            {!collapsed && (
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                View site
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
