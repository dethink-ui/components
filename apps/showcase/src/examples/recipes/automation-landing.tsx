"use client";

import Link from "next/link";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { useAutomationReducedMotion } from "./automation-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  Cloud,
  Database,
  GitBranch,
  Layers3,
  Play,
  Plus,
  ShieldCheck,
  Triangle,
  Users,
  Zap,
} from "lucide-react";
import {
  Accordion,
  AvatarGroup,
  Badge,
  Button,
  Card,
  SilkFlowBackground,
  ShaderHeroText,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import "./automation-suite.css";

const workflows = [
  {
    id: "leads",
    label: "Lead routing",
    title: "A new lead. Already in the right hands.",
    source: "Website form",
    steps: [
      "New lead received",
      "Enrich company data",
      "Assign the right owner",
      "Sync to your CRM",
    ],
    records: ["Acme Studio", "Northstar Labs", "Orbit Software"],
    outcome: "Routed",
    icon: Users,
  },
  {
    id: "invoices",
    label: "Invoice approvals",
    title: "From incoming invoice to approved expense.",
    source: "Shared inbox",
    steps: [
      "Invoice received",
      "Match purchase order",
      "Request approval",
      "Update the ledger",
    ],
    records: ["INV-2048 · Acme", "INV-2049 · Orbit", "INV-2050 · Linear"],
    outcome: "Approved",
    icon: Layers3,
  },
  {
    id: "incidents",
    label: "Incident response",
    title: "The right response, before the next alert.",
    source: "Monitoring",
    steps: [
      "Alert received",
      "Enrich with context",
      "Notify on-call team",
      "Create incident log",
    ],
    records: ["API latency", "Queue backlog", "Webhook recovery"],
    outcome: "Resolved",
    icon: ShieldCheck,
  },
];
const operators = [
  { id: "mp", name: "Mira Patel" },
  { id: "jo", name: "June Okafor" },
  { id: "em", name: "Eli Morgan" },
];
const faq = [
  [
    "Do I need to write code?",
    "Start with a workflow template, connect your tools, and choose the rules. Add a human approval wherever your team needs the final say.",
  ],
  [
    "What happens when a step fails?",
    "Every run keeps a readable activity history. In a connected production workflow, you would configure retries and an owner for failures before enabling it.",
  ],
  [
    "Can I try it without connecting my tools?",
    "Yes. The workflow console above runs entirely with sample data. Nothing is sent to a CRM, accounting system, or incident service.",
  ],
  [
    "Is this a real software service?",
    "Automation is a fictional company in this Dethink recipe. Pricing, runs, and sign-in are interactive demonstrations, with no payment or account creation.",
  ],
];

function WorkflowConsole() {
  const [selected, setSelected] = useState("leads");
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState(0);
  const workflow = workflows.find((item) => item.id === selected)!;
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      if (step < 3) setStep(step + 1);
      else {
        setStep(4);
        setRunning(false);
        setRuns((count) => count + 1);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [running, step]);
  return (
    <Card
      shadow="none"
      className="border-border bg-background overflow-hidden rounded-xl"
    >
      <Tabs
        value={selected}
        onValueChange={(value) => {
          setSelected(value);
          setStep(0);
          setRunning(false);
          setRuns(0);
        }}
        motionPreset="none"
        className="gap-0"
      >
        <div className="border-border overflow-x-auto border-b px-3 py-3 sm:px-6">
          <Tabs.List
            aria-label="Automation workflows"
            className="gap-2 border-0 bg-transparent p-0 shadow-none"
          >
            {workflows.map(({ id, label, icon: Icon }) => (
              <Tabs.Trigger
                key={id}
                value={id}
                className="px-4 text-xs sm:text-sm"
              >
                <span className="inline-flex items-center gap-2.5">
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span>{label}</span>
                </span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>
        {workflows.map((item) => (
          <Tabs.Panel key={item.id} value={item.id} className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Workflow /{" "}
                  {item.id === "leads"
                    ? "001"
                    : item.id === "invoices"
                      ? "002"
                      : "003"}
                </p>
                <h3 className="text-base font-medium">{item.title}</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStep(0);
                  setRunning(true);
                }}
                disabled={running}
                leftIcon={<Play />}
              >
                {running ? "Running sample…" : "Run sample"}
              </Button>
            </div>
            <ol
              aria-label={`${item.label} steps`}
              className="my-10 grid gap-6 sm:flex sm:gap-0"
            >
              {item.steps.map((label, index) => {
                const Icon = [Zap, Database, Users, Cloud][index]!;
                return (
                  <li
                    key={label}
                    className="relative flex items-center gap-3 sm:block sm:min-w-0 sm:flex-1 sm:pr-8 sm:last:max-w-[25%] sm:last:flex-none sm:last:pr-0"
                  >
                    <div className="border-primary/40 bg-primary/5 text-primary relative mb-0 flex size-11 shrink-0 items-center justify-center rounded-full border sm:mb-4">
                      {step > index ? (
                        <Check aria-hidden="true" className="size-5" />
                      ) : (
                        <Icon aria-hidden="true" className="size-5" />
                      )}
                    </div>
                    {index < 3 && (
                      <div
                        aria-hidden="true"
                        className="border-border absolute top-5 right-6 left-14 hidden border-t border-dashed sm:block"
                      />
                    )}
                    <div>
                      <p className="text-muted-foreground text-[10px] tracking-widest uppercase">
                        0{index + 1} /{" "}
                        {step > index
                          ? "Complete"
                          : running && step === index
                            ? "Running"
                            : "Ready"}
                      </p>
                      <p className="mt-1 text-sm">{label}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="mb-5">
              <Progress
                value={step * 25}
                aria-label="Sample workflow progress"
                size="sm"
              />
            </div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-xs font-medium">Recent activity</h4>
              <Badge variant="soft">Sample data</Badge>
            </div>
            <div className="border-border overflow-x-auto rounded-lg border">
              <Table
                tabIndex={0}
                aria-label={`${item.label} recent activity`}
                className="focus-visible:outline-ring min-w-[520px] text-xs focus-visible:outline-2"
              >
                <TableHeader>
                  <TableRow>
                    <TableHead>Record</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ...(runs ? [`Sample run ${runs}`] : []),
                    ...item.records,
                  ].map((record, index) => (
                    <TableRow key={record}>
                      <TableCell className="font-medium">{record}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.source}
                      </TableCell>
                      <TableCell>
                        <AvatarGroup
                          members={operators.slice(index % 2, (index % 2) + 2)}
                          size="xs"
                          max={2}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="text-primary inline-flex items-center gap-1.5">
                          <CheckCheck aria-hidden="true" className="size-3" />
                          {item.outcome}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {runs && index === 0 ? "Just now" : `${index + 2}m ago`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Tabs.Panel>
        ))}
      </Tabs>
      <div className="border-border text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3 text-xs">
        <p role="status">
          {running
            ? `${workflow.label}: step ${step + 1} of 4`
            : step === 4
              ? `${workflow.label} complete. Sample run ${runs} added to activity.`
              : "Ready when you are. Run a sample workflow."}
        </p>
        <span>Local demo · no tools connected</span>
      </div>
    </Card>
  );
}

export function AutomationLandingRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const id = useId();
  const reduceMotion = useAutomationReducedMotion();
  const [annual, setAnnual] = useState(true);
  const workflowId = `${id}-workflows`,
    benefitsId = `${id}-benefits`,
    pricingId = `${id}-pricing`,
    faqId = `${id}-faq`;
  return (
    <div
      data-recipe-surface="automation-landing"
      id={`${id}-top`}
      className={`sc-automation sc-automation-dark min-h-[calc(100dvh-7rem)] ${presentation === "embedded" ? "border-border overflow-hidden rounded-xl border" : ""}`}
    >
      <div className="automation-ink relative isolate overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[660px]"
          aria-hidden="true"
        >
          <SilkFlowBackground
            animate={!reduceMotion}
            speed="fast"
            intensity="bold"
            seed={8}
            className="h-full w-full"
          />
          <div className="from-background via-background/40 absolute inset-0 bg-gradient-to-r to-transparent" />
          <div className="from-background absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
        </div>
        <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10">
          <a
            href={`#${id}-top`}
            aria-label="Automation home"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <Triangle aria-hidden="true" className="text-primary size-5" />
            AUTOMATION<span className="text-primary">®</span>
          </a>
          <nav
            aria-label="Automation navigation"
            className="text-muted-foreground order-3 flex w-full gap-6 text-xs sm:order-none sm:w-auto"
          >
            <a href={`#${workflowId}`}>Product</a>
            <a href={`#${benefitsId}`}>Solutions</a>
            <a href={`#${pricingId}`}>Pricing</a>
          </nav>
          <Button asChild variant="outline" size="sm">
            <Link href="/recipes/automation-login">
              Log in <ArrowUpRight aria-hidden="true" className="size-3" />
            </Link>
          </Button>
        </header>
        <section className="mx-auto max-w-6xl px-6 pt-12 pb-12 sm:px-10 sm:pt-20 sm:pb-16">
          <p className="text-primary mb-5 flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase">
            <span className="bg-primary size-1.5 rounded-full" />A little
            automation. A lot more possibility.
          </p>
          <h1 className="max-w-3xl text-[clamp(2.8rem,6.5vw,5.5rem)] leading-[0.99] font-medium tracking-[-0.06em]">
            <ShaderHeroText
              as="span"
              text="Less busywork."
              animation="particle-follow"
              intensity={0.85}
              reducedMotion={reduceMotion ? "always" : "user"}
            />
            <ShaderHeroText
              as="span"
              text="More momentum."
              animation="particle-follow"
              intensity={0.85}
              reducedMotion={reduceMotion ? "always" : "user"}
              className="text-primary"
              style={
                {
                  "--shader-hero-text-base": "var(--dt-color-primary)",
                } as CSSProperties
              }
            />
          </h1>
          <p className="text-muted-foreground mt-6 max-w-md text-sm leading-7 sm:text-base">
            Connect your tools. Automate the handoffs.
            <br className="hidden sm:block" /> Give your team the space to do
            their best work.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/recipes/automation-login">
                Start automating{" "}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={`#${workflowId}`}>Explore workflows</a>
            </Button>
          </div>
          <div className="text-muted-foreground mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[11px]">
            {[
              "Start with a template",
              "Keep people in control",
              "Make every step visible",
            ].map((text) => (
              <span key={text} className="inline-flex items-center gap-1.5">
                <Check aria-hidden="true" className="text-primary size-3" />
                {text}
              </span>
            ))}
          </div>
        </section>
        <section
          id={workflowId}
          aria-label="Interactive workflow demo"
          className="mx-auto max-w-6xl px-4 pb-10 sm:px-10"
        >
          <WorkflowConsole />
        </section>
      </div>
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <section
          id={benefitsId}
          aria-label="Automation benefits"
          className="border-border grid gap-10 border-b py-16 sm:grid-cols-3 sm:gap-12 lg:gap-24"
        >
          {[
            [
              Layers3,
              "Build once. Keep moving.",
              "Turn the steps you repeat into workflows that do the heavy lifting.",
            ],
            [
              GitBranch,
              "Bring your tools together.",
              "Connect the handoffs between sales, finance, and the teams behind them.",
            ],
            [
              ShieldCheck,
              "Stay in the loop.",
              "Put approvals where they matter. See what happened at every step.",
            ],
          ].map(([Icon, title, copy]) => {
            const Glyph = Icon as typeof Layers3;
            return (
              <div key={String(title)}>
                <Glyph
                  aria-hidden="true"
                  className="text-primary mb-6 size-6"
                />
                <h2 className="text-base font-medium tracking-tight">
                  {String(title)}
                </h2>
                <p className="text-muted-foreground mt-3 text-sm leading-6">
                  {String(copy)}
                </p>
              </div>
            );
          })}
        </section>
        <section id={pricingId} className="py-14">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-primary mb-2 text-[10px] tracking-[0.18em] uppercase">
                Room to grow
              </p>
              <h2 className="text-3xl font-medium tracking-tight">
                Small start. Big possibilities.
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Illustrative plans for your next chapter.
              </p>
            </div>
            <div
              role="group"
              aria-label="Billing interval"
              className="border-border flex gap-1 rounded-lg border p-1"
            >
              <Button
                size="sm"
                variant={!annual ? "solid" : "ghost"}
                aria-pressed={!annual}
                onClick={() => setAnnual(false)}
              >
                Monthly
              </Button>
              <Button
                size="sm"
                variant={annual ? "solid" : "ghost"}
                aria-pressed={annual}
                onClick={() => setAnnual(true)}
              >
                Yearly · save 20%
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "$0",
                detail: "For the first thing you never do twice.",
                features: [
                  "3 active workflows",
                  "100 sample runs / month",
                  "Core integrations",
                ],
              },
              {
                name: "Team",
                price: annual ? "$24" : "$30",
                detail: "For teams ready to find their rhythm.",
                features: [
                  "Unlimited workflows",
                  "10,000 runs / month",
                  "Approvals and run history",
                ],
              },
              {
                name: "Enterprise",
                price: "Let’s talk",
                detail: "For the way your organisation works.",
                features: [
                  "Custom run volume",
                  "Advanced access controls",
                  "Dedicated onboarding",
                ],
              },
            ].map((plan, index) => (
              <Card
                key={plan.name}
                shadow="none"
                className={`flex flex-col gap-5 p-6 ${index === 1 ? "border-primary" : "border-border"}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{plan.name}</h3>
                  {index === 1 && <Badge variant="soft">Most popular</Badge>}
                </div>
                <div>
                  <p
                    className="text-4xl font-medium tracking-tight"
                    data-plan-price={plan.name}
                  >
                    {plan.price}
                  </p>
                  <p className="text-muted-foreground mt-2 min-h-5 text-xs">
                    {index === 0
                      ? "Free to explore"
                      : index === 1
                        ? `per workspace / month · ${annual ? "$288 billed yearly" : "billed monthly"}`
                        : "Built around your team"}
                  </p>
                </div>
                <p className="text-muted-foreground text-sm">{plan.detail}</p>
                <ul className="space-y-3 text-xs">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check
                        aria-hidden="true"
                        className="text-primary size-3.5 shrink-0"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={index === 1 ? "solid" : "outline"}
                  className="mt-auto w-full"
                >
                  <Link href="/recipes/automation-login">
                    {index === 0
                      ? "Get started"
                      : index === 1
                        ? "Try the team demo"
                        : "Explore enterprise"}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>
        <section
          id={faqId}
          className="border-border grid gap-7 border-t py-12 md:grid-cols-[1fr_1.6fr]"
        >
          <div>
            <p className="text-primary mb-3 text-[10px] tracking-widest uppercase">
              A few good questions
            </p>
            <h2 className="text-3xl font-medium tracking-tight">
              Glad you asked.
            </h2>
          </div>
          <Accordion
            motionPreset="none"
            aria-label="Automation questions"
            className="gap-0"
          >
            {faq.map(([question, answer], index) => (
              <Accordion.Item
                key={question}
                value={String(index)}
                className="border-border rounded-none border-x-0 border-t-0 border-b bg-transparent shadow-none"
              >
                <Accordion.Blade iconPosition="end" className="py-5">
                  <Accordion.BladeText className="text-sm font-medium">
                    {question}
                  </Accordion.BladeText>
                  <Accordion.BladeIcon>
                    <Plus aria-hidden="true" className="size-4" />
                  </Accordion.BladeIcon>
                </Accordion.Blade>
                <Accordion.Content>
                  <p className="text-muted-foreground pb-5 text-sm leading-6">
                    {answer}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion>
        </section>
        <footer className="border-border text-muted-foreground flex flex-wrap items-center justify-between gap-5 border-t py-7 text-xs">
          <span className="flex items-center gap-2 font-medium">
            <Triangle aria-hidden="true" className="size-4" />
            AUTOMATION{" "}
            <span className="font-normal">/ Work, with room to breathe.</span>
          </span>
          <div className="flex gap-5">
            <a href={`#${workflowId}`}>Product</a>
            <a href={`#${faqId}`}>Questions</a>
            <Link href="/recipes/automation-login">Log in</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
