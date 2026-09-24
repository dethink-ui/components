"use client";

import { useId, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { MotionConfig } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  Database,
  FileText,
  GitBranch,
  Layers3,
  Mail,
  MessageSquare,
  Network,
  Pause,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import {
  Accordion,
  Badge,
  Button,
  Card,
  CardScroller,
  CardScrollerItem,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  HeroTextAnimation,
  HeroTextAnimationProvider,
  IconButton,
  LightStreaksBackground,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  RevealButton,
  Separator,
  Tabs,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import {
  formaAgents,
  formaEngagements,
  formaFaq,
  type FormaAgentId,
  type FormaEngagementId,
} from "./forma-ai-data";
import { FormaAgentLab } from "./forma-ai-lab";
import { FormaBrief } from "./forma-ai-brief";
import "./forma-ai.css";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(listener: () => void) {
  const preference = window.matchMedia(motionQuery);
  preference.addEventListener("change", listener);
  return () => preference.removeEventListener("change", listener);
}
const motionSnapshot = () => window.matchMedia(motionQuery).matches;
const serverMotionSnapshot = () => true;

const integrations = [
  {
    name: "Knowledge",
    icon: FileText,
    description:
      "Bring approved documents and help content into the agent's context. A production connection would define indexing, permissions and freshness before use.",
  },
  {
    name: "Messaging",
    icon: MessageSquare,
    description:
      "Prepare useful updates for team conversations. Decide which channels are available and which messages need a human review before connecting a service.",
  },
  {
    name: "Your data",
    icon: Database,
    description:
      "Use a carefully scoped view of your data. A real implementation would define access controls, sensitive-field handling and the questions an agent is allowed to answer.",
  },
  {
    name: "Email",
    icon: Mail,
    description:
      "Classify an inbox or prepare a draft reply. Set approval boundaries and recipient checks before enabling any sending capability.",
  },
  {
    name: "Projects",
    icon: Layers3,
    description:
      "Turn an approved next step into a project handoff. Map owners and action permissions before connecting your task system.",
  },
  {
    name: "Your API",
    icon: Network,
    description:
      "Connect a service specific to your business. Authentication, permitted actions, rate limits and recovery paths are part of the design.",
  },
];

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
      {children}
    </p>
  );
}

