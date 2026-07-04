"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemLabel,
  DropdownMenuSection,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuContent,
  DropdownMenuTrigger,
} from "@dethink/components";

export function DropdownMenuSubmenuExample() {
  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger variant="outline">Export</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSection>
            <DropdownMenuItem>
              <DropdownMenuItemLabel>Download PDF</DropdownMenuItemLabel>
              <DropdownMenuItemDescription>
                Snapshot of the current view
              </DropdownMenuItemDescription>
            </DropdownMenuItem>
            <DropdownMenuSubmenu>
              <DropdownMenuItem textValue="Export data">
                <DropdownMenuItemLabel>Export data…</DropdownMenuItemLabel>
              </DropdownMenuItem>
              <DropdownMenuSubmenuContent>
                <DropdownMenuItem>
                  <DropdownMenuItemLabel>CSV</DropdownMenuItemLabel>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DropdownMenuItemLabel>JSON</DropdownMenuItemLabel>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <DropdownMenuItemLabel>Parquet (soon)</DropdownMenuItemLabel>
                </DropdownMenuItem>
              </DropdownMenuSubmenuContent>
            </DropdownMenuSubmenu>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
