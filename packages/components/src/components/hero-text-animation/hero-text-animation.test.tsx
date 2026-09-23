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
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("HeroTextAnimation", () => {
  it("reads and subscribes to the browser motion preference", () => {
    let matches = true;
    let notify: (() => void) | undefined;
    const removeEventListener = vi.fn();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        get matches() {
          return matches;
        },
        addEventListener: (_event: string, listener: () => void) => {
          notify = listener;
        },
        removeEventListener,
      })),
    );
    const { unmount } = render(
      <HeroTextAnimation
        text="A readable first impression."
        animation="typewriter"
        reducedMotionStrategy="static"
      />,
    );
    const heading = screen.getByRole("heading");
    expect(heading).toHaveAttribute("data-reduced-motion", "true");
    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-typewriter-text"]',
      ),
    ).toHaveTextContent("A readable first impression.");
    act(() => {
      matches = false;
      notify?.();
    });
    expect(heading).toHaveAttribute("data-reduced-motion", "false");
    act(() => {
      matches = true;
      notify?.();
    });
    expect(heading).toHaveAttribute("data-reduced-motion", "true");
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

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
      // eslint-disable-next-line jsx-a11y/heading-has-content -- The text prop renders an accessible text span inside this polymorphic heading; axe coverage verifies it.
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

    // Typing now fills the requested duration (~50ms/char + 50ms delay ≈ 350ms
    // for 6 characters) instead of snapping to a fixed fast interval.
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(getTypewriterText()).toHaveTextContent("Replay");
    expect(handleComplete).toHaveBeenCalledTimes(1);

    // repeatDelay (200ms) elapses and the visual clears to replay.
    await act(async () => {
      vi.advanceTimersByTime(160);
    });

    expect(getTypewriterText()).toHaveTextContent("");

    await act(async () => {
      vi.advanceTimersByTime(400);
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

  it("decrypts scramble text deterministically to the exact final copy once", async () => {
    vi.useFakeTimers();
    const handleComplete = vi.fn();

    render(
      <HeroTextAnimation
        animation="scramble-decrypt"
        delay={0}
        duration={1.2}
        text="Decrypt launch copy."
        onAnimationComplete={handleComplete}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Decrypt launch copy.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"]',
    );
    const scrambleText = heading.querySelector(
      '[data-slot="hero-text-animation-scramble-text"]',
    );

    expect(heading).toHaveAttribute("data-animation", "scramble-decrypt");
    expect(heading).toHaveAttribute("data-split-by", "character");
    expect(heading).toHaveAttribute("data-segment-count", "20");
    expect(motion).toHaveAttribute("aria-hidden", "true");
    expect(motion).toHaveAttribute("data-scramble-complete", "false");
    // Snappy cadence: a short interval and many frames so the decrypt reads as
    // rapid cipher churn rather than a few sluggish steps.
    expect(
      Number(motion?.getAttribute("data-scramble-interval-ms")),
    ).toBeLessThanOrEqual(60);
    expect(
      Number(motion?.getAttribute("data-scramble-max-updates")),
    ).toBeGreaterThanOrEqual(12);
    expect(scrambleText).not.toHaveTextContent("Decrypt launch copy.");

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(scrambleText).toHaveTextContent("Decrypt launch copy.");
    expect(motion).toHaveAttribute("data-scramble-complete", "true");
    expect(handleComplete).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(scrambleText).toHaveTextContent("Decrypt launch copy.");
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it("uses deterministic scramble placeholder frames for the same text", () => {
    vi.useFakeTimers();

    const { unmount } = render(
      <HeroTextAnimation
        animation="scramble-decrypt"
        delay={0}
        duration={1.2}
        text="Stable decrypt."
      />,
    );
    const firstFrame = screen
      .getByRole("heading", { name: "Stable decrypt." })
      .querySelector(
        '[data-slot="hero-text-animation-scramble-text"]',
      )?.textContent;

    unmount();

    render(
      <HeroTextAnimation
        animation="scramble-decrypt"
        delay={0}
        duration={1.2}
        text="Stable decrypt."
      />,
    );
    const secondFrame = screen
      .getByRole("heading", { name: "Stable decrypt." })
      .querySelector(
        '[data-slot="hero-text-animation-scramble-text"]',
      )?.textContent;

    expect(firstFrame).toBe(secondFrame);
    expect(firstFrame).not.toBe("Stable decrypt.");
  });

  it("replays scramble text through the shared repeat mechanism", async () => {
    vi.useFakeTimers();
    const handleComplete = vi.fn();

    render(
      <HeroTextAnimation
        animation="scramble-decrypt"
        delay={0}
        duration={0.7}
        repeat
        repeatDelay={0.2}
        text="Replay"
        onAnimationComplete={handleComplete}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Replay",
    });
    const getScrambleText = () =>
      heading.querySelector('[data-slot="hero-text-animation-scramble-text"]');

    expect(heading).toHaveAttribute("data-repeat", "true");
    expect(getScrambleText()).not.toHaveTextContent("Replay");

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(getScrambleText()).toHaveTextContent("Replay");
    expect(handleComplete).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(getScrambleText()).not.toHaveTextContent("Replay");

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(getScrambleText()).toHaveTextContent("Replay");
    expect(handleComplete).toHaveBeenCalledTimes(2);
  });

  it("renders scramble final text immediately in reduced motion without timers", () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");

    render(
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="scramble-decrypt"
          repeat
          repeatDelay={0.1}
          text="Reduced motion skips scramble timers."
        />
      </HeroTextAnimationProvider>,
    );

    const heading = screen.getByRole("heading", {
      name: "Reduced motion skips scramble timers.",
    });
    const scrambleText = heading.querySelector(
      '[data-slot="hero-text-animation-scramble-text"]',
    );

    expect(heading).toHaveAttribute("data-reduced-motion", "true");
    expect(heading).toHaveAttribute("data-repeat", "true");
    expect(scrambleText).toHaveTextContent(
      "Reduced motion skips scramble timers.",
    );
    expect(scrambleText).toHaveAttribute("data-reduced-motion", "true");
    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it("renders a rotating keyword slot with one stable accessible sentence", () => {
    render(
      <HeroTextAnimation
        animation="rotating-keyword"
        rotatingKeywordOptions={["finance", "customer success", "sales"]}
        rotatingKeywordPrefix="Build dashboards for "
        rotatingKeywordSuffix=" teams."
        text="Build dashboards for every revenue team."
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Build dashboards for every revenue team.",
    });
    const visual = heading.querySelector(
      '[data-slot="hero-text-animation-visual"]',
    );
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"]',
    );
    const keyword = heading.querySelector(
      '[data-slot="hero-text-animation-rotating-keyword"]',
    );
    const sizer = heading.querySelector(
      '[data-slot="hero-text-animation-rotating-sizer"]',
    );

    expect(heading).toHaveAttribute("data-animation", "rotating-keyword");
    expect(heading).toHaveAttribute("data-split-by", "keyword");
    expect(heading).toHaveAttribute("data-segment-count", "3");
    expect(heading).toHaveAttribute("data-rotating-keyword-count", "3");
    expect(heading).toHaveAttribute("data-rotating-keyword-index", "0");
    expect(visual).toHaveAttribute("aria-hidden", "true");
    expect(motion).toHaveAttribute("data-auto-rotate-keywords", "false");
    expect(keyword).toHaveTextContent("finance");
    expect(sizer).toHaveTextContent("customer success");
    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-accessible-text"]',
      ),
    ).toHaveTextContent("Build dashboards for every revenue team.");
  });

  it("supports controlled rotating keyword index updates", () => {
    const { rerender } = render(
      <HeroTextAnimation
        animation="rotating-keyword"
        rotatingKeywordIndex={0}
        rotatingKeywordOptions={["finance", "support", "sales"]}
        rotatingKeywordPrefix="Build for "
        text="Build dashboards for every team."
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Build dashboards for every team.",
    });
    const getKeyword = () =>
      Array.from(
        heading.querySelectorAll(
          '[data-slot="hero-text-animation-rotating-keyword"]',
        ),
      );

    expect(getKeyword().at(-1)).toHaveTextContent("finance");

    rerender(
      <HeroTextAnimation
        animation="rotating-keyword"
        rotatingKeywordIndex={2}
        rotatingKeywordOptions={["finance", "support", "sales"]}
        rotatingKeywordPrefix="Build for "
        text="Build dashboards for every team."
      />,
    );

    expect(heading).toHaveAttribute("data-rotating-keyword-index", "2");
    expect(getKeyword().at(-1)).toHaveTextContent("sales");

    rerender(
      <HeroTextAnimation
        animation="rotating-keyword"
        rotatingKeywordIndex={1}
        rotatingKeywordOptions={["finance", "support", "sales"]}
        rotatingKeywordPrefix="Build for "
        text="Build dashboards for every team."
      />,
    );

    expect(heading).toHaveAttribute("data-rotating-keyword-index", "1");
    expect(getKeyword().at(-1)).toHaveTextContent("support");
  });

  it("does not start rotating keyword timers unless auto rotation is enabled", () => {
    vi.useFakeTimers();
    const setIntervalSpy = vi.spyOn(window, "setInterval");

    render(
      <HeroTextAnimation
        animation="rotating-keyword"
        rotatingKeywordOptions={["finance", "support"]}
        rotatingKeywordPrefix="Build for "
        text="Build dashboards for every team."
      />,
    );

    expect(setIntervalSpy).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(
      screen
        .getByRole("heading", {
          name: "Build dashboards for every team.",
        })
        .querySelector('[data-slot="hero-text-animation-rotating-keyword"]'),
    ).toHaveTextContent("finance");
  });

  it("auto-rotates keywords with bounded timers and stops within five seconds", async () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const handleChange = vi.fn();
    const handleComplete = vi.fn();

    render(
      <HeroTextAnimation
        animation="rotating-keyword"
        autoRotateKeywords
        rotatingKeywordInterval={1}
        rotatingKeywordOptions={["finance", "support", "sales"]}
        rotatingKeywordPrefix="Build for "
        text="Build dashboards for every team."
        onAnimationComplete={handleComplete}
        onRotatingKeywordIndexChange={handleChange}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Build dashboards for every team.",
    });
    const getKeyword = () =>
      Array.from(
        heading.querySelectorAll(
          '[data-slot="hero-text-animation-rotating-keyword"]',
        ),
      );

    expect(getKeyword().at(-1)).toHaveTextContent("finance");
    expect(heading).toHaveAttribute("data-rotating-keyword-index", "0");
    expect(
      heading.querySelector('[data-slot="hero-text-animation-motion"]'),
    ).toHaveAttribute("data-rotating-keyword-max-duration-ms", "5000");

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(handleChange).toHaveBeenLastCalledWith(1);
    expect(getKeyword().at(-1)).toHaveTextContent("support");

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(handleComplete).toHaveBeenCalledTimes(1);
    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledTimes(4);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(handleChange).toHaveBeenCalledTimes(4);
  });

  it("renders rotating keyword fallback immediately in reduced motion without timers", () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");

    render(
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="rotating-keyword"
          autoRotateKeywords
          rotatingKeywordIndex={1}
          rotatingKeywordOptions={["finance", "support", "sales"]}
          rotatingKeywordPrefix="Build for "
          text="Build dashboards for every team."
        />
      </HeroTextAnimationProvider>,
    );

    const heading = screen.getByRole("heading", {
      name: "Build dashboards for every team.",
    });
    const keyword = heading.querySelector(
      '[data-slot="hero-text-animation-rotating-keyword"]',
    );

    expect(heading).toHaveAttribute("data-reduced-motion", "true");
    expect(heading).toHaveAttribute("data-rotating-keyword-index", "1");
    expect(keyword).toHaveTextContent("support");
    expect(keyword).toHaveAttribute("data-reduced-motion", "true");
    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it("renders a tokenized gradient highlight phrase with stable accessible text", () => {
    render(
      <HeroTextAnimation
        animation="gradient-highlight"
        text="Highlight the conversion-critical phrase."
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Highlight the conversion-critical phrase.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-highlight="gradient-highlight"]',
    ) as HTMLElement | null;

    expect(heading).toHaveAttribute("data-animation", "gradient-highlight");
    expect(heading).toHaveAttribute("data-split-by", "phrase");
    expect(heading).toHaveAttribute("data-segment-count", "1");
    expect(heading).toHaveAttribute("data-repeat", "false");
    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-accessible-text"]',
      ),
    ).toHaveTextContent("Highlight the conversion-critical phrase.");
    expect(motion).toHaveAttribute("aria-hidden", "true");
    expect(motion).toHaveClass(
      "text-transparent",
      "bg-clip-text",
      "bg-no-repeat",
    );
    expect(motion?.getAttribute("style")).toContain(
      "--hero-text-animation-highlight-base: var(--dt-color-foreground)",
    );
    expect(motion?.getAttribute("style")).toContain(
      "--hero-text-animation-highlight-sheen: color-mix(in oklab, var(--dt-color-primary) 55%, var(--dt-color-background) 45%)",
    );
    expect(motion?.getAttribute("style")).not.toMatch(/#[0-9a-f]{3,8}|rgb/i);
  });

  it("keeps gradient highlight static in reduced motion without timers", () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");

    render(
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="gradient-highlight"
          repeat
          repeatDelay={0.1}
          text="Reduced motion keeps the highlighted phrase settled."
        />
      </HeroTextAnimationProvider>,
    );

    const heading = screen.getByRole("heading", {
      name: "Reduced motion keeps the highlighted phrase settled.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-highlight="gradient-highlight"]',
    );

    expect(heading).toHaveAttribute("data-reduced-motion", "true");
    expect(heading).toHaveAttribute("data-repeat", "true");
    expect(motion).toHaveTextContent(
      "Reduced motion keeps the highlighted phrase settled.",
    );
    expect(motion).toHaveAttribute("data-reduced-motion", "true");
    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it("renders svg stroke draw by tracing the heading letterforms", () => {
    render(
      <HeroTextAnimation
        animation="svg-stroke-draw"
        text="Draw attention without replacing the headline."
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Draw attention without replacing the headline.",
    });
    const visual = heading.querySelector(
      '[data-slot="hero-text-animation-visual"]',
    );
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-svg-stroke-draw="true"]',
    );
    const svg = heading.querySelector('[data-slot="hero-text-animation-svg"]');
    const outline = heading.querySelector(
      '[data-slot="hero-text-animation-svg-line"]',
    );
    const fill = heading.querySelector(
      '[data-slot="hero-text-animation-svg-fill"]',
    );

    expect(heading).toHaveAttribute("data-animation", "svg-stroke-draw");
    expect(heading).toHaveAttribute("data-split-by", "line");
    expect(heading).toHaveAttribute("data-segment-count", "1");
    expect(visual).toHaveAttribute("aria-hidden", "true");
    expect(motion).toHaveAttribute("data-svg-stroke-draw-mode", "letter-trace");
    expect(motion).toHaveAttribute("data-svg-line-count", "1");
    expect(motion).toHaveTextContent(
      "Draw attention without replacing the headline.",
    );
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");
    expect(outline).toHaveTextContent(
      "Draw attention without replacing the headline.",
    );
    expect(outline).toHaveAttribute(
      "stroke",
      "var(--hero-text-animation-svg-stroke)",
    );
    expect(outline).toHaveAttribute("fill", "none");
    expect(fill).toHaveAttribute("fill", "currentColor");
    expect(motion?.getAttribute("style")).toContain(
      "--hero-text-animation-svg-stroke: color-mix(in oklab, var(--dt-color-foreground) 82%, var(--dt-color-primary) 18%)",
    );
    expect(motion?.getAttribute("style")).not.toMatch(/#[0-9a-f]{3,8}|rgb/i);
    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-accessible-text"]',
      ),
    ).toHaveTextContent("Draw attention without replacing the headline.");
  });

  it("traces one line per hard break in the heading text", () => {
    render(
      <HeroTextAnimation
        animation="svg-stroke-draw"
        text={"Make it\nunforgettable."}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: /Make it\s+unforgettable\./,
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-svg-stroke-draw="true"]',
    );
    const lines = heading.querySelectorAll(
      '[data-slot="hero-text-animation-svg-line"]',
    );

    expect(heading).toHaveAttribute("data-segment-count", "2");
    expect(motion).toHaveAttribute("data-svg-line-count", "2");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveTextContent("Make it");
    expect(lines[1]).toHaveTextContent("unforgettable.");
  });

  it("frames the trace automatically when the view box override is invalid", () => {
    render(
      <HeroTextAnimation
        animation="svg-stroke-draw"
        svgViewBox="0 0 0 96"
        text="Invalid view box still leaves readable text."
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Invalid view box still leaves readable text.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-svg-stroke-draw="true"]',
    );

    expect(motion).toHaveTextContent(
      "Invalid view box still leaves readable text.",
    );
    expect(motion).toHaveAttribute("data-svg-line-count", "1");
    expect(motion).toHaveAttribute("data-svg-view-box-valid", "false");
    expect(
      heading.querySelector('[data-slot="hero-text-animation-svg-line"]'),
    ).toBeInTheDocument();
  });

  it("can expose the trace as an image when an accessible title is set", () => {
    render(
      <HeroTextAnimation
        animation="svg-stroke-draw"
        data-testid="svg-stroke-heading"
        svgAccessibleTitle="The headline, hand drawn"
        text="Expose the SVG only when configured."
      />,
    );

    const heading = screen.getByTestId("svg-stroke-heading");
    const visual = heading.querySelector(
      '[data-slot="hero-text-animation-visual"]',
    );
    const svg = heading.querySelector('[data-slot="hero-text-animation-svg"]');
    const line = heading.querySelector(
      '[data-slot="hero-text-animation-svg-line"]',
    );

    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-accessible-text"]',
      ),
    ).toHaveTextContent("Expose the SVG only when configured.");
    expect(visual).not.toHaveAttribute("aria-hidden");
    expect(svg).toHaveAttribute("aria-label", "The headline, hand drawn");
    expect(svg).toHaveAttribute("role", "img");
    expect(line).toHaveAttribute("aria-hidden", "true");
  });

  it("renders svg stroke draw final filled state in reduced motion without timers", () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");

    render(
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="svg-stroke-draw"
          reducedMotionStrategy="opacity-only"
          repeat
          repeatDelay={0.1}
          text="Reduced motion keeps the stroke draw settled."
        />
      </HeroTextAnimationProvider>,
    );

    const heading = screen.getByRole("heading", {
      name: "Reduced motion keeps the stroke draw settled.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-svg-stroke-draw="true"]',
    );
    const line = heading.querySelector(
      '[data-slot="hero-text-animation-svg-line"]',
    );

    expect(heading).toHaveAttribute("data-reduced-motion", "true");
    expect(heading).toHaveAttribute("data-repeat", "true");
    expect(motion).toHaveAttribute("data-reduced-motion", "true");
    expect(motion).toHaveTextContent(
      "Reduced motion keeps the stroke draw settled.",
    );
    expect(line).toHaveAttribute("data-reduced-motion", "true");
    expect(line).toHaveAttribute("fill", "currentColor");
    expect(line).toHaveAttribute("fill-opacity", "1");
    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it("renders blur focus as a short phrase reveal with a crisp final target", () => {
    const handleComplete = vi.fn();

    render(
      <HeroTextAnimation
        animation="blur-focus"
        duration={0.42}
        text="Bring the launch promise into focus."
        onAnimationComplete={handleComplete}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Bring the launch promise into focus.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-focus-reveal="blur-focus"]',
    );

    expect(heading).toHaveAttribute("data-animation", "blur-focus");
    expect(heading).toHaveAttribute("data-split-by", "phrase");
    expect(heading).toHaveAttribute("data-segment-count", "1");
    expect(motion).toHaveAttribute("aria-hidden", "true");
    expect(motion).toHaveAttribute("data-blur-initial", "0.2em");
    expect(motion).toHaveAttribute("data-blur-final", "0em");
    expect(motion).toHaveTextContent("Bring the launch promise into focus.");
    expect(motion).toHaveClass("will-change-[filter,opacity,transform]");
    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-accessible-text"]',
      ),
    ).toHaveTextContent("Bring the launch promise into focus.");
  });

  it("splits blur focus into staggered words when splitBy is word", () => {
    render(
      <HeroTextAnimation
        animation="blur-focus"
        splitBy="word"
        text="Focus each word in turn."
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Focus each word in turn.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-focus-reveal="blur-focus"]',
    );

    expect(heading).toHaveAttribute("data-animation", "blur-focus");
    expect(heading).toHaveAttribute("data-split-by", "word");
    expect(heading).toHaveAttribute("data-segment-count", "5");
    expect(motion).toHaveAttribute("data-split-by", "word");
    expect(motion).toHaveAttribute("data-blur-initial", "0.2em");
    expect(
      motion?.querySelectorAll(
        '[data-slot="hero-text-animation-segment"][data-segment="word"]',
      ),
    ).toHaveLength(5);
    expect(motion).toHaveTextContent("Focus each word in turn.");
  });

  it("removes blur and vertical transform from blur focus in reduced motion", () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");

    render(
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="blur-focus"
          repeat
          repeatDelay={0.1}
          text="Reduced motion keeps the focused heading readable."
        />
      </HeroTextAnimationProvider>,
    );

    const heading = screen.getByRole("heading", {
      name: "Reduced motion keeps the focused heading readable.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-focus-reveal="blur-focus"]',
    );

    expect(heading).toHaveAttribute("data-reduced-motion", "true");
    expect(heading).toHaveAttribute("data-repeat", "true");
    expect(motion).toHaveAttribute("data-reduced-motion", "true");
    expect(motion).toHaveAttribute("data-blur-initial", "0em");
    expect(motion).toHaveAttribute("data-blur-final", "0em");
    expect(motion).toHaveTextContent(
      "Reduced motion keeps the focused heading readable.",
    );
    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it("renders kinetic emphasis pop with configured static emphasis words", () => {
    const handleComplete = vi.fn();

    render(
      <HeroTextAnimation
        animation="kinetic-emphasis-pop"
        duration={0.42}
        emphasisWords={["revenue", "handoffs"]}
        text="Make revenue handoffs impossible to miss."
        onAnimationComplete={handleComplete}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Make revenue handoffs impossible to miss.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-kinetic-emphasis="pop"]',
    );
    const emphasizedWords = heading.querySelectorAll(
      '[data-slot="hero-text-animation-segment"][data-emphasized="true"]',
    );

    expect(heading).toHaveAttribute("data-animation", "kinetic-emphasis-pop");
    expect(heading).toHaveAttribute("data-split-by", "word");
    expect(heading).toHaveAttribute("data-emphasis-count", "2");
    expect(motion).toHaveAttribute("aria-hidden", "true");
    expect(motion).toHaveAttribute("data-emphasis-count", "2");
    expect(emphasizedWords).toHaveLength(2);
    expect(emphasizedWords[0]).toHaveTextContent("revenue");
    expect(emphasizedWords[0]).toHaveAttribute("data-emphasis-word-index", "1");
    expect(emphasizedWords[0]).toHaveAttribute("data-emphasis-scale", "1.08");
    expect(emphasizedWords[0]).toHaveClass(
      "data-[emphasized=true]:text-primary",
      "data-[emphasized=true]:underline",
    );
    expect(emphasizedWords[1]).toHaveTextContent("handoffs");
    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-accessible-text"]',
      ),
    ).toHaveTextContent("Make revenue handoffs impossible to miss.");
  });

  it("uses zero-based emphasis word indices before matching emphasis words", () => {
    render(
      <HeroTextAnimation
        animation="kinetic-emphasis-pop"
        emphasisWordIndices={[5]}
        emphasisWords={["ship"]}
        text="Ship cleaner launch reviews with less risk."
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Ship cleaner launch reviews with less risk.",
    });
    const emphasizedWords = heading.querySelectorAll(
      '[data-slot="hero-text-animation-segment"][data-emphasized="true"]',
    );

    expect(emphasizedWords).toHaveLength(2);
    expect(emphasizedWords[0]).toHaveTextContent("Ship");
    expect(emphasizedWords[0]).toHaveAttribute("data-emphasis-word-index", "0");
    expect(emphasizedWords[0]).toHaveAttribute("data-emphasis-order", "1");
    expect(emphasizedWords[1]).toHaveTextContent("less");
    expect(emphasizedWords[1]).toHaveAttribute("data-emphasis-word-index", "5");
    expect(emphasizedWords[1]).toHaveAttribute("data-emphasis-order", "0");
  });

  it("removes kinetic emphasis scale animation in reduced motion but keeps static emphasis", () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");

    render(
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="kinetic-emphasis-pop"
          emphasisWords={["quality", "speed"]}
          repeat
          repeatDelay={0.1}
          text="Balance quality with speed."
        />
      </HeroTextAnimationProvider>,
    );

    const heading = screen.getByRole("heading", {
      name: "Balance quality with speed.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-kinetic-emphasis="pop"]',
    );
    const emphasizedWords = heading.querySelectorAll(
      '[data-slot="hero-text-animation-segment"][data-emphasized="true"]',
    );

    expect(heading).toHaveAttribute("data-reduced-motion", "true");
    expect(heading).toHaveAttribute("data-repeat", "true");
    expect(motion).toHaveAttribute("data-reduced-motion", "true");
    expect(emphasizedWords).toHaveLength(2);
    expect(emphasizedWords[0]).toHaveTextContent("quality");
    expect(emphasizedWords[0]).toHaveAttribute("data-reduced-motion", "true");
    expect(emphasizedWords[0]).not.toHaveAttribute("data-emphasis-scale");
    expect(emphasizedWords[0]).toHaveClass(
      "data-[emphasized=true]:text-primary",
      "data-[emphasized=true]:underline",
    );
    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it("renders scroll-responsive text as readable copy with bounded scroll metadata", () => {
    render(
      <HeroTextAnimation
        animation="scroll-responsive"
        text="Let the hero respond subtly to the first scroll."
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Let the hero respond subtly to the first scroll.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-scroll-responsive="subtle"]',
    );

    expect(heading).toHaveAttribute("data-animation", "scroll-responsive");
    expect(heading).toHaveAttribute("data-split-by", "phrase");
    expect(heading).toHaveAttribute("data-segment-count", "1");
    expect(motion).toHaveAttribute("aria-hidden", "true");
    expect(motion).toHaveAttribute("data-scroll-anchor", "start 70%");
    expect(
      Number(motion?.getAttribute("data-scroll-range-px")),
    ).toBeGreaterThanOrEqual(220);
    expect(motion).toHaveAttribute("data-scroll-y-min", "-32");
    expect(motion).toHaveAttribute("data-scroll-y-max", "0");
    expect(motion).toHaveAttribute("data-scroll-opacity-min", "0.92");
    expect(motion).toHaveTextContent(
      "Let the hero respond subtly to the first scroll.",
    );
    expect(
      heading.querySelector(
        '[data-slot="hero-text-animation-accessible-text"]',
      ),
    ).toHaveTextContent("Let the hero respond subtly to the first scroll.");
  });

  it("updates scroll-responsive transforms within a subtle bounded range", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      return window.setTimeout(() => callback(0), 0);
    });
    vi.stubGlobal("cancelAnimationFrame", (frameId: number) => {
      window.clearTimeout(frameId);
    });

    render(
      <HeroTextAnimation
        animation="scroll-responsive"
        text="Scroll-linked copy stays available."
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Scroll-linked copy stays available.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-scroll-responsive="subtle"]',
    ) as HTMLElement;

    // Progress begins at 70% of the viewport and uses the stable heading box.
    vi.stubGlobal("innerHeight", 1000);
    const scrollHeroTo = (top: number) => {
      vi.stubGlobal("scrollY", 700 - top);
      heading.getBoundingClientRect = () =>
        ({
          top,
          height: 200,
          bottom: top + 200,
          left: 0,
          right: 0,
          width: 0,
          x: 0,
          y: top,
          toJSON: () => ({}),
        }) as DOMRect;
      window.dispatchEvent(new Event("scroll"));
    };

    expect(motion).toHaveAttribute("data-scroll-progress", "0.000");

    // Half of a 550px visible scroll range.
    scrollHeroTo(425);

    await waitFor(() => {
      expect(motion).toHaveAttribute("data-scroll-progress", "0.500");
    });

    expect(motion).toHaveAttribute("data-scroll-y", "-16.000");
    expect(motion).toHaveAttribute("data-scroll-opacity", "0.960");

    // Scrolled well past the hero => progress clamps to 1 => full subtle effect.
    scrollHeroTo(-500);

    await waitFor(() => {
      expect(motion).toHaveAttribute("data-scroll-progress", "1.000");
    });

    expect(motion).toHaveAttribute("data-scroll-y", "-32.000");
    expect(motion).toHaveAttribute("data-scroll-opacity", "0.920");
  });

  it("disables scroll-responsive listeners and transforms in reduced motion", async () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const requestAnimationFrame = vi.fn();
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame);

    render(
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="scroll-responsive"
          repeat
          text="Reduced motion keeps scroll-responsive text still."
        />
      </HeroTextAnimationProvider>,
    );

    const heading = screen.getByRole("heading", {
      name: "Reduced motion keeps scroll-responsive text still.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-scroll-responsive="subtle"]',
    );

    await waitFor(() => {
      expect(motion).toHaveAttribute("data-reduced-motion", "true");
    });

    expect(motion).toHaveAttribute("data-scroll-progress", "0.000");
    expect(motion).toHaveAttribute("data-scroll-y", "0.000");
    expect(motion).toHaveAttribute("data-scroll-opacity", "1.000");
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      expect.anything(),
    );
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
