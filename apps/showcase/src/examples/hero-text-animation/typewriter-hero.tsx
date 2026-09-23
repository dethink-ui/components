"use client";

import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  GitBranch,
  Star,
  Terminal,
} from "lucide-react";

const terminalLines = [
  { prompt: true, text: "npx dethink init landing" },
  { prompt: false, text: "◇ Scaffolding hero, motion tokens, registry…" },
  { prompt: false, text: "◇ Wiring reduced-motion + SSR fallbacks…" },
  { prompt: false, text: "✓ Ready in 1.2s — run pnpm dev", ok: true },
];

export function HeroTextAnimationTypewriterHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-typewriter-heading"
        className="bg-background text-foreground border-border @container/hero overflow-hidden rounded-md border"
      >
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-12 @min-[480px]/hero:px-8 @min-[900px]/hero:grid-cols-[minmax(0,1fr)_26rem] @min-[900px]/hero:px-10 @min-[900px]/hero:py-16">
          <div className="min-w-0">
            <span className="border-border bg-muted/50 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-medium">
              <span
                aria-hidden="true"
                className="bg-success size-1.5 rounded-full"
              />
              v2.0.0 — now stable
            </span>

            {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The component renders its text prop as accessible heading content. */}
            <HeroTextAnimation
              as="h2"
              trigger="in-view"
              reducedMotionStrategy="static"
              animation="typewriter"
              duration={1.9}
              id="hero-text-typewriter-heading"
              text="Ship your CLI in an afternoon."
              className="font-heading text-foreground mt-6 max-w-xl text-[clamp(1.875rem,5.5cqi,3.75rem)] leading-[1.05] font-semibold tracking-tight"
            />
            <p className="text-muted-foreground mt-6 max-w-md text-base leading-7 @min-[480px]/hero:text-lg">
              A typed, developer-first toolkit for building command-line tools
              your team actually enjoys. Zero config, fully tree-shakeable.
            </p>

            <div className="border-border bg-muted/40 mt-7 flex max-w-md items-center gap-3 rounded-md border px-3.5 py-2.5">
              <Terminal
                aria-hidden="true"
                className="text-muted-foreground size-4 shrink-0"
              />
              <code className="text-foreground min-w-0 flex-1 truncate font-mono text-sm">
                <span className="text-muted-foreground select-none">$ </span>
                npm i -D @dethink/cli
              </code>
              <button
                type="button"
                aria-label="Copy install command"
                className="text-muted-foreground hover:text-foreground hover:bg-background focus-visible:ring-ring focus-visible:ring-offset-background grid size-7 shrink-0 place-items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Copy aria-hidden="true" className="size-3.5" />
              </button>
            </div>

            <div className="mt-7 flex flex-col flex-wrap gap-3 @min-[480px]/hero:flex-row @min-[480px]/hero:items-center">
              <Button asChild size="lg" leftIcon={<BookOpen />}>
                <a href="#installation-heading">Read the docs</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                leftIcon={<GitBranch />}
                rightIcon={<Star />}
              >
                <a href="#examples-heading">Star on GitHub</a>
              </Button>
            </div>
          </div>

          <div className="bg-foreground text-background min-w-0 overflow-hidden rounded-lg shadow-lg">
            <div className="border-background/15 flex items-center gap-2 border-b px-4 py-3">
              <span className="flex items-center gap-1.5" aria-hidden="true">
                <span className="bg-destructive size-3 rounded-full" />
                <span className="bg-warning size-3 rounded-full" />
                <span className="bg-success size-3 rounded-full" />
              </span>
              <span className="text-background/60 ml-2 font-mono text-xs">
                ~/app — zsh
              </span>
            </div>
            <div className="space-y-2 px-4 py-5 font-mono text-[13px] leading-relaxed">
              {terminalLines.map((line, index) => (
                <p
                  key={index}
                  className={
                    line.ok
                      ? "text-background flex items-start gap-2"
                      : line.prompt
                        ? "text-background flex items-start gap-2"
                        : "text-background/65 flex items-start gap-2"
                  }
                >
                  {line.prompt ? (
                    <span aria-hidden="true" className="text-background/50">
                      $
                    </span>
                  ) : line.ok ? (
                    <Check
                      aria-hidden="true"
                      className="text-success mt-0.5 size-3.5 shrink-0"
                    />
                  ) : (
                    <span aria-hidden="true" className="text-background/30">
                      ›
                    </span>
                  )}
                  <span className="min-w-0">{line.text}</span>
                </p>
              ))}
              <p className="text-background flex items-center gap-2 pt-1 font-mono">
                <span aria-hidden="true" className="text-background/50">
                  $
                </span>
                <span
                  aria-hidden="true"
                  className="bg-background inline-block h-4 w-2"
                />
              </p>
            </div>
            <div className="border-background/15 text-background/60 flex items-center justify-between border-t px-4 py-2.5 font-mono text-xs">
              <span>node v22.4.0</span>
              <span className="inline-flex items-center gap-1.5">
                Done
                <ArrowRight aria-hidden="true" className="size-3" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
