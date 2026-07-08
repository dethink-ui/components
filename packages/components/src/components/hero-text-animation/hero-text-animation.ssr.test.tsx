import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HeroTextAnimation } from ".";

describe("HeroTextAnimation SSR", () => {
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
      hydrateRoot(
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
      hydrateRoot(
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
      hydrateRoot(
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
      hydrateRoot(
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
      hydrateRoot(
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
});
