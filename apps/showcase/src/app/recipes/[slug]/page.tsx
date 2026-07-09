import type { ComponentType } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { AiWorkspaceRecipe } from "@/examples/recipes/ai-workspace";
import { CommandCenterDashboardRecipe } from "@/examples/recipes/command-center-dashboard";
import { CrudResourceManagerRecipe } from "@/examples/recipes/crud-resource-manager";
import { CustomerSupportCopilotRecipe } from "@/examples/recipes/customer-support-copilot";
import { LoginAndOnboardingRecipe } from "@/examples/recipes/login-and-onboarding";
import { SaasCheckoutOrderSummaryRecipe } from "@/examples/recipes/saas-checkout-order-summary";
import { SaasLandingPageRecipe } from "@/examples/recipes/saas-landing-page";
import { SchedulerAndBookingRecipe } from "@/examples/recipes/scheduler-and-booking";
import { SettingsAndBillingRecipe } from "@/examples/recipes/settings-and-billing";
import { getExampleSource } from "@/lib/example-source";
import {
  getRecipeCategoryMeta,
  getRecipeComponentMetas,
  getRecipeMeta,
  recipesCatalog,
} from "@/lib/recipes-meta";

const recipeComponents: Record<string, ComponentType> = {
  "ai-workspace": AiWorkspaceRecipe,
  "command-center-dashboard": CommandCenterDashboardRecipe,
  "crud-resource-manager": CrudResourceManagerRecipe,
  "customer-support-copilot": CustomerSupportCopilotRecipe,
  "login-and-onboarding": LoginAndOnboardingRecipe,
  "saas-checkout-order-summary": SaasCheckoutOrderSummaryRecipe,
  "saas-landing-page": SaasLandingPageRecipe,
  "scheduler-and-booking": SchedulerAndBookingRecipe,
  "settings-and-billing": SettingsAndBillingRecipe,
};

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return recipesCatalog.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeMeta(slug);

  if (!recipe) {
    return {
      title: "Recipe not found",
    };
  }

  return {
    title: recipe.title,
    description: recipe.summary,
  };
}

export default async function RecipeDetailPage({
  params,
}: RecipePageProps) {
  const { slug } = await params;
  const recipe = getRecipeMeta(slug);
  const RecipePreview = recipe ? recipeComponents[recipe.slug] : undefined;

  if (!recipe || !RecipePreview) {
    notFound();
  }

  const category = getRecipeCategoryMeta(recipe.category);
  const components = getRecipeComponentMetas(recipe);
  const source = await getExampleSource(recipe.sourceFile);
  const relatedRecipes = recipesCatalog
    .filter(
      (candidate) =>
        candidate.slug !== recipe.slug && candidate.category === recipe.category,
    )
    .slice(0, 3);

  return (
    <article className="mx-auto box-border w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-6">
        <Link
          href="/recipes"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center gap-2 rounded-md text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Recipes
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                {category.name}
              </span>
              <span className="border-border text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium">
                {recipe.complexity}
              </span>
              {recipe.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="border-border text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                {recipe.title}
              </h1>
              <p className="text-muted-foreground max-w-3xl text-base leading-7">
                {recipe.summary}
              </p>
            </div>
          </div>

          <aside className="border-border bg-muted/35 rounded-xl border p-4">
            <h2 className="font-heading text-sm font-semibold">
              Components used
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {components.map((component) => (
                <li key={component.slug}>
                  <Link
                    href={`/components/${component.slug}`}
                    className="bg-background hover:border-primary/50 hover:text-primary focus-visible:ring-ring focus-visible:ring-offset-background inline-flex rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    {component.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </header>

      <section aria-labelledby="recipe-preview-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2
              id="recipe-preview-heading"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Live preview
            </h2>
            <p className="text-muted-foreground max-w-2xl text-sm leading-6">
              This is the full interactive recipe. The source below is read
              from the same file that renders this preview.
            </p>
          </div>
          <a
            href="#recipe-source-heading"
            className="text-primary inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
          >
            View source
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="sc-preview-surface border-border overflow-hidden rounded-xl border bg-background p-4 sm:p-6 lg:p-8">
          <RecipePreview />
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section
          aria-labelledby="recipe-source-heading"
          className="min-w-0 space-y-4"
        >
          <div className="space-y-1.5">
            <h2
              id="recipe-source-heading"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Source
            </h2>
            <p className="text-muted-foreground max-w-2xl text-sm leading-6">
              Copy the whole example or lift the component compositions into
              your own app. Recipes are showcase examples, not registry blocks.
            </p>
          </div>
          <CodeBlock code={source} filename={`examples/${recipe.sourceFile}`} />
        </section>

        <aside className="sc-recipe-section-deferred space-y-4">
          {[
            ["Motion", recipe.motionNotes],
            ["Accessibility", recipe.accessibilityNotes],
            ["Responsive", recipe.responsiveNotes],
          ].map(([title, body]) => (
            <section
              key={title}
              className="border-border bg-background rounded-xl border p-4 shadow-sm"
            >
              <h2 className="font-heading flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2
                  className="text-primary size-4"
                  aria-hidden="true"
                />
                {title}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {body}
              </p>
            </section>
          ))}

          {relatedRecipes.length > 0 ? (
            <section className="border-border bg-muted/35 rounded-xl border p-4">
              <h2 className="font-heading text-sm font-semibold">
                Related recipes
              </h2>
              <ul className="mt-3 space-y-2">
                {relatedRecipes.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/recipes/${item.slug}`}
                      className="text-muted-foreground hover:text-primary focus-visible:ring-ring focus-visible:ring-offset-background inline-flex rounded-md text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
