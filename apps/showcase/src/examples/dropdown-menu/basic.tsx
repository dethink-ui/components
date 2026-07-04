"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  DropdownMenuItemShortcut,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@dethink/components";
import { Copy, ExternalLink, RefreshCw, Trash2 } from "lucide-react";

export function DropdownMenuBasic() {
  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger variant="outline">Report actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSection>
            <DropdownMenuLabel>Report</DropdownMenuLabel>
            <DropdownMenuItem>
              <DropdownMenuItemIcon>
                <ExternalLink aria-hidden="true" />
              </DropdownMenuItemIcon>
              <DropdownMenuItemLabel>Open report</DropdownMenuItemLabel>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DropdownMenuItemIcon>
                <RefreshCw aria-hidden="true" />
              </DropdownMenuItemIcon>
              <DropdownMenuItemLabel>Refresh data</DropdownMenuItemLabel>
              <DropdownMenuItemShortcut>R</DropdownMenuItemShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DropdownMenuItemIcon>
                <Copy aria-hidden="true" />
              </DropdownMenuItemIcon>
              <DropdownMenuItemLabel>Duplicate</DropdownMenuItemLabel>
              <DropdownMenuItemShortcut>⌘D</DropdownMenuItemShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive>
              <DropdownMenuItemIcon>
                <Trash2 aria-hidden="true" />
              </DropdownMenuItemIcon>
              <DropdownMenuItemLabel>Delete report</DropdownMenuItemLabel>
            </DropdownMenuItem>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
