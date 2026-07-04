"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@dethink/components";
import { RefreshCw } from "lucide-react";

export function TooltipBasic() {
  return (
    <div className="flex justify-center">
      <Tooltip>
        <TooltipTrigger aria-label="Refresh dashboard" size="icon" variant="outline">
          <RefreshCw className="size-4" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Refresh dashboard data</TooltipContent>
      </Tooltip>
    </div>
  );
}
