"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  AlertTriangle,
  Building2,
  Check,
  CreditCard,
  Download,
  Gauge,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Callout,
  Card,
  CardContent,
  CardDescription,
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
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Progress,
  type ProgressTone,
} from "@dethink/components";

// ----------------------------------------------------------------------------
// Decorative layers (token-only, aria-hidden, non-interactive)
// ----------------------------------------------------------------------------

const washStyle: CSSProperties = {
  backgroundImage: [
    "radial-gradient(52% 40% at 0% 0%, color-mix(in oklab, var(--dt-color-primary) 12%, transparent), transparent 70%)",
    "radial-gradient(48% 38% at 100% 2%, color-mix(in oklab, var(--dt-color-info) 10%, transparent), transparent 72%)",
    "radial-gradient(60% 52% at 94% 104%, color-mix(in oklab, var(--dt-color-success) 8%, transparent), transparent 74%)",
    "linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 2.5%, transparent), transparent 28%)",
  ].join(", "),
};

// ----------------------------------------------------------------------------
// Domain data
// ----------------------------------------------------------------------------

const invoices = [
  { id: "INV-2026-07", date: "Jul 1, 2026", amount: "$1,248.00", status: "Paid" },
  { id: "INV-2026-06", date: "Jun 1, 2026", amount: "$1,109.00", status: "Paid" },
  { id: "INV-2026-05", date: "May 1, 2026", amount: "$982.00", status: "Paid" },
];

type UsageMeter = {
  key: string;
  label: string;
  detail: string;
  value: number;
  tone: ProgressTone;
  icon: typeof Gauge;
};

const usageMeters: UsageMeter[] = [
  {
    key: "seats",
    label: "Seats used",
    detail: "38 of 50 seats",
    value: 76,
    tone: "primary",
    icon: Building2,
  },
  {
    key: "spend",
    label: "Monthly spend",
    detail: "$1,248 of $1,500 budget",
    value: 83,
    tone: "warning",
    icon: Wallet,
  },
  {
    key: "api",
    label: "API calls",
    detail: "612k of 1M included",
    value: 61,
    tone: "info",
    icon: Zap,
  },
];

type Plan = {
  value: string;
  label: string;
  price: string;
  cadence: string;
  feature: string;
};

const plans: Plan[] = [
  {
    value: "starter",
    label: "Starter",
    price: "$29",
    cadence: "/ seat · mo",
    feature: "Core workspace, 3 projects, community support.",
  },
  {
    value: "growth",
    label: "Growth",
    price: "$79",
    cadence: "/ seat · mo",
    feature: "SAML, audit exports, priority support, unlimited projects.",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    price: "Custom",
    cadence: "annual",
    feature: "SCIM, dedicated region, SLA, and named CSM.",
  },
];

// ----------------------------------------------------------------------------
// Presentational bits (token-only)
// ----------------------------------------------------------------------------

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Gauge;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className="bg-primary/10 text-primary ring-primary/20 mt-0.5 grid size-7 shrink-0 place-items-center rounded-md ring-1"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-foreground text-sm font-semibold">{title}</div>
        <div className="text-muted-foreground text-xs leading-5">
          {description}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------

