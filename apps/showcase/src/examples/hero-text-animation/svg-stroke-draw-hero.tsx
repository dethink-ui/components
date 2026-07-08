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
  ChevronDown,
  DraftingCompass,
  Eye,
  Gauge,
  Layers3,
  PenLine,
  PlayCircle,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "#examples", label: "Examples" },
  { href: "#installation", label: "Install" },
  { href: "#props", label: "API" },
];

const svgResources = [
  {
    icon: PenLine,
    label: "Decorative path",
    description: "Draws a tokenized SVG shape without replacing the headline.",
  },
  {
    icon: ShieldCheck,
    label: "Reduced motion",
    description: "Skips the draw and renders the final filled state.",
  },
  {
    icon: DraftingCompass,
    label: "Path contract",
    description: "Custom path data must fit the configured viewBox.",
  },
];

const proofPoints = [
  {
    icon: Eye,
    title: "Real headline",
    description: "The visible sentence stays HTML text, not SVG lettering.",
  },
  {
    icon: Gauge,
    title: "Replayable preview",
    description: "Repeat timing works for demos without refreshing the page.",
  },
  {
    icon: Layers3,
    title: "Tokenized color",
    description: "Stroke and fill resolve from foreground and primary tokens.",
  },
  {
    icon: BookOpenText,
    title: "Documented SVG",
    description: "Path and viewBox expectations are listed in the API table.",
  },
];

export function HeroTextAnimationSvgStrokeDrawHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-svg-stroke-draw-heading"
        className="bg-background text-foreground border-border rounded-md border"
      >
        <div className="mx-auto max-w-5xl px-5 py-5 sm:px-8 lg:px-10">
          <header className="border-border bg-background/95 flex min-h-14 items-center gap-4 rounded-md border px-3 shadow-sm">
            <a
              href="#examples"
              aria-label="Dethink SVG stroke draw hero example"
              className="focus-visible:ring-ring focus-visible:ring-offset-background flex min-w-0 shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className="bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-md"
              >
                <Route className="size-4" />
              </span>
              <span className="font-heading hidden text-sm font-semibold sm:inline">
                Dethink Path
              </span>
            </a>

            <nav
              aria-label="SVG stroke draw recipe navigation"
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
                    <DropdownMenuLabel>SVG path draw</DropdownMenuLabel>
                    {svgResources.map(({ icon: Icon, label, description }) => (
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
                    <DropdownMenuItem textValue="Open SVG checklist">
                      <DropdownMenuItemIcon aria-hidden="true">
                        <BookOpenText />
                      </DropdownMenuItemIcon>
                      <DropdownMenuItemLabel>
                        SVG checklist
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
              <PenLine
                aria-hidden="true"
                className="text-primary size-3.5 shrink-0"
              />
              <span className="truncate">SVG stroke draw hero recipe</span>
            </div>

            <div className="space-y-5">
              <HeroTextAnimation
                animation="svg-stroke-draw"
                duration={1.15}
                id="hero-text-svg-stroke-draw-heading"
                repeat
                repeatDelay={1.5}
                text="Draw a clear path from first visit to first action."
                className="font-heading text-foreground max-w-3xl text-4xl leading-[1.03] font-semibold tracking-normal sm:text-5xl lg:text-6xl"
              />
              <p className="text-muted-foreground max-w-xl text-base leading-7 sm:text-lg">
                Use the stroke draw when the words already carry the message and
                the SVG should only guide attention. The same final sentence is
                available before hydration, after replay, and in reduced motion.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" rightIcon={<ArrowRight />}>
                <a href="#installation">Install component</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#props">Review SVG props</a>
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

        <div className="border-border mx-auto grid max-w-5xl gap-3 border-t px-5 py-5 sm:grid-cols-3 sm:px-8 lg:px-10">
          {[
            "Decorative SVG by default",
            "Final fill in reduced motion",
            "Real text remains visible",
          ].map((label) => (
            <div
              key={label}
              className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm"
            >
              <BadgeCheck
                aria-hidden="true"
                className="text-primary size-4 shrink-0"
              />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
