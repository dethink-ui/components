import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
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
import { WorkbenchDock } from "@/components/workbench-dock";
import { WorkbenchHero } from "@/components/workbench-hero";
import { componentCatalog, getComponentMeta } from "@/lib/components-meta";
import {
  featuredRecipes,
  getRecipeCategoryMeta,
  getRecipeComponentMetas,
} from "@/lib/recipes-meta";

/*
 * The landing page is a "component workbench": a token-themed console that
 * doubles as the marketing surface. It leans on real @dethink/components
 * (NavDock for section nav, RevealButton for hero actions) and reuses the
 * showcase's live component teasers, so nothing here is a static mock.
 */

// A curated matrix of components whose teasers read well at card size.
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

const colorTokens = [
  { name: "background", token: "--dt-color-background" },
  { name: "muted", token: "--dt-color-muted" },
  { name: "border", token: "--dt-color-border" },
  { name: "foreground", token: "--dt-color-foreground" },
  { name: "primary", token: "--dt-color-primary" },
  { name: "info", token: "--dt-color-info" },
  { name: "success", token: "--dt-color-success" },
  { name: "destructive", token: "--dt-color-destructive" },
] as const;

const typeScale = [
  {
    label: "Display / 52",
    className: "font-heading text-5xl font-bold tracking-tight",
    sample: "Space Grotesk",
  },
  {
    label: "Heading / 22",
    className: "font-heading text-[22px] font-bold tracking-tight",
    sample: "Component matrix",
  },
  {
    label: "Body / 16",
    className: "font-sans text-base",
    sample: "Inter carries every paragraph, label, and UI string.",
  },
  {
    label: "Mono / 13",
    className: "font-mono text-[13px]",
    sample: 'const contract = "--dt-*";',
  },
] as const;

const radii = [
  { label: "sm", className: "rounded-[var(--dt-radius-sm)]" },
  { label: "md", className: "rounded-[var(--dt-radius-md)]" },
  { label: "lg", className: "rounded-[var(--dt-radius-lg)]" },
  { label: "pill", className: "rounded-full" },
] as const;

