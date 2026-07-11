import type { Metadata } from "next";
import { RecipesGallery } from "@/components/recipes-gallery";
import {
  featuredRecipes,
  recipeCategories,
  recipesCatalog,
} from "@/lib/recipes-meta";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Production-shaped recipes built with Dethink Components: auth, dashboards, CRUD screens, landing pages, AI workspaces, scheduling, settings, and billing flows.",
};

export default function RecipesIndexPage() {
  return (
    <div className="space-y-8">
      <header className="sc-hero-backdrop border-border/70 border-b px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl space-y-4">
            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
              Recipes
            </p>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                Complete product surfaces built from Dethink Components.
              </h1>
              <p className="text-muted-foreground max-w-2xl text-base leading-7">
                Browse copyable, live compositions for common SaaS, dashboard,
                internal-tool, and AI-native workflows. Every recipe links back
                to the components that power it.
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-2 lg:w-[27rem]">
            <div className="border-border bg-background/80 rounded-lg border p-3 shadow-sm backdrop-blur">
              <dt className="text-muted-foreground text-xs font-medium">
                Total recipes
              </dt>
              <dd className="font-heading mt-1 text-2xl font-semibold">
                {recipesCatalog.length}
              </dd>
            </div>
            <div className="border-border bg-background/80 rounded-lg border p-3 shadow-sm backdrop-blur">
              <dt className="text-muted-foreground text-xs font-medium">
                Featured recipes
              </dt>
              <dd className="font-heading mt-1 text-2xl font-semibold">
                {featuredRecipes.length}
              </dd>
            </div>
            <div className="border-border bg-background/80 rounded-lg border p-3 shadow-sm backdrop-blur">
              <dt className="text-muted-foreground text-xs font-medium">
                Categories
              </dt>
              <dd className="font-heading mt-1 text-2xl font-semibold">
                {recipeCategories.length}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <section
        aria-labelledby="recipes-gallery-heading"
        className="mx-auto box-border w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      >
        <div className="mb-4 space-y-2">
          <h2
            id="recipes-gallery-heading"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Browse recipes
          </h2>
          <p className="text-muted-foreground max-w-2xl text-sm leading-6">
            Filter by workflow or search across recipe names, tags, and
            component usage. Gallery previews stay lightweight; open a recipe
            for the full interactive surface and source.
          </p>
        </div>
        <RecipesGallery />
      </section>
    </div>
  );
}
