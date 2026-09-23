"use client";

import { useState } from "react";
import {
  Button,
  ButtonGroup,
  DropdownButton,
  DropdownMenuItem,
} from "@dethink/components";

type HeaderActionId = "preview" | "share" | "export" | "archive";

interface HeaderAction {
  destructive?: boolean;
  disabled?: boolean;
  id: HeaderActionId;
  label: string;
}

const headerActions: HeaderAction[] = [
  { id: "preview", label: "Preview" },
  { id: "share", label: "Share" },
  { disabled: true, id: "export", label: "Export" },
  { destructive: true, id: "archive", label: "Archive" },
];

const alwaysVisibleIds = new Set<HeaderActionId>(["preview", "share"]);

export function ButtonGroupResponsiveActionHandoff() {
  const [lastActionId, setLastActionId] = useState<HeaderActionId>();
  const wideActions = headerActions;
  const narrowPrimaryActions = headerActions.filter((action) =>
    alwaysVisibleIds.has(action.id),
  );
  const narrowMenuActions = headerActions.filter(
    (action) => !alwaysVisibleIds.has(action.id),
  );
  const runAction = (action: HeaderAction) => setLastActionId(action.id);

  return (
    <div className="border-border bg-background @container w-full space-y-4 rounded-2xl border p-5 shadow-sm">
      <div
        data-layout="wide"
        className="hidden @min-lg:flex @min-lg:items-center @min-lg:justify-between @min-lg:gap-4"
      >
        <p className="text-sm font-medium">Quarterly report</p>
        <ButtonGroup aria-label="Quarterly report actions">
          {wideActions.map((action) => (
            <Button
              key={action.id}
              data-action-id={action.id}
              size="sm"
              disabled={action.disabled}
              onClick={() => runAction(action)}
              variant={action.destructive ? "destructive" : "outline"}
            >
              {action.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div
        data-layout="narrow"
        className="flex flex-col items-start gap-3 @min-lg:hidden"
      >
        <p className="min-w-0 truncate text-sm font-medium">Quarterly report</p>
        <ButtonGroup
          aria-label="Quarterly report actions"
          mode="separated"
          className="flex-wrap"
        >
          {narrowPrimaryActions.map((action) => (
            <Button
              key={action.id}
              data-action-id={action.id}
              size="sm"
              disabled={action.disabled}
              onClick={() => runAction(action)}
              variant="outline"
            >
              {action.label}
            </Button>
          ))}
          <DropdownButton
            aria-label="More quarterly report actions"
            label="More"
            size="sm"
          >
            {narrowMenuActions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                data-action-id={action.id}
                destructive={action.destructive}
                disabled={action.disabled}
                onAction={() => runAction(action)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownButton>
        </ButtonGroup>
      </div>

      <p className="text-muted-foreground text-xs">
        Export becomes available after approval.
      </p>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {lastActionId
          ? `${headerActions.find((action) => action.id === lastActionId)?.label} selected for Quarterly report.`
          : "Choose an available action."}
      </p>
    </div>
  );
}
