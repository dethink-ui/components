import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  HeroTextAnimation,
  HeroTextAnimationProvider,
  heroTextAnimationClassNames,
  splitHeroText,
  type HeroTextAnimationProps,
} from ".";

const validProps = {
  animation: "masked-curtain",
  text: "Build production-ready landing pages faster.",
} satisfies HeroTextAnimationProps;

const invalidChildrenProps = {
  // @ts-expect-error HeroTextAnimation owns its readable text through text.
  children: "Build production-ready landing pages faster.",
  text: "Build production-ready landing pages faster.",
} satisfies HeroTextAnimationProps;

void validProps;
void invalidChildrenProps;

describe("HeroTextAnimation", () => {
  it("renders a semantic h1 with a stable accessible label", async () => {
    render(
      <HeroTextAnimation text="Build production-ready landing pages faster." />,
    );

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Build production-ready landing pages faster.",
    });

    expect(heading).toHaveAttribute("data-slot", "hero-text-animation");
    expect(heading).toHaveAttribute("data-testid", "hero-text-animation");
    expect(heading).toHaveAttribute("data-animation", "stagger-words");
    expect(heading).toHaveAttribute("data-trigger", "mount");
    expect(heading).toHaveAttribute("data-once", "true");
    expect(heading).toHaveAttribute("data-reduced-motion", "false");

    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-accessible-text"]',
      ),
    ).toHaveTextContent("Build production-ready landing pages faster.");

    const visual = heading.querySelector(
      '[data-slot="hero-text-animation-visual"]',
    );

    expect(visual).toHaveAttribute("aria-hidden", "true");

    await waitFor(() => {
      expect(
        heading.querySelectorAll(
          '[data-slot="hero-text-animation-segment"][data-segment="word"]',
        ),
      ).toHaveLength(5);
    });
  });

  it("supports h2, paragraph, and span roots", () => {
    const { rerender } = render(
      <HeroTextAnimation as="h2" text="Ship safer hero motion." />,
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Ship safer hero motion.",
      }).tagName,
    ).toBe("H2");

    rerender(
      <HeroTextAnimation
        as="p"
        data-testid="hero-paragraph"
        text="Paragraph hero copy."
      />,
    );

    expect(screen.getByTestId("hero-paragraph").tagName).toBe("P");

    rerender(
      <HeroTextAnimation
        as="span"
        data-testid="hero-span"
        text="Inline hero copy."
      />,
    );

    expect(screen.getByTestId("hero-span").tagName).toBe("SPAN");
  });

  it("uses ariaLabel when visual text needs a broader stable sentence", () => {
    render(
      <HeroTextAnimation
        ariaLabel="Build faster landing pages with production-ready motion."
        text="Build faster landing pages."
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Build faster landing pages with production-ready motion.",
      }),
    ).toBeInTheDocument();
  });

  it("can split and stagger explicit lines", async () => {
    render(
      <HeroTextAnimation
        splitBy="line"
        text={"Build faster.\nLaunch safer."}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: /Build faster\.\s+Launch safer\./,
    });

    expect(heading).toHaveAttribute("data-split-by", "line");
    expect(heading).toHaveAttribute("data-segment-count", "2");

    await waitFor(() => {
      expect(
        heading.querySelectorAll(
          '[data-slot="hero-text-animation-segment"][data-segment="line"]',
        ),
      ).toHaveLength(2);
    });
  });

  it("renders masked curtain lines inside stable masks", async () => {
    render(
      <HeroTextAnimation
        animation="masked-curtain"
        text={"Build faster.\nLaunch safer."}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: /Build faster\.\s+Launch safer\./,
    });

    expect(heading).toHaveAttribute("data-animation", "masked-curtain");
    expect(heading).toHaveAttribute("data-split-by", "line");
    expect(heading).toHaveAttribute("data-segment-count", "2");

    let masks: NodeListOf<Element> | undefined;

    await waitFor(() => {
      masks = heading.querySelectorAll(
        '[data-slot="hero-text-animation-mask"]',
      );
      expect(masks).toHaveLength(2);
    });

    expect(masks?.[0]).toHaveClass("overflow-hidden");

    expect(
      heading.querySelectorAll(
        '[data-slot="hero-text-animation-segment"][data-segment="line"]',
      ),
    ).toHaveLength(2);
    expect(
      heading.querySelector('[data-slot="hero-text-animation-visual"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("uses line masks for masked curtain even when splitBy is omitted", async () => {
    render(
      <HeroTextAnimation
        animation="masked-curtain"
        text="One readable hero sentence."
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "One readable hero sentence.",
    });

    await waitFor(() => {
      expect(
        heading.querySelectorAll('[data-slot="hero-text-animation-mask"]'),
      ).toHaveLength(1);
    });

    expect(heading).toHaveAttribute("data-split-by", "line");
  });

  it("marks reduced-motion rendering and keeps transform motion out of segments", async () => {
    render(
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          reducedMotionStrategy="opacity-only"
          text="Respect motion settings."
        />
      </HeroTextAnimationProvider>,
    );

    const heading = screen.getByRole("heading", {
      name: "Respect motion settings.",
    });

    await waitFor(() =>
      expect(heading).toHaveAttribute("data-reduced-motion", "true"),
    );

    expect(
      heading.querySelector('[data-slot="hero-text-animation-segment"]'),
    ).toHaveAttribute("data-reduced-motion", "true");
  });

  it("keeps masked curtain transform motion out of reduced-motion segments", async () => {
    render(
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="masked-curtain"
          reducedMotionStrategy="opacity-only"
          text={"Respect motion settings.\nReveal safely."}
        />
      </HeroTextAnimationProvider>,
    );

    const heading = screen.getByRole("heading", {
      name: /Respect motion settings\.\s+Reveal safely\./,
    });

    await waitFor(() =>
      expect(heading).toHaveAttribute("data-reduced-motion", "true"),
    );

    expect(
      heading.querySelector('[data-slot="hero-text-animation-segment"]'),
    ).toHaveAttribute("data-reduced-motion", "true");
    expect(
      heading.querySelector('[data-slot="hero-text-animation-mask"]'),
    ).toBeInTheDocument();
  });

  it("supports controlled manual trigger state", () => {
    render(
      <HeroTextAnimation
        active={false}
        text="Controlled hero motion."
        trigger="manual"
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Controlled hero motion.",
    });

    expect(heading).toHaveAttribute("data-trigger", "manual");
    expect(heading).toHaveAttribute("data-active", "false");
  });

  it("exposes reusable split and class helpers", () => {
    expect(splitHeroText("Ship  faster", "word")).toEqual([
      { kind: "text", text: "Ship" },
      { kind: "space", text: "  " },
      { kind: "text", text: "faster" },
    ]);
    expect(splitHeroText("Ship\nfaster", "line")).toEqual([
      { kind: "text", text: "Ship" },
      { kind: "text", text: "faster" },
    ]);
    expect(heroTextAnimationClassNames({ className: "text-4xl" })).toContain(
      "text-4xl",
    );
  });
});
