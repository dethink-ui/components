"use client";

import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { HorizontalAccordion } from "@dethink/components";
import { GithubIcon } from "@/components/icons";
import { CopyButton } from "@/components/copy-button";
import { LandingDemo } from "@/components/landing-demo";
import { componentCatalog } from "@/lib/components-meta";

const INSTALL_COMMAND = "npx shadcn@latest add @dethink/button";

const featuredSlugs = [
  "button",
  "data-table",
  "sidebar",
  "combobox",
  "dialog",
  "timeline",
  "card-stack",
  "horizontal-accordion",
];

const qualityChecks = [
  {
    title: "Keyboard first",
    body: "Roving focus, arrow keys, Home/End, and visible focus rings on every interactive part.",
  },
  {
    title: "ARIA built in",
    body: "Disclosure, listbox, dialog, and grid semantics wired by default and checked with jest-axe.",
  },
  {
    title: "SSR safe",
    body: "Every component server-renders cleanly and hydrates without window access at render time.",
  },
  {
    title: "Reduced motion",
    body: "Choreography respects prefers-reduced-motion — state is never communicated by animation alone.",
  },
];

function PrimaryCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

export function LandingHero() {
  return (
    <HorizontalAccordion
      aria-label="Dethink Components highlights"
      className="rounded-xl border border-border bg-background shadow-sm"
      compactBreakpoint={1024}
      defaultValue="overview"
      height={560}
    >
      <HorizontalAccordion.Item value="overview">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeIcon>
            <Sparkles className="size-[18px]" aria-hidden="true" />
          </HorizontalAccordion.BladeIcon>
          <HorizontalAccordion.BladeLabel>
            Overview
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <div className="grid h-full items-center gap-10 overflow-y-auto p-8 sm:p-10 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Open code · shadcn-compatible registry
              </p>
              <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight lg:text-5xl">
                Production React components,
                <span className="sc-gradient-text"> themed by tokens.</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                Dethink Components is an open-code component system for SaaS
                dashboards, internal tools, and AI-native interfaces. Copy the
                source into your project, restyle everything through CSS
                variables — like the teal theme on this very page.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <PrimaryCta href="/components">Browse components</PrimaryCta>
                <a
                  href="https://github.com/parveshh/dethink-components"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-5 text-base font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <GithubIcon className="size-4" />
                  GitHub
                </a>
              </div>
              <div className="flex w-full max-w-full items-center gap-3 rounded-lg border border-[var(--sc-code-border)] bg-[var(--sc-code-bg)] py-2 pl-4 pr-2 text-[var(--sc-code-foreground)] sm:w-fit">
                <code className="overflow-x-auto whitespace-nowrap font-mono text-sm">
                  {INSTALL_COMMAND}
                </code>
                <CopyButton text={INSTALL_COMMAND} />
              </div>
            </div>
            <div className="hidden justify-end xl:flex">
              <LandingDemo />
            </div>
          </div>
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>

      <HorizontalAccordion.Item value="components">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeIcon>
            <Layers className="size-[18px]" aria-hidden="true" />
          </HorizontalAccordion.BladeIcon>
          <HorizontalAccordion.BladeLabel>
            Components
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <div className="flex h-full flex-col justify-center gap-6 overflow-y-auto p-8 sm:p-10">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {componentCatalog.length} documented components
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight">
                From layout primitives to data tables
              </h2>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Buttons, forms, overlays, navigation, dates, and heavyweight
                data surfaces — every page pairs live previews with the exact
                source behind them, installation steps, and a full props
                reference.
              </p>
            </div>
            <ul className="flex max-w-2xl flex-wrap gap-2">
              {componentCatalog
                .filter((component) => featuredSlugs.includes(component.slug))
                .map((component) => (
                  <li key={component.slug}>
                    <Link
                      href={`/components/${component.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {component.name}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
            </ul>
            <div>
              <PrimaryCta href="/components">View the full catalog</PrimaryCta>
            </div>
          </div>
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>

      <HorizontalAccordion.Item value="theming">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeIcon>
            <Palette className="size-[18px]" aria-hidden="true" />
          </HorizontalAccordion.BladeIcon>
          <HorizontalAccordion.BladeLabel>
            Theming
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <div className="flex h-full flex-col justify-center gap-6 overflow-y-auto p-8 sm:p-10">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                CSS variables all the way down
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight">
                Rebrand without touching a component
              </h2>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Color, radius, typography, spacing, and density are all
                semantic tokens. This site&apos;s teal brand — and its dark
                mode — is a pure token override. Try the theme picker in the
                header to swap palettes live.
              </p>
            </div>
            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="size-9 rounded-full bg-primary shadow-sm" />
              <span className="size-9 rounded-full bg-foreground shadow-sm" />
              <span className="size-9 rounded-full bg-muted shadow-sm ring-1 ring-inset ring-border" />
              <span className="size-9 rounded-full bg-background shadow-sm ring-1 ring-inset ring-border" />
              <span className="font-mono text-xs text-muted-foreground">
                --dt-color-primary · --dt-radius-lg · --dt-font-heading
              </span>
            </div>
            <div className="w-fit rounded-lg border border-[var(--sc-code-border)] bg-[var(--sc-code-bg)] p-4 text-[var(--sc-code-foreground)]">
              <pre className="overflow-x-auto font-mono text-sm leading-6">{`:root {
  --dt-color-primary: oklch(0.72 0.12 190);
  --dt-radius-lg: 0.75rem;
}`}</pre>
            </div>
          </div>
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>

      <HorizontalAccordion.Item value="quality">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeIcon>
            <ShieldCheck className="size-[18px]" aria-hidden="true" />
          </HorizontalAccordion.BladeIcon>
          <HorizontalAccordion.BladeLabel>
            Quality
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <div className="flex h-full flex-col justify-center gap-6 overflow-y-auto p-8 sm:p-10">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                1,200+ tests · automated a11y · SSR smoke checks
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight">
                Accessible and verified by default
              </h2>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Every component ships with behavior tests, jest-axe automation,
                server-render smoke tests, and Storybook interaction coverage —
                this hero&apos;s accordion included.
              </p>
            </div>
            <dl className="grid max-w-2xl gap-x-8 gap-y-4 sm:grid-cols-2">
              {qualityChecks.map((check) => (
                <div key={check.title} className="space-y-1">
                  <dt className="flex items-center gap-2 font-heading text-base font-semibold">
                    <ShieldCheck
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    {check.title}
                  </dt>
                  <dd className="text-sm leading-6 text-muted-foreground">
                    {check.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
    </HorizontalAccordion>
  );
}
