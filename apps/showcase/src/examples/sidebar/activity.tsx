"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Button,
  Sidebar,
  SidebarActivity,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  type SidebarActivityItem,
} from "@dethink/components";
import { Layers } from "lucide-react";

const subscribeHydration = () => () => {};

export function SidebarActivityExample() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const [reviewed, setReviewed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [empty, setEmpty] = useState(false);
  const items: SidebarActivityItem[] = empty
    ? []
    : [
        {
          id: "brief",
          title: "Launch brief",
          status: reviewed ? "complete" : "attention",
          description: reviewed
            ? "Approved and ready to share"
            : "Your approval is needed to continue",
          action: reviewed
            ? undefined
            : { label: "Approve brief", onAction: () => setReviewed(true) },
        },
        {
          id: "index",
          title: "Indexing documents",
          status: finished ? "complete" : "running",
          progress: 62,
          description: finished
            ? "128 documents ready to search"
            : "79 of 128 documents",
          action: finished
            ? undefined
            : { label: "Finish demo run", onAction: () => setFinished(true) },
        },
        {
          id: "export",
          title: "Weekly report",
          status: "queued",
          description: "Waiting for the index",
        },
      ];
  return (
    <fieldset
      disabled={!hydrated}
      aria-label="Activity demo"
      className="min-w-0 space-y-4"
      data-testid="sidebar-activity-demo"
    >
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setEmpty(!empty)}>
          {empty ? "Show activity" : "Clear activity"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setReviewed(false);
            setFinished(false);
            setEmpty(false);
          }}
        >
          Reset demo
        </Button>
      </div>
      <SidebarProvider motion="subtle" className="mx-auto max-w-64">
        <Sidebar
          className="h-[31rem] rounded-xl border"
          aria-label="Activity workspace"
        >
          <SidebarHeader>
            <div className="flex items-center gap-2 group-data-[collapsed=true]/sidebar:flex-col">
              <span className="flex size-9.5 shrink-0 items-center justify-center">
                <Layers
                  aria-hidden="true"
                  data-testid="activity-workspace-icon"
                  className="text-primary size-5 shrink-0"
                />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold group-data-[collapsed=true]/sidebar:hidden">
                Studio workspace
              </span>
              <SidebarTrigger className="size-9.5" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarActivity items={items} label="Background work" />
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </fieldset>
  );
}
