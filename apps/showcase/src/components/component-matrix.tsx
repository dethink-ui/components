"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import {
  ButtonTeaser,
  CardTeaser,
  CheckboxTeaser,
  ComboboxTeaser,
  DataTableTeaser,
  InputTeaser,
  LinkTeaser,
  NumberInputTeaser,
  SelectTeaser,
  SwitchTeaser,
  TimelineTeaser,
} from "@/components/component-teasers";
import { getComponentMeta } from "@/lib/components-meta";

const matrixSlugs = [
  "button",
  "input",
  "switch",
  "data-table",
  "select",
  "checkbox",
  "timeline",
  "combobox",
  "link",
  "card",
  "number-input",
] as const;

const matrixTeasers: Record<string, ReactNode> = {
  button: <ButtonTeaser />,
  input: <InputTeaser />,
  switch: <SwitchTeaser />,
  "data-table": <DataTableTeaser />,
  select: <SelectTeaser />,
  checkbox: <CheckboxTeaser />,
  timeline: <TimelineTeaser />,
  combobox: <ComboboxTeaser />,
  link: <LinkTeaser />,
  card: <CardTeaser />,
  "number-input": <NumberInputTeaser />,
};

const motionEase = [0.2, 0, 0, 1] as const;

export function ComponentMatrix({
  componentCount,
}: {
  componentCount: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.ul
        role="list"
        aria-label="Component state previews"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {matrixSlugs.map((slug, index) => {
          const meta = getComponentMeta(slug);
          if (!meta) return null;

          return (
            <motion.li
              key={slug}
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.99 }
              }
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.24,
                ease: motionEase,
                delay: shouldReduceMotion ? 0 : Math.min(index * 0.025, 0.2),
              }}
              className="h-full"
            >
              {/*
               * The real component state is visual evidence only. `inert`
               * removes its controls from pointer, keyboard, and accessibility
               * interaction; the stretched documentation link is the card's
               * single action.
               */}
              <article className="group border-border bg-background hover:border-primary/50 hover:bg-primary/[0.04] focus-within:ring-ring focus-within:ring-offset-background relative flex h-full flex-col gap-3 rounded-md border p-3 transition-colors focus-within:ring-2 focus-within:ring-offset-2 sm:p-4">
                <span
                  aria-hidden="true"
                  inert
                  className="border-border/60 bg-muted/30 pointer-events-none block h-24 overflow-hidden rounded-sm border p-2"
                >
                  <span
                    className={`flex w-[125%] origin-top-left scale-[0.8] items-center [&>*]:w-full ${
                      slug === "timeline"
                        ? "-translate-x-8 -translate-y-36"
                        : ""
                    }`}
                  >
                    {matrixTeasers[slug]}
                  </span>
                </span>
                <h3 className="font-heading flex items-center justify-between gap-2 text-[0.9375rem] font-semibold text-balance">
                  <Link
                    href={`/components/${slug}`}
                    className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-md"
                  >
                    {meta.name}
                  </Link>
                  <ArrowRight
                    aria-hidden="true"
                    className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </h3>
              </article>
            </motion.li>
          );
        })}

        <motion.li
          key="view-all-components"
          initial={
            shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.99 }
          }
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.24,
            ease: motionEase,
            delay: shouldReduceMotion ? 0 : 0.2,
          }}
          className="h-full"
        >
          <Link
            href="/components"
            className="group border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/[0.06] focus-visible:ring-ring focus-visible:ring-offset-background flex h-full min-h-40 flex-col justify-between gap-3 rounded-md border p-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="text-primary font-mono text-xs font-semibold">
              +{componentCount - matrixSlugs.length}
            </span>
            <span className="text-muted-foreground group-hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors">
              View all components
              <ArrowRight aria-hidden="true" className="size-4" />
            </span>
          </Link>
        </motion.li>
      </motion.ul>
    </MotionConfig>
  );
}
