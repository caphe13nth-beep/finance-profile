"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/faq-data";

export function FaqAccordion() {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold tracking-tight">
        Frequently Asked Questions
      </h2>

      <Accordion.Root type="single" collapsible className="mt-6 space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <Accordion.Item
            key={i}
            value={`faq-${i}`}
            className="overflow-hidden rounded-xl border border-border bg-card transition-colors data-[state=open]:border-accent/30"
          >
            <Accordion.Trigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-medium text-foreground transition-colors hover:text-accent [&[data-state=open]>svg]:rotate-180">
              {item.question}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
            </Accordion.Trigger>
            <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
