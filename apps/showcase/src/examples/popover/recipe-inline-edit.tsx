"use client";

import { useId, useState } from "react";
import { Pencil } from "lucide-react";
import {
  Button,
  Field,
  FieldControl,
  FieldLabel,
  FieldError,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
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
  const [submitted, setSubmitted] = useState(false);
  const fieldId = useId();
  const amount = Number(draft);
  const valid = draft.trim() !== "" && Number.isFinite(amount) && amount >= 0;

  return (
    <div className="border-border bg-background mx-auto flex w-full max-w-sm items-center justify-between gap-4 rounded-xl border p-4 shadow-sm">
      <div className="min-w-0">
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
            setSubmitted(false);
          }
        }}
      >
        <PopoverTrigger
          variant="outline"
          className="shrink-0 tabular-nums"
          aria-label={`Edit monthly spend limit, currently $${limit}`}
        >
          ${limit}
          <Pencil
            aria-hidden="true"
            className="text-muted-foreground size-3.5"
          />
        </PopoverTrigger>
        <PopoverContent placement="bottom end" showArrow>
          <form
            className="grid gap-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
              if (!valid) return;
              setLimit(amount);
              setOpen(false);
            }}
          >
            <PopoverHeader>
              <PopoverTitle>Edit spend limit</PopoverTitle>
              <PopoverDescription>
                Set a monthly budget for your workspace.
              </PopoverDescription>
            </PopoverHeader>
            <Field id={fieldId} invalid={submitted && !valid}>
              <FieldLabel>Limit (USD)</FieldLabel>
              <FieldControl asChild>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  required
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
              </FieldControl>
              {submitted && !valid ? (
                <FieldError>Enter an amount of 0 or more.</FieldError>
              ) : null}
            </Field>
            <PopoverFooter>
              <PopoverClose size="sm" variant="ghost">
                Cancel
              </PopoverClose>
              <Button type="submit" size="sm">
                Save changes
              </Button>
            </PopoverFooter>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
