"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@dethink/components";

export function TooltipTiming() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Tooltip delay={0} closeDelay={0}>
        <TooltipTrigger variant="soft" size="sm">
          Instant
        </TooltipTrigger>
        <TooltipContent>Shows immediately</TooltipContent>
      </Tooltip>
      <Tooltip delay={700} closeDelay={300}>
        <TooltipTrigger variant="soft" size="sm">
          Patient
        </TooltipTrigger>
        <TooltipContent>700ms open delay, 300ms close delay</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger variant="soft" size="sm">
          Placed top
        </TooltipTrigger>
        <TooltipContent placement="top" showArrow>
          Anchored above with an arrow
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
