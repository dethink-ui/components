"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  LockKeyhole,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Form,
  Input,
  NumberInput,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  ToastProvider,
  ToastViewport,
  useToast,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

// ----------------------------------------------------------------------------
// Decorative layers (token-only, aria-hidden, non-interactive)
// ----------------------------------------------------------------------------

const washStyle: CSSProperties = {
  backgroundImage: [
    "radial-gradient(54% 42% at 0% 0%, color-mix(in oklab, var(--dt-color-primary) 12%, transparent), transparent 70%)",
    "radial-gradient(50% 40% at 100% 2%, color-mix(in oklab, var(--dt-color-info) 10%, transparent), transparent 72%)",
    "radial-gradient(62% 54% at 96% 106%, color-mix(in oklab, var(--dt-color-success) 8%, transparent), transparent 74%)",
    "linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 2.5%, transparent), transparent 28%)",
  ].join(", "),
};

// ----------------------------------------------------------------------------
// Domain data
// ----------------------------------------------------------------------------

type PlanMeta = {
  label: string;
  unit: number;
  blurb: string;
  features: string[];
  popular: boolean;
};

const plans: Record<string, PlanMeta> = {
  starter: {
    label: "Starter",
    unit: 29,
    blurb: "For small teams getting off the ground.",
    features: ["Up to 10 seats", "Core dashboards", "Email support"],
    popular: false,
  },
  growth: {
    label: "Growth",
    unit: 79,
    blurb: "For scaling operations teams.",
    features: ["Unlimited projects", "SAML & audit logs", "Priority support"],
    popular: true,
  },
  enterprise: {
    label: "Enterprise",
    unit: 149,
    blurb: "For regulated organizations.",
    features: [
      "SCIM & dedicated region",
      "99.9% uptime SLA",
      "Named success manager",
    ],
    popular: false,
  },
};

type Plan = keyof typeof plans;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const steps = ["Plan", "Details", "Review"] as const;
const currentStep = 2; // Review

const trustChips = [
  { label: "SOC 2 Type II", icon: ShieldCheck },
  { label: "PCI-ready", icon: LockKeyhole },
  { label: "GDPR", icon: BadgeCheck },
];

// ----------------------------------------------------------------------------
// Presentational bits (token-only)
// ----------------------------------------------------------------------------

