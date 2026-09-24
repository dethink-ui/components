"use client";

import { useId, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import {
  Button,
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Input,
} from "@dethink/components";

export function NewsNewsletter({ id }: { id: string }) {
  const fieldId = useId();
  const emailInput = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  return (
    <section
      id={id}
      aria-label="The Current newsletter"
      className="scroll-mt-32 bg-[var(--news-red)] px-4 py-6 text-[var(--news-on-night)] sm:px-7"
    >
      <div className="grid items-center gap-5 sm:grid-cols-[1fr_1.1fr]">
        <div className="flex items-start gap-3">
          <Mail aria-hidden="true" className="mt-1 size-7 shrink-0 stroke-1" />
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              A wider world. In your inbox.
            </h2>
            <p className="mt-1 text-xs leading-relaxed">
              The stories that matter, and the perspective to make sense of
              them.
            </p>
          </div>
        </div>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!email.trim() || !emailInput.current?.validity.valid) {
              setError("Enter a valid email address, such as you@example.com.");
              emailInput.current?.focus();
              return;
            }
            setError("");
            setComplete(true);
          }}
        >
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
            <Field
              id={fieldId}
              invalid={Boolean(error)}
              className="min-w-0 flex-1"
            >
              <FieldLabel className="text-[11px] text-[var(--news-on-night)]">
                Email address
              </FieldLabel>
              <FieldControl asChild>
                <Input
                  ref={emailInput}
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setComplete(false);
                  }}
                  className="h-10 rounded-none bg-[var(--news-on-night)] text-[var(--news-night)] placeholder:text-[var(--news-night)]/60"
                />
              </FieldControl>
              {error && (
                <FieldError
                  role="alert"
                  className="text-[var(--news-on-night)]"
                >
                  {error}
                </FieldError>
              )}
            </Field>
            <Button
              type="submit"
              rightIcon={<ArrowRight aria-hidden="true" />}
              className="h-10 shrink-0 rounded-none border border-[var(--news-on-night)] bg-[var(--news-on-night)] text-xs text-[var(--news-red)] hover:bg-[var(--news-on-night)]/90"
            >
              Sign me up
            </Button>
          </div>
          <div role="status" className="mt-2 text-[10px] leading-relaxed">
            {complete ? (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 aria-hidden="true" className="size-3.5" />
                You’re on the sample list. No email was sent or stored.
              </span>
            ) : (
              "A daily dose of perspective. Demo signup — no email is sent or stored."
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
