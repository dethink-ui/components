"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Layers3, Plus, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemLabel,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@dethink/components";

const workspaces = [
  {
    id: "studio",
    name: "Acme Studio",
    detail: "Pro plan · 12 members",
    initials: "AS",
  },
  {
    id: "product",
    name: "Product Lab",
    detail: "Team plan · 8 members",
    initials: "PL",
  },
  {
    id: "personal",
    name: "Personal",
    detail: "Free plan · Just you",
    initials: "ME",
  },
];

export function DropdownMenuWorkspace() {
  const [active, setActive] = useState(workspaces[0]);
  const [status, setStatus] = useState("");
  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <div className="border-border bg-background rounded-2xl border p-5 shadow-sm">
        <p className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
          Your workspace
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Switch workspace, ${active.name}`}
            variant="ghost"
            className="border-border bg-muted/30 h-auto min-h-16 w-full justify-start gap-3 rounded-xl p-3 text-start [&_[data-slot=button-content]]:w-full [&_[data-slot=button-label]]:w-full"
          >
            <span className="flex w-full items-center gap-3">
              {" "}
              <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
                {active.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {active.name}
                </span>
                <span className="text-muted-foreground block text-xs font-normal">
                  {active.detail}
                </span>
              </span>
              <ChevronsUpDown
                aria-hidden="true"
                className="text-muted-foreground size-4 shrink-0"
              />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            aria-label="Workspaces"
            className="max-h-none w-72 rounded-xl p-1.5"
            menuClassName="max-h-[min(26rem,70dvh)]"
          >
            <DropdownMenuSection
              aria-label="Available workspaces"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[active.id]}
              onSelectionChange={(keys) => {
                const next = workspaces.find(
                  (workspace) => keys !== "all" && keys.has(workspace.id),
                );
                if (next) {
                  setActive(next);
                  setStatus(`Switched to ${next.name}.`);
                }
              }}
            >
              <DropdownMenuLabel className="px-3 py-2 text-[11px] tracking-wider">
                Switch workspace
              </DropdownMenuLabel>
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  id={workspace.id}
                  key={workspace.id}
                  textValue={workspace.name}
                  className="grid-cols-[2.25rem_minmax(0,1fr)_1rem] rounded-lg px-3 py-3"
                >
                  {({ isSelected }) => (
                    <>
                      <span
                        aria-hidden="true"
                        className={`row-span-2 flex size-9 items-center justify-center rounded-lg border text-xs font-semibold ${isSelected ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"}`}
                      >
                        {workspace.initials}
                      </span>
                      <DropdownMenuItemLabel className="font-medium">
                        {workspace.name}
                      </DropdownMenuItemLabel>
                      <span className="text-primary row-span-2">
                        {isSelected && (
                          <Check aria-hidden="true" className="size-4" />
                        )}
                      </span>
                      <DropdownMenuItemDescription>
                        {workspace.detail}
                      </DropdownMenuItemDescription>
                    </>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSection>
            <DropdownMenuSeparator />
            <DropdownMenuSection aria-label="Workspace actions">
              <DropdownMenuItem
                textValue="Create workspace"
                className="rounded-lg px-3 py-2.5"
                onAction={() =>
                  setStatus("Create workspace selected. This is a local demo.")
                }
              >
                <Plus
                  aria-hidden="true"
                  className="text-muted-foreground size-4"
                />
                <DropdownMenuItemLabel>Create workspace</DropdownMenuItemLabel>
              </DropdownMenuItem>
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="text-muted-foreground mt-5 flex items-center gap-2 text-xs">
          <Layers3 aria-hidden="true" className="size-4" />
          <span>One place for your next big idea.</span>
          <Sparkles
            aria-hidden="true"
            className="text-primary ms-auto size-4"
          />
        </div>
      </div>
      <p
        role="status"
        className="text-muted-foreground min-h-5 text-center text-xs"
      >
        {status || "Open the menu to switch workspaces."}
      </p>
    </div>
  );
}
