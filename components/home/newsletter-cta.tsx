"use client";

import { useRef } from "react";
import { useActionState } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { subscribeAction } from "@/app/actions/newsletter";

export function NewsletterCta() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [state, action, pending] = useActionState(subscribeAction, {
    success: false,
    error: null,
  });

  return (
    <section id="newsletter" ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 text-center sm:px-12 sm:py-16"
        >
          {/* Decorative gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-gold/5" />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
              <Mail className="h-7 w-7 text-accent" />
            </div>

            <h2 className="mt-6 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Stay Ahead of the Market
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Get weekly insights on market trends, portfolio strategies, and
              actionable investment ideas delivered to your inbox.
            </p>

            {state.success ? (
              <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-2 rounded-lg bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
                <CheckCircle2 className="h-5 w-5" />
                You&apos;re subscribed! Check your inbox.
              </div>
            ) : (
              <form
                action={action}
                className="mx-auto mt-8 flex max-w-md gap-2"
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="h-11 shrink-0 rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
                >
                  {pending ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}

            {state.error && (
              <div className="mx-auto mt-3 flex max-w-sm items-center justify-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {state.error}
              </div>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
