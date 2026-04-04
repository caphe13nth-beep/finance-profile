import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signOutAction } from "@/app/actions/auth";
import {
  TrendingUp, LogOut, FileText, Briefcase, MessageSquare,
  Users, Mail, Eye, Clock, Settings, FolderOpen,
  Image as ImageIcon, Heart, Layout, ToggleLeft,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SubscribersChart, TopPostsChart } from "@/components/admin/dashboard-charts";

const ADMIN_LINKS = [
  { label: "Site Settings", href: "/admin/settings", icon: Settings, description: "Identity, theme, hero, stats, SEO" },
  { label: "Section Toggles", href: "/admin/settings/sections", icon: ToggleLeft, description: "Toggle homepage sections on/off" },
  { label: "Page Visibility", href: "/admin/settings/pages", icon: Layout, description: "Enable or disable site pages" },
  { label: "Blog Posts", href: "/admin/posts", icon: FileText, description: "Manage articles and insights" },
  { label: "Case Studies", href: "/admin/case-studies", icon: Briefcase, description: "Edit portfolio case studies" },
  { label: "Projects", href: "/admin/projects", icon: FolderOpen, description: "Personal projects and side work" },
  { label: "Photo Gallery", href: "/admin/gallery", icon: ImageIcon, description: "Upload and manage photos" },
  { label: "Hobbies", href: "/admin/hobbies", icon: Heart, description: "Hobbies and interests" },
  { label: "Contacts", href: "/admin/contacts", icon: MessageSquare, description: "View contact form messages" },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mail, description: "Newsletter subscriber list" },
  { label: "Testimonials", href: "/admin/testimonials", icon: Users, description: "Manage client testimonials" },
];

interface ActivityItem {
  id: string;
  type: "contact" | "subscriber";
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

const ACTIVITY_ICONS = { contact: MessageSquare, subscriber: Mail };
const ACTIVITY_LABELS = { contact: "Contact submission", subscriber: "New subscriber" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = createAdminClient();

  // 6 stat counts
  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: subCount },
    { count: unreadContacts },
    { count: projectCount },
    { count: caseCount },
  ] = await Promise.all([
    admin.from("blog_posts").select("*", { count: "exact", head: true }),
    admin.from("blog_posts").select("*", { count: "exact", head: true }).eq("is_published", true),
    admin.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true),
    admin.from("contact_submissions").select("*", { count: "exact", head: true }).eq("is_read", false),
    admin.from("personal_projects").select("*", { count: "exact", head: true }),
    admin.from("case_studies").select("*", { count: "exact", head: true }),
  ]);

  // Subscribers per day (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: recentSubs } = await admin
    .from("newsletter_subscribers")
    .select("subscribed_at")
    .gte("subscribed_at", thirtyDaysAgo)
    .order("subscribed_at", { ascending: true });

  const subsByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    subsByDay[d] = 0;
  }
  (recentSubs ?? []).forEach((s) => {
    const d = s.subscribed_at?.slice(0, 10);
    if (d && d in subsByDay) subsByDay[d]++;
  });
  const subscriberChartData = Object.entries(subsByDay).map(([date, count]) => ({ date, count }));

  // Top 5 posts by reading_time_min as proxy (view_count column not yet available)
  const { data: topPosts } = await admin
    .from("blog_posts")
    .select("title, reading_time_min")
    .eq("is_published", true)
    .order("reading_time_min", { ascending: false })
    .limit(5);

  const topPostsData = (topPosts ?? []).map((p) => ({
    title: p.title,
    views: p.reading_time_min ?? 0,
  }));

  // Recent activity — contacts + subscribers, last 10
  const [{ data: recentContacts }, { data: recentSubsList }] = await Promise.all([
    admin.from("contact_submissions").select("id, name, subject, created_at").order("created_at", { ascending: false }).limit(10),
    admin.from("newsletter_subscribers").select("id, email, subscribed_at").order("subscribed_at", { ascending: false }).limit(10),
  ]);

  const activity: ActivityItem[] = [
    ...(recentContacts ?? []).map((c) => ({
      id: `contact-${c.id}`,
      type: "contact" as const,
      title: c.subject ? `${c.name} — ${c.subject}` : c.name,
      timestamp: c.created_at,
    })),
    ...(recentSubsList ?? []).map((s) => ({
      id: `sub-${s.id}`,
      type: "subscriber" as const,
      title: s.email,
      timestamp: s.subscribed_at,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const stats = [
    { label: "Total Posts", value: totalPosts ?? 0, icon: FileText, color: "text-chart-1" },
    { label: "Published", value: publishedPosts ?? 0, icon: Eye, color: "text-accent" },
    { label: "Subscribers", value: subCount ?? 0, icon: Mail, color: "text-chart-2" },
    { label: "Unread Messages", value: unreadContacts ?? 0, icon: MessageSquare, color: "text-destructive" },
    { label: "Projects", value: projectCount ?? 0, icon: FolderOpen, color: "text-chart-1" },
    { label: "Case Studies", value: caseCount ?? 0, icon: Briefcase, color: "text-chart-2" },
  ];

  return (
    <section className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </form>
        </div>

        {/* 6 Stat Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <Icon className={`h-5 w-5 ${color}`} />
                <p className="mt-2 font-mono text-2xl font-bold text-foreground">{value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-heading text-sm font-semibold text-foreground">Subscribers (Last 30 Days)</h3>
              <div className="mt-4">
                <SubscribersChart data={subscriberChartData} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-heading text-sm font-semibold text-foreground">Top Posts</h3>
              <p className="text-xs text-muted-foreground">By reading time</p>
              <div className="mt-4">
                {topPostsData.length > 0 ? (
                  <TopPostsChart data={topPostsData} />
                ) : (
                  <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">No published posts yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity + Quick links */}
        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-heading text-sm font-semibold text-foreground">Recent Activity</h3>
                {activity.length > 0 ? (
                  <div className="mt-4 space-y-1">
                    {activity.map((item) => {
                      const Icon = ACTIVITY_ICONS[item.type];
                      const label = ACTIVITY_LABELS[item.type];
                      return (
                        <div key={item.id} className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
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
                  <p className="mt-4 text-sm text-muted-foreground">No recent activity.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-heading text-sm font-semibold text-foreground">Quick Access</h3>
            <div className="mt-3 space-y-2">
              {ADMIN_LINKS.slice(0, 8).map(({ label, href, icon: Icon, description }) => (
                <Link key={label} href={href} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-accent/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
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
