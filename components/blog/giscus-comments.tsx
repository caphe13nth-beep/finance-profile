"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useSettings } from "@/lib/settings-provider";

export function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const { site_identity, section_visibility } = useSettings();

  const { giscus_repo, giscus_repo_id, giscus_category, giscus_category_id } = site_identity;

  // Don't render if comments are disabled or giscus isn't configured
  const enabled =
    section_visibility.comments &&
    giscus_repo &&
    giscus_repo_id &&
    giscus_category &&
    giscus_category_id;

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Clear previous instance
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", giscus_repo);
    script.setAttribute("data-repo-id", giscus_repo_id);
    script.setAttribute("data-category", giscus_category);
    script.setAttribute("data-category-id", giscus_category_id);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", resolvedTheme === "dark" ? "dark" : "light");
    script.setAttribute("data-lang", "en");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    containerRef.current.appendChild(script);
  }, [enabled, giscus_repo, giscus_repo_id, giscus_category, giscus_category_id, resolvedTheme]);

  if (!enabled) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="mb-6 font-heading text-xl font-bold">Comments</h2>
      <div ref={containerRef} />
    </section>
  );
}
