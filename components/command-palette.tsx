"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Command } from "cmdk";
import { createClient } from "@/lib/supabase/client";
import { useSettings } from "@/lib/settings-provider";
import {
  Search, FileText, Home, User, Briefcase, FolderOpen,
  Mail, BookOpen, BarChart3, Wrench, Sun, Moon, Settings,
  ArrowRight,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  category: string | null;
}

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
    { label: "Home", href: "/", icon: Home, always: true },
    { label: "About", href: "/about", icon: User, key: "about" as const },
    { label: "Services", href: "/services", icon: Briefcase, key: "services" as const },
    { label: "Portfolio", href: "/portfolio", icon: FolderOpen, key: "portfolio" as const },
    { label: "Blog", href: "/blog", icon: BookOpen, key: "blog" as const },
    { label: "Insights", href: "/insights", icon: BarChart3, key: "market_insights" as const },
    { label: "Contact", href: "/contact", icon: Mail, key: "contact" as const },
    { label: "Tools", href: "/tools", icon: Wrench, key: "tools" as const },
  ].filter((p) => p.always || (p.key && page_visibility[p.key]));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="relative mx-auto mt-0 h-full w-full px-0 sm:mt-[15vh] sm:h-auto sm:max-w-lg sm:px-4">
        <Command
          className="flex h-full flex-col overflow-hidden border-border bg-card shadow-2xl sm:rounded-xl sm:border"
          shouldFilter={false}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search posts, navigate pages..."
              className="h-12 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[50vh] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              {loading ? "Searching..." : "No results found."}
            </Command.Empty>

            {/* Search results */}
            {results.length > 0 && (
              <Command.Group heading="Blog Posts">
                {results.map((post) => (
                  <Command.Item
                    key={post.id}
                    value={post.title}
                    onSelect={() => navigate(`/blog/${post.slug}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm text-foreground aria-selected:bg-accent/10"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-accent" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{post.title}</p>
                      {post.category && (
                        <p className="text-xs text-muted-foreground">{post.category}</p>
                      )}
                    </div>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Pages */}
            <Command.Group heading="Pages">
              {pages.map(({ label, href, icon: Icon }) => (
                <Command.Item
                  key={href}
                  value={label}
                  onSelect={() => navigate(href)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm text-foreground aria-selected:bg-accent/10"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{label}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Actions */}
            <Command.Group heading="Actions">
              <Command.Item
                value="Toggle dark mode"
                onSelect={toggleTheme}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm text-foreground aria-selected:bg-accent/10"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Moon className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span>Toggle {resolvedTheme === "dark" ? "Light" : "Dark"} Mode</span>
              </Command.Item>

              <Command.Item
                value="Admin Dashboard"
                onSelect={() => navigate("/admin")}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm text-foreground aria-selected:bg-accent/10"
              >
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Admin Dashboard</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <span>Navigate with ↑↓ · Select with ↵</span>
            <span>
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">⌘</kbd>
              {" + "}
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">K</kbd>
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
