"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Check,
  CircleDashed,
  FolderKanban,
  Layers3,
  LineChart,
  Orbit,
  Play,
  Plus,
  Sparkles,
  Star,
  WandSparkles,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardScroller,
  CardScrollerItem,
  CardStack,
  CardTitle,
  GridBeamsBackground,
  HeroTextAnimation,
  HeroTextAnimationProvider,
  NavDock,
  NavDockButton,
  NavDockItem,
  NavDockLink,
  NavDockList,
  NavDockSeparator,
  RevealButton,
  Separator,
  StarfieldBackground,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

const projects = [
  {
    name: "Aurora",
    type: "Brand evolution",
    progress: "72%",
    progressClassName: "w-[72%]",
    signalClassName: "bg-primary",
    stage: "In focus",
  },
  {
    name: "Nexus",
    type: "Product launch",
    progress: "48%",
    progressClassName: "w-[48%]",
    signalClassName: "bg-info",
    stage: "Composing",
  },
  {
    name: "Echo",
    type: "Campaign rollout",
    progress: "63%",
    progressClassName: "w-[63%]",
    signalClassName: "bg-warning",
    stage: "On deck",
  },
] as const;

const waysOfWorking = [
  {
    value: "strategy",
    eyebrow: "01 / Strategy",
    title: "Find the signal worth following.",
    description:
      "Bring early evidence, loose thinking, and strong opinions into one living brief.",
    icon: Orbit,
    accentClassName: "text-primary",
  },
  {
    value: "systems",
    eyebrow: "02 / Systems",
    title: "Give every idea a place to land.",
    description:
      "Shapes, decisions, and launch moments stay connected as the work changes shape.",
    icon: Blocks,
    accentClassName: "text-info",
  },
  {
    value: "momentum",
    eyebrow: "03 / Momentum",
    title: "Make the next move obvious.",
    description:
      "A clear point of view for the team, with room for handoffs, experiments, and surprise.",
    icon: WandSparkles,
    accentClassName: "text-warning",
  },
  {
    value: "releases",
    eyebrow: "04 / Releases",
    title: "Launch with the whole picture.",
    description:
      "Turn live work into a shared story for the people who need to move it forward.",
    icon: LineChart,
    accentClassName: "text-success",
  },
] as const;

const proofCards = [
  {
    company: "STUDIO OHM",
    quote: "Lumen gives the work a pulse before the brief is finished.",
    result: "2.4× faster brief-to-build",
    tintClassName: "bg-primary/15 text-primary",
  },
  {
    company: "TIDELINE",
    quote: "We stopped managing tabs and started making decisions together.",
    result: "34% fewer review loops",
    tintClassName: "bg-info/15 text-info",
  },
  {
    company: "PARADE",
    quote: "Every launch now has a calm centre of gravity.",
    result: "One shared launch view",
    tintClassName: "bg-warning/15 text-warning",
  },
] as const;

const dockItems = [
  { href: "#lumen-home", icon: Sparkles, label: "Home", value: "home" },
  {
    href: "#lumen-console",
    icon: FolderKanban,
    label: "Projects",
    value: "projects",
  },
  {
    href: "#lumen-signals",
    icon: CircleDashed,
    label: "Signals",
    value: "signals",
  },
  {
    href: "#lumen-proof",
    icon: Star,
    label: "Proof",
    value: "proof",
  },
] as const;

function BrandMark() {
  return (
    <a
      href="#lumen-home"
      className="focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-[0.7rem] shadow-[0_0_2rem_color-mix(in_oklab,var(--dt-color-primary)_34%,transparent)]"
      >
        <Sparkles className="size-4" strokeWidth={2.4} />
      </span>
      <span className="font-heading text-lg font-semibold tracking-[-0.04em]">
        Lumen
      </span>
    </a>
  );
}

