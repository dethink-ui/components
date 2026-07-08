"use client";

import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@dethink/components";
import { Bold, Italic, Link2, Strikethrough } from "lucide-react";

const tools = [
  { id: "bold", label: "Bold", keys: "⌘B", icon: Bold },
  { id: "italic", label: "Italic", keys: "⌘I", icon: Italic },
  { id: "strike", label: "Strikethrough", keys: "⌘⇧X", icon: Strikethrough },
  { id: "link", label: "Add link", keys: "⌘K", icon: Link2 },
];

/**
 * Icon-only toolbars are where tooltips earn their keep: each trigger keeps
 * a real aria-label (the tooltip is a hint, not the accessible name) and the
 * content pairs the label with its keyboard shortcut.
 */
export function TooltipRecipeToolbar() {
  const [active, setActive] = useState<Set<string>>(new Set(["bold"]));

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="border-border bg-muted/40 mx-auto flex w-fit gap-1 rounded-lg border p-1"
    >
      {tools.map((tool) => (
        <Tooltip key={tool.id} delay={300}>
          <TooltipTrigger
            aria-label={tool.label}
            aria-pressed={active.has(tool.id)}
            size="icon"
            variant={active.has(tool.id) ? "soft" : "ghost"}
            onClick={() =>
              setActive((current) => {
                const next = new Set(current);
                if (next.has(tool.id)) {
                  next.delete(tool.id);
                } else {
                  next.add(tool.id);
                }
                return next;
              })
            }
          >
            <tool.icon className="size-4" aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent placement="top">
            <span className="flex items-center gap-2">
              {tool.label}
              <kbd className="border-border/60 rounded border px-1 font-mono text-[0.7em]">
                {tool.keys}
              </kbd>
            </span>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
