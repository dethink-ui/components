"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Button, EmptyState, Input } from "@dethink/components";
import { ArrowRight, Search, SearchX, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import {
  componentCatalog,
  filterComponentGroups,
  getComponentDisplayName,
} from "@/lib/components-meta";

const motionEase = [0.2, 0, 0, 1] as const;
const quickDuration = 0.12;
const standardDuration = 0.24;

function resultLabel(count: number) {
  return `${count} ${count === 1 ? "component" : "components"}`;
}

export function ComponentCatalog() {
  const [query, setQuery] = useState("");
  const [announcedCount, setAnnouncedCount] = useState(componentCatalog.length);
  const inputId = useId();
  const descriptionId = useId();
  const searchRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const filteredGroups = filterComponentGroups(query);
  const filteredCount = filteredGroups.reduce(
    (total, group) => total + group.components.length,
    0,
  );
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAnnouncedCount(filteredCount);
    }, 240);

    return () => window.clearTimeout(timeoutId);
  }, [filteredCount]);

  useEffect(() => {
    searchRef.current?.setAttribute("data-hydrated", "true");
  }, []);

  const clearSearch = () => setQuery("");

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-10">
        <search
          ref={searchRef}
          className="border-border bg-background/80 block rounded-xl border p-4 shadow-sm sm:p-5"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(16rem,26rem)_1fr] lg:items-end">
            <div className="space-y-2">
              <label
                htmlFor={inputId}
                className="font-heading block text-sm font-semibold"
              >
                Find a component
              </label>
              <p
                id={descriptionId}
                className="text-muted-foreground text-sm leading-6"
              >
                Search by API name, purpose, or component group.
              </p>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                />
                <Input
                  id={inputId}
                  aria-describedby={descriptionId}
                  className="pr-12 pl-9"
                  placeholder="Try “Icon Button”, “forms”, or “microphone”"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <span className="absolute top-1/2 right-1.5 -translate-y-1/2">
                  <AnimatePresence initial={false}>
                    {hasQuery ? (
                      <motion.span
                        key="clear-search"
                        initial={
                          shouldReduceMotion
                            ? false
                            : { opacity: 0, scale: 0.88 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        exit={
                          shouldReduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.88 }
                        }
                        transition={{
                          duration: quickDuration,
                          ease: motionEase,
                        }}
                        className="inline-flex"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Clear component search"
                          onClick={clearSearch}
                        >
                          <X aria-hidden="true" className="size-4" />
                        </Button>
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
              </div>
            </div>

            <div className="flex min-h-10 items-center justify-between gap-4 lg:justify-end">
              <p
                aria-hidden="true"
                className="text-muted-foreground flex items-baseline gap-2 text-sm"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={filteredCount}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                    }
                    transition={{ duration: quickDuration, ease: motionEase }}
                    className="text-foreground font-heading text-2xl font-semibold tabular-nums"
                  >
                    {filteredCount}
                  </motion.span>
                </AnimatePresence>
                <span>
                  {hasQuery
                    ? `of ${componentCatalog.length} components`
                    : "documented components"}
                </span>
              </p>
              <p className="sr-only" aria-live="polite" aria-atomic="true">
                {resultLabel(announcedCount)} found.
              </p>
            </div>
          </div>
        </search>

        <section aria-label="Component catalog results" className="space-y-12">
          <AnimatePresence initial={false} mode="popLayout">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group, groupIndex) => (
                <motion.section
                  key={group.id}
                  aria-labelledby={`${group.id}-heading`}
                  layout={shouldReduceMotion ? false : "position"}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }
                  }
                  transition={{
                    duration: standardDuration,
                    ease: motionEase,
                    delay: shouldReduceMotion
                      ? 0
                      : Math.min(groupIndex * 0.025, 0.1),
                    layout: {
                      duration: standardDuration,
                      ease: motionEase,
                    },
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <h2
                      id={`${group.id}-heading`}
                      className="font-heading text-2xl font-semibold tracking-tight"
                    >
                      {group.name}
                    </h2>
                    <p className="text-muted-foreground max-w-2xl text-sm leading-6">
                      {group.description}
                    </p>
                  </div>
                  <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {group.components.map((component) => {
                      const displayName = getComponentDisplayName(component);
                      const showApiName = displayName !== component.name;

                      return (
                        <li key={component.slug}>
                          <Link
                            href={`/components/${component.slug}`}
                            className="group border-border/70 bg-background hover:border-primary/50 hover:bg-primary/[0.04] focus-visible:ring-ring focus-visible:ring-offset-background flex h-full min-h-40 flex-col gap-3 rounded-md border p-5 shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                          >
                            <span className="flex items-start justify-between gap-3">
                              <span className="min-w-0 space-y-1">
                                <span className="font-heading block text-lg font-semibold">
                                  {displayName}
                                </span>
                                {showApiName ? (
                                  <code className="text-primary block font-mono text-[0.6875rem] tracking-wide">
                                    {component.name}
                                  </code>
                                ) : null}
                              </span>
                              <ArrowRight
                                aria-hidden="true"
                                className="text-muted-foreground group-hover:text-primary mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                              />
                            </span>
                            <span className="text-muted-foreground text-sm leading-6">
                              {component.description}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </motion.section>
              ))
            ) : (
              <motion.div
                key="no-component-results"
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 12, scale: 0.99 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -8, scale: 0.99 }
                }
                transition={{ duration: standardDuration, ease: motionEase }}
              >
                <EmptyState
                  variant="page"
                  visual={<SearchX />}
                  title={
                    <h2 className="font-heading text-lg font-semibold">
                      No components found
                    </h2>
                  }
                  description={`Nothing matches “${query.trim()}”. Try an API name, component group, or purpose.`}
                  primaryAction={
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearSearch}
                    >
                      Clear search
                    </Button>
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </MotionConfig>
  );
}
