"use client";

import { Users, Share2 } from "lucide-react";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@dethink/components";

export function PopoverBasic() {
  return (
    <div className="flex justify-center">
      <Popover>
        <PopoverTrigger variant="outline">
          <Share2 aria-hidden="true" className="size-4" />
          Share dashboard
        </PopoverTrigger>
        <PopoverContent showArrow>
          <PopoverHeader>
            <PopoverTitle>Share dashboard</PopoverTitle>
            <PopoverDescription>
              Keep your team on the same page.
            </PopoverDescription>
          </PopoverHeader>
          <div className="border-border bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
            <span className="border-border bg-background text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md border">
              <Users aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Workspace members</p>
              <p className="text-muted-foreground text-xs">
                Everyone in your workspace
              </p>
            </div>
            <span className="text-muted-foreground shrink-0 text-xs">
              Can view
            </span>
          </div>
          <PopoverFooter>
            <PopoverClose size="sm" variant="solid">
              Done
            </PopoverClose>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </div>
  );
}
