"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
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
} from "@dethink/components";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import {
  getRecipeCategoryMeta,
  getRecipeComponentMetas,
  recipeCategories,
  recipesCatalog,
  type RecipeCategory,
  type RecipeMeta,
} from "@/lib/recipes-meta";

type ActiveCategory = "all" | RecipeCategory;

const motionEase = [0.2, 0, 0, 1] as const;

function RecipeThumbnail({ recipe }: { recipe: RecipeMeta }) {
  return (
    <div
      aria-hidden="true"
      className="sc-recipe-thumb border-border bg-muted relative aspect-video overflow-hidden rounded-lg border"
    >
      <Image
        src={`/recipe-captures/${recipe.slug}--teal-light-default@1x.png`}
        alt=""
        width={1200}
        height={675}
        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, calc(100vw - 3rem)"
        className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
        draggable={false}
      />
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
          <p className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
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
  const [announcedCount, setAnnouncedCount] = useState(recipesCatalog.length);
  const shouldReduceMotion = useReducedMotion();

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredRecipes = recipesCatalog.filter((recipe) => {
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAnnouncedCount(filteredRecipes.length);
    }, 240);

    return () => window.clearTimeout(timeoutId);
  }, [filteredRecipes.length]);

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        <search
          aria-label="Filter recipes"
          className="border-border bg-background/80 block rounded-xl border p-4 shadow-sm"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(16rem,24rem)_1fr] lg:items-center">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
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
                aria-pressed={category === "all"}
                onClick={() => setCategory("all")}
              >
                All
              </Button>
              {recipeCategories.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={category === item.id ? "solid" : "outline"}
                  aria-pressed={category === item.id}
                  onClick={() => setCategory(item.id)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        </search>

        <div className="text-muted-foreground flex min-h-7 items-baseline justify-between gap-4 text-sm">
          <p aria-hidden="true" className="flex items-baseline gap-1.5">
            Showing
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={filteredRecipes.length}
                initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }
                }
                transition={{ duration: 0.12, ease: motionEase }}
                className="text-foreground font-heading text-lg font-semibold tabular-nums"
              >
                {filteredRecipes.length}
              </motion.span>
            </AnimatePresence>
            of {recipesCatalog.length} recipes
          </p>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {announcedCount} {announcedCount === 1 ? "recipe" : "recipes"}
            found.
          </p>
          {query || category !== "all" ? (
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          {filteredRecipes.length > 0 ? (
            <motion.ul
              key="recipe-results"
              aria-label="Recipe results"
              layout={shouldReduceMotion ? false : "position"}
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {filteredRecipes.map((recipe, index) => (
                  <motion.li
                    key={recipe.slug}
                    layout={shouldReduceMotion ? false : "position"}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: -8 }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.24,
                      ease: motionEase,
                      delay: shouldReduceMotion
                        ? 0
                        : Math.min(index * 0.025, 0.125),
                      layout: {
                        duration: shouldReduceMotion ? 0 : 0.24,
                        ease: motionEase,
                      },
                    }}
                    className="h-full"
                  >
                    <RecipeCard recipe={recipe} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <motion.div
              key="no-recipe-results"
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.99 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -8, scale: 0.99 }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : 0.24,
                ease: motionEase,
              }}
              className="border-border bg-background rounded-xl border p-8"
            >
              <EmptyState
                visual={<Search />}
                title={
                  <h3 className="font-heading text-lg font-semibold">
                    No recipes found
                  </h3>
                }
                description="Try a broader workflow, component name, or category."
                primaryAction={
                  <Button
                    leftIcon={<CheckCircle2 />}
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