export default function HomePage() {
  const componentCount = componentCatalog.length;
  const recipeCount = featuredRecipes.length;

  return (
    <div className="flex flex-col">
      <WorkbenchDock />

      {/* ============================== OVERVIEW / HERO ============================== */}
      <section
        id="overview"
        aria-labelledby="overview-heading"
        className="sc-hero-backdrop border-border/70 scroll-mt-20 border-b"
      >
        <h2 id="overview-heading" className="sr-only">
          Overview
        </h2>
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <WorkbenchHero
            componentCount={componentCount}
            recipeCount={recipeCount}
          />
        </div>
      </section>

      {/* ============================== COMPONENT MATRIX ============================== */}
      <section
        id="matrix"
        aria-labelledby="matrix-heading"
        className="border-border/70 scroll-mt-20 border-b"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-2">
              <p className="text-primary font-mono text-[11px] font-medium tracking-[0.14em] uppercase">
                {componentCount} components
              </p>
              <h2
                id="matrix-heading"
                className="font-heading text-2xl font-bold tracking-tight"
              >
                Component matrix
              </h2>
            </div>
            <span className="text-muted-foreground font-mono text-[11px] tracking-[0.12em] uppercase">
              Hover = live preview
            </span>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {matrixSlugs.map((slug) => {
              const meta = getComponentMeta(slug);
              if (!meta) return null;

              return (
                <li key={slug}>
                  {/*
                   * The teaser is a decorative sibling of the link — never a
                   * child of the anchor — so the interactive elements inside
                   * each teaser don't nest inside an <a> (invalid HTML that
                   * causes hydration mismatches). A stretched link keeps the
                   * whole card clickable.
                   */}
                  <article className="group border-border bg-background hover:border-primary/50 hover:bg-primary/[0.04] relative flex h-full flex-col gap-3 rounded-md border p-4 transition-colors">
                    <span
                      aria-hidden="true"
                      inert
                      className="pointer-events-none flex h-14 origin-left scale-[0.62] items-center [&>*]:w-full"
                    >
                      {matrixTeasers[slug]}
                    </span>
                    <h3 className="font-heading flex items-center justify-between text-sm font-semibold">
                      <Link
                        href={`/components/${slug}`}
                        className="focus-visible:ring-ring rounded-sm outline-none after:absolute after:inset-0 after:rounded-md focus-visible:ring-2"
                      >
                        {meta.name}
                      </Link>
                      <ArrowRight
                        aria-hidden="true"
                        className="text-muted-foreground group-hover:text-primary size-3.5 transition-transform group-hover:translate-x-0.5"
                      />
                    </h3>
                  </article>
                </li>
              );
            })}

            <li>
              <Link
                href="/components"
                className="group border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/[0.06] focus-visible:ring-ring focus-visible:ring-offset-background flex h-full flex-col justify-between gap-3 rounded-md border p-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <span className="text-primary font-mono text-[11px] font-semibold">
                  +{componentCount - matrixSlugs.length}
                </span>
                <span className="text-muted-foreground group-hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors">
                  View all
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* ============================== RECIPES ============================== */}
      <section
        id="recipes"
        aria-labelledby="recipes-heading"
        className="border-border/70 bg-muted/25 scroll-mt-20 border-b"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-2">
              <p className="text-primary font-mono text-[11px] font-medium tracking-[0.14em] uppercase">
                Recipes
              </p>
              <h2
                id="recipes-heading"
                className="font-heading text-2xl font-bold tracking-tight"
              >
                Components, composed into product flows
              </h2>
            </div>
            <Link
              href="/recipes"
              className="text-primary inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              All {recipeCount} recipes
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <ul className="grid gap-5 md:grid-cols-2">
            {featuredRecipes.slice(0, 4).map((recipe) => {
              const category = getRecipeCategoryMeta(recipe.category);
              const components = getRecipeComponentMetas(recipe).slice(0, 3);

              return (
                <li key={recipe.slug}>
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className="group border-border bg-background hover:border-primary/50 flex h-full flex-col overflow-hidden rounded-xl border shadow-sm transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className="sc-recipe-thumb border-border/70 flex h-40 items-center justify-center border-b"
                    >
                      <span className="font-heading text-primary/70 text-4xl font-bold tracking-tight">
                        {category.name}
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-3 p-5">
                      <span className="space-y-1">
                        <span className="font-heading block text-lg font-semibold">
                          {recipe.title}
                        </span>
                        <span className="text-muted-foreground font-mono block text-[10px] tracking-wide uppercase">
                          {components.map((component) => component.name).join(" · ")}
                        </span>
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ============================== FOUNDATIONS / TOKENS ============================== */}
      <section
        id="foundations"
        aria-labelledby="foundations-heading"
        className="scroll-mt-20"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <p className="text-primary font-mono text-[11px] font-medium tracking-[0.14em] uppercase">
              Foundations / design tokens
            </p>
            <h2
              id="foundations-heading"
              className="font-heading text-2xl font-bold tracking-tight"
            >
              The --dt-* contract
            </h2>
            <p className="text-muted-foreground max-w-xl text-sm leading-6">
              One console pattern, two themes. Every surface, border, and text
              color below is a token — flip the theme in the header and the whole
              system restyles.
            </p>
          </div>

          {/* Color */}
          <h3 className="font-heading mb-3 text-lg font-semibold">Color</h3>
          <ul className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {colorTokens.map((swatch) => (
              <li
                key={swatch.token}
                className="border-border bg-background overflow-hidden rounded-md border"
              >
                <span
                  aria-hidden="true"
                  className="block h-16"
                  style={{ background: `var(${swatch.token})` }}
                />
                <span className="block px-3 py-2.5">
                  <span className="font-mono block text-xs font-semibold">
                    {swatch.name}
                  </span>
                  <span className="text-muted-foreground font-mono mt-0.5 block text-[10px]">
                    {swatch.token}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {/* Type */}
          <h3 className="font-heading mb-3 text-lg font-semibold">Type</h3>
          <div className="border-border bg-background mb-10 space-y-4 rounded-md border p-6">
            {typeScale.map((row) => (
              <div
                key={row.label}
                className="flex flex-wrap items-baseline gap-4"
              >
                <span className="text-muted-foreground font-mono w-32 shrink-0 text-[11px]">
                  {row.label}
                </span>
                <span className={row.className}>{row.sample}</span>
              </div>
            ))}
          </div>

          {/* Radius */}
          <h3 className="font-heading mb-3 text-lg font-semibold">
            Radius &amp; elevation
          </h3>
          <ul className="flex flex-wrap gap-4">
            {radii.map((radius) => (
              <li
                key={radius.label}
                className={`border-border bg-background text-muted-foreground font-mono grid h-20 w-28 place-items-center border text-[11px] shadow-sm ${radius.className}`}
              >
                {radius.label}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
