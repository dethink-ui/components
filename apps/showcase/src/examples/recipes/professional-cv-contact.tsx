"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
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

export function CvContact({ motionEnabled }: { motionEnabled: boolean }) {
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [interest, setInterest] = useState("Product design");
  const [complete, setComplete] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const completeRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (complete) completeRef.current?.focus();
  }, [complete]);
  return (
    <Dialog
      onOpenChange={() => {
        setComplete(false);
        setErrors({});
        setName("");
        setEmail("");
        setMessage("");
        setInterest("Product design");
      }}
    >
      <DialogTrigger className="h-12 gap-3 rounded-full px-7 text-sm">
        Let’s talk
        <ArrowUpRight aria-hidden className="size-4" />
      </DialogTrigger>
      <DialogContent
        size="md"
        scrollBehavior="inside"
        className="sc-cv-theme"
        data-motion={motionEnabled ? "enabled" : "paused"}
        closeButtonLabel="Close contact form"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>
            {complete
              ? "A good conversation starts here."
              : "What are you thinking about?"}
          </DialogTitle>
          <DialogDescription>
            This is a local portfolio demo. Your details are not sent or saved.
          </DialogDescription>
        </DialogHeader>
        {complete ? (
          <>
            <div className="space-y-5 px-6 pb-6">
              <CheckCircle2 aria-hidden className="text-primary size-9" />
              <h3
                ref={completeRef}
                tabIndex={-1}
                className="text-xl font-medium outline-none"
              >
                Your sample enquiry is ready, {name.trim()}.
              </h3>
              <dl className="bg-muted space-y-3 rounded-xl p-5 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Interested in
                  </dt>
                  <dd>{interest}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Reply address
                  </dt>
                  <dd className="break-words">{email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Your idea</dt>
                  <dd className="break-words whitespace-pre-wrap">{message}</dd>
                </div>
              </dl>
              <p role="status" className="text-muted-foreground text-sm">
                Nothing was sent. In your own portfolio, connect this form to
                your preferred contact service.
              </p>
            </div>
            <DialogFooter>
              <DialogClose variant="outline">Back to portfolio</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              const next = {
                name: name.trim() ? undefined : "Please enter your name.",
                email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                  ? undefined
                  : "Please enter a valid email address.",
                message:
                  message.trim().length >= 10
                    ? undefined
                    : "Tell me a little more (at least 10 characters).",
              };
              setErrors(next);
              if (next.name) nameRef.current?.focus();
              else if (next.email) emailRef.current?.focus();
              else if (next.message) messageRef.current?.focus();
              else setComplete(true);
            }}
          >
            <div className="space-y-5 px-6 pb-6">
              <Field invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor={`${id}-name`}>Your name</FieldLabel>
                <FieldControl>
                  <Input
                    ref={nameRef}
                    id={`${id}-name`}
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </FieldControl>
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>
              <Field invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor={`${id}-email`}>Email address</FieldLabel>
                <FieldControl>
                  <Input
                    ref={emailRef}
                    id={`${id}-email`}
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </FieldControl>
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor={`${id}-interest`}>
                  I’m interested in
                </FieldLabel>
                <FieldControl>
                  <Select
                    id={`${id}-interest`}
                    value={interest}
                    onValueChange={setInterest}
                  >
                    {[
                      "Product design",
                      "Design systems",
                      "Brand direction",
                      "A full-time role",
                    ].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </Select>
                </FieldControl>
              </Field>
              <Field invalid={Boolean(errors.message)}>
                <FieldLabel htmlFor={`${id}-message`}>
                  A little about your idea
                </FieldLabel>
                <FieldControl>
                  <Textarea
                    ref={messageRef}
                    id={`${id}-message`}
                    rows={4}
                    required
                    maxLength={2000}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="The challenge, the ambition, or just a hello…"
                  />
                </FieldControl>
                {errors.message && <FieldError>{errors.message}</FieldError>}
              </Field>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="gap-2"
                rightIcon={<ArrowUpRight aria-hidden />}
              >
                Prepare sample enquiry
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
