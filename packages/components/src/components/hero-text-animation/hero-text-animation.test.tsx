import { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

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

  it("types visual text once while keeping final text accessible", async () => {
    vi.useFakeTimers();
    const handleComplete = vi.fn();

    render(
      <HeroTextAnimation
        animation="typewriter"
        duration={0.9}
        text="Write short hero copy once."
        onAnimationComplete={handleComplete}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Write short hero copy once.",
    });

    expect(heading).toHaveAttribute("data-animation", "typewriter");
    expect(heading).toHaveAttribute("data-segment-count", "27");
    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-accessible-text"]',
      ),
    ).toHaveTextContent("Write short hero copy once.");

    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"]',
    );
    const typewriterText = heading.querySelector(
      '[data-slot="hero-text-animation-typewriter-text"]',
    );

    expect(motion).toHaveAttribute("aria-hidden", "true");
    expect(motion).toHaveAttribute("data-split-by", "character");
    expect(typewriterText).toHaveTextContent("");
    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-typewriter-caret"]',
      ),
    ).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(typewriterText).toHaveTextContent("Write short hero copy once.");
    expect(motion).toHaveAttribute("data-typewriter-complete", "true");
    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-typewriter-caret"]',
      ),
    ).not.toBeInTheDocument();
    expect(handleComplete).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(typewriterText).toHaveTextContent("Write short hero copy once.");
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it("replays typewriter visual text after repeatDelay when repeat is enabled", async () => {
    vi.useFakeTimers();
    const handleComplete = vi.fn();

    render(
      <HeroTextAnimation
        animation="typewriter"
        duration={0.3}
        repeat
        repeatDelay={0.2}
        text="Replay"
        onAnimationComplete={handleComplete}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Replay",
    });
    const getTypewriterText = () =>
      heading.querySelector(
        '[data-slot="hero-text-animation-typewriter-text"]',
      );

    expect(heading).toHaveAttribute("data-repeat", "true");
    expect(heading).toHaveAttribute("data-repeat-delay", "0.2");
    expect(getTypewriterText()).toHaveTextContent("");

    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    expect(getTypewriterText()).toHaveTextContent("Replay");
    expect(handleComplete).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(getTypewriterText()).toHaveTextContent("Replay");

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    expect(getTypewriterText()).toHaveTextContent("");

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(getTypewriterText()).toHaveTextContent("Replay");
    expect(handleComplete).toHaveBeenCalledTimes(2);
  });

  it("clears a scheduled repeat timeout on unmount", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

    const { unmount } = render(
      <HeroTextAnimation
        animation="typewriter"
        duration={0.3}
        repeat
        repeatDelay={5}
        text="Replay"
      />,
    );

    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("renders typewriter final text immediately in reduced motion without timers", () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");

    render(
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="typewriter"
          repeat
          repeatDelay={0.1}
          text="Reduced motion skips typing timers."
        />
      </HeroTextAnimationProvider>,
    );

    const heading = screen.getByRole("heading", {
      name: "Reduced motion skips typing timers.",
    });
    const typewriterText = heading.querySelector(
      '[data-slot="hero-text-animation-typewriter-text"]',
    );

    expect(heading).toHaveAttribute("data-reduced-motion", "true");
    expect(heading).toHaveAttribute("data-repeat", "true");
    expect(typewriterText).toHaveTextContent(
      "Reduced motion skips typing timers.",
    );
    expect(typewriterText).toHaveAttribute("data-reduced-motion", "true");
    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-typewriter-caret"]',
      ),
    ).not.toBeInTheDocument();
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it("cleans typewriter timers on text changes and unmount", async () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

    const { rerender, unmount } = render(
      <HeroTextAnimation
        animation="typewriter"
        text="First timer-managed hero copy."
      />,
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    rerender(
      <HeroTextAnimation
        animation="typewriter"
        text="Second timer-managed hero copy."
      />,
    );

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(clearTimeoutSpy).toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(
      screen
        .getByRole("heading", {
          name: "Second timer-managed hero copy.",
        })
        .querySelector('[data-slot="hero-text-animation-typewriter-text"]'),
    ).toHaveTextContent("Second timer-managed hero copy.");

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(clearTimeoutSpy).toHaveBeenCalled();
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
