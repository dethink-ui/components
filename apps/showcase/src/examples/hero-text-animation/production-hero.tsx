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
  BookOpenText,
  ChevronDown,
  Eye,
  Gauge,
  Layers3,
  LifeBuoy,
  PlayCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "#examples-heading", label: "Examples" },
  { href: "#installation-heading", label: "Install" },
  { href: "#props-heading", label: "API" },
];

const resourceItems = [
  {
    icon: Layers3,
    label: "Animation patterns",
    description: "Choose a safe motion style for each hero message.",
  },
  {
    icon: ShieldCheck,
    label: "Accessibility model",
    description: "Keep one readable heading while fragments animate visually.",
  },
  {
    icon: LifeBuoy,
    label: "Implementation notes",
    description: "Reduced-motion, SSR, and registry guidance in one place.",
  },
];

const heroSignals = [
  {
    icon: Eye,
    title: "Readable first",
    description: "The final headline stays present in server-rendered HTML.",
  },
  {
    icon: ShieldCheck,
    title: "Motion aware",
    description:
      "Reduced-motion visitors get a calm static or opacity-only state.",
  },
  {
    icon: Gauge,
    title: "Fast by default",
    description:
      "Short stagger timing keeps the hero clear without delaying action.",
  },
  {
    icon: BookOpenText,
    title: "Easy to scan",
    description:
      "Icon and text pairs turn hero promises into quick proof points.",
  },
];

export function HeroTextAnimationProductionHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-production-heading"
        className="bg-background text-foreground border-border @container/hero rounded-md border"
      >
        <div className="mx-auto max-w-5xl px-5 py-5 @min-[480px]/hero:px-8 @min-[900px]/hero:px-10">
          <header className="border-border bg-background/95 flex min-h-14 items-center gap-4 rounded-md border px-3 shadow-sm">
            <a
              href="#examples-heading"
              aria-label="Dethink hero animation examples"
              className="focus-visible:ring-ring focus-visible:ring-offset-background flex min-w-0 shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className="bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-md"
              >
                <Sparkles className="size-4" />
              </span>
              <span className="font-heading hidden text-sm font-semibold @min-[480px]/hero:inline">
                Dethink Hero
              </span>
            </a>

            <nav
              aria-label="Hero recipe navigation"
              className="hidden min-w-0 flex-1 @min-[680px]/hero:block"
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
                  <span className="inline-flex items-center gap-1.5">
                    Resources
                    <ChevronDown aria-hidden="true" className="size-3.5" />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent placement="bottom end" showArrow>
                  <DropdownMenuSection>
                    <DropdownMenuLabel>Hero resources</DropdownMenuLabel>
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
                    <DropdownMenuItem textValue="Open production checklist">
                      <DropdownMenuItemIcon aria-hidden="true">
                        <BookOpenText />
                      </DropdownMenuItemIcon>
                      <DropdownMenuItemLabel>
                        Production checklist
                      </DropdownMenuItemLabel>
                    </DropdownMenuItem>
                  </DropdownMenuSection>
                </DropdownMenuContent>
              </DropdownMenu>

              <RevealButton
                className="hidden @min-[480px]/hero:inline-flex"
                icon={<PlayCircle />}
                label="Preview"
                size="sm"
                variant="outline"
              />
              <RevealButton
                icon={<Rocket />}
                label="Start"
                size="sm"
                variant="solid"
              />
            </div>
          </header>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 px-5 pt-6 pb-10 @min-[480px]/hero:px-8 @min-[900px]/hero:grid-cols-[minmax(0,1fr)_22rem] @min-[900px]/hero:items-center @min-[900px]/hero:px-10 @min-[900px]/hero:pt-10 @min-[900px]/hero:pb-14">
          <div className="min-w-0 space-y-7">
            <div className="border-border bg-muted/50 text-muted-foreground inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <Sparkles
                aria-hidden="true"
                className="text-primary size-3.5 shrink-0"
              />
              <span className="truncate">Hero section recipe</span>
            </div>

            <div className="space-y-5">
              {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The component renders its text prop as accessible heading content. */}
              <HeroTextAnimation
                as="h2"
                trigger="in-view"
                reducedMotionStrategy="static"
                id="hero-text-production-heading"
                text="Your next big idea starts here."
                className="font-heading text-foreground max-w-3xl text-[clamp(1.875rem,5.5cqi,3.75rem)] leading-[1.03] font-semibold tracking-normal"
              />
              <p className="text-muted-foreground max-w-xl text-base leading-7 @min-[480px]/hero:text-lg">
                Pair the animated headline with plain-language support copy,
                clear actions, and icon-led proof points so the hero stays
                usable before and after the motion completes.
              </p>
            </div>

            <div className="flex flex-col flex-wrap gap-3 @min-[480px]/hero:flex-row">
              <Button asChild size="lg" rightIcon={<ArrowRight />}>
                <a href="#installation-heading">Install component</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#props-heading">Review props</a>
              </Button>
            </div>
          </div>

          <ul className="grid min-w-0 gap-3 @min-[480px]/hero:grid-cols-2 @min-[900px]/hero:grid-cols-1">
            {heroSignals.map(({ icon: Icon, title, description }) => (
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
