"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Form,
  Input,
  Link as DethinkLink,
  Separator,
  ToastProvider,
  ToastViewport,
  useToast,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import { GithubIcon } from "@/components/icons";

const panelBackdropStyle: CSSProperties = {
  backgroundImage: [
    "radial-gradient(70% 55% at 12% 0%, color-mix(in oklab, var(--dt-color-primary) 22%, transparent), transparent 70%)",
    "radial-gradient(55% 50% at 92% 18%, color-mix(in oklab, var(--dt-color-info) 20%, transparent), transparent 72%)",
    "radial-gradient(80% 70% at 78% 108%, color-mix(in oklab, var(--dt-color-success) 14%, transparent), transparent 74%)",
    "linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 4%, transparent), transparent 45%)",
  ].join(", "),
};

const dotTextureStyle: CSSProperties = {
  backgroundImage:
    "radial-gradient(color-mix(in oklab, var(--dt-color-foreground) 14%, transparent) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
  maskImage: "radial-gradient(80% 80% at 30% 20%, black, transparent 78%)",
  WebkitMaskImage:
    "radial-gradient(80% 80% at 30% 20%, black, transparent 78%)",
};

const avatars = [
  { initials: "NR", tint: "var(--dt-color-primary)" },
  { initials: "AV", tint: "var(--dt-color-info)" },
  { initials: "KM", tint: "var(--dt-color-success)" },
  { initials: "TS", tint: "var(--dt-color-warning)" },
];

const stats = [
  { value: "98.4%", label: "invite completion", trend: "+6.2%" },
  { value: "12.8k", label: "monthly sign-ins", trend: "+18%" },
  { value: "< 2m", label: "time to first login", trend: "−41%" },
];

const included = [
  "SAML & OIDC single sign-on out of the box",
  "Passkey and magic-link authentication",
  "SOC 2 audit trail on every session",
];

function LoginPanel() {
  const { toast } = useToast();
  const [email, setEmail] = useState("ops@northstar.example");
  const [loading, setLoading] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      toast({
        title: "Check your inbox",
        description: `A secure sign-in link was sent to ${email}.`,
        tone: "success",
      });
    }, 700);
  }

  return (
    <Card
      className="ring-border/60 relative w-full max-w-md ring-1 backdrop-blur-sm hover:shadow-lg motion-safe:transition-all motion-safe:duration-300 hover:motion-safe:-translate-y-0.5"
      shadow="md"
    >
      <CardHeader>
        <div className="bg-primary/10 text-primary mb-3 grid size-11 place-items-center rounded-xl">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to continue onboarding your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" leftIcon={<GithubIcon />}>
            GitHub
          </Button>
          <Button variant="outline" leftIcon={<Building2 />}>
            SSO
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">
            or with email
          </span>
          <Separator className="flex-1" />
        </div>

        <Form onSubmit={submit} className="space-y-4">
          <Field id="recipe-login-email">
            <FieldLabel>Email</FieldLabel>
            <FieldControl asChild>
              <Input
                autoComplete="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </FieldControl>
            <FieldDescription>
              We will send a one-time secure link to this address.
            </FieldDescription>
          </Field>

          <Field id="recipe-login-remember" orientation="horizontal">
            <FieldControl asChild>
              <Checkbox name="remember" value="yes" defaultChecked />
            </FieldControl>
            <FieldContent>
              <FieldLabel>Keep this device remembered</FieldLabel>
              <FieldDescription>
                Skip extra verification on this trusted browser.
              </FieldDescription>
            </FieldContent>
          </Field>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            rightIcon={<ArrowRight />}
          >
            Send secure link
          </Button>
        </Form>

        <div className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
          <Lock aria-hidden="true" className="size-3.5" />
          <span>Encrypted end-to-end. Links expire in 10 minutes.</span>
        </div>

        <Separator />

        <p className="text-muted-foreground text-center text-sm">
          New workspace?{" "}
          <DethinkLink href="#onboarding">Start onboarding</DethinkLink>
        </p>
      </CardContent>
    </Card>
  );
}

export function LoginAndOnboardingRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const fullPage = presentation === "full-page";

  return (
    <ToastProvider motion="standard">
      <div
        data-recipe-surface="login-and-onboarding"
        className={`grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-stretch ${
          fullPage
            ? "bg-muted/20 min-h-[calc(100dvh-7rem)] p-4 sm:p-6 lg:p-8"
            : ""
        }`}
      >
        <section
          data-login-form
          aria-label="Sign in form"
          className="flex items-center justify-center lg:col-start-2 lg:row-start-1"
        >
          <LoginPanel />
        </section>

        <section
          data-login-marketing
          className="border-border ring-border/50 relative overflow-hidden rounded-xl border shadow-sm ring-1 motion-safe:transition-transform motion-safe:duration-300 hover:motion-safe:-translate-y-1 lg:col-start-1 lg:row-start-1"
        >
          <span
            aria-hidden="true"
            style={panelBackdropStyle}
            className="pointer-events-none absolute inset-0"
          />
          <span
            aria-hidden="true"
            style={dotTextureStyle}
            className="pointer-events-none absolute inset-0"
          />

          <div className="relative flex h-full min-h-96 flex-col justify-between gap-8 p-6 sm:p-8">
            <div className="space-y-6">
              <div className="bg-background/70 text-foreground border-border/70 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
                <Sparkles
                  className="text-primary size-3.5"
                  aria-hidden="true"
                />
                <span className="tracking-[0.18em] uppercase">
                  Secure onboarding
                </span>
              </div>

              <div className="space-y-3">
                <h2 className="font-heading max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Bring a team into a secure workspace in under two minutes.
                </h2>
                <p className="text-muted-foreground max-w-lg text-sm leading-6">
                  Auth screens are rarely just forms. This recipe pairs trust
                  signals, SSO choices, validation-ready fields, and announced
                  feedback in one copied surface.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {avatars.map((avatar) => (
                    <span
                      key={avatar.initials}
                      aria-hidden="true"
                      className="border-background text-foreground/80 bg-background grid size-8 place-items-center rounded-full border-2 text-[0.65rem] font-semibold shadow-sm"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${avatar.tint} 16%, var(--dt-color-background))`,
                      }}
                    >
                      {avatar.initials}
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs leading-5">
                  Joined this week by teams at
                  <span className="text-foreground font-medium">
                    {" "}
                    Northstar, Aperture &amp; 40+ more
                  </span>
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-border/70 bg-background/70 rounded-lg border p-4 shadow-sm backdrop-blur"
                >
                  <div className="font-heading text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {stat.label}
                  </div>
                  <div className="text-success mt-2 inline-flex items-center gap-1 text-xs font-medium">
                    <TrendingUp aria-hidden="true" className="size-3" />
                    {stat.trend}
                  </div>
                </div>
              ))}
            </div>

            <ul className="space-y-2.5">
              {included.map((item) => (
                <li
                  key={item}
                  className="text-foreground/90 flex items-start gap-2.5 text-sm leading-6"
                >
                  <span
                    aria-hidden="true"
                    className="bg-success/15 text-success mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Alert
              icon={<KeyRound />}
              title="Passkey-ready layout"
              description="Add passkeys or SAML without changing the card anatomy."
              tone="info"
            />
          </div>
        </section>
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
