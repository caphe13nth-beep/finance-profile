"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  BookOpen,
  FileSpreadsheet,
  BarChart3,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  file_path: string;
  thumbnail_url: string | null;
  is_gated: boolean;
  sort_order: number;
}

const TYPE_CONFIG: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  whitepaper: { icon: BookOpen, label: "Whitepaper", color: "text-accent" },
  template: { icon: FileSpreadsheet, label: "Template", color: "text-chart-2" },
  guide: { icon: FileText, label: "Guide", color: "text-accent" },
  report: { icon: BarChart3, label: "Report", color: "text-chart-2" },
  other: { icon: FileText, label: "Resource", color: "text-muted-foreground" },
};

function EmailGate({
  onUnlock,
  onCancel,
}: {
  onUnlock: () => void;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim() });

    // 23505 = already subscribed — still unlock
    if (error && error.code !== "23505") {
      setStatus("error");
      return;
    }

    onUnlock();
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-card/95 p-6 backdrop-blur-sm"
    >
      <Lock className="h-8 w-8 text-chart-2" />
      <p className="mt-3 text-center text-sm font-medium text-foreground">
        Enter your email to download
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex w-full max-w-xs gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-9 shrink-0 rounded-md bg-accent px-3 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Unlock"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" /> Try again
        </p>
      )}
      <button
        onClick={onCancel}
        className="mt-3 text-xs text-muted-foreground hover:text-foreground"
      >
        Cancel
      </button>
    </motion.div>
  );
}

function ResourceCard({
  resource,
  index,
  storageUrl,
}: {
  resource: Resource;
  index: number;
  storageUrl: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [showGate, setShowGate] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const config = TYPE_CONFIG[resource.type] ?? TYPE_CONFIG.other;
  const Icon = config.icon;
  const downloadUrl = `${storageUrl}/storage/v1/object/public/documents/${resource.file_path}`;

  function handleDownload() {
    if (resource.is_gated && !unlocked) {
      setShowGate(true);
      return;
    }
    window.open(downloadUrl, "_blank");
  }

  function handleUnlock() {
    setUnlocked(true);
    setShowGate(false);
    window.open(downloadUrl, "_blank");
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
    >
      <AnimatePresence>
        {showGate && (
          <EmailGate
            onUnlock={handleUnlock}
            onCancel={() => setShowGate(false)}
          />
        )}
      </AnimatePresence>

      {/* Thumbnail / icon header */}
      {resource.thumbnail_url ? (
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={resource.thumbnail_url}
            alt={resource.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-accent/5 to-gold/5">
          <Icon className={`h-12 w-12 ${config.color} opacity-30`} />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Type badge */}
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
          {resource.is_gated && !unlocked && (
            <span className="flex items-center gap-1 text-xs text-chart-2">
              <Lock className="h-3 w-3" />
              Gated
            </span>
          )}
          {unlocked && (
            <span className="flex items-center gap-1 text-xs text-accent">
              <CheckCircle2 className="h-3 w-3" />
              Unlocked
            </span>
          )}
        </div>

        <h3 className="mt-2 font-heading text-lg font-semibold text-foreground">
          {resource.title}
        </h3>

        {resource.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {resource.description}
          </p>
        )}

        <button
          onClick={handleDownload}
          className="mt-4 inline-flex items-center gap-2 self-start rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
        >
          <Download className="h-4 w-4" />
          {resource.is_gated && !unlocked ? "Unlock & Download" : "Download"}
        </button>
      </div>
    </motion.div>
  );
}

export function ResourceGrid({ resources }: { resources: Resource[] }) {
  const [filter, setFilter] = useState<string | null>(null);
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const types = [...new Set(resources.map((r) => r.type))].sort();
  const filtered = filter
    ? resources.filter((r) => r.type === filter)
    : resources;

  return (
    <div>
      {/* Filter pills */}
      {types.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === null
                ? "bg-accent text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {types.map((type) => {
            const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.other;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === type
                    ? "bg-accent text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {config.label}s
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource, i) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              index={i}
              storageUrl={storageUrl}
            />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted-foreground">
          No resources available yet. Check back soon.
        </p>
      )}
    </div>
  );
}
