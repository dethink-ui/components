"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@dethink/components";
import { MoreHorizontal } from "lucide-react";

const initialKeys = [
  { id: "k1", name: "production-api", lastUsed: "2 minutes ago" },
  { id: "k2", name: "staging-api", lastUsed: "3 days ago" },
  { id: "k3", name: "ci-deploy", lastUsed: "just now" },
];

/**
 * The menu's most common seat: one icon trigger per row, labelled with the
 * row's name so screen-reader users know which record the actions target.
 * Destructive items get the destructive treatment, and actions mutate the
 * live list.
 */
export function DropdownMenuRecipeRowActions() {
  const [keys, setKeys] = useState(initialKeys);
  const [status, setStatus] = useState("");

  return (
    <div className="mx-auto max-w-sm space-y-2">
      <ul className="divide-y divide-border rounded-lg border border-border">
        {keys.map((apiKey) => (
          <li
            key={apiKey.id}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <div>
              <p className="font-mono text-sm">{apiKey.name}</p>
              <p className="text-xs text-muted-foreground">
                Last used {apiKey.lastUsed}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                variant="ghost"
                size="icon"
                aria-label={`Actions for ${apiKey.name}`}
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent placement="bottom end">
                <DropdownMenuSection>
                  <DropdownMenuItem
                    onAction={() => setStatus(`Copied ${apiKey.name}.`)}
                  >
                    <DropdownMenuItemLabel>Copy key</DropdownMenuItemLabel>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onAction={() => setStatus(`Rotated ${apiKey.name}.`)}
                  >
                    <DropdownMenuItemLabel>Rotate…</DropdownMenuItemLabel>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    destructive
                    onAction={() => {
                      setKeys((current) =>
                        current.filter((entry) => entry.id !== apiKey.id),
                      );
                      setStatus(`Revoked ${apiKey.name}.`);
                    }}
                  >
                    <DropdownMenuItemLabel>Revoke</DropdownMenuItemLabel>
                  </DropdownMenuItem>
                </DropdownMenuSection>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  );
}
