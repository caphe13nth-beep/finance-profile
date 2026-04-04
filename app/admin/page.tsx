import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signOutAction } from "@/app/actions/auth";
import {
  TrendingUp,
  LogOut,
  FileText,
  Briefcase,
  MessageSquare,
  Users,
  Mail,
  Eye,
  Clock,
  Settings,
} from "lucide-react";
import Link from "next/link";

import { Layout, ToggleLeft } from "lucide-react";

const ADMIN_LINKS = [
  { label: "Site Settings", href: "/admin/settings", icon: Settings, description: "Identity, hero, stats, social, SEO" },
  { label: "Section Toggles", href: "/admin/settings/sections", icon: ToggleLeft, description: "Toggle homepage sections on/off" },
  { label: "Page Visibility", href: "/admin/settings/pages", icon: Layout, description: "Enable or disable site pages" },
  { label: "Blog Posts", href: "/admin/posts", icon: FileText, description: "Manage articles and insights" },
  { label: "Case Studies", href: "/admin/case-studies", icon: Briefcase, description: "Edit portfolio case studies" },
  { label: "Contact Submissions", href: "/admin/contacts", icon: MessageSquare, description: "View contact form messages" },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mail, description: "Newsletter subscriber list" },
  { label: "Testimonials", href: "/admin/testimonials", icon: Users, description: "Manage client testimonials" },
];

interface ActivityItem {
  id: string;
  type: "post" | "contact" | "subscriber" | "case_study";
  title: string;
  timestamp: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const ACTIVITY_ICONS = {
  post: FileText,
  contact: MessageSquare,
  subscriber: Mail,
  case_study: Briefcase,
};

const ACTIVITY_LABELS = {
  post: "Blog post published",
  contact: "New contact submission",
  subscriber: "New subscriber",
  case_study: "Case study added",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = createAdminClient();

  // Fetch counts in parallel
  const [
    { count: postCount },
    { count: caseCount },
    { count: unreadCount },
    { count: subCount },
  ] = await Promise.all([
    admin.from("blog_posts").select("*", { count: "exact", head: true }),
    admin.from("case_studies").select("*", { count: "exact", head: true }),
    admin.from("contact_submissions").select("*", { count: "exact", head: true }).eq("is_read", false),
    admin.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  // Build recent activity feed from multiple tables
  const [
    { data: recentPosts },
    { data: recentContacts },
    { data: recentSubs },
    { data: recentCases },
  ] = await Promise.all([
    admin.from("blog_posts").select("id, title, created_at").order("created_at", { ascending: false }).limit(5),
    admin.from("contact_submissions").select("id, name, subject, created_at").order("created_at", { ascending: false }).limit(5),
    admin.from("newsletter_subscribers").select("id, email, subscribed_at").order("subscribed_at", { ascending: false }).limit(5),
    admin.from("case_studies").select("id, title, created_at").order("created_at", { ascending: false }).limit(3),
  ]);

  const activity: ActivityItem[] = [
    ...(recentPosts ?? []).map((p) => ({
      id: `post-${p.id}`,
      type: "post" as const,
      title: p.title,
      timestamp: p.created_at,
    })),
    ...(recentContacts ?? []).map((c) => ({
      id: `contact-${c.id}`,
      type: "contact" as const,
      title: c.subject ? `${c.name} — ${c.subject}` : c.name,
      timestamp: c.created_at,
    })),
    ...(recentSubs ?? []).map((s) => ({
      id: `sub-${s.id}`,
      type: "subscriber" as const,
      title: s.email,
      timestamp: s.subscribed_at,
    })),
    ...(recentCases ?? []).map((cs) => ({
      id: `case-${cs.id}`,
      type: "case_study" as const,
      title: cs.title,
      timestamp: cs.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const stats = [
    { label: "Blog Posts", value: postCount ?? 0, icon: FileText, color: "text-accent" },
    { label: "Case Studies", value: caseCount ?? 0, icon: Briefcase, color: "text-gold" },
    { label: "Unread Messages", value: unreadCount ?? 0, icon: MessageSquare, color: "text-destructive" },
    { label: "Subscribers", value: subCount ?? 0, icon: Mail, color: "text-accent" },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${color}`} />
                <Eye className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
              <p className="mt-3 font-mono text-3xl font-bold text-foreground">
                {value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          {/* Recent activity */}
          <div className="lg:col-span-3">
            <h2 className="font-heading text-lg font-bold">Recent Activity</h2>

            {activity.length > 0 ? (
              <div className="mt-4 space-y-1">
                {activity.map((item) => {
                  const Icon = ACTIVITY_ICONS[item.type];
                  const label = ACTIVITY_LABELS[item.type];
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No recent activity yet.
              </p>
            )}
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h2 className="font-heading text-lg font-bold">Quick Access</h2>
            <div className="mt-4 space-y-3">
              {ADMIN_LINKS.map(({ label, href, icon: Icon, description }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-accent/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="truncate text-xs text-muted-foreground">{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