function CheckoutStepper() {
  return (
    <ol
      aria-label="Checkout steps"
      className="border-border/70 bg-background/70 flex items-center gap-1 rounded-full border p-1.5 shadow-sm backdrop-blur"
    >
      {steps.map((step, index) => {
        const done = index < currentStep;
        const active = index === currentStep;
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className="flex items-center gap-1"
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold motion-safe:transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : done
                    ? "text-foreground/90"
                    : "text-muted-foreground"
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid size-4 shrink-0 place-items-center rounded-full text-[0.65rem] ${
                  active
                    ? "bg-primary-foreground/25 text-primary-foreground"
                    : done
                      ? "bg-success text-background"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-2.5" /> : index + 1}
              </span>
              {step}
            </span>
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={`h-px w-4 ${done ? "bg-success/60" : "bg-border"}`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function TrustChip({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck;
  label: string;
}) {
  return (
    <span className="border-border/70 bg-background/70 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
      <Icon className="text-success size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

// ----------------------------------------------------------------------------

function CheckoutFlow({ presentation = "embedded" }: RecipePreviewProps) {
  const { toast } = useToast();
  const [plan, setPlan] = useState<Plan>("growth");
  const [seats, setSeats] = useState(12);
  const unit = plans[plan].unit;
  const subtotal = unit * seats;
  const support = plan === "enterprise" ? 299 : 99;
  const total = subtotal + support;
  const fullPage = presentation === "full-page";

  const rows = useMemo(
    () => [
      [`${plans[plan].label} plan`, `${seats} seats`, unit, subtotal],
      ["Priority support", "1 workspace", support, support],
    ],
    [plan, seats, unit, subtotal, support],
  );

  return (
    <div
      data-recipe-surface="saas-checkout-order-summary"
      className={`relative ${
        fullPage ? "min-h-[calc(100dvh-7rem)] p-4 sm:p-6 lg:p-8" : ""
      }`}
    >
      <span
        aria-hidden="true"
        style={washStyle}
        className="pointer-events-none absolute -inset-x-6 -top-6 bottom-0 -z-10"
      />

      <div className="space-y-5">
        {/* Header band */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span
              aria-hidden="true"
              className="border-border/60 text-foreground/90 grid size-12 shrink-0 place-items-center rounded-xl border text-sm font-semibold shadow-sm"
              style={{
                backgroundColor:
                  "color-mix(in oklab, var(--dt-color-primary) 18%, var(--dt-color-background))",
              }}
            >
              NS
            </span>
            <div className="space-y-1.5">
              <span className="text-muted-foreground inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
                <Sparkles
                  className="text-primary size-3.5"
                  aria-hidden="true"
                />
                Checkout · Subscription
              </span>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Complete your subscription
              </h2>
              <p className="text-muted-foreground max-w-md text-sm leading-6">
                Pick a plan, confirm buyer details, and route the order to
                finance approval — no card charged yet.
              </p>
            </div>
          </div>

          <CheckoutStepper />
        </div>

        <Form
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]"
          onSubmit={(event) => {
            event.preventDefault();
            toast({
              title: "Order submitted",
              description: `${plans[plan].label} plan checkout is ready for finance review.`,
              tone: "success",
            });
          }}
        >
          <div className="space-y-5">
            {/* Plan selection */}
            <Card
              shadow="sm"
              className="ring-border/60 relative overflow-hidden ring-1 backdrop-blur-sm"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                  Choose plan
                </CardTitle>
                <CardDescription>
                  Real radios keep subscription choices explicit and keyboard
                  reachable.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldSet>
                  <FieldLegend className="sr-only">
                    Subscription plan
                  </FieldLegend>
                  <RadioGroup
                    value={plan}
                    onValueChange={(value) => setPlan(value as Plan)}
                    name="plan"
                  >
                    <FieldGroup className="grid gap-3 sm:grid-cols-3">
                      {(Object.entries(plans) as [Plan, PlanMeta][]).map(
                        ([value, item]) => {
                          const selected = plan === value;
                          return (
                            <Field
                              key={value}
                              id={`checkout-plan-${value}`}
                              className={`relative rounded-lg border p-4 motion-safe:transition-colors ${
                                selected
                                  ? "border-primary ring-primary/40 bg-primary/5 ring-1"
                                  : "border-border/60 bg-background/60 hover:border-border"
                              }`}
                            >
                              {item.popular ? (
                                <span className="bg-primary/15 text-primary ring-primary/25 absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ring-1 ring-inset">
                                  <Star
                                    className="size-2.5"
                                    aria-hidden="true"
                                  />
                                  Most popular
                                </span>
                              ) : null}
                              <div className="flex items-start justify-between gap-2">
                                <FieldControl asChild>
                                  <RadioGroupItem value={value} />
                                </FieldControl>
                                {selected ? (
                                  <span
                                    aria-hidden="true"
                                    className="bg-primary text-primary-foreground grid size-5 shrink-0 place-items-center rounded-full"
                                  >
                                    <Check className="size-3" />
                                  </span>
                                ) : null}
                              </div>
                              <FieldContent className="mt-2">
                                <FieldLabel className="text-sm font-semibold">
                                  {item.label}
                                </FieldLabel>
                                <div className="text-foreground flex items-baseline gap-1">
                                  <span className="font-heading text-xl font-semibold tabular-nums">
                                    {currency.format(item.unit)}
                                  </span>
                                  <span className="text-muted-foreground text-[0.7rem] font-normal">
                                    / seat · mo
                                  </span>
                                </div>
                                <FieldDescription>
                                  {item.blurb}
                                </FieldDescription>
                                <ul className="mt-2 space-y-1.5">
                                  {item.features.map((feature) => (
                                    <li
                                      key={feature}
                                      className="text-foreground/90 flex items-start gap-1.5 text-xs leading-5"
                                    >
                                      <Check
                                        className="text-success mt-0.5 size-3.5 shrink-0"
                                        aria-hidden="true"
                                      />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </FieldContent>
                            </Field>
                          );
                        },
                      )}
                    </FieldGroup>
                  </RadioGroup>
                </FieldSet>
              </CardContent>
            </Card>

            {/* Buyer details */}
            <Card
              shadow="sm"
              className="ring-border/60 relative overflow-hidden ring-1 backdrop-blur-sm"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                  Buyer details
                </CardTitle>
                <CardDescription>
                  Standard inputs and number fields cover checkout without a
                  special ecommerce primitive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="checkout-email">
                    <FieldLabel>Billing email</FieldLabel>
                    <FieldControl asChild>
                      <Input
                        name="email"
                        type="email"
                        defaultValue="finance@northstar.example"
                        required
                      />
                    </FieldControl>
                    <FieldDescription>
                      Invoices and PO documents route here.
                    </FieldDescription>
                  </Field>
                  <Field id="checkout-seats">
                    <FieldLabel>Seats</FieldLabel>
                    <FieldControl asChild>
                      <NumberInput
                        name="seats"
                        type="number"
                        min={1}
                        max={500}
                        value={seats}
                        onChange={(event) =>
                          setSeats(
                            Math.max(1, Number(event.currentTarget.value) || 1),
                          )
                        }
                      />
                    </FieldControl>
                    <FieldDescription>
                      Scale now, true up later.
                    </FieldDescription>
                  </Field>
                </div>
                <div className="border-border/60 bg-muted/30 text-muted-foreground flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
                  <CreditCard
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-foreground/90 tabular-nums">
                    {seats} seats × {currency.format(unit)} ={" "}
                    <span className="font-semibold">
                      {currency.format(subtotal)}
                    </span>
                    /mo
                  </span>
                  <span aria-hidden="true">before support</span>
                </div>
              </CardContent>
            </Card>

            {/* Procurement handoff */}
            <Alert
              icon={<LockKeyhole />}
              title="Secure procurement workflow"
              description="The checkout action hands off to finance approval instead of charging immediately."
              tone="info"
            />

            {/* Trust chips */}
            <div className="flex flex-wrap items-center gap-2">
              {trustChips.map((chip) => (
                <TrustChip
                  key={chip.label}
                  icon={chip.icon}
                  label={chip.label}
                />
              ))}
            </div>
          </div>

          {/* Order summary — the star */}
          <aside className="space-y-5">
            <Card
              shadow="md"
              className="ring-border/60 relative overflow-hidden ring-1 backdrop-blur-sm"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-16"
                style={{
                  backgroundImage:
                    "radial-gradient(120% 100% at 50% 0%, color-mix(in oklab, var(--dt-color-primary) 8%, transparent), transparent 70%)",
                }}
              />
              <CardHeader className="relative">
                <span className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
                  Order summary
                </span>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard
                    className="text-primary size-5"
                    aria-hidden="true"
                  />
                  {plans[plan].label} · monthly
                </CardTitle>
                <CardDescription>
                  Step progress and a semantic table keep the summary scannable.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-5">
                <Progress
                  label="Checkout progress"
                  value={90}
                  tone="primary"
                  showValue
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead align="end">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(([label, detail, unitPrice, amount]) => (
                      <TableRow key={String(label)}>
                        <TableCell>
                          <div className="font-medium">{label}</div>
                          <div className="text-muted-foreground text-xs">
                            {detail} × {currency.format(Number(unitPrice))}
                          </div>
                        </TableCell>
                        <TableCell align="end" className="tabular-nums">
                          {currency.format(Number(amount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>
                        <span className="text-foreground font-heading text-base font-semibold">
                          Total due
                        </span>
                        <div className="text-muted-foreground text-xs font-normal">
                          Billed monthly · taxes calculated at invoicing
                        </div>
                      </TableCell>
                      <TableCell align="end">
                        <span className="text-foreground font-heading text-xl font-semibold tabular-nums">
                          {currency.format(total)}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
              <CardFooter className="relative flex-col items-stretch gap-3">
                <Button type="submit" className="w-full" rightIcon={<Send />}>
                  Submit order
                </Button>
                <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-center text-xs leading-5">
                  <CheckCircle2
                    className="text-success size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  You won&apos;t be charged yet — routes to finance approval.
                </p>
                <div className="border-border/60 text-muted-foreground grid grid-cols-3 gap-2 border-t pt-3 text-[0.7rem]">
                  <span className="flex flex-col items-center gap-1 text-center">
                    <LockKeyhole className="size-3.5" aria-hidden="true" />
                    SSL secured
                  </span>
                  <span className="flex flex-col items-center gap-1 text-center">
                    <RefreshCcw className="size-3.5" aria-hidden="true" />
                    Cancel anytime
                  </span>
                  <span className="flex flex-col items-center gap-1 text-center">
                    <FileText className="size-3.5" aria-hidden="true" />
                    Invoice / PO
                  </span>
                </div>
              </CardFooter>
            </Card>

            <Card
              shadow="sm"
              className="ring-border/60 ring-1 backdrop-blur-sm"
            >
              <CardContent className="flex items-start gap-3 p-4">
                <CheckCircle2
                  className="text-success mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-muted-foreground text-sm leading-6">
                  Payment, procurement, and billing states share the same table,
                  alert, progress, and form primitives.
                </p>
              </CardContent>
            </Card>
          </aside>
        </Form>
      </div>
    </div>
  );
}

export function SaasCheckoutOrderSummaryRecipe(props: RecipePreviewProps) {
  return (
    <ToastProvider motion="standard">
      <CheckoutFlow {...props} />
      <ToastViewport />
    </ToastProvider>
  );
}
