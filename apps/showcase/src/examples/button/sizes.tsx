"use client";

import { Button } from "@dethink/components";
import { Plus } from "lucide-react";

export function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra large</Button>
      <Button size="icon" aria-label="Add item">
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
