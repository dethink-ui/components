"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  HeroTextAnimation,
  HeroTextAnimationProvider,
  RevealButton,
} from "@dethink/components";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  BrainCircuit,
  ChevronDown,
  CircleGauge,
  Command,
  Eye,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";

const navItems = [
  { href: "#examples", label: "Examples" },
  { href: "#installation", label: "Install" },
  { href: "#props", label: "API" },
];

const resourceItems = [
  {
    icon: TimerReset,
    label: "Bounded reveal",
    description: "The decrypt pass resolves quickly and then settles.",
  },
  {
    icon: Eye,
    label: "Stable wording",
    description: "The final message is present for assistive technology.",
  },
  {
    icon: ShieldCheck,
    label: "Motion aware",
    description: "Reduced-motion users receive the final copy immediately.",
  },
];

const proofPoints = [
  {
    icon: BrainCircuit,
    title: "Signal extraction",
    description: "Surface pipeline insights without hiding the final message.",
  },
  {
    icon: CircleGauge,
    title: "Cadence limits",
    description: "Keep the reveal deliberate instead of visually noisy.",
  },
  {
    icon: LockKeyhole,
    title: "Readable by default",
    description: "Use decorative glyphs while the actual heading stays stable.",
  },
  {
    icon: BadgeCheck,
    title: "Launch ready",
    description: "Pair animated copy with CTAs that remain available.",
  },
];

export function HeroTextAnimationScrambleDecryptHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-scramble-heading"
        className="bg-background text-foreground border-border rounded-md border"
      >
        <div className="mx-auto max-w-5xl px-5 py-5 sm:px-8 lg:px-10">
          <header className="border-border bg-background/95 flex min-h-14 items-center gap-4 rounded-md border px-3 shadow-sm">
            <a
              href="#examples"
              aria-label="Dethink decrypt hero example"
              className="focus-visible:ring-ring focus-visible:ring-offset-background flex min-w-0 shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className="bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-md"
              >
                <Command className="size-4" />
              </span>
              <span className="font-heading hidden text-sm font-semibold sm:inline">
                Dethink Signal
              </span>
            </a>

            <nav
              aria-label="Scramble decrypt recipe navigation"
              className="hidden min-w-0 flex-1 md:block"
            >
              <ul className="flex items-center justify-center gap-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  size="sm"
                  variant="ghost"
                  className="gap-1.5"
                >
                  Resources
                  <ChevronDown aria-hidden="true" className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent placement="bottom end" showArrow>
                  <DropdownMenuSection>
                    <DropdownMenuLabel>Decrypt reveal</DropdownMenuLabel>
                    {resourceItems.map(({ icon: Icon, label, description }) => (
                      <DropdownMenuItem key={label} textValue={label}>
                        <DropdownMenuItemIcon aria-hidden="true">
                          <Icon />
                        </DropdownMenuItemIcon>
                        <DropdownMenuItemLabel>{label}</DropdownMenuItemLabel>
                        <DropdownMenuItemDescription>
                          {description}
                        </DropdownMenuItemDescription>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem textValue="Open launch notes">
                      <DropdownMenuItemIcon aria-hidden="true">
                        <BookOpenText />
                      </DropdownMenuItemIcon>
                      <DropdownMenuItemLabel>
                        Launch notes
                      </DropdownMenuItemLabel>
                    </DropdownMenuItem>
                  </DropdownMenuSection>
                </DropdownMenuContent>
              </DropdownMenu>

              <RevealButton
                className="hidden sm:inline-flex"
                icon={<PlayCircle />}
                label="Preview"
                size="sm"
                variant="outline"
              />
              <RevealButton
                icon={<Sparkles />}
                label="Launch"
                size="sm"
                variant="solid"
              />
            </div>
          </header>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 px-5 pt-6 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:px-10 lg:pt-10 lg:pb-14">
          <div className="min-w-0 space-y-7">
            <div className="border-border bg-muted/50 text-muted-foreground inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <LockKeyhole
                aria-hidden="true"
                className="text-primary size-3.5 shrink-0"
              />
              <span className="truncate">Signal launch workspace</span>
            </div>

            <div className="space-y-5">
              <HeroTextAnimation
                animation="scramble-decrypt"
                duration={1.2}
                id="hero-text-scramble-heading"
                repeat
                repeatDelay={1.6}
                text="Decode the work that moves accounts forward."
                className="font-heading text-foreground max-w-3xl text-4xl leading-[1.03] font-semibold tracking-normal sm:text-5xl lg:text-6xl"
              />
              <p className="text-muted-foreground max-w-xl text-base leading-7 sm:text-lg">
                Bring account signals, product usage, and team context into one
                launch surface so operators can see the next best move without
                chasing dashboards.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" rightIcon={<ArrowRight />}>
                <a href="#installation">Install component</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#props">Review props</a>
              </Button>
            </div>
          </div>

          <ul className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {proofPoints.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="border-border bg-muted/35 flex min-w-0 gap-3 rounded-md border p-4"
              >
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-md"
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="text-muted-foreground mt-1 block text-sm leading-6">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
