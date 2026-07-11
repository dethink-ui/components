"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Code2 } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";

const motionEase = [0.2, 0, 0, 1] as const;

interface RecipeDemoBarProps {
  title: string;
}

const actionClassName =
  "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:px-2.5 sm:text-sm";

export function RecipeDemoBar({ title }: RecipeDemoBarProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.nav
        aria-label="Recipe demo controls"
        data-recipe-demo-bar
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.24,
          ease: motionEase,
        }}
        className="border-border bg-background/90 sticky top-14 z-30 flex min-h-14 items-center gap-2 border-b px-2 backdrop-blur-md sm:gap-3 sm:px-4"
      >
        <Link href="/recipes" className={actionClassName}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          <span className="max-sm:sr-only">Recipes</span>
        </Link>

        <span aria-hidden="true" className="bg-border h-5 w-px shrink-0" />

        <h1
          id="recipe-demo-title"
          title={title}
          className="font-heading min-w-0 flex-1 truncate text-sm font-semibold sm:text-base"
        >
          {title}
        </h1>

        <a href="#recipe-details-heading" className={actionClassName}>
          <BookOpen aria-hidden="true" className="size-4" />
          <span className="max-sm:sr-only">Details</span>
        </a>
        <a href="#recipe-source-heading" className={actionClassName}>
          <Code2 aria-hidden="true" className="size-4" />
          <span className="max-sm:sr-only">Source</span>
        </a>
      </motion.nav>
    </MotionConfig>
  );
}
