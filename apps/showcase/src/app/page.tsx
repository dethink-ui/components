import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import {
  ButtonTeaser,
  CalendarTeaser,
  CardStackTeaser,
  CardTeaser,
  ComboboxTeaser,
  DatePickerTeaser,
  DateRangePickerTeaser,
  DateTimePickerTeaser,
  InputTeaser,
  SelectTeaser,
} from "@/components/component-teasers";
import { GithubIcon } from "@/components/icons";
import { CopyButton } from "@/components/copy-button";
import { LandingDemo } from "@/components/landing-demo";
import { componentCatalog } from "@/lib/components-meta";

const INSTALL_COMMAND = "npx shadcn@latest add @dethink/button";

const teasers: Record<string, ReactNode> = {
  button: <ButtonTeaser />,
  calendar: <CalendarTeaser />,
  card: <CardTeaser />,
  "card-stack": <CardStackTeaser />,
  combobox: <ComboboxTeaser />,
  "date-picker": <DatePickerTeaser />,
  "date-range-picker": <DateRangePickerTeaser />,
  "date-time-picker": <DateTimePickerTeaser />,
  input: <InputTeaser />,
  select: <SelectTeaser />,
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="sc-hero-backdrop border-b border-border/70">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24 lg:px-8">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Open code · shadcn-compatible registry
            </p>
            <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
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
              <Link
                href="/components"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Browse components
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
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
            <div className="flex w-fit max-w-full items-center gap-3 rounded-lg border border-[var(--sc-code-border)] bg-[var(--sc-code-bg)] py-2 pl-4 pr-2 text-[var(--sc-code-foreground)]">
              <code className="overflow-x-auto whitespace-nowrap font-mono text-sm">
                {INSTALL_COMMAND}
              </code>
              <CopyButton text={INSTALL_COMMAND} />
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <LandingDemo />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="catalog-heading"
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h2
              id="catalog-heading"
              className="font-heading text-3xl font-bold tracking-tight"
            >
              Documented components
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Each page pairs live previews with the exact source behind them,
              installation steps, and a full props reference.
            </p>
          </div>
          <Link
            href="/components"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View all
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="grid gap-5 md:grid-cols-3">
          {componentCatalog.map((component) => (
            <li key={component.slug} className="h-full">
              <Link
                href={`/components/${component.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="sc-preview-surface flex min-h-36 flex-1 items-center justify-center border-b border-border/70 p-6">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none w-full max-w-60"
                    // Teasers are decorative previews; the link text carries meaning.
                    inert
                  >
                    {teasers[component.slug]}
                  </div>
                </div>
                <div className="space-y-1.5 p-5">
                  <h3 className="flex items-center justify-between font-heading text-lg font-semibold">
                    {component.name}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {component.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="principles-heading"
        className="border-t border-border/70 bg-muted/40"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 id="principles-heading" className="sr-only">
            Principles
          </h2>
          <dl className="grid gap-10 md:grid-cols-3">
            <div className="space-y-2">
              <dt className="font-heading text-lg font-semibold">
                <span aria-hidden="true" className="mr-2 text-primary">
                  01
                </span>
                Own the code
              </dt>
              <dd className="text-sm leading-6 text-muted-foreground">
                Components install as readable source through a shadcn-compatible
                registry. No black-box package — edit anything.
              </dd>
            </div>
            <div className="space-y-2">
              <dt className="font-heading text-lg font-semibold">
                <span aria-hidden="true" className="mr-2 text-primary">
                  02
                </span>
                Themed by tokens
              </dt>
              <dd className="text-sm leading-6 text-muted-foreground">
                Every color, radius, font, and density value is a CSS variable.
                This site&apos;s teal brand is a pure token override — zero
                component changes.
              </dd>
            </div>
            <div className="space-y-2">
              <dt className="font-heading text-lg font-semibold">
                <span aria-hidden="true" className="mr-2 text-primary">
                  03
                </span>
                Accessible by default
              </dt>
              <dd className="text-sm leading-6 text-muted-foreground">
                Keyboard support, focus rings, ARIA states, and reduced-motion
                behavior are built in and covered by automated a11y tests.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