function ProjectTile({ project }: { project: (typeof projects)[number] }) {
  return (
    <div className="border-border/80 bg-background/55 rounded-xl border p-3 shadow-[0_1rem_2.5rem_color-mix(in_oklab,var(--dt-color-background)_68%,transparent)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.12em] uppercase">
          <span
            aria-hidden="true"
            className={"size-1.5 rounded-full " + project.signalClassName}
          />
          {project.stage}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="text-muted-foreground size-3.5"
        />
      </div>
      <p className="font-heading mt-8 text-base font-semibold tracking-tight">
        {project.name}
      </p>
      <p className="text-muted-foreground mt-1 text-xs">{project.type}</p>
      <div className="mt-5 flex items-center gap-2">
        <div
          aria-label={project.progress + " complete"}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Number.parseInt(project.progress, 10)}
          className="bg-muted h-1.5 min-w-0 flex-1 overflow-hidden rounded-full"
          role="progressbar"
        >
          <span
            className={
              "bg-primary block h-full rounded-full " +
              project.progressClassName
            }
          />
        </div>
        <span className="text-muted-foreground text-[0.65rem] font-medium tabular-nums">
          {project.progress}
        </span>
      </div>
    </div>
  );
}

function LumenConsole() {
  return (
    <Card
      id="lumen-console"
      aria-label="Lumen creative operations dashboard"
      className="border-border/80 bg-background/75 relative overflow-hidden shadow-[0_2rem_6rem_color-mix(in_oklab,var(--dt-color-background)_70%,transparent)] backdrop-blur-xl"
      shadow="none"
    >
      <div className="border-border/80 bg-background/70 flex items-center justify-between gap-3 border-b px-4 py-3">
        <div aria-hidden="true" className="flex items-center gap-1.5">
          <span className="bg-destructive/70 size-2 rounded-full" />
          <span className="bg-warning/80 size-2 rounded-full" />
          <span className="bg-success/80 size-2 rounded-full" />
        </div>
        <span className="border-border bg-muted/60 text-muted-foreground rounded-full border px-3 py-1 text-[0.65rem] font-medium tracking-[0.08em] uppercase">
          lumen.space / studio
        </span>
        <RevealButton
          icon={<Plus />}
          label="New project"
          labelVisibility="always"
          size="sm"
          variant="soft"
        />
      </div>

      <div className="grid min-h-[33rem] lg:grid-cols-[12rem_minmax(0,1fr)]">
        <aside className="border-border/80 bg-muted/35 hidden border-e p-3 lg:block">
          <p className="text-muted-foreground px-2 pt-2 text-[0.65rem] font-semibold tracking-[0.14em] uppercase">
            Your studio
          </p>
          <nav aria-label="Creative workspace">
            <ul className="mt-3 space-y-1">
              {[
                ["Overview", Sparkles, true],
                ["Projects", FolderKanban, false],
                ["Signals", CircleDashed, false],
                ["Library", Layers3, false],
              ].map(([label, Icon, active]) => {
                const NavigationIcon = Icon as typeof Sparkles;

                return (
                  <li key={label as string}>
                    <a
                      href="#lumen-signals"
                      aria-current={active ? "page" : undefined}
                      className="text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-ring aria-[current=page]:bg-background aria-[current=page]:text-foreground flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium outline-none focus-visible:ring-2"
                    >
                      <NavigationIcon aria-hidden="true" className="size-4" />
                      {label as string}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-border bg-background/60 mt-8 rounded-xl border p-3">
            <span className="text-primary text-[0.65rem] font-semibold tracking-[0.12em] uppercase">
              Today&apos;s signal
            </span>
            <p className="mt-2 text-sm leading-5 font-medium">
              The work is converging around one shared idea.
            </p>
            <div className="mt-4 flex items-end gap-1" aria-hidden="true">
              {[35, 58, 47, 82, 68, 94, 73].map((height) => (
                <span
                  key={height}
                  className="bg-primary/30 last:bg-primary w-full rounded-t-sm"
                  style={{ height: height + "%" }}
                />
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-primary text-[0.65rem] font-semibold tracking-[0.16em] uppercase">
                A clear next move
              </p>
              <h2 className="font-heading mt-2 text-2xl font-semibold tracking-tight">
                Work in motion
              </h2>
            </div>
            <div className="border-border bg-background/70 flex items-center gap-2 rounded-lg border px-3 py-2">
              <span className="bg-primary size-2 rounded-full" />
              <span className="text-muted-foreground text-xs font-medium">
                12 people in focus
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1.45fr)_minmax(12rem,0.8fr)]">
            <div className="sc-lumen-console-aurora border-border/80 overflow-hidden rounded-2xl border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-primary text-[0.65rem] font-semibold tracking-[0.14em] uppercase">
                    The brief is alive
                  </p>
                  <p className="font-heading mt-2 max-w-sm text-xl leading-tight font-semibold tracking-tight">
                    Aurora is becoming the story everyone can see.
                  </p>
                </div>
                <span className="border-primary/30 bg-primary/10 text-primary grid size-10 place-items-center rounded-xl border">
                  <Orbit className="size-5" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-2">
                {["Signal", "Shape", "Shift"].map((label, index) => (
                  <div
                    key={label}
                    className="border-border/80 bg-background/55 rounded-xl border p-3"
                  >
                    <p className="text-muted-foreground text-[0.62rem] font-semibold tracking-[0.1em] uppercase">
                      {label}
                    </p>
                    <p className="font-heading mt-2 text-lg font-semibold">
                      {["18", "06", "03"][index]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-border bg-muted/35 rounded-2xl border p-4">
              <p className="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.13em] uppercase">
                Pulse check
              </p>
              <p className="font-heading mt-4 text-5xl font-semibold tracking-[-0.07em]">
                76<span className="text-primary text-2xl">%</span>
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-5">
                The team sees the route, not just the to-do list.
              </p>
              <div
                className="mt-5 flex items-center gap-1.5"
                aria-hidden="true"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={index}
                    className={
                      "border-background size-7 rounded-full border-2 " +
                      (index < 4 ? "bg-primary/70" : "bg-muted-foreground/30")
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {projects.map((project) => (
              <ProjectTile key={project.name} project={project} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function LumenLandingRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const [activeDockItem, setActiveDockItem] = useState("home");
  const fullPage = presentation === "full-page";

  return (
    <HeroTextAnimationProvider>
      <div
        data-recipe-surface="lumen-landing"
        className={
          "sc-lumen-theme overflow-hidden border " +
          (fullPage
            ? "min-h-[calc(100dvh-7rem)] rounded-none border-x-0 border-t-0"
            : "rounded-xl")
        }
      >
        <section id="lumen-home" aria-labelledby="lumen-hero-heading">
          <GridBeamsBackground
            animate
            density="normal"
            intensity="subtle"
            seed={17}
            speed="slow"
            tone="primary"
            className="sc-lumen-hero-aurora"
          >
            <header className="relative z-20 mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
              <BrandMark />
              <nav
                aria-label="Lumen page navigation"
                className="hidden items-center gap-1 md:flex"
              >
                {[
                  ["Why Lumen", "#lumen-signals"],
                  ["The system", "#lumen-console"],
                  ["Proof", "#lumen-proof"],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    className="text-muted-foreground hover:bg-background/60 hover:text-foreground focus-visible:ring-ring rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2"
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <div className="flex items-center gap-2">
                <RevealButton
                  icon={<Play />}
                  label="Watch the pulse"
                  className="hidden sm:inline-flex"
                  onClick={() => {
                    document.getElementById("lumen-console")?.scrollIntoView();
                  }}
                  size="sm"
                  variant="ghost"
                />
                <RevealButton
                  icon={<Plus />}
                  label="Start a project"
                  labelVisibility="always"
                  onClick={() => {
                    document.getElementById("lumen-console")?.scrollIntoView();
                  }}
                  size="sm"
                  variant="solid"
                />
              </div>
            </header>

            <div className="relative z-10 mx-auto max-w-7xl px-5 pt-12 pb-8 sm:px-8 sm:pt-16 lg:px-10 lg:pt-22">
              <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="max-w-4xl">
                  <p className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                    <span
                      aria-hidden="true"
                      className="bg-primary size-2 rounded-full"
                    />
                    The creative operating system
                  </p>
                  <HeroTextAnimation
                    animation="kinetic-emphasis-pop"
                    ariaLabel="Make your next move a bright one."
                    emphasisWords={["move", "bright"]}
                    id="lumen-hero-heading"
                    text="Make your next move a bright one."
                    className="font-heading [&_[data-emphasis-word-index]]:text-primary mt-5 max-w-4xl text-5xl leading-[0.92] font-semibold tracking-[-0.065em] text-balance sm:text-7xl lg:text-[6.3rem]"
                  />
                  <p className="text-muted-foreground mt-7 max-w-xl text-base leading-7 sm:text-lg">
                    Lumen is where creative teams find the signal, shape the
                    story, and make the work feel inevitable.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                      size="lg"
                      rightIcon={<ArrowRight />}
                      onClick={() => {
                        document
                          .getElementById("lumen-console")
                          ?.scrollIntoView();
                      }}
                    >
                      Start a project
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        document
                          .getElementById("lumen-signals")
                          ?.scrollIntoView();
                      }}
                    >
                      Explore the system
                    </Button>
                  </div>
                </div>

                <div className="border-border/80 bg-background/55 rounded-2xl border p-4 shadow-[0_1.5rem_4rem_color-mix(in_oklab,var(--dt-color-background)_64%,transparent)] backdrop-blur">
                  <p className="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.14em] uppercase">
                    The work feels
                  </p>
                  <ul className="mt-4 space-y-3">
                    {[
                      ["More connected", "Every decision has a visible home."],
                      ["More intentional", "A system that sharpens the brief."],
                      ["More alive", "Momentum is felt across the room."],
                    ].map(([title, body], index) => (
                      <li key={title} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className={
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[0.65rem] font-semibold " +
                            (index === 0
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground")
                          }
                        >
                          0{index + 1}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">
                            {title}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-xs leading-5">
                            {body}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-14">
                <LumenConsole />
              </div>
            </div>
          </GridBeamsBackground>
        </section>

        <div className="sticky bottom-4 z-30 mx-auto -mt-5 flex max-w-7xl justify-center px-4">
          <NavDock
            aria-label="Explore the Lumen landing page"
            collapseMode="auto"
            currentValue={activeDockItem}
            motion="expressive"
            showTitle="always"
            size="sm"
            variant="glass"
          >
            <NavDockList>
              {dockItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavDockItem
                    key={item.value}
                    icon={<Icon aria-hidden="true" />}
                    title={item.label}
                    value={item.value}
                  >
                    <NavDockLink
                      href={item.href}
                      onClick={() => setActiveDockItem(item.value)}
                    />
                  </NavDockItem>
                );
              })}
              <NavDockSeparator />
              <NavDockItem
                icon={<Plus aria-hidden="true" />}
                title="New project"
                value="new"
              >
                <NavDockButton
                  onAction={() => {
                    setActiveDockItem("projects");
                    document.getElementById("lumen-console")?.scrollIntoView();
                  }}
                />
              </NavDockItem>
            </NavDockList>
          </NavDock>
        </div>

        <section
          id="lumen-signals"
          aria-labelledby="lumen-signals-heading"
          className="border-border/70 relative isolate overflow-hidden border-t"
        >
          <StarfieldBackground
            animate
            density="normal"
            intensity="faint"
            interactive
            seed={43}
            speed="slow"
            tone="primary"
            className="sc-lumen-signal-field"
          >
            <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-end">
                <div>
                  <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                    A system for the living brief
                  </p>
                  <h2
                    id="lumen-signals-heading"
                    className="font-heading mt-4 max-w-xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl"
                  >
                    Make the invisible parts of creative work easier to hold.
                  </h2>
                </div>
                <p className="text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg">
                  Not another place to track tasks. A shared field where
                  research, decisions, and delivery stay close enough to create
                  real momentum.
                </p>
              </div>

              <div className="mt-10">
                <CardScroller
                  aria-label="Ways Lumen supports creative work"
                  defaultValue="systems"
                  maxVisibleCards={3}
                  nextLabel="Show more ways of working"
                  previousLabel="Show previous ways of working"
                  showControls
                >
                  {waysOfWorking.map((item) => {
                    const Icon = item.icon;

                    return (
                      <CardScrollerItem
                        key={item.value}
                        label={item.title}
                        value={item.value}
                      >
                        <Card
                          as="article"
                          className="border-border/75 bg-background/70 min-h-72 overflow-hidden backdrop-blur-sm"
                          shadow="none"
                        >
                          <CardHeader>
                            <span className="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.14em] uppercase">
                              {item.eyebrow}
                            </span>
                            <span
                              aria-hidden="true"
                              className={
                                "bg-muted mt-5 grid size-11 place-items-center rounded-2xl " +
                                item.accentClassName
                              }
                            >
                              <Icon className="size-5" />
                            </span>
                            <CardTitle className="mt-5 text-xl leading-tight">
                              {item.title}
                            </CardTitle>
                            <CardDescription className="mt-2 leading-6">
                              {item.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="mt-auto">
                            <div className="border-border/80 flex items-center justify-between border-t pt-4 text-xs font-semibold">
                              <span className={item.accentClassName}>
                                Explore the move
                              </span>
                              <ArrowRight
                                aria-hidden="true"
                                className="size-4"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </CardScrollerItem>
                    );
                  })}
                </CardScroller>
              </div>
            </div>
          </StarfieldBackground>
        </section>

        <section
          id="lumen-proof"
          aria-labelledby="lumen-proof-heading"
          className="bg-muted/25 border-border/70 border-t"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.86fr)] lg:items-center lg:px-10 lg:py-28">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                Let the work speak
              </p>
              <h2
                id="lumen-proof-heading"
                className="font-heading mt-4 max-w-xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl"
              >
                A brighter way forward starts with a shared point of view.
              </h2>
              <p className="text-muted-foreground mt-6 max-w-xl text-base leading-7">
                Lumen turns the messy middle into a visible system of signals,
                decisions, and next moves—so teams can spend more energy on the
                work that changes things.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" rightIcon={<ArrowRight />}>
                  See a project in motion
                </Button>
                <Button size="lg" variant="ghost">
                  Meet the system
                </Button>
              </div>
              <Separator className="my-10 max-w-xl" />
              <div className="grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["18 days", "from signal to brief"],
                  ["6 views", "one connected story"],
                  ["0 tabs", "lost to drift"],
                ].map(([value, label]) => (
                  <div key={value} className="min-w-0">
                    <p className="font-heading text-xl font-semibold tracking-tight">
                      {value}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <span
                aria-hidden="true"
                className="bg-primary/20 absolute inset-x-12 top-12 h-72 rounded-full blur-3xl"
              />
              <CardStack
                aria-label="Stories from teams using Lumen"
                angle={8}
                defaultActiveIndex={0}
                loop
                stackOffset={14}
              >
                {proofCards.map((item, index) => (
                  <Card
                    key={item.company}
                    className="border-border bg-background/92 min-h-72 shadow-[0_1.5rem_4rem_color-mix(in_oklab,var(--dt-color-background)_48%,transparent)] backdrop-blur"
                    shadow="none"
                  >
                    <CardHeader>
                      <span
                        aria-hidden="true"
                        className={
                          "grid size-11 place-items-center rounded-2xl " +
                          item.tintClassName
                        }
                      >
                        <span className="font-heading text-lg font-semibold">
                          0{index + 1}
                        </span>
                      </span>
                      <CardTitle className="mt-6 text-sm tracking-[0.12em] uppercase">
                        {item.company}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <p className="font-heading text-2xl leading-tight font-semibold tracking-tight">
                        “{item.quote}”
                      </p>
                      <p className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                        <Check aria-hidden="true" className="size-4" />
                        {item.result}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </CardStack>
            </div>
          </div>
        </section>

        <footer className="border-border/70 border-t">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <BrandMark />
            <p className="text-muted-foreground max-w-md text-sm leading-6 sm:text-right">
              Creative work is already in motion. Lumen helps it move with
              intention.
            </p>
          </div>
        </footer>
      </div>
    </HeroTextAnimationProvider>
  );
}
