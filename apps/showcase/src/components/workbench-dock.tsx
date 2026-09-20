"use client";

import { useEffect, useState } from "react";
import { NavDock, type NavDockItemData } from "@dethink/components";
import { Blocks, LayoutGrid, Layers, Palette, Sparkles } from "lucide-react";

/*
 * The workbench dock mirrors the design's sidebar sections as a floating,
 * macOS-style NavDock. Each item is an in-page anchor; an IntersectionObserver
 * keeps `currentValue` in sync with the section in view so the active item
 * lights up as you scroll. It auto-collapses to a trigger on touch/small
 * screens via NavDock's `collapseMode="auto"`.
 */
const sections = [
  { value: "overview", title: "Overview", icon: <LayoutGrid /> },
  { value: "features", title: "Features", icon: <Sparkles /> },
  { value: "matrix", title: "Components", icon: <Blocks /> },
  { value: "recipes", title: "Recipes", icon: <Layers /> },
  { value: "foundations", title: "Foundations", icon: <Palette /> },
] as const;

const items: NavDockItemData[] = sections.map((section) => ({
  value: section.value,
  title: section.title,
  icon: section.icon,
  href: `#${section.value}`,
}));

export function WorkbenchDock() {
  const [active, setActive] = useState<string>("overview");

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.value))
      .filter((element): element is HTMLElement => element !== null);

    if (targets.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer the entry closest to the top of the viewport that is visible.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return (
    <NavDock
      aria-label="Workbench sections"
      items={items}
      placement="left"
      position="fixed"
      variant="glass"
      size="md"
      showTitle="hover"
      motion="standard"
      collapseMode="auto"
      currentValue={active}
      triggerLabel="Jump to section"
      className="max-lg:hidden"
    />
  );
}
