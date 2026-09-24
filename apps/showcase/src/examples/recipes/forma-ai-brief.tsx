"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@dethink/components";
import { formaEngagements, type FormaEngagementId } from "./forma-ai-data";

export function FormaBrief({
  engagement,
  label,
  small = false,
  outline = false,
}: {
  engagement: FormaEngagementId;
  label: string;
  small?: boolean;
  outline?: boolean;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState("");
  const [choice, setChoice] = useState<FormaEngagementId>(engagement);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    brief?: string;
  }>({});
  const [complete, setComplete] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const briefRef = useRef<HTMLTextAreaElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (complete) successRef.current?.focus();
  }, [complete]);
  const scope = formaEngagements.find((item) => item.id === choice)!;
  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          setChoice(engagement);
          setComplete(false);
          setErrors({});
        } else {
          setName("");
          setEmail("");
          setBrief("");
          setErrors({});
          setComplete(false);
        }
      }}
    >
      <DialogTrigger
        size={small ? "sm" : "md"}
        variant={outline ? "outline" : "solid"}
        className={
          outline
            ? "gap-2 text-xs"
            : "gap-2 border-0 bg-[var(--forma-ink)] text-xs text-[var(--forma-paper)] hover:bg-[var(--forma-ink)]/90"
        }
      >
        {label}
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </DialogTrigger>
      <DialogContent
        className="sc-forma-theme"
        size="md"
        scrollBehavior="inside"
        closeButtonLabel="Close project brief"
      >
        <DialogHeader>
          <DialogTitle>
            {complete ? "A good starting point." : "Tell us what’s possible."}
          </DialogTitle>
          <DialogDescription>
            {complete
              ? "Your sample project brief is ready below. Nothing has been sent or stored outside this page."
              : "A little context goes a long way. This demo prepares a brief locally; it does not contact a real studio."}
          </DialogDescription>
        </DialogHeader>
        {complete ? (
          <>
            <div className="space-y-5 px-6 pb-6">
              <CheckCircle2
                aria-hidden="true"
                className="text-primary size-8"
              />
              <h3
                ref={successRef}
                tabIndex={-1}
                className="text-xl font-medium outline-none"
              >
                Your sample brief is ready, {name.trim()}.
              </h3>
              <dl className="bg-muted grid gap-3 rounded-xl p-4 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">Engagement</dt>
                  <dd className="mt-1 font-medium">{scope.label}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Your ambition
                  </dt>
                  <dd className="mt-1 break-words whitespace-pre-wrap">
                    {brief.trim()}
                  </dd>
                </div>
              </dl>
              <p
                role="status"
                className="text-muted-foreground text-xs leading-5"
              >
                Local demo complete. No email sent, no account created.
              </p>
            </div>
            <DialogFooter>
              <DialogClose>Back to Forma</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              const next = {
                name:
                  name.trim().length < 2
                    ? "Enter your name (at least two characters)."
                    : undefined,
                email:
                  !email.trim() || !emailRef.current?.validity.valid
                    ? "Enter a valid email address."
                    : undefined,
                brief:
                  brief.trim().length < 20
                    ? "Tell us a little more (at least 20 characters)."
                    : undefined,
              };
              setErrors(next);
              if (next.name) nameRef.current?.focus();
              else if (next.email) emailRef.current?.focus();
              else if (next.brief) briefRef.current?.focus();
              else setComplete(true);
            }}
          >
            <div className="space-y-5 px-6 pb-6">
              <Field id={`${id}-name`} invalid={Boolean(errors.name)}>
                <FieldLabel>Your name</FieldLabel>
                <FieldControl asChild>
                  <Input
                    ref={nameRef}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    autoComplete="name"
                    maxLength={80}
                    placeholder="Alex Morgan"
                  />
                </FieldControl>
                {errors.name && (
                  <FieldError role="alert">{errors.name}</FieldError>
                )}
              </Field>
              <Field id={`${id}-email`} invalid={Boolean(errors.email)}>
                <FieldLabel>Work email</FieldLabel>
                <FieldControl asChild>
                  <Input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    maxLength={254}
                    placeholder="alex@yourcompany.com"
                  />
                </FieldControl>
                {errors.email && (
                  <FieldError role="alert">{errors.email}</FieldError>
                )}
              </Field>
              <Select
                label="Engagement"
                value={choice}
                onValueChange={(value) => setChoice(value as FormaEngagementId)}
              >
                {formaEngagements.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </Select>
              <Field id={`${id}-brief`} invalid={Boolean(errors.brief)}>
                <FieldLabel>What would you like to change?</FieldLabel>
                <FieldControl asChild>
                  <Textarea
                    ref={briefRef}
                    value={brief}
                    onChange={(event) => setBrief(event.target.value)}
                    required
                    rows={4}
                    maxLength={1200}
                    placeholder="Tell us about the work you want to make easier…"
                  />
                </FieldControl>
                {errors.brief && (
                  <FieldError role="alert">{errors.brief}</FieldError>
                )}
              </Field>
              <p className="text-muted-foreground text-xs leading-5">
                Use sample details. This form is a local demonstration and
                clears when closed.
              </p>
            </div>
            <DialogFooter>
              <DialogClose variant="outline">Cancel</DialogClose>
              <Button type="submit" rightIcon={<ArrowRight />}>
                Prepare sample brief
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
