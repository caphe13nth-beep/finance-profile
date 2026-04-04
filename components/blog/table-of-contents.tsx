"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function useTocData() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const article = document.querySelector("[data-article]");
    if (!article) return;

    const nodes = article.querySelectorAll("h2, h3");
    const items: TocItem[] = Array.from(nodes).map((node) => {
      if (!node.id) {
        node.id = node.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") ?? "";
      }
      return {
        id: node.id,
        text: node.textContent ?? "",
        level: node.tagName === "H2" ? 2 : 3,
      };
    });
    setHeadings(items);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  return { headings, activeId };
}

function TocLinks({
  headings,
  activeId,
  onSelect,
}: {
  headings: TocItem[];
  activeId: string;
  onSelect?: () => void;
}) {
  return (
    <ul className="space-y-1 border-l border-border">
      {headings.map(({ id, text, level }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              onSelect?.();
            }}
            className={cn(
              "block border-l-2 py-1 text-sm transition-colors",
              level === 3 ? "pl-6" : "pl-4",
              activeId === id
                ? "border-accent font-medium text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {text}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Desktop: sticky sidebar TOC */
export function TableOfContents() {
  const { headings, activeId } = useTocData();

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24" aria-label="Table of contents">
      <p className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <div className="mt-3">
        <TocLinks headings={headings} activeId={activeId} />
      </div>
    </nav>
  );
}

/** Mobile: floating button + slide-up panel */
export function MobileToc() {
  const { headings, activeId } = useTocData();
  const [open, setOpen] = useState(false);

  if (headings.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors hover:bg-accent hover:text-white lg:hidden"
        aria-label="Table of contents"
      >
        <List className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/50 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[70] max-h-[60vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-6 shadow-2xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-heading text-sm font-semibold">On this page</p>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <TocLinks
                headings={headings}
                activeId={activeId}
                onSelect={() => setOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
