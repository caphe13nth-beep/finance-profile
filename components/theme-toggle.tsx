"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = useCallback(() => {
    // Add transition class to <html> for smooth color shift
    const root = document.documentElement;
    root.classList.add("theme-transition");

    setTheme(resolvedTheme === "dark" ? "light" : "dark");

    // Remove after transitions complete to avoid interfering with hover styles
    setTimeout(() => root.classList.remove("theme-transition"), 500);
  }, [resolvedTheme, setTheme]);

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <button
        className="inline-flex h-9 w-16 items-center rounded-full border border-border bg-card px-1"
        aria-label="Toggle theme"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
          <Sun className="h-3.5 w-3.5" />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="relative inline-flex h-9 w-16 items-center rounded-full border border-border bg-card transition-colors hover:border-accent/40"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sun icon (left) */}
      <span className="absolute left-1.5 flex h-5 w-5 items-center justify-center">
        <Sun className="h-3 w-3 text-muted-foreground" />
      </span>

      {/* Moon icon (right) */}
      <span className="absolute right-1.5 flex h-5 w-5 items-center justify-center">
        <Moon className="h-3 w-3 text-muted-foreground" />
      </span>

      {/* Sliding knob with active icon */}
      <motion.span
        layout
        className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-accent shadow-sm"
        style={{ left: isDark ? "calc(100% - 1.875rem - 2px)" : "2px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <Moon className="h-3.5 w-3.5 text-white" />
            ) : (
              <Sun className="h-3.5 w-3.5 text-white" />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
