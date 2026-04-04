"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REACTIONS = [
  { key: "like", emoji: "👍", label: "Like" },
  { key: "insightful", emoji: "💡", label: "Insightful" },
  { key: "fire", emoji: "🔥", label: "Fire" },
  { key: "bookmark", emoji: "🔖", label: "Bookmark" },
] as const;

export function BlogReactions({ postId }: { postId: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({
    like: 0, insightful: 0, fire: 0, bookmark: 0,
  });
  const [active, setActive] = useState<string[]>([]);
  const [animating, setAnimating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reactions?post_id=${postId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.counts) setCounts(data.counts);
        if (data.active) setActive(data.active);
      })
      .catch(() => {});
  }, [postId]);

  async function toggle(reaction: string) {
    setAnimating(reaction);
    setTimeout(() => setAnimating(null), 300);

    // Optimistic update
    const wasActive = active.includes(reaction);
    setActive((prev) =>
      wasActive ? prev.filter((r) => r !== reaction) : [...prev, reaction]
    );
    setCounts((prev) => ({
      ...prev,
      [reaction]: prev[reaction] + (wasActive ? -1 : 1),
    }));

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, reaction }),
      });
      const data = await res.json();
      if (data.counts) setCounts(data.counts);
      if (data.active) setActive(data.active);
    } catch {
      // Revert on failure
      setActive((prev) =>
        wasActive ? [...prev, reaction] : prev.filter((r) => r !== reaction)
      );
      setCounts((prev) => ({
        ...prev,
        [reaction]: prev[reaction] + (wasActive ? 1 : -1),
      }));
    }
  }

  return (
    <div className="flex items-center gap-2">
      {REACTIONS.map(({ key, emoji, label }) => {
        const isActive = active.includes(key);
        const count = counts[key] ?? 0;
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all ${
              isActive
                ? "border-accent/40 bg-accent/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-accent/30 hover:text-foreground"
            }`}
            aria-label={`${label} (${count})`}
            aria-pressed={isActive}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={animating === key ? "pop" : "idle"}
                initial={animating === key ? { scale: 1.4 } : false}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {emoji}
              </motion.span>
            </AnimatePresence>
            {count > 0 && (
              <span className="font-mono text-xs">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
