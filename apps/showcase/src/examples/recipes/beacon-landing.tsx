"use client";

import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import {
  BellRing,
  BookOpenCheck,
  Check,
  GitPullRequestArrow,
  LineChart,
  Plus,
  Radio,
  Rocket,
  ShieldCheck,
  Timer,
  Workflow,
} from "lucide-react";
import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardScroller,
  CardScrollerItem,
  CardTitle,
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  HeroTextAnimationProvider,
  Input,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuDescription,
  NavigationMenuFeaturedItem,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLabel,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSection,
  NavigationMenuTrigger,
  RevealButton,
  Separator,
  Switch,
  Tabs,
  ToastProvider,
  ToastViewport,
  cn,
  useToast,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import { BeaconAssembly } from "./beacon-assembly";
import { BeaconHero } from "./beacon-hero";

/*
 * Beacon is a fictional incident-response product. The landing page is a
 * conventional marketing flow (hero with a live incident replay, proof,
 * features, pricing, voices, FAQ, sign-up) wrapped around one centrepiece: a scroll-driven stage that
 * assembles the product from real Dethink components. No data leaves the
 * page; the sign-up form only raises a local toast.
 */

const customers = [
  "Lattice",
  "Northwind",
  "Quanta",
  "Helix",
  "Parallel",
  "Oakline",
];

const navFeatures = [
  {
    icon: BellRing,
    title: "Alerting",
    body: "Route pages by service, severity, and rotation.",
  },
  {
    icon: Workflow,
    title: "Response",
    body: "Runbooks, roles, and status updates in one room.",
  },
  {
    icon: LineChart,
    title: "Insights",
    body: "Trends, MTTR, and blameless review templates.",
  },
];

const proofStats = [
  { value: "38%", label: "faster time to resolve" },
  { value: "4 min", label: "median setup" },
  { value: "99.99%", label: "paging uptime" },
];

const featureTabs = [
  {
    value: "detect",
    label: "Detect",
    title: "Hear about it before your customers do",
    body: "Beacon de-duplicates alerts from your monitoring stack and opens one incident with the right owner already paged.",
    points: [
      "Alert grouping across Datadog, Grafana, and Sentry",
      "Severity rules per service and time of day",
      "Escalations that respect time zones",
    ],
    icon: BellRing,
  },
  {
    value: "respond",
    label: "Respond",
    title: "Give every incident a calm room",
    body: "Roles, a live timeline, and linked runbooks keep responders focused while stakeholders follow along on their own.",
    points: [
      "Commander, comms, and scribe roles in one click",
      "Timeline that captures chat, deploys, and graphs",
      "Status updates drafted by the copilot",
    ],
    icon: ShieldCheck,
  },
  {
    value: "learn",
    label: "Learn",
    title: "Turn every page into a better week",
    body: "Beacon writes the first draft of the review, tracks follow-ups, and shows which services keep waking people up.",
    points: [
      "Blameless review templates with the timeline attached",
      "Follow-up actions synced to your issue tracker",
      "On-call load reports by person and service",
    ],
    icon: BookOpenCheck,
  },
];

const plans = [
  {
    name: "Starter",
    monthly: 0,
    annual: 0,
    blurb: "For side projects and small teams getting their first rotation.",
    features: ["Up to 5 responders", "Slack and email paging", "7-day history"],
    featured: false,
  },
  {
    name: "Team",
    monthly: 24,
    annual: 19,
    blurb: "For product teams who run their own services in production.",
    features: [
      "Unlimited responders",
      "Phone, SMS, and push paging",
      "Copilot status drafts",
      "Reviews and follow-ups",
    ],
    featured: true,
  },
  {
    name: "Scale",
    monthly: 49,
    annual: 39,
    blurb: "For organisations with many services and strict compliance needs.",
    features: [
      "SAML SSO and audit log",
      "Custom severity policies",
      "Dedicated success manager",
    ],
    featured: false,
  },
];

const voices = [
  {
    value: "priya",
    name: "Priya Raman",
    role: "Staff SRE, Quanta",
    quote:
      "Our first sev1 in Beacon was the first one where nobody asked ‘who is on this?’ in the channel.",
  },
  {
    value: "jon",
    name: "Jon Alvarez",
    role: "Engineering manager, Helix",
    quote:
      "The copilot's status drafts save our incident commander ten minutes every time. That is ten minutes of actually fixing things.",
  },
  {
    value: "amara",
    name: "Amara Okafor",
    role: "Head of platform, Parallel",
    quote:
      "On-call load reports finally gave us the data to split a service that paged the same two people every week.",
  },
  {
    value: "lena",
    name: "Lena Fischer",
    role: "CTO, Oakline",
    quote:
      "We moved from three tools to one in an afternoon and never looked back.",
  },
];

