"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  Combobox,
  ComboboxItem,
} from "@dethink/components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  componentCatalog,
  componentGroups,
  filterComponentGroups,
  getComponentDisplayName,
  getComponentMeta,
} from "@/lib/components-meta";

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

export function ComponentDocNavigation({
  currentSlug,
}: {
  currentSlug: string;
}) {
  const router = useRouter();
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
  return (
    <nav
      key={currentSlug}
      aria-label="Component documentation navigation"
      className="motion-safe:animate-scrim-in max-w-md"
    >
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
    </nav>
  );
}

export function ComponentSequenceNavigation({
  currentSlug,
}: {
  currentSlug: string;
}) {
  const currentIndex = componentCatalog.findIndex(
    (component) => component.slug === currentSlug,
  );
  const previousComponent =
    currentIndex > 0 ? componentCatalog[currentIndex - 1] : undefined;
  const nextComponent =
    currentIndex >= 0 && currentIndex < componentCatalog.length - 1
      ? componentCatalog[currentIndex + 1]
      : undefined;

  if (!previousComponent && !nextComponent) {
    return null;
  }

  return (
    <nav aria-label="Adjacent components" className="flex min-w-0 justify-end">
      <ButtonGroup
        aria-label="Previous and next components"
        className="text-muted-foreground min-w-0 items-center"
      >
        {previousComponent ? (
          <Button
            asChild
            size="xs"
            variant="ghost"
            leftIcon={<ChevronLeft />}
            className="text-muted-foreground hover:text-foreground max-w-36 px-1.5 sm:max-w-48"
          >
            <Link
              href={`/components/${previousComponent.slug}`}
              aria-label={`Previous component: ${getComponentDisplayName(previousComponent)}`}
            >
              {getComponentDisplayName(previousComponent)}
            </Link>
          </Button>
        ) : null}
        {previousComponent && nextComponent ? (
          <ButtonGroupSeparator className="mx-0.5 my-1.5" />
        ) : null}
        {nextComponent ? (
          <Button
            asChild
            size="xs"
            variant="ghost"
            rightIcon={<ChevronRight />}
            className="text-muted-foreground hover:text-foreground max-w-36 px-1.5 sm:max-w-48"
          >
            <Link
              href={`/components/${nextComponent.slug}`}
              aria-label={`Next component: ${getComponentDisplayName(nextComponent)}`}
            >
              {getComponentDisplayName(nextComponent)}
            </Link>
          </Button>
        ) : null}
      </ButtonGroup>
    </nav>
  );
}
