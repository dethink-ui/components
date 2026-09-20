import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroTextAnimation } from ".";

describe("HeroTextAnimation SSR", () => {
  let root: ReturnType<typeof hydrateRoot> | undefined;

  afterEach(async () => {
    // These roots bypass Testing Library, so explicitly stop their animation
    // effects before Vitest tears down the browser environment.
    await act(async () => {
      root?.unmount();
    });
    root = undefined;
    vi.restoreAllMocks();
  });

  it("renders final readable text on the server without hidden motion styles", () => {
    const html = renderToString(
      <HeroTextAnimation text="Build production-ready landing pages faster." />,
    );

    expect(html).toContain('data-slot="hero-text-animation"');
    expect(html).toContain("Build production-ready landing pages faster.");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders masked curtain final text on the server without hidden motion styles", () => {
    const html = renderToString(
      <HeroTextAnimation
        animation="masked-curtain"
        text={"Reveal clearly.\nStay readable."}
      />,
    );

    expect(html).toContain('data-animation="masked-curtain"');
    expect(html).toContain("Reveal clearly.");
    expect(html).toContain("Stay readable.");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders typewriter final text on the server without timer-only output", () => {
    const html = renderToString(
      <HeroTextAnimation
        animation="typewriter"
        text="Type concise launch copy once."
      />,
    );

    expect(html).toContain('data-animation="typewriter"');
    expect(html).toContain("Type concise launch copy once.");
    expect(html).not.toContain("hero-text-animation-typewriter-caret");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders scramble decrypt final text on the server without timer-only output", () => {
    const html = renderToString(
      <HeroTextAnimation
        animation="scramble-decrypt"
        text="Decrypt concise launch copy once."
      />,
    );

    expect(html).toContain('data-animation="scramble-decrypt"');
    expect(html).toContain("Decrypt concise launch copy once.");
    expect(html).not.toContain("hero-text-animation-scramble-fragment");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders rotating keyword fallback on the server without motion styles", () => {
    const html = renderToString(
      <HeroTextAnimation
        animation="rotating-keyword"
        rotatingKeywordOptions={["finance", "customer success", "sales"]}
        rotatingKeywordPrefix="Build dashboards for "
        rotatingKeywordSuffix=" teams."
        text="Build dashboards for every revenue team."
      />,
    );

    expect(html).toContain('data-animation="rotating-keyword"');
    expect(html).toContain("Build dashboards for every revenue team.");
    expect(html).toContain("customer success");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders gradient highlight final text on the server without hidden motion styles", () => {
    const html = renderToString(
      <HeroTextAnimation
        animation="gradient-highlight"
        text="Highlight launch copy without hiding text."
      />,
    );

    expect(html).toContain('data-animation="gradient-highlight"');
    expect(html).toContain("Highlight launch copy without hiding text.");
    expect(html).toContain("hero-text-animation-highlight-base");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders blur focus final text on the server without blur or hidden motion styles", () => {
    const html = renderToString(
      <HeroTextAnimation
        animation="blur-focus"
        text="Bring launch copy into focus."
      />,
    );

    expect(html).toContain('data-animation="blur-focus"');
    expect(html).toContain("Bring launch copy into focus.");
    expect(html).toContain('data-blur-final="0em"');
    expect(html).not.toContain("blur(");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders kinetic emphasis final text on the server without transform styles", () => {
    const html = renderToString(
      <HeroTextAnimation
        animation="kinetic-emphasis-pop"
        emphasisWords={["quality", "speed"]}
        text="Balance quality with speed."
      />,
    );

    expect(html).toContain('data-animation="kinetic-emphasis-pop"');
    expect(html).toContain("Balance quality with speed.");
    expect(html).toContain('data-kinetic-emphasis="pop"');
    expect(html).toContain('data-emphasis-count="2"');
    expect(html).toContain("data-[emphasized=true]:underline");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("scale(");
    expect(html).not.toContain("translate");
  });

  it("renders scroll responsive final text on the server without scroll transform styles", () => {
    const html = renderToString(
      <HeroTextAnimation
        animation="scroll-responsive"
        text="Let scroll-responsive copy stay readable."
      />,
    );

    expect(html).toContain('data-animation="scroll-responsive"');
    expect(html).toContain("Let scroll-responsive copy stay readable.");
    expect(html).toContain('data-scroll-responsive="subtle"');
    expect(html).toContain('data-scroll-progress="0.000"');
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("renders svg stroke draw final filled letterforms on the server", () => {
    const html = renderToString(
      <HeroTextAnimation
        animation="svg-stroke-draw"
        text="Draw a launch path without SVG-only text."
      />,
    );

    expect(html).toContain('data-animation="svg-stroke-draw"');
    expect(html).toContain("Draw a launch path without SVG-only text.");
    expect(html).toContain('data-svg-stroke-draw="true"');
    expect(html).toContain('data-svg-stroke-draw-mode="letter-trace"');
    expect(html).toContain('data-svg-line-count="1"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("hero-text-animation-svg-stroke");
    expect(html).toContain('data-slot="hero-text-animation-svg-line"');
    expect(html).toContain('fill-opacity="1"');
    expect(html).not.toContain('stroke-dashoffset="');
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("transform:");
    expect(html).not.toContain("translate");
  });

  it("hydrates scramble decrypt output without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <HeroTextAnimation
        animation="scramble-decrypt"
        text="Hydrate scramble hero text."
      />,
    );

    await act(async () => {
      root = hydrateRoot(
        container,
        <HeroTextAnimation
          animation="scramble-decrypt"
          text="Hydrate scramble hero text."
        />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <HeroTextAnimation text="Hydrate production hero text." />,
    );

    await act(async () => {
      root = hydrateRoot(
        container,
        <HeroTextAnimation text="Hydrate production hero text." />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates typewriter output without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <HeroTextAnimation
        animation="typewriter"
        text="Hydrate typewriter hero text."
      />,
    );

    await act(async () => {
      root = hydrateRoot(
        container,
        <HeroTextAnimation
          animation="typewriter"
          text="Hydrate typewriter hero text."
        />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates rotating keyword output without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <HeroTextAnimation
        animation="rotating-keyword"
        rotatingKeywordOptions={["finance", "support", "sales"]}
        rotatingKeywordPrefix="Build for "
        text="Hydrate rotating hero text."
      />,
    );

    await act(async () => {
      root = hydrateRoot(
        container,
        <HeroTextAnimation
          animation="rotating-keyword"
          rotatingKeywordOptions={["finance", "support", "sales"]}
          rotatingKeywordPrefix="Build for "
          text="Hydrate rotating hero text."
        />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates gradient highlight output without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <HeroTextAnimation
        animation="gradient-highlight"
        text="Hydrate highlighted hero text."
      />,
    );

    await act(async () => {
      root = hydrateRoot(
        container,
        <HeroTextAnimation
          animation="gradient-highlight"
          text="Hydrate highlighted hero text."
        />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates blur focus output without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <HeroTextAnimation
        animation="blur-focus"
        text="Hydrate focused hero text."
      />,
    );

    await act(async () => {
      root = hydrateRoot(
        container,
        <HeroTextAnimation
          animation="blur-focus"
          text="Hydrate focused hero text."
        />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates kinetic emphasis output without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <HeroTextAnimation
        animation="kinetic-emphasis-pop"
        emphasisWords={["quality", "speed"]}
        text="Hydrate quality speed emphasis."
      />,
    );

    await act(async () => {
      root = hydrateRoot(
        container,
        <HeroTextAnimation
          animation="kinetic-emphasis-pop"
          emphasisWords={["quality", "speed"]}
          text="Hydrate quality speed emphasis."
        />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates scroll responsive output without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <HeroTextAnimation
        animation="scroll-responsive"
        text="Hydrate scroll responsive hero text."
      />,
    );

    await act(async () => {
      root = hydrateRoot(
        container,
        <HeroTextAnimation
          animation="scroll-responsive"
          text="Hydrate scroll responsive hero text."
        />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("hydrates svg stroke draw output without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <HeroTextAnimation
        animation="svg-stroke-draw"
        text="Hydrate stroke draw hero text."
      />,
    );

    await act(async () => {
      root = hydrateRoot(
        container,
        <HeroTextAnimation
          animation="svg-stroke-draw"
          text="Hydrate stroke draw hero text."
        />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
