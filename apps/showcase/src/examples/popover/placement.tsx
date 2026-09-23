"use client";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
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
            <PopoverHeader>
              <PopoverTitle className="capitalize">
                {placement} placement
              </PopoverTitle>
              <PopoverDescription>
                The arrow follows the trigger. This panel flips sides when it
                needs more room.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
