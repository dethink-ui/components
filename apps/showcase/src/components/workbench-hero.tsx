"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RevealButton } from "@dethink/components";
import { ArrowRight, BookOpen, Check, Copy } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";

const INSTALL_COMMAND = "npx shadcn@latest add @dethink/button";
const motionEase = [0.2, 0, 0, 1] as const;
const contentVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.055,
    },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: motionEase },
  },
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}

export function WorkbenchHero({
  componentCount,
  recipeCount,
}: {
  componentCount: number;
  recipeCount: number;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
    } catch {
      // Clipboard can reject without user gesture / permissions; fail quietly.
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        <motion.div
          variants={contentVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
        >
          <motion.p
            data-hero-motion-item
            variants={itemVariants}
            className="text-primary flex items-center gap-2.5 font-mono text-[11px] font-medium tracking-[0.12em] uppercase sm:gap-3 sm:tracking-[0.14em]"
          >
            <span aria-hidden="true" className="bg-primary h-px w-5 sm:w-6" />
            Open code · {componentCount} components · {recipeCount} recipes
          </motion.p>
          <motion.h1
            data-hero-motion-item
            variants={itemVariants}
            className="font-heading mt-3 max-w-2xl text-[2rem] leading-[1.04] font-bold tracking-tight text-balance sm:mt-4 sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem]"
          >
            A component workbench for{" "}
            <span className="sc-brand-text">token-themed</span> product UI.
          </motion.h1>
          <motion.p
            data-hero-motion-item
            variants={itemVariants}
            className="text-muted-foreground mt-3 max-w-xl text-[0.9375rem] leading-6 text-pretty sm:mt-4 sm:text-base sm:leading-7"
          >
            Every component, every state, every recipe — live on one surface.
            Copy the source; the{" "}
            <code className="font-mono text-[0.9em]">--dt-*</code> contract
            restyles everything, light or dark.
          </motion.p>

          <motion.div
            data-hero-motion-item
            variants={itemVariants}
            className="mt-5 grid grid-cols-[1.05fr_0.95fr] gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:items-center sm:gap-3"
          >
            <RevealButton
              icon={<ArrowRight />}
              label="Components"
              variant="solid"
              size="lg"
              labelVisibility="always"
              className="w-full justify-center sm:w-auto"
              onClick={() => scrollToSection("matrix")}
            />
            <RevealButton
              icon={<BookOpen />}
              label="Recipes"
              variant="outline"
              size="lg"
              labelVisibility="always"
              className="w-full justify-center sm:w-auto"
              onClick={() => router.push("/recipes")}
            />
          </motion.div>
        </motion.div>

        {/* Compact install proof on mobile; full evidence returns at sm+. */}
        <motion.div
          data-hero-motion-item
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.42,
            delay: shouldReduceMotion ? 0 : 0.205,
            ease: motionEase,
          }}
          className="sc-terminal w-full overflow-hidden rounded-lg border shadow-lg lg:w-[30rem]"
        >
          <div className="flex items-center gap-2 border-b border-[color:var(--sc-code-border)] px-3 py-2">
            <span className="size-2.5 rounded-full bg-current opacity-30" />
            <span className="size-2.5 rounded-full bg-current opacity-30" />
            <span className="size-2.5 rounded-full bg-current opacity-30" />
            <span className="ml-auto">
              <RevealButton
                icon={copied ? <Check /> : <Copy />}
                label={copied ? "Copied" : "Copy"}
                labelVisibility="always"
                variant="ghost"
                size="xs"
                className="text-[color:var(--sc-code-foreground)]"
                onClick={copyInstall}
              />
            </span>
          </div>
          <div className="space-y-1.5 p-3 font-mono text-[11.5px] leading-relaxed sm:p-4 sm:text-[12.5px]">
            <div>
              <span className="text-primary">$</span> {INSTALL_COMMAND}
            </div>
            <div className="opacity-60 sm:hidden">
              ✓ installed · tokens wired
            </div>
            <div className="hidden opacity-60 sm:block">
              ✓ installed src/components/button.tsx
            </div>
            <div className="hidden opacity-60 sm:block">
              ✓ tokens wired to --dt-* contract{" "}
              <span
                data-install-cursor
                className="text-primary motion-safe:animate-pulse motion-reduce:animate-none"
              >
                ▌
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
