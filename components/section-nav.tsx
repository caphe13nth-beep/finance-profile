"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface SectionNavItem {
  id: string;
  label: string;
}

interface SectionNavProps {
  items: SectionNavItem[];
}

export function SectionNav({ items }: SectionNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    for (const { id } of items) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 xl:flex"
      aria-label="Page sections"
    >
      <ul className="flex flex-col items-center gap-3">
        {items.map(({ id, label }) => {
          const isActive = activeId === id;
          return (
            <li key={id} className="group relative">
              <button
                onClick={() => scrollTo(id)}
                className="flex items-center justify-center p-1"
                aria-label={`Scroll to ${label}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-200",
                    isActive
                      ? "h-3 w-3 bg-accent shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      : "h-2 w-2 bg-muted-foreground/40 group-hover:bg-muted-foreground"
                  )}
                />
              </button>

              {/* Tooltip */}
              <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100">
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