const faqs = [
  {
    value: "tools",
    question: "Which monitoring tools does Beacon work with?",
    answer:
      "Beacon accepts alerts from Datadog, Grafana, Prometheus Alertmanager, Sentry, and any tool that can send a webhook.",
  },
  {
    value: "copilot",
    question: "What data does the copilot use?",
    answer:
      "Only the incident timeline, linked deploys, and runbooks in your workspace. Drafts are always suggestions a responder approves.",
  },
  {
    value: "migrate",
    question: "Can we import our existing rotations?",
    answer:
      "Yes. Import schedules from a CSV or connect your current paging tool and Beacon mirrors the rotations during a trial.",
  },
  {
    value: "trial",
    question: "Is there a free trial?",
    answer:
      "Team and Scale include a 14-day trial with every feature. Starter is free for up to five responders.",
  },
];

const ctaGlowStyle: CSSProperties = {
  backgroundImage: [
    "radial-gradient(60% 120% at 0% 0%, color-mix(in oklab, var(--dt-color-primary) 22%, transparent), transparent 70%)",
    "radial-gradient(50% 120% at 100% 100%, color-mix(in oklab, var(--dt-color-info) 18%, transparent), transparent 72%)",
  ].join(", "),
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignupForm({
  emailRef,
}: {
  emailRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a work email like you@company.com.");
      emailRef.current?.focus();
      return;
    }

    setError(null);
    setEmail("");
    toast({
      tone: "success",
      title: "Your trial is ready",
      description: `We sent a sign-in link to ${value}. (Demo: nothing was sent.)`,
    });
  };

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-label="Start a free trial"
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-start"
    >
      <Field id="beacon-email" invalid={error !== null} className="flex-1">
        <FieldLabel className="sr-only">Work email</FieldLabel>
        <FieldControl asChild>
          <Input
            ref={emailRef}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            controlSize="lg"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
          />
        </FieldControl>
        {error ? (
          <FieldError>{error}</FieldError>
        ) : (
          <FieldDescription>14 days free. No card required.</FieldDescription>
        )}
      </Field>
      <Button type="submit" size="lg" rightIcon={<Rocket />}>
        Start free trial
      </Button>
    </form>
  );
}

