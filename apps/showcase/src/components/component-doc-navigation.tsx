"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Combobox, ComboboxItem } from "@dethink/components";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import {
  componentCatalog,
  componentGroups,
  filterComponentGroups,
  getComponentDisplayName,
  getComponentMeta,
} from "@/lib/components-meta";

const motionEase = [0.2, 0, 0, 1] as const;

const navigationItems = componentCatalog.map((component) => {
  const displayName = getComponentDisplayName(component);
  const group = componentGroups.find((entry) =>
    entry.components.some((candidate) => candidate.slug === component.slug),
  );

  return {
    ...component,
    displayName,
    textValue: [
      displayName,
      component.name,
      component.description,
      group?.name,
      group?.description,
    ]
      .filter(Boolean)
      .join(" "),
    value: component.slug,
  };
});

const navigationItemsBySlug = new Map(
  navigationItems.map((component) => [component.slug, component]),
);

function SequentialLink({
  component,
  direction,
}: {
  component: (typeof componentCatalog)[number] | undefined;
  direction: "next" | "previous";
}) {
  const isPrevious = direction === "previous";
  const displayName = component
    ? getComponentDisplayName(component)
    : isPrevious
      ? "Start of catalog"
      : "End of catalog";
  const eyebrow = isPrevious ? "Previous" : "Next";
  const Icon = isPrevious ? ArrowLeft : ArrowRight;

  if (!component) {
    return (
      <span className="border-border bg-muted/20 text-muted-foreground flex min-h-20 items-center gap-3 rounded-md border border-dashed px-3 py-2 opacity-60">
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        <span className="min-w-0">
          <span className="block text-[0.6875rem] font-semibold tracking-[0.12em] uppercase">
            {eyebrow}
          </span>
          <span className="block truncate text-sm">{displayName}</span>
        </span>
      </span>
    );
  }

  return (
    <Link
      href={`/components/${component.slug}`}
      aria-label={`${eyebrow} component: ${displayName}`}
      className="border-border bg-background hover:border-primary/50 hover:bg-primary/[0.04] focus-visible:ring-ring focus-visible:ring-offset-background group flex min-h-20 items-center gap-3 rounded-md border px-3 py-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {isPrevious ? (
        <Icon
          aria-hidden="true"
          className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
        />
      ) : null}
      <span className={`min-w-0 ${isPrevious ? "" : "text-right"}`}>
        <span className="text-muted-foreground block text-[0.6875rem] font-semibold tracking-[0.12em] uppercase">
          {eyebrow}
        </span>
        <span className="font-heading block truncate text-sm font-semibold">
          {displayName}
        </span>
      </span>
      {!isPrevious ? (
        <Icon
          aria-hidden="true"
          className="text-muted-foreground group-hover:text-primary ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      ) : null}
    </Link>
  );
}

export function ComponentDocNavigation({
  currentSlug,
}: {
  currentSlug: string;
}) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const currentIndex = componentCatalog.findIndex(
    (component) => component.slug === currentSlug,
  );
  const currentComponent = getComponentMeta(currentSlug);
  const currentDisplayName = currentComponent
    ? getComponentDisplayName(currentComponent)
    : "";
  const [inputValue, setInputValue] = useState(currentDisplayName);
  const [isOpen, setIsOpen] = useState(false);
  const filteredItems = (
    isOpen && inputValue.trim()
      ? filterComponentGroups(inputValue).flatMap((group) => group.components)
      : componentCatalog
  )
    .map((component) => navigationItemsBySlug.get(component.slug))
    .filter((component) => component !== undefined);
  const previousComponent =
    currentIndex > 0 ? componentCatalog[currentIndex - 1] : undefined;
  const nextComponent =
    currentIndex >= 0 && currentIndex < componentCatalog.length - 1
      ? componentCatalog[currentIndex + 1]
      : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <motion.nav
        key={currentSlug}
        aria-label="Component documentation navigation"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: motionEase }}
        className="border-border bg-muted/15 rounded-xl border p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(15rem,22rem)_minmax(22rem,1fr)] xl:items-end">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                Browse documentation
              </p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {currentIndex + 1} of {componentCatalog.length}
              </p>
            </div>
            <Combobox
              aria-label="Switch component"
              placeholder="Search components"
              menuTrigger="focus"
              items={filteredItems}
              value={currentSlug}
              inputValue={inputValue}
              onInputValueChange={setInputValue}
              onOpenChange={(open, trigger) => {
                setIsOpen(open);

                if (open && trigger !== "input") {
                  setInputValue("");
                } else if (!open) {
                  setInputValue(currentDisplayName);
                }
              }}
              onValueChange={(value) => {
                if (!value || value === currentSlug) {
                  setInputValue(currentDisplayName);
                  return;
                }

                const next = getComponentMeta(value);
                setInputValue(next ? getComponentDisplayName(next) : value);
                router.push(`/components/${value}`);
              }}
            >
              {(component) => (
                <ComboboxItem
                  key={component.value}
                  value={component.value}
                  textValue={component.textValue}
                >
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="truncate">{component.displayName}</span>
                    {component.displayName !== component.name ? (
                      <code className="text-primary shrink-0 font-mono text-[0.6875rem]">
                        {component.name}
                      </code>
                    ) : null}
                  </span>
                </ComboboxItem>
              )}
            </Combobox>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SequentialLink
              direction="previous"
              component={previousComponent}
            />
            <SequentialLink direction="next" component={nextComponent} />
          </div>
        </div>
      </motion.nav>
    </MotionConfig>
  );
}
