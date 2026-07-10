"use client";

import { useState } from "react";
import {
  DropdownButton,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  DropdownMenuItemShortcut,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
} from "@dethink/components";

export function DropdownButtonBasic() {
  const [controlledOpen, setControlledOpen] = useState(false);
  const [lastAction, setLastAction] = useState("No action selected yet.");

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          One trigger, related actions
        </p>
        <DropdownButton
          label="Create"
          onOpenChange={(open) => {
            if (open) setLastAction("Create menu opened.");
          }}
          showArrow
          variant="solid"
        >
          <DropdownMenuSection>
            <DropdownMenuLabel>Create</DropdownMenuLabel>
            <DropdownMenuItem
              onAction={() => setLastAction("Project created.")}
            >
              <DropdownMenuItemIcon aria-hidden="true">P</DropdownMenuItemIcon>
              <DropdownMenuItemLabel>Project</DropdownMenuItemLabel>
              <DropdownMenuItemShortcut>⌘P</DropdownMenuItemShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onAction={() => setLastAction("Workspace created.")}
            >
              <DropdownMenuItemIcon aria-hidden="true">W</DropdownMenuItemIcon>
              <DropdownMenuItemLabel>Workspace</DropdownMenuItemLabel>
              <DropdownMenuItemDescription>
                A shared space for a team.
              </DropdownMenuItemDescription>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <DropdownMenuItemIcon aria-hidden="true">T</DropdownMenuItemIcon>
              <DropdownMenuItemLabel>Template</DropdownMenuItemLabel>
            </DropdownMenuItem>
          </DropdownMenuSection>
        </DropdownButton>
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {lastAction}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          Split primary action and alternatives
        </p>
        <DropdownButton
          label="Save"
          menuLabel="More save options"
          mode="split"
          onPrimaryAction={() => setLastAction("Saved directly.")}
          primaryIcon={<span aria-hidden="true">✓</span>}
        >
          <DropdownMenuItem
            onAction={() => setLastAction("Saved as template.")}
          >
            Save as template
          </DropdownMenuItem>
          <DropdownMenuItem onAction={() => setLastAction("Saved and closed.")}>
            Save and close
          </DropdownMenuItem>
        </DropdownButton>
        <p className="text-muted-foreground max-w-prose text-sm">
          The primary side runs only Save. The separately named chevron opens
          alternatives; both controls remain normal Tab stops.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          Controlled open state and destructive action
        </p>
        <DropdownButton
          label="Workspace actions"
          motionPreset="subtle"
          open={controlledOpen}
          onOpenChange={setControlledOpen}
          placement="bottom end"
        >
          <DropdownMenuItem
            onAction={() => setLastAction("Workspace renamed.")}
          >
            Rename workspace
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            destructive
            onAction={() => setLastAction("Delete action selected.")}
          >
            Delete workspace
          </DropdownMenuItem>
        </DropdownButton>
        <p className="text-muted-foreground text-sm">
          Controlled state: {controlledOpen ? "open" : "closed"}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          Explicit async policies
        </p>
        <div className="flex flex-wrap gap-3">
          <DropdownButton
            label="Publishing"
            loading
            menuLabel="More publish options"
            mode="split"
            onPrimaryAction={() => undefined}
          >
            <DropdownMenuItem>Schedule publish</DropdownMenuItem>
          </DropdownButton>
          <DropdownButton
            label="Generating report"
            loading
            loadingBehavior="primary"
            menuLabel="More report options"
            mode="split"
            onPrimaryAction={() => undefined}
            reducedMotion
          >
            <DropdownMenuItem>Cancel generation</DropdownMenuItem>
          </DropdownButton>
        </div>
        <p className="text-muted-foreground max-w-prose text-sm">
          Whole-composite loading is the safe default. Primary-only loading is
          opt-in for alternatives that the product has explicitly declared safe
          while the primary action runs.
        </p>
      </div>
    </div>
  );
}
