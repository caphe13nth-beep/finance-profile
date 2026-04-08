"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTheme } from "next-themes";
import { Command } from "cmdk";
import { createClient } from "@/lib/supabase/client";
import { useSettings } from "@/lib/settings-provider";
import {
  Search, FileText, Home, User, Briefcase, FolderOpen,
  Mail, BookOpen, BarChart3, Wrench, Sun, Moon, Settings,
  ArrowRight, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  category: string | null;
}

// ── Shared item classes ────────────────────────────

const itemCls = cn(
  "group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none transition-colors",
  "border-l-2 border-transparent",
  "aria-selected:border-accent aria-selected:bg-accent/[0.08]",
);

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { page_visibility } = useSettings();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Search blog posts on type
  const searchPosts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, category")
        .eq("status", "published")
        .ilike("title", `%${q}%`)
        .order("published_at", { ascending: false })
        .limit(5);
      setResults(data ?? []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPosts(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchPosts]);

  function navigate(path: string) {
    setOpen(false);
    setQuery("");
    router.push(path);
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    setOpen(false);
  }

  // Build page links from visibility
  const pages = [
    { label: "Home", href: "/", icon: Home, desc: "Homepage", always: true },
    { label: "About", href: "/about", icon: User, desc: "Bio & career", key: "about" as const },
    { label: "Services", href: "/services", icon: Briefcase, desc: "What I offer", key: "services" as const },
    { label: "Portfolio", href: "/portfolio", icon: FolderOpen, desc: "Case studies", key: "portfolio" as const },
    { label: "Blog", href: "/blog", icon: BookOpen, desc: "Articles & insights", key: "blog" as const },
    { label: "Insights", href: "/insights", icon: BarChart3, desc: "Market analysis", key: "market_insights" as const },
    { label: "Contact", href: "/contact", icon: Mail, desc: "Get in touch", key: "contact" as const },
    { label: "Tools", href: "/tools", icon: Wrench, desc: "Calculators & utilities", key: "tools" as const },
  ].filter((p) => p.always || (p.key && page_visibility[p.key]));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[15vh] sm:pt-[18vh]">
      {/* Backdrop — blur 8px */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[8px]"
        onClick={() => setOpen(false)}
      />

      {/* Dialog — spotlight style */}
      <div
        className="cmd-dialog relative w-full max-w-[560px] mx-4 overflow-hidden rounded-xl border border-border bg-card shadow-[0_25px_60px_-12px_rgba(0,0,0,0.35)]"
      >
        <Command shouldFilter={false} className="flex flex-col">
          {/* Search input — large, borderless */}
          <div className="flex items-center gap-3 px-5 py-4">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search pages, posts, actions…"
              className="flex-1 bg-transparent text-[1.25rem] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="h-px bg-border" />

          {/* Results list */}
          <Command.List className="max-h-[50vh] overflow-y-auto px-2 py-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              {loading ? "Searching…" : "No results found."}
            </Command.Empty>

            {/* Blog post search results */}
            {results.length > 0 && (
              <Command.Group
                heading="Blog Posts"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/60"
              >
                {results.map((post) => (
                  <Command.Item
                    key={post.id}
                    value={post.title}
                    onSelect={() => navigate(`/blog/${post.slug}`)}
                    className={itemCls}
                  >
                    <FileText className="h-4 w-4 shrink-0 text-accent" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{post.title}</p>
                    </div>
                    {post.category && (
                      <span className="shrink-0 text-xs text-muted-foreground">{post.category}</span>
                    )}
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-aria-selected:opacity-100" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Pages */}
            <Command.Group
              heading="Pages"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/60"
            >
              {pages.map(({ label, href, icon: Icon, desc }) => (
                <Command.Item
                  key={href}
                  value={label}
                  onSelect={() => navigate(href)}
                  className={itemCls}
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{desc}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Actions */}
            <Command.Group
              heading="Actions"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/60"
            >
              <Command.Item
                value="Toggle dark mode"
                onSelect={toggleTheme}
                className={itemCls}
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Moon className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="flex-1">
                  Toggle {resolvedTheme === "dark" ? "Light" : "Dark"} Mode
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">Appearance</span>
              </Command.Item>

              <Command.Item
                value="Change language"
                onSelect={() => {}}
                className={itemCls}
              >
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1">Change Language</span>
                <span className="shrink-0 text-xs text-muted-foreground">Locale</span>
              </Command.Item>

              <Command.Item
                value="Admin Dashboard"
                onSelect={() => navigate("/admin")}
                className={itemCls}
              >
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1">Admin Dashboard</span>
                <span className="shrink-0 text-xs text-muted-foreground">Manage</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer — keyboard hints */}
          <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="cmd-kbd">↑</kbd>
              <kbd className="cmd-kbd">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="cmd-kbd">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="cmd-kbd">esc</kbd>
              close
            </span>
            <span className="ml-auto flex items-center gap-0.5">
              <kbd className="cmd-kbd">⌘</kbd>
              <kbd className="cmd-kbd">K</kbd>
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
