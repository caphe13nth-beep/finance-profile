"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealVariant = "fadeUp" | "fadeLeft" | "fadeRight" | "scaleIn";

interface RevealOnScrollProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}

const variants: Record<
  RevealVariant,
  { hidden: Record<string, number>; visible: Record<string, number> }
> = {
  fadeUp: { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } },
  fadeLeft: { hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0 } },
  fadeRight: { hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0 } },
  scaleIn: { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } },
};

export function RevealOnScroll({
  children,
  variant = "fadeUp",
  delay = 0,
  className,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  // Remove will-change after animation to free compositor memory
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const timer = setTimeout(() => {
      el.style.willChange = "auto";
    }, (delay + 0.5) * 1000);
    return () => clearTimeout(timer);
  }, [inView, delay]);

  const v = variants[variant];

  return (
    <motion.div
      ref={ref}
      initial={v.hidden}
      animate={inView ? v.visible : v.hidden}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(className)}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
