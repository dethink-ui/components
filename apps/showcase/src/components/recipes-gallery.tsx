"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  Search,
  Settings2,
  Sparkles,
  Table2,
} from "lucide-react";
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Progress,
} from "@dethink/components";
import {
  getRecipeCategoryMeta,
  getRecipeComponentMetas,
  recipeCategories,
  recipesCatalog,
  type RecipeCategory,
  type RecipeMeta,
} from "@/lib/recipes-meta";

type ActiveCategory = "all" | RecipeCategory;

const previewIcons: Record<RecipeCategory, React.ElementType> = {
  ai: Bot,
  auth: LockKeyhole,
  billing: CreditCard,
  dashboard: LayoutDashboard,
  data: Table2,
  marketing: Sparkles,
  scheduling: CalendarDays,
  settings: Settings2,
};

function RecipeThumbnail({ recipe }: { recipe: RecipeMeta }) {
  const Icon = previewIcons[recipe.category];
  const metrics =
    recipe.category === "marketing"
      ? ["Hero", "Bento", "Pricing"]
      : recipe.category === "auth"
        ? ["SSO", "Form", "Toast"]
        : recipe.category === "data"
          ? ["Rows", "Drawer", "Actions"]
          : ["Shell", "Filters", "Status"];

  return (
    <div
      aria-hidden="true"
      className="sc-recipe-thumb border-border bg-background relative min-h-44 overflow-hidden rounded-lg border p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary grid size-9 place-items-center rounded-md">
            <Icon className="size-4" />
          </span>
          <div className="space-y-1">
            <span className="bg-foreground/80 block h-2.5 w-24 rounded-full" />
            <span className="bg-muted-foreground/30 block h-2 w-16 rounded-full" />
          </div>
        </div>
        <span className="border-border bg-muted h-7 w-16 rounded-full border" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {metrics.map((metric, index) => (
          <div
            key={metric}
            className="border-border bg-muted/45 rounded-md border p-2"
          >
            <span className="text-muted-foreground block text-[0.625rem] font-medium">
              {metric}
            </span>
            <span
              className="bg-primary/70 mt-2 block h-2 rounded-full"
              style={{ inlineSize: `${64 + index * 12}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-2">
        <Progress
          aria-label={`${recipe.title} preview progress`}
          value={recipe.featured ? 82 : 64}
          tone={recipe.featured ? "success" : "info"}
        />
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <span className="bg-muted block h-8 rounded-md" />
          <span className="bg-primary/80 block h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: RecipeMeta }) {
  const category = getRecipeCategoryMeta(recipe.category);
  const components = getRecipeComponentMetas(recipe).slice(0, 5);

  return (
    <Card className="group h-full overflow-hidden" shadow="sm">
      <div className="p-3 pb-0">
        <RecipeThumbnail recipe={recipe} />
      </div>
      <CardHeader>
        <CardTitle>
          <Link
            href={`/recipes/${recipe.slug}`}
            className="focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {recipe.title}
            <ArrowRight
              aria-hidden="true"
              className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        </CardTitle>
        <CardDescription>{recipe.summary}</CardDescription>
        <CardAction>
          <span className="border-border bg-muted text-muted-foreground rounded-full border px-2.5 py-1 text-xs font-medium">
            {recipe.complexity}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium">
            {category.name}
          </span>
          {recipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="border-border text-muted-foreground rounded-full border px-2.5 py-1 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.12em]">
            Components
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {components.map((component) => (
              <li key={component.slug}>
                <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
                  {component.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecipesGallery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ActiveCategory>("all");

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return recipesCatalog.filter((recipe) => {
      if (category !== "all" && recipe.category !== category) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = [
        recipe.title,
        recipe.summary,
        recipe.category,
        recipe.complexity,
        ...recipe.tags,
        ...getRecipeComponentMetas(recipe).map((component) => component.name),
      ]
        .join(" ")
        .toLocaleLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [category, query]);

  return (
    <div className="space-y-8">
      <div className="border-border bg-background/80 rounded-xl border p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(16rem,24rem)_1fr] lg:items-center">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
            />
            <Input
              aria-label="Search recipes"
              className="pl-9"
              placeholder="Search recipes, components, workflows..."
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={category === "all" ? "solid" : "outline"}
              onClick={() => setCategory("all")}
            >
              All
            </Button>
            {recipeCategories.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={category === item.id ? "solid" : "outline"}
                onClick={() => setCategory(item.id)}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredRecipes.length > 0 ? (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <li key={recipe.slug} className="h-full">
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-border bg-background rounded-xl border p-8">
          <EmptyState
            visual={<Search />}
            title="No recipes found"
            description="Try a broader workflow, component name, or category."
            primaryAction={
              <Button
                leftIcon={<CheckCircle2 />}
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