export function SettingsAndBillingRecipe() {
  const [saved, setSaved] = useState<null | string>(null);
  const [plan, setPlan] = useState("growth");

  return (
    <div className="relative">
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
              NO
            </span>
            <div className="space-y-1.5">
              <span className="text-muted-foreground inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
                <Sparkles className="text-primary size-3.5" aria-hidden="true" />
                Workspace · Settings
              </span>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Northstar Operations
              </h2>
              <p className="text-muted-foreground max-w-md text-sm leading-6">
                Manage workspace configuration, seats, billing, and security for
                your team.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="bg-primary/15 text-primary ring-primary/25 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset">
              <CreditCard className="size-3.5" aria-hidden="true" />
              Current plan · Growth
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              <Building2 className="size-3.5" aria-hidden="true" />
              northstar.dev
            </span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            {/* Settings card */}
            <Card
              shadow="sm"
              className="ring-border/60 relative overflow-hidden ring-1 backdrop-blur-sm"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="text-primary size-4" aria-hidden="true" />
                  Workspace settings
                </CardTitle>
                <CardDescription>
                  Dense forms with calm grouping and a visible save state.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form
                  className="space-y-6"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setSaved("All changes saved");
                  }}
                >
                  {/* General section */}
                  <div className="space-y-4">
                    <SectionHeading
                      icon={Building2}
                      title="General"
                      description="Identity and defaults for new projects."
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="settings-name">
                        <FieldLabel>Workspace name</FieldLabel>
                        <FieldControl asChild>
                          <Input defaultValue="Northstar Operations" />
                        </FieldControl>
                      </Field>
                      <Select
                        label="Default region"
                        defaultValue="eu-west"
                        description="Used for new projects."
                      >
                        <SelectItem value="us-east">US East</SelectItem>
                        <SelectItem value="eu-west">EU West</SelectItem>
                        <SelectItem value="ap-south">AP South</SelectItem>
                      </Select>
                    </div>
                  </div>

                  <div className="border-border/60 border-t" />

                  {/* Feature controls */}
                  <FieldSet className="space-y-4">
                    <SectionHeading
                      icon={Zap}
                      title="Feature controls"
                      description="Toggle workspace-wide capabilities."
                    />
                    <FieldLegend className="sr-only">Feature controls</FieldLegend>
                    <FieldGroup className="gap-3">
                      <Field
                        id="settings-ai"
                        orientation="horizontal"
                        className="border-border/60 bg-background/60 rounded-lg border p-3"
                      >
                        <FieldControl asChild>
                          <Switch defaultChecked name="ai-assistant" />
                        </FieldControl>
                        <FieldContent>
                          <FieldLabel>AI assistant</FieldLabel>
                          <FieldDescription>
                            Enable command suggestions and run summaries.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                      <Field
                        id="settings-audit"
                        orientation="horizontal"
                        className="border-border/60 bg-background/60 rounded-lg border p-3"
                      >
                        <FieldControl asChild>
                          <Switch defaultChecked name="audit-export" />
                        </FieldControl>
                        <FieldContent>
                          <FieldLabel>Audit export</FieldLabel>
                          <FieldDescription>
                            Allow admins to export signed audit trails.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </FieldSet>

                  <div className="border-border/60 border-t" />

                  {/* Seat limit */}
                  <div className="space-y-4">
                    <SectionHeading
                      icon={Gauge}
                      title="Approvals"
                      description="Guardrails for seat provisioning."
                    />
                    <Field id="settings-seat-limit">
                      <FieldLabel>Seat approval limit</FieldLabel>
                      <FieldControl asChild>
                        <NumberInput
                          defaultValue={42}
                          min={1}
                          max={500}
                          name="seat-limit"
                          type="number"
                        />
                      </FieldControl>
                      <FieldDescription>
                        Requests above this number require owner approval.
                      </FieldDescription>
                    </Field>
                  </div>

                  <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <output className="text-sm">
                      {saved ? (
                        <span className="text-foreground/90 inline-flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="bg-success grid size-4 shrink-0 place-items-center rounded-full"
                          >
                            <Check className="text-background size-2.5" />
                          </span>
                          {saved}
                        </span>
                      ) : (
                        <span className="text-muted-foreground inline-flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="bg-muted-foreground/50 size-2 shrink-0 rounded-full"
                          />
                          Autosave enabled
                        </span>
                      )}
                    </output>
                    <Button type="submit">Save settings</Button>
                  </div>
                </Form>
              </CardContent>
            </Card>

            {/* Usage / billing summary */}
            <Card shadow="sm" className="ring-border/60 ring-1 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="text-primary size-4" aria-hidden="true" />
                  Usage this cycle
                </CardTitle>
                <CardDescription>
                  Resets Aug 1 · seats, spend, and API volume against your plan
                  limits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {usageMeters.map((meter) => {
                  const Icon = meter.icon;
                  return (
                    <div key={meter.key} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-foreground/90 inline-flex items-center gap-2 text-sm font-medium">
                          <Icon
                            className="text-muted-foreground size-4"
                            aria-hidden="true"
                          />
                          {meter.label}
                        </span>
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {meter.detail}
                        </span>
                      </div>
                      <Progress
                        size="sm"
                        value={meter.value}
                        tone={meter.tone}
                        aria-label={`${meter.label}: ${meter.detail}`}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card shadow="sm" className="ring-border/60 ring-1 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                  Invoices
                </CardTitle>
                <CardDescription>
                  Billing history stays a semantic table for audit exports.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead align="end">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead align="end">
                        <span className="sr-only">Download</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        className="hover:bg-muted/40 motion-safe:transition-colors"
                      >
                        <TableCell className="font-mono text-sm">
                          {invoice.id}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {invoice.date}
                        </TableCell>
                        <TableCell align="end" className="tabular-nums">
                          {invoice.amount}
                        </TableCell>
                        <TableCell>
                          <span className="bg-success/15 text-success ring-success/25 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset">
                            <span
                              aria-hidden="true"
                              className="bg-success size-1.5 rounded-full"
                            />
                            {invoice.status}
                          </span>
                        </TableCell>
                        <TableCell align="end">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Download />}
                            aria-label={`Download ${invoice.id}`}
                          >
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-5">
            {/* Plan selection */}
            <Card shadow="sm" className="ring-border/60 ring-1 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard
                    className="text-primary size-5"
                    aria-hidden="true"
                  />
                  Plan
                </CardTitle>
                <CardDescription>
                  Switch plans with real, keyboard-accessible radios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldSet>
                  <FieldLegend className="sr-only">Billing plan</FieldLegend>
                  <RadioGroup
                    value={plan}
                    onValueChange={setPlan}
                    name="plan"
                  >
                    <FieldGroup className="gap-3">
                      {plans.map((item) => {
                        const selected = plan === item.value;
                        return (
                          <Field
                            key={item.value}
                            id={`settings-plan-${item.value}`}
                            orientation="horizontal"
                            className={`rounded-lg border p-3 motion-safe:transition-colors ${
                              selected
                                ? "border-primary ring-primary/40 bg-primary/5 ring-1"
                                : "border-border/60 bg-background/60 hover:border-border"
                            }`}
                          >
                            <FieldControl asChild>
                              <RadioGroupItem value={item.value} />
                            </FieldControl>
                            <FieldContent>
                              <div className="flex items-baseline justify-between gap-2">
                                <FieldLabel>{item.label}</FieldLabel>
                                <span className="text-foreground text-sm font-semibold tabular-nums">
                                  {item.price}
                                  <span className="text-muted-foreground ml-1 text-[0.7rem] font-normal">
                                    {item.cadence}
                                  </span>
                                </span>
                              </div>
                              <FieldDescription>{item.feature}</FieldDescription>
                            </FieldContent>
                          </Field>
                        );
                      })}
                    </FieldGroup>
                  </RadioGroup>
                </FieldSet>
              </CardContent>
            </Card>

            {/* Security callout */}
            <Callout
              icon={<ShieldCheck />}
              title="Security review complete"
              description="SAML, SCIM, and audit exports are enabled for this workspace."
              tone="success"
            />

            {/* Danger zone */}
            <Card
              shadow="sm"
              className="border-destructive/40 ring-destructive/20 relative overflow-hidden ring-1"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(80% 60% at 100% 0%, color-mix(in oklab, var(--dt-color-destructive) 8%, transparent), transparent 72%)",
                }}
              />
              <CardHeader className="relative">
                <CardTitle className="text-destructive flex items-center gap-2 text-base">
                  <AlertTriangle className="size-4" aria-hidden="true" />
                  Danger zone
                </CardTitle>
                <CardDescription>
                  Destructive actions require explicit confirmation.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-3">
                <p className="text-muted-foreground text-sm leading-6">
                  Suspending removes member access immediately. Billing and audit
                  logs remain available to owners.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger variant="destructive">
                    <AlertTriangle className="size-4" aria-hidden="true" />
                    Suspend workspace
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Suspend workspace?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Users will lose access immediately. Billing and audit
                        logs remain available to owners.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep active</AlertDialogCancel>
                      <AlertDialogAction variant="destructive">
                        Suspend
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
