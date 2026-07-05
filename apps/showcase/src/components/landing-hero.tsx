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
  { title: "Keyboard first", body: "Roving focus, arrows, Home/End, focus rings." },
  { title: "ARIA built in", body: "Semantics wired and checked with jest-axe." },
  { title: "SSR safe", body: "Server-renders and hydrates cleanly." },
  { title: "Reduced motion", body: "Choreography respects user preference." },
];

function PrimaryCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col justify-center gap-5 p-8 lg:p-10">
      {children}
    </div>
  );
}

export function LandingHero() {
  return (
    <HorizontalAccordion
      aria-label="Dethink Components highlights"
      className="rounded-xl border border-border bg-background shadow-sm"
      bladeWidth={84}
      compactBreakpoint={1024}
      defaultValue="overview"
      height={450}
    >
      <HorizontalAccordion.Item value="overview">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeIcon>
            <Sparkles className="size-6" aria-hidden="true" />
          </HorizontalAccordion.BladeIcon>
          <HorizontalAccordion.BladeLabel className="text-base tracking-wide">
            Overview
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <PanelShell>
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Open code · shadcn-compatible registry
            </p>
            <h1 className="max-w-2xl font-heading text-3xl font-bold leading-[1.1] tracking-tight lg:text-4xl">
              Production React components,
              <span className="sc-gradient-text"> themed by tokens.</span>
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              An open-code component system for SaaS dashboards, internal
              tools, and AI-native interfaces. Copy the source, restyle it
              through CSS variables — like this page&apos;s theme.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryCta href="/components">Browse components</PrimaryCta>
              <a
                href="https://github.com/parveshh/dethink-components"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <GithubIcon className="size-4" />
                GitHub
              </a>
              <div className="flex items-center gap-3 rounded-lg border border-[var(--sc-code-border)] bg-[var(--sc-code-bg)] py-1.5 pl-4 pr-1.5 text-[var(--sc-code-foreground)]">
                <code className="overflow-x-auto whitespace-nowrap font-mono text-sm">
                  {INSTALL_COMMAND}
                </code>
                <CopyButton text={INSTALL_COMMAND} />
              </div>
            </div>
          </PanelShell>
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>

      <HorizontalAccordion.Item value="components">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeIcon>
            <Layers className="size-6" aria-hidden="true" />
          </HorizontalAccordion.BladeIcon>
          <HorizontalAccordion.BladeLabel className="text-base tracking-wide">
            Components
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <PanelShell>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {componentCatalog.length} documented components
            </p>
            <h2 className="font-heading text-2xl font-bold tracking-tight lg:text-3xl">
              From layout primitives to data tables
            </h2>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Every page pairs live previews with the exact source behind
              them, installation steps, and a full props reference.
            </p>
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
          </PanelShell>
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>

      <HorizontalAccordion.Item value="theming">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeIcon>
            <Palette className="size-6" aria-hidden="true" />
          </HorizontalAccordion.BladeIcon>
          <HorizontalAccordion.BladeLabel className="text-base tracking-wide">
            Theming
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <PanelShell>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              CSS variables all the way down
            </p>
            <h2 className="font-heading text-2xl font-bold tracking-tight lg:text-3xl">
              Rebrand without touching a component
            </h2>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Color, radius, typography, spacing, and density are semantic
              tokens. This site&apos;s brand — and its dark mode — is a pure
              token override. Try the theme picker in the header.
            </p>
            <div className="flex flex-wrap items-center gap-3" aria-hidden="true">
              <span className="size-9 rounded-full bg-primary shadow-sm" />
              <span className="size-9 rounded-full bg-foreground shadow-sm" />
              <span className="size-9 rounded-full bg-muted shadow-sm ring-1 ring-inset ring-border" />
              <span className="size-9 rounded-full bg-background shadow-sm ring-1 ring-inset ring-border" />
              <code className="font-mono text-xs text-muted-foreground">
                --dt-color-primary · --dt-radius-lg · --dt-font-heading
              </code>
            </div>
          </PanelShell>
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>

      <HorizontalAccordion.Item value="quality">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeIcon>
            <ShieldCheck className="size-6" aria-hidden="true" />
          </HorizontalAccordion.BladeIcon>
          <HorizontalAccordion.BladeLabel className="text-base tracking-wide">
            Quality
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <PanelShell>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              1,200+ tests · automated a11y · SSR smoke checks
            </p>
            <h2 className="font-heading text-2xl font-bold tracking-tight lg:text-3xl">
              Accessible and verified by default
            </h2>
            <dl className="grid max-w-2xl gap-x-8 gap-y-3 sm:grid-cols-2">
              {qualityChecks.map((check) => (
                <div key={check.title} className="space-y-0.5">
                  <dt className="flex items-center gap-2 font-heading text-sm font-semibold">
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
          </PanelShell>
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
    </HorizontalAccordion>
  );
}
