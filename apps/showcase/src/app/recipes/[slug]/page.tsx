import type { ComponentType } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { RecipeDemoBar } from "@/components/recipe-demo-bar";
import { AiWorkspaceRecipe } from "@/examples/recipes/ai-workspace";
import { AiChatStudioRecipe } from "@/examples/recipes/ai-chat-studio";
import { CommandCenterDashboardRecipe } from "@/examples/recipes/command-center-dashboard";
import { CrudResourceManagerRecipe } from "@/examples/recipes/crud-resource-manager";
import { CustomerSupportCopilotRecipe } from "@/examples/recipes/customer-support-copilot";
import { DaymarkLandingRecipe } from "@/examples/recipes/daymark-landing";
import { DethinkLabsSecurityRecipe } from "@/examples/recipes/dethink-labs-security";
import { HelioGridEnergyRecipe } from "@/examples/recipes/heliogrid-energy";
import { HushAndHearthRecipe } from "@/examples/recipes/hush-and-hearth";
import { IntegrationsHubRecipe } from "@/examples/recipes/integrations-hub";
import { InvoiceApprovalDeskRecipe } from "@/examples/recipes/invoice-approval-desk";
import { LoginAndOnboardingRecipe } from "@/examples/recipes/login-and-onboarding";
import { RelayLandingRecipe } from "@/examples/recipes/relay-landing";
import { LumenLandingRecipe } from "@/examples/recipes/lumen-landing";
import { ReleaseReadinessRecipe } from "@/examples/recipes/release-readiness";
import { SaasCheckoutOrderSummaryRecipe } from "@/examples/recipes/saas-checkout-order-summary";
import { SaasLandingPageRecipe } from "@/examples/recipes/saas-landing-page";
import { SchedulerAndBookingRecipe } from "@/examples/recipes/scheduler-and-booking";
import { SettingsAndBillingRecipe } from "@/examples/recipes/settings-and-billing";
import { getExampleSource } from "@/lib/example-source";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import {
  getRecipeCategoryMeta,
  getRecipeComponentMetas,
  getRecipeMeta,
  recipesCatalog,
} from "@/lib/recipes-meta";

const recipeComponents: Record<string, ComponentType<RecipePreviewProps>> = {
  "ai-chat-studio": AiChatStudioRecipe,
  "relay-landing": RelayLandingRecipe,
  "ai-workspace": AiWorkspaceRecipe,
  "command-center-dashboard": CommandCenterDashboardRecipe,
  "crud-resource-manager": CrudResourceManagerRecipe,
  "customer-support-copilot": CustomerSupportCopilotRecipe,
  "daymark-landing": DaymarkLandingRecipe,
  "dethink-labs-security": DethinkLabsSecurityRecipe,
  "heliogrid-energy": HelioGridEnergyRecipe,
  "hush-and-hearth": HushAndHearthRecipe,
  "integrations-hub": IntegrationsHubRecipe,
  "invoice-approval-desk": InvoiceApprovalDeskRecipe,
  "login-and-onboarding": LoginAndOnboardingRecipe,
  "lumen-landing": LumenLandingRecipe,
  "release-readiness": ReleaseReadinessRecipe,
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

export default async function RecipeDetailPage({ params }: RecipePageProps) {
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
        candidate.slug !== recipe.slug &&
        candidate.category === recipe.category,
    )
    .slice(0, 3);

  return (
    <article className="w-full">
      <section
        aria-labelledby="recipe-demo-title"
        data-recipe-demo={recipe.slug}
        className="bg-background min-h-[calc(100dvh-3.5rem)]"
      >
        <RecipeDemoBar title={recipe.title} />
        <div
          data-recipe-preview={recipe.slug}
          className="sc-recipe-full-page bg-background mx-auto min-h-[calc(100dvh-7rem)] w-full max-w-[1200px] overflow-x-clip"
        >
          <RecipePreview presentation="full-page" />
        </div>
      </section>

      <div className="mx-auto box-border w-full max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="space-y-6">
          <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
            Recipe details
          </p>

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
                <h2
                  id="recipe-details-heading"
                  className="font-heading scroll-mt-32 text-4xl font-bold tracking-tight text-balance sm:text-5xl"
                >
                  {recipe.title}
                </h2>
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
                      className="bg-background hover:border-primary/50 hover:text-primary focus-visible:ring-ring focus-visible:ring-offset-background border-border text-muted-foreground inline-flex rounded-full border px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      {component.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <section
            aria-labelledby="recipe-source-heading"
            className="min-w-0 space-y-4"
          >
            <div className="space-y-1.5">
              <h2
                id="recipe-source-heading"
                className="font-heading scroll-mt-32 text-2xl font-semibold tracking-tight"
              >
                Source
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm leading-6">
                Copy the whole example or lift the component compositions into
                your own app. Recipes are showcase examples, not registry
                blocks.
              </p>
            </div>
            <CodeBlock
              code={source}
              filename={`examples/${recipe.sourceFile}`}
            />
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
      </div>
    </article>
  );
}