function BeaconLanding({ presentation = "embedded" }: RecipePreviewProps) {
  const fullPage = presentation === "full-page";
  const [annual, setAnnual] = useState(true);
  const emailRef = useRef<HTMLInputElement>(null);

  const goToSignup = () => {
    document.getElementById("beacon-cta")?.scrollIntoView({ block: "center" });
    emailRef.current?.focus({ preventScroll: true });
  };

  return (
    <HeroTextAnimationProvider>
      <div
        data-recipe-surface="beacon-landing"
        className={cn(
          "border-border bg-background text-foreground overflow-clip border",
          fullPage
            ? "min-h-[calc(100dvh-7rem)] rounded-none border-x-0 border-t-0 [--beacon-sticky-top:calc(var(--site-header-height,0px)+3.5rem)]"
            : "rounded-xl",
        )}
      >
        {/* Header */}
        <header className="border-border flex min-h-16 items-center gap-3 border-b px-4 sm:px-6 lg:px-10">
          <a
            href="#beacon-hero"
            className="focus-visible:ring-ring focus-visible:ring-offset-background flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
              <Radio className="size-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-base font-semibold">Beacon</span>
          </a>

          <NavigationMenu
            aria-label="Beacon"
            className="ml-4 hidden flex-1 md:flex"
          >
            <NavigationMenuList>
              <NavigationMenuItem value="product">
                <NavigationMenuTrigger>Product</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuFeaturedItem href="#beacon-assemble">
                    See Beacon come together
                    <NavigationMenuDescription>
                      A seven-step tour of the workspace.
                    </NavigationMenuDescription>
                  </NavigationMenuFeaturedItem>
                  <NavigationMenuSection>
                    <NavigationMenuLabel>Platform</NavigationMenuLabel>
                    {navFeatures.map(({ icon: Icon, title, body }) => (
                      <NavigationMenuLink
                        key={title}
                        href="#beacon-features"
                        icon={<Icon aria-hidden="true" />}
                      >
                        {title}
                        <NavigationMenuDescription>
                          {body}
                        </NavigationMenuDescription>
                      </NavigationMenuLink>
                    ))}
                  </NavigationMenuSection>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#beacon-pricing">
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#beacon-customers">
                  Customers
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuIndicator />
            </NavigationMenuList>
          </NavigationMenu>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="max-sm:hidden">
              Log in
            </Button>
            <RevealButton
              icon={<Rocket />}
              label="Start free"
              size="sm"
              variant="solid"
              labelVisibility="always"
              onClick={goToSignup}
            />
          </div>
        </header>

        <BeaconHero
          onStart={goToSignup}
          onTour={() =>
            document
              .getElementById("beacon-assemble")
              ?.scrollIntoView({ block: "start" })
          }
        />

        {/* Social proof */}
        <section
          aria-label="Teams using Beacon"
          className="px-4 py-10 sm:px-6 lg:px-10"
        >
          <p className="text-muted-foreground text-center text-xs font-semibold tracking-[0.16em] uppercase">
            On call with 1,200+ engineering teams
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {customers.map((name) => (
              <li
                key={name}
                className="font-heading text-muted-foreground text-lg font-semibold tracking-tight"
              >
                {name}
              </li>
            ))}
          </ul>
          <dl className="border-border mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 border-t pt-8 text-center">
            {proofStats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-muted-foreground text-xs sm:text-sm">
                  {stat.label}
                </dt>
                <dd className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <BeaconAssembly onStart={goToSignup} />

        {/* Features */}
        <section
          id="beacon-features"
          aria-labelledby="beacon-features-heading"
          className="px-4 py-20 sm:px-6 lg:px-10"
        >
          <div className="max-w-2xl space-y-3">
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              Platform
            </p>
            <h2
              id="beacon-features-heading"
              className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              From the first alert to the last follow-up
            </h2>
          </div>

          <Tabs defaultValue="detect" className="mt-8">
            <Tabs.List aria-label="Beacon platform areas">
              {featureTabs.map((tab) => (
                <Tabs.Trigger key={tab.value} value={tab.value}>
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            {featureTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tabs.Panel key={tab.value} value={tab.value}>
                  <div className="grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
                    <div className="space-y-4">
                      <span className="bg-primary/10 text-primary grid size-11 place-items-center rounded-xl">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <h3 className="font-heading text-2xl font-semibold tracking-tight">
                        {tab.title}
                      </h3>
                      <p className="text-muted-foreground leading-7">
                        {tab.body}
                      </p>
                    </div>
                    <ul className="grid gap-3">
                      {tab.points.map((point) => (
                        <li
                          key={point}
                          className="border-border bg-muted/30 flex items-start gap-3 rounded-lg border p-4 text-sm"
                        >
                          <Check
                            aria-hidden="true"
                            className="text-success mt-0.5 size-4 shrink-0"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Tabs.Panel>
              );
            })}
          </Tabs>
        </section>

        <Separator />

        {/* Pricing */}
        <section
          id="beacon-pricing"
          aria-labelledby="beacon-pricing-heading"
          className="px-4 py-20 sm:px-6 lg:px-10"
        >
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl space-y-3">
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                Pricing
              </p>
              <h2
                id="beacon-pricing-heading"
                className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Priced per responder, not per page
              </h2>
            </div>
            <label
              htmlFor="beacon-billing"
              className="flex items-center gap-3 text-sm font-medium"
            >
              Monthly
              <Switch
                id="beacon-billing"
                checked={annual}
                onCheckedChange={setAnnual}
                aria-describedby="beacon-billing-note"
              />
              Annual
              <Badge tone="success" variant="soft" size="sm">
                Save 20%
              </Badge>
            </label>
          </div>
          <p id="beacon-billing-note" className="sr-only">
            Annual billing shows the discounted monthly price.
          </p>

          <ul className="mt-10 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
              const price = annual ? plan.annual : plan.monthly;
              return (
                <li key={plan.name}>
                  <Card
                    as="article"
                    shadow={plan.featured ? "md" : "sm"}
                    className={cn(
                      "flex h-full flex-col",
                      plan.featured && "ring-primary ring-2",
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        {plan.featured ? (
                          <Badge tone="primary" size="sm">
                            Most popular
                          </Badge>
                        ) : null}
                      </div>
                      <CardDescription>{plan.blurb}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-6">
                      <p className="flex items-baseline gap-1">
                        <span className="font-heading text-4xl font-semibold tracking-tight">
                          ${price}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          per responder / month
                        </span>
                      </p>
                      <ul className="space-y-2.5 text-sm">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex gap-2.5">
                            <Check
                              aria-hidden="true"
                              className="text-primary mt-0.5 size-4 shrink-0"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="mt-auto w-full"
                        variant={plan.featured ? "solid" : "outline"}
                        onClick={goToSignup}
                      >
                        {price === 0 ? "Start for free" : "Start trial"}
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Customers */}
        <section
          id="beacon-customers"
          aria-labelledby="beacon-customers-heading"
          className="bg-muted/30 border-border border-y px-4 py-20 sm:px-6 lg:px-10"
        >
          <h2
            id="beacon-customers-heading"
            className="font-heading max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Quieter nights, in their words
          </h2>
          <div className="mt-8">
            <CardScroller
              aria-label="Customer stories"
              defaultValue={voices[0]?.value}
              maxVisibleCards={3}
              nextLabel="Show next story"
              previousLabel="Show previous story"
              showControls
            >
              {voices.map((voice) => (
                <CardScrollerItem
                  key={voice.value}
                  value={voice.value}
                  label={voice.name}
                >
                  <Card as="article" shadow="sm" className="h-full min-h-64">
                    <CardContent className="h-full p-6">
                      <figure className="flex h-full flex-col gap-6">
                        <blockquote className="font-heading text-lg leading-snug font-medium tracking-tight">
                          “{voice.quote}”
                        </blockquote>
                        <figcaption className="mt-auto flex items-center gap-3">
                          <Avatar name={voice.name} decorative size="md" />
                          <span>
                            <span className="block text-sm font-semibold">
                              {voice.name}
                            </span>
                            <span className="text-muted-foreground block text-xs">
                              {voice.role}
                            </span>
                          </span>
                        </figcaption>
                      </figure>
                    </CardContent>
                  </Card>
                </CardScrollerItem>
              ))}
            </CardScroller>
          </div>
        </section>

        {/* FAQ */}
        <section
          aria-labelledby="beacon-faq-heading"
          className="grid gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:px-10"
        >
          <div className="space-y-3">
            <h2
              id="beacon-faq-heading"
              className="font-heading text-3xl font-semibold tracking-tight"
            >
              Questions
            </h2>
            <p className="text-muted-foreground text-sm leading-6">
              Anything else? Our on-call engineers answer support too.
            </p>
          </div>
          <Accordion aria-label="Questions about Beacon" className="gap-0">
            {faqs.map((faq) => (
              <Accordion.Item
                key={faq.value}
                value={faq.value}
                className="border-border rounded-none border-x-0 border-t border-b-0 bg-transparent shadow-none"
              >
                <Accordion.Blade iconPosition="end" className="py-5">
                  <Accordion.BladeText className="text-base font-medium">
                    {faq.question}
                  </Accordion.BladeText>
                  <Accordion.BladeIcon>
                    <Plus aria-hidden="true" className="size-4" />
                  </Accordion.BladeIcon>
                </Accordion.Blade>
                <Accordion.Content>
                  <p className="text-muted-foreground max-w-2xl pb-4 text-sm leading-7">
                    {faq.answer}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion>
        </section>

        {/* CTA */}
        <section
          id="beacon-cta"
          aria-labelledby="beacon-cta-heading"
          className="px-4 pb-20 sm:px-6 lg:px-10"
        >
          <div
            style={ctaGlowStyle}
            className="border-border flex flex-col gap-8 rounded-2xl border px-6 py-12 sm:px-10 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="max-w-md space-y-3">
              <h2
                id="beacon-cta-heading"
                className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
              >
                Your next incident can be a calm one
              </h2>
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Timer aria-hidden="true" className="size-4" />
                Set up your first rotation in about four minutes.
              </p>
            </div>
            <SignupForm emailRef={emailRef} />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-border text-muted-foreground flex flex-wrap items-center justify-between gap-4 border-t px-4 py-8 text-sm sm:px-6 lg:px-10">
          <span className="flex items-center gap-2">
            <Radio aria-hidden="true" className="text-primary size-4" />
            Beacon is a fictional product for this recipe.
          </span>
          <span className="flex items-center gap-2">
            <GitPullRequestArrow aria-hidden="true" className="size-4" />
            Built with Dethink components
          </span>
        </footer>
      </div>
    </HeroTextAnimationProvider>
  );
}

export function BeaconLandingRecipe(props: RecipePreviewProps) {
  return (
    <ToastProvider motion="standard">
      <BeaconLanding {...props} />
      <ToastViewport />
    </ToastProvider>
  );
}
