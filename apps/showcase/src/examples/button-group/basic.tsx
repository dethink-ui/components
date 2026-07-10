"use client";

import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  IconButton,
} from "@dethink/components";
import { MoreHorizontal } from "lucide-react";

export function ButtonGroupBasic() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          Attached document actions
        </p>
        <ButtonGroup aria-label="Document actions">
          <Button variant="outline">Preview</Button>
          <Button variant="outline">Share</Button>
          <IconButton aria-label="More document actions" variant="outline">
            <MoreHorizontal />
          </IconButton>
        </ButtonGroup>
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          Separated state-aware actions
        </p>
        <ButtonGroup aria-label="Publishing actions" mode="separated">
          <Button>Publish</Button>
          <Button disabled variant="outline">
            Schedule
          </Button>
          <Button loading variant="outline">
            Syncing
          </Button>
        </ButtonGroup>
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          Vertical actions with a decorative separator
        </p>
        <ButtonGroup aria-label="Record actions" orientation="vertical">
          <Button variant="outline">Duplicate</Button>
          <ButtonGroupSeparator />
          <Button variant="outline">Archive</Button>
          <Button variant="destructive">Delete</Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
