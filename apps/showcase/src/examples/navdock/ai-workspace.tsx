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
    <div className="flex min-h-[24rem] overflow-hidden rounded-md border border-border bg-muted/20">
      <div className="flex w-24 items-center justify-center border-r border-border bg-background">
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
                    className="rounded-sm px-3 py-2 text-start text-sm text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    type="button"
                  >
                    Model routing
                  </button>
                  <button
                    className="rounded-sm px-3 py-2 text-start text-sm text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
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
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <DatabaseZap {...iconProps} className="size-4" />
          AI workspace
        </div>
        <div>
          <h3 className="font-heading text-xl font-semibold text-foreground">
            {currentTool === "agent" ? "Agent run queue" : "Workspace panel"}
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            The dock stays compact while the main panel changes. Submenu items
            remain buttons and links rather than ARIA menu items.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-background p-4">
            <FileSearch {...iconProps} className="mb-3 size-5 text-primary" />
            <div className="text-sm font-semibold text-foreground">
              Review queue
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              12 runs waiting for review.
            </p>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <BrainCircuit {...iconProps} className="mb-3 size-5 text-primary" />
            <div className="text-sm font-semibold text-foreground">
              Eval pass rate
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              94% across the latest prompt set.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