function IntegrationTiles() {
  return (
    <div className="grid grid-cols-3 gap-2" aria-label="Integration categories">
      {integrations.map(({ name, icon: Icon, description }) => (
        <Dialog key={name}>
          <DialogTrigger
            aria-label={`Explore ${name} integration`}
            variant="outline"
            className="border-border/70 bg-background/90 h-auto! min-h-20 flex-col gap-2 rounded-xl px-2 py-3 text-[10px]"
          >
            <Icon aria-hidden="true" className="text-primary size-5" />
            <span>{name}</span>
          </DialogTrigger>
          <DialogContent className="sc-forma-theme" size="sm">
            <DialogHeader>
              <DialogTitle>{name} integration</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <p className="text-muted-foreground px-6 pb-5 text-sm">
              This is a capability preview. No account is connected and no data
              leaves this page.
            </p>
            <DialogFooter>
              <DialogClose variant="outline">Back to capabilities</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

export function FormaAiRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const id = useId();
  const target = (section: string) => `${id}-forma-${section}`;
  const href = (section: string) => `#${target(section)}`;
  const reduced = useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    serverMotionSnapshot,
  );
  const [paused, setPaused] = useState(false);
  const motionEnabled = !reduced && !paused;
  const [selectedAgent, setSelectedAgent] = useState<FormaAgentId>("research");
  const [engagement, setEngagement] = useState<FormaEngagementId>("discovery");
  const agent = formaAgents.find((item) => item.id === selectedAgent)!;
  const nav = [
    ["Capabilities", "capabilities"],
    ["How it works", "process"],
    ["Agent lab", "lab"],
    ["FAQ", "faq"],
  ] as const;
  return (
    <MotionConfig reducedMotion={motionEnabled ? "user" : "always"}>
      <HeroTextAnimationProvider
        reducedMotion={motionEnabled ? "user" : "always"}
      >
        <div
          className="sc-forma-theme bg-background text-foreground min-w-0"
          data-recipe-surface="forma-ai"
          data-presentation={presentation}
          data-motion={motionEnabled ? "playing" : "paused"}
        >
          <a
            href={href("hero")}
            className="sr-only focus:not-sr-only focus:block focus:p-4"
          >
            Skip to Forma introduction
          </a>
          <header
            id={target("top")}
            className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-9"
          >
            <a
              href={href("top")}
              aria-label="Forma home"
              className="text-[28px] leading-none font-semibold tracking-[-0.08em]"
            >
              forma<span className="text-primary">✳</span>
            </a>
            <NavigationMenu
              aria-label="Forma sections"
              motion="none"
              variant="quiet"
              size="sm"
              className="order-3 w-full sm:order-none sm:w-auto"
            >
              <NavigationMenuList className="flex-wrap justify-center gap-0 sm:gap-1">
                {nav.map(([label, section]) => (
                  <NavigationMenuItem key={section}>
                    <NavigationMenuLink
                      href={href(section)}
                      className="px-2 text-[11px] font-normal sm:px-3"
                    >
                      {label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            <div className="flex items-center gap-2">
              <IconButton
                aria-label={
                  reduced
                    ? "Reduced motion enabled"
                    : paused
                      ? "Resume animation"
                      : "Pause animation"
                }
                aria-pressed={paused || reduced}
                disabled={reduced}
                variant="ghost"
                size="sm"
                onClick={() => setPaused(!paused)}
              >
                {motionEnabled ? (
                  <Pause aria-hidden="true" />
                ) : (
                  <Play aria-hidden="true" />
                )}
              </IconButton>
              <FormaBrief engagement={engagement} label="Let’s talk" small />
            </div>
          </header>

          <LightStreaksBackground
            animate={motionEnabled}
            density="sparse"
            intensity="faint"
            speed="slow"
            tone="primary"
            seed={94}
            className="relative isolate"
          >
            <section
              id={target("hero")}
              aria-labelledby={target("heading")}
              className="relative isolate scroll-mt-32 px-5 pt-10 pb-28 text-center sm:px-9 sm:pt-14 sm:pb-32"
            >
              <Image
                src="/recipes/forma-ai/ribbon.webp"
                alt=""
                aria-hidden="true"
                width={1536}
                height={1024}
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="sc-forma-ribbon pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-65"
              />
              <Badge
                tone="primary"
                variant="soft"
                size="sm"
                className="border-primary/10 bg-background/90 mb-6 px-3 py-2 text-[10px] font-normal"
              >
                Intelligent systems. Human ambition.
              </Badge>
              <h1
                id={target("heading")}
                aria-label="Less busywork. More possibility."
                className="mx-auto max-w-[880px] font-sans text-[clamp(2.8rem,6.8vw,5.4rem)] leading-[1.03] font-medium tracking-[-0.065em]"
              >
                <HeroTextAnimation
                  as="span"
                  animation="masked-curtain"
                  text="Less busywork."
                  splitBy="word"
                  duration={0.8}
                  stagger={0.07}
                  className="block"
                />
                <HeroTextAnimation
                  as="span"
                  animation="masked-curtain"
                  text="More possibility."
                  splitBy="word"
                  duration={0.8}
                  stagger={0.07}
                  className="text-primary block"
                />
              </h1>
              <p className="text-muted-foreground mx-auto mt-6 max-w-md text-sm leading-6 sm:text-base">
                We build AI agents and automations that give your team room to
                do their best work.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <FormaBrief engagement={engagement} label="Build with us" />
                <Button
                  asChild
                  variant="outline"
                  size="md"
                  className="bg-background/90 text-xs"
                >
                  <a href={href("lab")}>
                    Explore the agent lab{" "}
                    <ArrowDown
                      aria-hidden="true"
                      className="ms-2 inline size-3"
                    />
                  </a>
                </Button>
              </div>
              <div className="mt-12 flex items-center justify-between text-start sm:mt-14">
                <p className="text-muted-foreground max-w-24 text-[8px] leading-relaxed tracking-[0.17em] uppercase">
                  People.
                  <br />
                  Ideas.
                  <br />
                  Agents.
                  <br />A brighter tomorrow.
                </p>
                <div className="border-primary/40 text-muted-foreground max-w-40 border-s ps-4 text-[8px] tracking-[0.15em] uppercase">
                  Same people.
                  <br />
                  Bigger possibilities.
                </div>
              </div>
            </section>
          </LightStreaksBackground>

          <div className="relative px-5 pb-14 sm:px-9">
            <section
              id={target("lab")}
              aria-label="Interactive agent lab"
              className="relative -mt-10 scroll-mt-32"
            >
              <FormaAgentLab motionEnabled={motionEnabled} />
            </section>

            <section
              id={target("capabilities")}
              aria-labelledby={target("capabilities-heading")}
              className="scroll-mt-32 pt-16"
            >
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <Eyebrow>What we do</Eyebrow>
                  <h2
                    id={target("capabilities-heading")}
                    className="mt-2 text-3xl font-medium tracking-[-0.05em] sm:text-4xl"
                  >
                    Three ways to move forward.
                  </h2>
                </div>
                <p className="text-muted-foreground max-w-xs text-xs leading-5">
                  From specialized agents to end-to-end systems, we design AI
                  that fits the way you work.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Card
                  as="article"
                  shadow="none"
                  className="bg-background rounded-xl p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <Sparkles aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="text-sm font-semibold tracking-tight">
                      Agents that think ahead
                    </h3>
                  </div>
                  <p className="text-muted-foreground min-h-14 text-xs leading-5">
                    Specialized AI teammates that research, reason, and help you
                    take the next step.
                  </p>
                  <div className="bg-primary/7 mt-5 grid min-h-52 grid-cols-[0.7fr_1.3fr] items-center gap-3 rounded-xl p-4">
                    <div
                      aria-hidden="true"
                      className="border-primary/20 text-primary bg-background flex aspect-square items-center justify-center rounded-[40%] border shadow-[0_8px_35px_-10px_var(--dt-color-primary)]"
                    >
                      <Bot className="size-8 stroke-1" />
                    </div>
                    <ul className="space-y-2 text-[10px]">
                      {[
                        "Find the signal",
                        "Summarize the detail",
                        "Draft a response",
                        "Plan the next step",
                      ].map((label) => (
                        <li
                          key={label}
                          className="bg-background flex items-center gap-2 rounded-md p-2.5"
                        >
                          <FileText
                            aria-hidden="true"
                            className="text-primary size-3 shrink-0"
                          />
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-muted-foreground mt-5 text-[9px] tracking-widest uppercase">
                    More thinking. Less typing.
                  </p>
                </Card>
                <Card
                  as="article"
                  shadow="none"
                  className="bg-background rounded-xl p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <Workflow aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="text-sm font-semibold tracking-tight">
                      Workflows that just flow
                    </h3>
                  </div>
                  <p className="text-muted-foreground min-h-14 text-xs leading-5">
                    Turn complex processes into simple, reliable automations
                    with people at the right moments.
                  </p>
                  <ol className="bg-muted/50 before:bg-primary/25 relative mt-5 space-y-3 rounded-xl p-4 before:absolute before:inset-y-9 before:start-9 before:w-px">
                    {[
                      {
                        label: "Trigger",
                        detail: "A new request arrives",
                        icon: Zap,
                      },
                      {
                        label: "Agent",
                        detail: "Find context and prepare",
                        icon: Bot,
                      },
                      {
                        label: "Review",
                        detail: "A person makes the call",
                        icon: ShieldCheck,
                      },
                    ].map(({ label, detail, icon: Icon }) => (
                      <li
                        key={label}
                        className="bg-background relative flex items-center gap-3 rounded-lg p-3"
                      >
                        <span className="bg-primary/10 text-primary rounded-lg p-2">
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold">{label}</p>
                          <p className="text-muted-foreground text-[10px]">
                            {detail}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="text-muted-foreground mt-auto pt-5 text-[9px] tracking-widest uppercase">
                    From chaos to clarity.
                  </p>
                </Card>
                <Card
                  as="article"
                  shadow="none"
                  className="bg-background rounded-xl p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <Network aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="text-sm font-semibold tracking-tight">
                      Your tools, working together
                    </h3>
                  </div>
                  <p className="text-muted-foreground min-h-14 text-xs leading-5">
                    Connect the context you already have. Explore where an agent
                    could fit into your stack.
                  </p>
                  <div className="bg-muted/50 mt-5 rounded-xl p-3">
                    <IntegrationTiles />
                  </div>
                  <p className="text-muted-foreground mt-auto pt-5 text-[9px] tracking-widest uppercase">
                    Same tools. A smarter tomorrow.
                  </p>
                </Card>
              </div>
            </section>

            <section
              aria-labelledby={target("agents-heading")}
              className="pt-16"
            >
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <Eyebrow>Meet some of our agents</Eyebrow>
                  <h2
                    id={target("agents-heading")}
                    className="mt-2 text-3xl font-medium tracking-[-0.05em] sm:text-4xl"
                  >
                    Specialists for real work.
                  </h2>
                </div>
                <p className="text-muted-foreground max-w-xs text-xs leading-5">
                  Choose a specialist. See how it could help.
                  <br />
                  Built around the work that moves you forward.
                </p>
              </div>
              <CardScroller
                aria-label="Choose an agent specialist"
                value={selectedAgent}
                onValueChange={(value) =>
                  setSelectedAgent(value as FormaAgentId)
                }
                maxVisibleCards={3}
                showControls
                nextLabel="Next agent"
                previousLabel="Previous agent"
              >
                {formaAgents.map((item, index) => {
                  const Icon = [Search, MessageSquare, GitBranch][index];
                  return (
                    <CardScrollerItem
                      key={item.id}
                      value={item.id}
                      label={`${item.name} agent`}
                    >
                      <Card className="min-h-44 rounded-xl p-5" shadow="none">
                        <div className="flex items-start gap-3">
                          <span className="bg-primary/10 text-primary rounded-xl p-3">
                            <Icon aria-hidden="true" className="size-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="flex items-center justify-between text-sm font-semibold">
                              {item.name}
                              <ArrowUpRight
                                aria-hidden="true"
                                className="size-3"
                              />
                            </h3>
                            <p className="text-muted-foreground mt-2 text-[11px] leading-5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                          {item.tags.map((tag) => (
                            <Badge
                              key={tag}
                              size="xs"
                              variant="subtle"
                              tone="primary"
                              className="text-[9px]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    </CardScrollerItem>
                  );
                })}
              </CardScroller>
              <div
                role="region"
                aria-label="Selected agent details"
                className="border-border bg-muted/35 mt-3 grid gap-4 rounded-xl border p-5 sm:grid-cols-[1fr_1.5fr]"
              >
                <div>
                  <p className="text-primary text-[10px] font-semibold tracking-wider uppercase">
                    {agent.name} agent
                  </p>
                  <h3 className="mt-1 text-xl font-medium tracking-tight">
                    {agent.role}
                  </h3>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs leading-5">
                    {agent.detail}
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-[11px]">
                    <ShieldCheck
                      aria-hidden="true"
                      className="text-primary mt-0.5 size-3.5 shrink-0"
                    />
                    {agent.boundary}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section
            id={target("process")}
            aria-labelledby={target("process-heading")}
            className="sc-forma-inverse bg-background text-foreground scroll-mt-32 px-5 py-12 sm:px-9"
          >
            <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
              <div>
                <Eyebrow>How we work</Eyebrow>
                <h2
                  id={target("process-heading")}
                  className="mt-2 text-3xl font-medium tracking-[-0.05em] sm:text-4xl"
                >
                  From a spark to a system.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-md text-sm leading-6">
                  A collaborative journey from exploration to impact.
                  <br />
                  With you at every step.
                </p>
                <ol className="mt-10 grid gap-6 sm:grid-cols-3">
                  {[
                    {
                      title: "Discover",
                      icon: Sparkles,
                      text: "Understand the work. Find the friction. Choose the right place to begin.",
                    },
                    {
                      title: "Build",
                      icon: Workflow,
                      text: "Design, prototype and refine a system with the people who will use it.",
                    },
                    {
                      title: "Evolve",
                      icon: ArrowUpRight,
                      text: "Learn from real use. Make thoughtful improvements. Keep moving forward.",
                    },
                  ].map(({ title, icon: Icon, text }, index) => (
                    <li key={title} className="border-primary/25 border-t pt-4">
                      <Icon
                        aria-hidden="true"
                        className="text-primary mb-4 size-6 stroke-1"
                      />
                      <span className="text-muted-foreground text-[10px]">
                        0{index + 1}
                      </span>
                      <h3 className="mt-1 text-lg tracking-tight">{title}</h3>
                      <p className="text-muted-foreground mt-2 text-xs leading-5">
                        {text}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
              <Tabs
                value={engagement}
                onValueChange={(value) =>
                  setEngagement(value as FormaEngagementId)
                }
                motionPreset={motionEnabled ? "subtle" : "none"}
                size="sm"
              >
                <Tabs.List
                  aria-label="Engagement options"
                  className="grid w-full grid-cols-3"
                >
                  {formaEngagements.map((item) => (
                    <Tabs.Trigger key={item.id} value={item.id}>
                      {item.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
                {formaEngagements.map((item) => (
                  <Tabs.Panel key={item.id} value={item.id} className="pt-4">
                    <Card className="bg-muted/60 rounded-xl p-5" shadow="none">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-medium">
                          {item.label} scope
                        </h3>
                        <Badge
                          size="xs"
                          variant="outline"
                          className="text-[9px]"
                        >
                          {item.duration}
                        </Badge>
                      </div>
                      <p className="mt-4 text-xl leading-snug tracking-tight">
                        {item.heading}
                      </p>
                      <p className="text-muted-foreground mt-3 text-xs leading-5">
                        {item.description}
                      </p>
                      <ul className="mt-5 space-y-3">
                        {item.deliverables.map((line) => (
                          <li
                            key={line}
                            className="flex items-center gap-2 text-[11px]"
                          >
                            <Check
                              aria-hidden="true"
                              className="text-primary size-3.5 shrink-0"
                            />
                            {line}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <FormaBrief
                          engagement={item.id}
                          label={`Start with ${item.label.toLowerCase()}`}
                          outline
                        />
                      </div>
                    </Card>
                  </Tabs.Panel>
                ))}
              </Tabs>
            </div>
          </section>

          <section
            id={target("faq")}
            aria-labelledby={target("faq-heading")}
            className="scroll-mt-32 px-5 py-14 sm:px-9"
          >
            <div className="grid gap-8 md:grid-cols-[1.6fr_1fr]">
              <div>
                <Eyebrow>Common questions</Eyebrow>
                <h2
                  id={target("faq-heading")}
                  className="mt-2 mb-6 text-4xl font-medium tracking-[-0.05em]"
                >
                  Good questions.
                  <br />
                  Straight answers.
                </h2>
                <Accordion
                  type="single"
                  collapsible
                  motionPreset={motionEnabled ? "subtle" : "none"}
                >
                  {formaFaq.map(([question, answer], index) => (
                    <Accordion.Item value={`faq-${index}`} key={question}>
                      <Accordion.Blade
                        iconPosition="end"
                        className="text-start text-xs"
                      >
                        <Accordion.BladeText>{question}</Accordion.BladeText>
                        <Accordion.BladeIcon>
                          <Plus aria-hidden="true" className="size-4" />
                        </Accordion.BladeIcon>
                      </Accordion.Blade>
                      <Accordion.Content className="text-muted-foreground text-xs leading-6">
                        {answer}
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </div>
              <Card
                className="bg-primary/5 relative self-end overflow-hidden rounded-xl border-0 p-7"
                shadow="none"
              >
                <Sparkles
                  aria-hidden="true"
                  className="text-primary mb-8 size-8 stroke-1"
                />
                <h3 className="text-2xl leading-tight font-medium tracking-[-0.04em]">
                  Different questions?
                  <br />
                  Same curiosity.
                </h3>
                <p className="text-muted-foreground mt-3 mb-6 text-xs leading-5">
                  Tell us where you want to go.
                  <br />
                  We’ll help you find the starting point.
                </p>
                <div>
                  <FormaBrief
                    engagement={engagement}
                    label="Let’s talk about it"
                    outline
                  />
                </div>
              </Card>
            </div>
          </section>

          <Separator />
          <section
            aria-label="Start a project"
            className="flex flex-wrap items-center justify-between gap-6 px-5 py-12 sm:px-9"
          >
            <div>
              <Eyebrow>Let’s build together</Eyebrow>
              <h2 className="text-primary mt-3 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">
                Make room for what’s next.
              </h2>
              <p className="text-muted-foreground mt-3 text-xs">
                Bring the ambition. We’ll bring the curiosity.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FormaBrief
                engagement={engagement}
                label="Start a conversation"
              />
              <RevealButton
                icon={<ArrowRight />}
                label="Try the agent lab"
                labelVisibility="always"
                motion={motionEnabled ? "subtle" : "none"}
                variant="outline"
                onClick={() =>
                  document
                    .getElementById(target("lab"))
                    ?.scrollIntoView({ behavior: "instant", block: "start" })
                }
              />
            </div>
          </section>
          <footer className="border-border flex flex-wrap items-center justify-between gap-5 border-t px-5 py-6 sm:px-9">
            <div className="flex items-center gap-4">
              <a
                href={href("top")}
                className="text-2xl font-semibold tracking-[-0.08em]"
              >
                forma✳
              </a>
              <span className="text-muted-foreground text-[10px]">
                Intelligent systems. Human ambition.
              </span>
            </div>
            <nav
              aria-label="Forma footer"
              className="flex flex-wrap gap-4 text-[10px]"
            >
              {nav.map(([label, section]) => (
                <a
                  key={section}
                  className="hover:text-primary hover:underline"
                  href={href(section)}
                >
                  {label}
                </a>
              ))}
            </nav>
            <p className="text-muted-foreground text-[9px]">
              Fictional studio · A Dethink recipe
            </p>
          </footer>
        </div>
      </HeroTextAnimationProvider>
    </MotionConfig>
  );
}
