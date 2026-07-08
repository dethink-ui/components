"use client";

import { useState } from "react";
import {
  Button,
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Textarea,
} from "@dethink/components";

const LIMIT = 240;

/**
 * A social-style composer: the counter turns from quiet meter into an error
 * as the budget runs out, and the field flips to invalid past the limit so
 * assistive tech hears the same thing sighted users see.
 */
export function TextareaRecipeComposer() {
  const [text, setText] = useState("");
  const remaining = LIMIT - text.length;
  const overBudget = remaining < 0;

  return (
    <form
      className="mx-auto max-w-sm space-y-3"
      onSubmit={(event) => event.preventDefault()}
    >
      <Field id="composer" invalid={overBudget}>
        <FieldLabel>Share an update</FieldLabel>
        <FieldControl asChild>
          <Textarea
            rows={4}
            resize="none"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="What are you shipping this week?"
          />
        </FieldControl>
        {overBudget ? (
          <FieldError>
            Update is {-remaining} characters over the limit.
          </FieldError>
        ) : null}
      </Field>
      <div className="flex items-center justify-between">
        <p
          aria-live="polite"
          className={`text-sm tabular-nums ${
            overBudget
              ? "text-destructive font-medium"
              : remaining <= 40
                ? "text-warning"
                : "text-muted-foreground"
          }`}
        >
          {remaining} left
        </p>
        <Button size="sm" disabled={overBudget || text.length === 0}>
          Post update
        </Button>
      </div>
    </form>
  );
}
