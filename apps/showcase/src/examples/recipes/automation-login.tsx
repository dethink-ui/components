"use client";

import Link from "next/link";
import { useAutomationReducedMotion } from "./automation-motion";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Triangle,
} from "lucide-react";
import {
  Badge,
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
  SilkFlowBackground,
  ShaderHeroText,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import "./automation-suite.css";

function GithubMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.66.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function RecoveryDialog() {
  const id = useId();
  const [sent, setSent] = useState(false);
  return (
    <Dialog onOpenChange={() => setSent(false)}>
      <DialogTrigger variant="link" size="sm" className="h-auto px-0 text-xs">
        Forgot your password?
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Let’s get you back in.</DialogTitle>
          <DialogDescription>
            This is a local recovery preview. No email will be sent.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            // Portal events still bubble through the parent sign-in form.
            event.stopPropagation();
            setSent(true);
          }}
          className="space-y-5"
        >
          <Field id={id}>
            <FieldLabel>Email</FieldLabel>
            <FieldControl asChild>
              <Input
                name="recovery-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
              />
            </FieldControl>
          </Field>
          <p role="status" className="text-muted-foreground text-sm">
            {sent
              ? "Recovery preview complete. A connected application would send a reset link after checking this request."
              : "Use a sample address to preview password recovery."}
          </p>
          <DialogFooter>
            <DialogClose variant="outline">Back to sign in</DialogClose>
            <Button type="submit">
              {sent ? "Preview again" : "Preview recovery"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AccountDialog() {
  return (
    <Dialog>
      <DialogTrigger variant="link" size="sm" className="h-auto px-1 text-xs">
        Create an account
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Try your first workspace.</DialogTitle>
          <DialogDescription>
            This recipe previews sign-in without creating accounts. Choose
            Google, GitHub, or a sample email and password to explore the local
            success state.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Try the sign-in demo</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AutomationLoginRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const id = useId();
  const reduceMotion = useAutomationReducedMotion();
  const [status, setStatus] = useState<
    "idle" | "pending" | "error" | "success"
  >("idle");
  const [provider, setProvider] = useState("Email");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const result = useRef<HTMLHeadingElement>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (status === "success") result.current?.focus();
  }, [status]);
  function signIn(method: string) {
    if (busy.current) return;
    busy.current = true;
    setProvider(method);
    setStatus("pending");
    setErrors({});
    if (password.current) password.current.value = "";
    const shouldFail = simulateFailure;
    timer.current = setTimeout(() => {
      busy.current = false;
      setStatus(shouldFail ? "error" : "success");
      setSimulateFailure(false);
    }, 850);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = {
      email: !email.current?.validity.valid
        ? "Enter a valid email address."
        : undefined,
      password: !password.current?.value
        ? "Enter a sample password."
        : undefined,
    };
    setErrors(next);
    if (next.email || next.password) {
      (next.email ? email : password).current?.focus();
      return;
    }
    signIn("Email");
  }
  const pending = status === "pending";
  return (
    <div
      data-recipe-surface="automation-login"
      className={`sc-automation grid min-h-[calc(100dvh-7rem)] lg:grid-cols-[0.95fr_1fr] ${presentation === "embedded" ? "border-border overflow-hidden rounded-xl border" : ""}`}
    >
      <aside
        aria-label="About Automation"
        className="automation-ink relative isolate hidden min-h-[780px] flex-col justify-between overflow-hidden p-12 lg:flex"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <SilkFlowBackground
            animate={!reduceMotion}
            speed="fast"
            intensity="bold"
            seed={4}
            className="h-full w-full"
          />
          <div className="from-background/10 via-background/30 to-background/80 absolute inset-0 bg-gradient-to-b" />
        </div>
        <Link
          href="/recipes/automation-landing"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <Triangle aria-hidden="true" className="text-primary size-5" />
          AUTOMATION<span className="text-primary">®</span>
        </Link>
        <div className="pt-32 pb-24">
          <Badge
            variant="soft"
            className="border-primary/30 bg-background/80 text-primary mb-7 border"
          >
            Make space for what’s next
          </Badge>
          {/* ShaderHeroText supplies semantic heading content through text. */}
          {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
          <ShaderHeroText
            as="h2"
            text="Your next great workflow starts here."
            animation="particle-follow"
            intensity={0.85}
            reducedMotion={reduceMotion ? "always" : "user"}
            className="max-w-sm font-serif text-[3.6rem] leading-[1.02] tracking-[-0.045em]"
          />
          <p className="text-muted-foreground mt-7 max-w-xs text-sm leading-7">
            Same tools. Less busywork.
            <br />A more human way to work.
          </p>
        </div>
        <div className="border-border border-t pt-6">
          <p className="text-muted-foreground text-xs leading-6">
            A little less repetition.
            <br />A little more possibility.
          </p>
          <p className="text-primary mt-4 text-[9px] tracking-[0.22em] uppercase">
            Build · Automate · Move forward
          </p>
        </div>
      </aside>
      <section className="flex min-w-0 flex-col px-6 py-7 sm:px-12 lg:px-14">
        <div className="flex items-center justify-between gap-4 text-xs">
          <Link
            href="/recipes/automation-landing"
            className="text-muted-foreground inline-flex items-center gap-2"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Back to Automation
          </Link>
          <Badge variant="soft">Demo</Badge>
        </div>
        <div className="mx-auto flex w-full max-w-[350px] flex-1 flex-col justify-center py-14 lg:py-16">
          {status === "success" ? (
            <div className="space-y-6">
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                <Check aria-hidden="true" className="size-6" />
              </div>
              <h1
                ref={result}
                tabIndex={-1}
                className="text-3xl font-medium tracking-tight outline-none"
              >
                You’re ready to explore.
              </h1>
              <p className="text-muted-foreground text-sm leading-6">
                {provider} sign-in demo complete. No account was created and no
                credentials were sent.
              </p>
              <Button asChild className="w-full">
                <Link href="/recipes/automation-landing">
                  Explore the workflows{" "}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStatus("idle");
                  setVisible(false);
                }}
              >
                Try another sign-in method
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-primary mb-4 text-[10px] font-medium tracking-[0.19em] uppercase">
                  Good to see you again
                </p>
                <h1 className="text-4xl font-medium tracking-[-0.04em]">
                  Welcome back.
                </h1>
                <p className="text-muted-foreground mt-3 text-sm">
                  Your work, a little more in flow.
                </p>
              </div>
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={pending}
                  onClick={() => signIn("Google")}
                  className="w-full text-sm"
                >
                  <span aria-hidden="true" className="text-lg font-bold">
                    G
                  </span>
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  disabled={pending}
                  onClick={() => signIn("GitHub")}
                  className="w-full text-sm"
                >
                  <GithubMark />
                  Continue with GitHub
                </Button>
              </div>
              <div className="text-muted-foreground my-7 flex items-center gap-4 text-[11px]">
                <span className="bg-border h-px flex-1" />
                or use email
                <span className="bg-border h-px flex-1" />
              </div>
              <form
                noValidate
                onSubmit={submit}
                aria-label="Email sign in"
                aria-busy={pending}
                className="space-y-5"
              >
                <Field id={`${id}-email`} invalid={Boolean(errors.email)}>
                  <FieldLabel>Email</FieldLabel>
                  <FieldControl asChild>
                    <Input
                      ref={email}
                      name="email"
                      type="email"
                      autoComplete="username"
                      required
                      placeholder="you@company.com"
                      disabled={pending}
                      onChange={() =>
                        setErrors((current) => ({
                          ...current,
                          email: undefined,
                        }))
                      }
                      className="h-11"
                    />
                  </FieldControl>
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </Field>
                <Field id={`${id}-password`} invalid={Boolean(errors.password)}>
                  <FieldLabel>Password</FieldLabel>
                  <div className="relative">
                    <FieldControl asChild>
                      <Input
                        ref={password}
                        name="password"
                        type={visible ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        placeholder="Enter a sample password"
                        disabled={pending}
                        onChange={() =>
                          setErrors((current) => ({
                            ...current,
                            password: undefined,
                          }))
                        }
                        className="h-11 pr-12"
                      />
                    </FieldControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      aria-label={visible ? "Hide password" : "Show password"}
                      aria-pressed={visible}
                      onClick={() => setVisible(!visible)}
                      className="absolute top-0.5 right-1 size-10"
                    >
                      {visible ? (
                        <EyeOff aria-hidden="true" className="size-4" />
                      ) : (
                        <Eye aria-hidden="true" className="size-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <FieldError>{errors.password}</FieldError>
                  )}
                </Field>
                <div className="flex justify-end">
                  <RecoveryDialog />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  loading={pending && provider === "Email"}
                  disabled={pending}
                  className="w-full text-sm"
                >
                  Sign in <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
              </form>
              <div className="mt-4 min-h-6 text-xs leading-5">
                <p role="status">
                  {pending ? `Previewing ${provider} sign-in…` : ""}
                </p>
                {status === "error" && (
                  <div
                    role="alert"
                    className="border-border bg-muted rounded-lg border p-3"
                  >
                    <p>
                      The {provider} demo could not complete. This was a
                      simulated error.
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 px-0"
                      onClick={() => signIn(provider)}
                    >
                      Retry {provider} demo
                    </Button>
                  </div>
                )}
              </div>
              <div className="text-muted-foreground mt-4 flex items-center justify-center gap-1 text-xs">
                New here? <AccountDialog />
              </div>
              <details className="border-border text-muted-foreground mt-8 rounded-lg border p-3 text-xs">
                <summary className="cursor-pointer">
                  About this sign-in demo
                </summary>
                <p className="mt-3 leading-5">
                  Use sample credentials. Provider buttons simulate sign-in
                  locally; nothing is sent or stored. No real account is
                  created.
                </p>
                <label className="mt-3 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    disabled={pending}
                    onChange={(event) =>
                      setSimulateFailure(event.target.checked)
                    }
                    className="accent-primary size-4"
                  />
                  Simulate a failed sign-in once
                </label>
              </details>
            </>
          )}
        </div>
        <p className="text-muted-foreground flex items-center justify-center gap-2 text-center text-[10px] leading-5">
          <LockKeyhole aria-hidden="true" className="size-3" />A local preview.
          Your real accounts stay untouched.
        </p>
      </section>
    </div>
  );
}
