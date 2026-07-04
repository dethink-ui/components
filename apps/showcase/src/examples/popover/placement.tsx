"use client";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from "@dethink/components";

const placements = ["top", "right", "bottom", "left"] as const;

export function PopoverPlacement() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {placements.map((placement) => (
        <Popover key={placement}>
          <PopoverTrigger variant="soft" size="sm">
            {placement}
          </PopoverTrigger>
          <PopoverContent placement={placement} showArrow>
            <PopoverDescription className="px-[var(--dt-space-4)] py-[var(--dt-space-3)]">
              Anchored {placement} with an arrow.
            </PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
