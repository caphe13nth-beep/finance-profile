"use client";

import { useSettings } from "@/lib/settings-provider";
import type { SectionVisibility } from "@/types/settings";
import type { ReactNode } from "react";

export function ConditionalSection({
  sectionKey,
  children,
}: {
  sectionKey: keyof SectionVisibility;
  children: ReactNode;
}) {
  const { section_visibility } = useSettings();
  if (!section_visibility[sectionKey]) return null;
  return <>{children}</>;
}
