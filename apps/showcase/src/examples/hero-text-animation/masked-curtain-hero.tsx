"use client";

import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import { ArrowUpRight } from "lucide-react";

const navItems = ["Work", "Studio", "Journal", "Contact"];

const disciplines = [
  {
    index: "01",
    title: "Brand systems",
    description: "Identity, voice, and design language built to scale.",
  },
  {
    index: "02",
    title: "Web & product",
    description: "Editorial marketing sites and considered product UI.",
  },
  {
    index: "03",
    title: "Motion & film",
    description: "Title sequences, launch films, and interface motion.",
  },
];

export function HeroTextAnimationMaskedCurtainHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-masked-curtain-heading"
        className="bg-background text-foreground border-border @container/hero overflow-hidden rounded-md border"
      >
        <header className="border-border flex items-center justify-between gap-4 border-b px-5 py-4 @min-[480px]/hero:px-8 @min-[900px]/hero:px-12">
          <a
            href="#examples-heading"
            className="font-heading focus-visible:ring-ring focus-visible:ring-offset-background rounded-sm text-xs font-semibold tracking-[0.28em] uppercase outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Studio Dethink
          </a>
          <nav
            aria-label="Studio navigation"
            className="hidden items-center gap-7 @min-[680px]/hero:flex"
          >
            {navItems.map((item) => (
              <a
                key={item}
                href="#examples-heading"
                className="text-muted-foreground hover:text-foreground text-xs font-medium tracking-[0.14em] uppercase transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <span className="text-muted-foreground hidden text-xs tracking-[0.2em] uppercase @min-[480px]/hero:inline">
            Est. MMXXVI
          </span>
        </header>

        <div className="mx-auto max-w-3xl px-5 py-16 text-center @min-[480px]/hero:px-8 @min-[900px]/hero:py-24">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.24em] uppercase">
            Independent design &amp; motion studio
          </p>
          <span
            aria-hidden="true"
            className="bg-border mx-auto mt-6 block h-px w-10"
          />
          {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The component renders its text prop as accessible heading content. */}
          <HeroTextAnimation
            as="h2"
            trigger="in-view"
            reducedMotionStrategy="static"
            animation="masked-curtain"
            ariaLabel="We design brands that move with intent."
            id="hero-text-masked-curtain-heading"
            text={"We design brands\nthat move with intent."}
            className="font-heading text-foreground mx-auto mt-8 max-w-3xl text-[clamp(1.875rem,5.5cqi,3.75rem)] leading-[1.05] font-semibold tracking-tight text-balance"
          />
          <p className="text-muted-foreground mx-auto mt-7 max-w-xl text-base leading-7 @min-[480px]/hero:text-lg">
            A small studio for founders who care about the details. We shape
            identity, product, and motion into one deliberate, unhurried whole.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 @min-[480px]/hero:flex-row">
            <Button asChild size="lg" variant="outline">
              <a href="#installation-heading">Start a project</a>
            </Button>
            <a
              href="#examples-heading"
              className="text-foreground focus-visible:ring-ring focus-visible:ring-offset-background group inline-flex items-center gap-1.5 rounded-sm text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              View selected work
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>

        <ul className="border-border grid border-t @min-[480px]/hero:grid-cols-3">
          {disciplines.map(({ index, title, description }, position) => (
            <li
              key={title}
              className={`px-5 py-8 @min-[480px]/hero:px-8 @min-[900px]/hero:px-12 ${
                position > 0
                  ? "border-border border-t @min-[480px]/hero:border-t-0 @min-[480px]/hero:border-l"
                  : ""
              }`}
            >
              <span className="text-muted-foreground font-mono text-xs tracking-widest">
                {index}
              </span>
              <p className="font-heading mt-3 text-lg font-semibold">{title}</p>
              <p className="text-muted-foreground mt-1.5 text-sm leading-6">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </HeroTextAnimationProvider>
  );
}
