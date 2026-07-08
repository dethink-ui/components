"use client";

import { useState } from "react";
import {
  Field,
  FieldControl,
  FieldLabel,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@dethink/components";

/**
 * Inline edit: the value on the page is the trigger. A controlled popover
 * carries a draft, so Cancel discards and Save commits — the page value
 * never flickers mid-edit.
 */
export function PopoverRecipeInlineEdit() {
  const [limit, setLimit] = useState(500);
  const [draft, setDraft] = useState(String(limit));
  const [open, setOpen] = useState(false);

  return (
    <div className="border-border mx-auto flex max-w-sm items-center justify-between rounded-lg border px-4 py-3">
      <div>
        <p className="text-sm font-medium">Monthly spend limit</p>
        <p className="text-muted-foreground text-sm">
          Alerts fire at 80% of the limit.
        </p>
      </div>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setDraft(String(limit));
          }
        }}
      >
        <PopoverTrigger variant="ghost" className="font-mono">
          ${limit}
        </PopoverTrigger>
        <PopoverContent placement="bottom end">
          <PopoverHeader>
            <PopoverTitle>Edit spend limit</PopoverTitle>
          </PopoverHeader>
          <div className="px-[var(--dt-space-4)] py-[var(--dt-space-2)]">
            <Field id="limit-draft">
              <FieldLabel>Limit (USD)</FieldLabel>
              <FieldControl asChild>
                <Input
                  type="number"
                  min={0}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
              </FieldControl>
            </Field>
          </div>
          <PopoverFooter>
            <PopoverClose variant="ghost">Cancel</PopoverClose>
            <PopoverClose
              onPress={() => setLimit(Math.max(0, Number(draft) || 0))}
            >
              Save
            </PopoverClose>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </div>
  );
}
