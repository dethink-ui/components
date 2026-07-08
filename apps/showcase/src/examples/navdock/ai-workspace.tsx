"use client";

import { useState } from "react";
import {
  NavDock,
  NavDockButton,
  NavDockItem,
  NavDockLink,
  NavDockList,
  NavDockSeparator,
  NavDockSubmenu,
  NavDockSubmenuContent,
  NavDockSubmenuTrigger,
} from "@dethink/components";
import {
  Bot,
  BrainCircuit,
  DatabaseZap,
  FileSearch,
  MessagesSquare,
  SlidersHorizontal,
  SquareTerminal,
} from "lucide-react";

const iconProps = {
  "aria-hidden": true,
  absoluteStrokeWidth: true,
  strokeWidth: 2.1,
};

export function NavDockAiWorkspace() {
  const [currentTool, setCurrentTool] = useState("agent");

  return (
    <div className="border-border bg-muted/20 flex min-h-[24rem] overflow-hidden rounded-md border">
      <div className="border-border bg-background flex w-24 items-center justify-center border-r">
        <NavDock
          aria-label="AI workspace quick access"
          currentValue={currentTool}
          placement="left"
          showTitle="never"
          size="sm"
          variant="glass"
        >
          <NavDockList>
            <NavDockItem
              icon={<Bot {...iconProps} />}
              title="Agent runs"
              value="agent"
            >
              <NavDockButton onAction={() => setCurrentTool("agent")} />
            </NavDockItem>
            <NavDockItem
              icon={<MessagesSquare {...iconProps} />}
              title="Prompts"
              value="prompts"
            >
              <NavDockButton onAction={() => setCurrentTool("prompts")} />
            </NavDockItem>
            <NavDockItem
              icon={<BrainCircuit {...iconProps} />}
              title="Evaluations"
              value="evals"
            >
              <NavDockButton onAction={() => setCurrentTool("evals")} />
            </NavDockItem>
            <NavDockSeparator />
            <NavDockItem
              icon={<SlidersHorizontal {...iconProps} />}
              title="Controls"
              value="controls"
            >
              <NavDockSubmenu>
                <NavDockSubmenuTrigger />
                <NavDockSubmenuContent>
                  <button
                    className="text-foreground hover:bg-muted focus-visible:ring-ring rounded-sm px-3 py-2 text-start text-sm outline-none focus-visible:ring-2"
                    type="button"
                  >
                    Model routing
                  </button>
                  <button
                    className="text-foreground hover:bg-muted focus-visible:ring-ring rounded-sm px-3 py-2 text-start text-sm outline-none focus-visible:ring-2"
                    type="button"
                  >
                    Cost limits
                  </button>
                </NavDockSubmenuContent>
              </NavDockSubmenu>
            </NavDockItem>
            <NavDockItem
              icon={<SquareTerminal {...iconProps} />}
              title="Console"
              value="console"
            >
              <NavDockLink href="/ai/console" />
            </NavDockItem>
          </NavDockList>
        </NavDock>
      </div>

      <div className="grid flex-1 content-center gap-4 p-6">
        <div className="border-border bg-background text-muted-foreground inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
          <DatabaseZap {...iconProps} className="size-4" />
          AI workspace
        </div>
        <div>
          <h3 className="font-heading text-foreground text-xl font-semibold">
            {currentTool === "agent" ? "Agent run queue" : "Workspace panel"}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-lg text-sm leading-6">
            The dock stays compact while the main panel changes. Submenu items
            remain buttons and links rather than ARIA menu items.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border-border bg-background rounded-md border p-4">
            <FileSearch {...iconProps} className="text-primary mb-3 size-5" />
            <div className="text-foreground text-sm font-semibold">
              Review queue
            </div>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              12 runs waiting for review.
            </p>
          </div>
          <div className="border-border bg-background rounded-md border p-4">
            <BrainCircuit {...iconProps} className="text-primary mb-3 size-5" />
            <div className="text-foreground text-sm font-semibold">
              Eval pass rate
            </div>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              94% across the latest prompt set.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
