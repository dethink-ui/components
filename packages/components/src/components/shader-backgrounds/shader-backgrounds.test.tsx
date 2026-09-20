import { act, createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { axe } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiquidMeshBackground } from "../liquid-mesh-background";
import { SilkFlowBackground } from "../silk-flow-background";
import { CausticLightBackground } from "../caustic-light-background";
import { ContourFieldBackground } from "../contour-field-background";
import { OrbitalGlowBackground } from "../orbital-glow-background";
import { bufferSize } from "./types";

const components = [
  LiquidMeshBackground,
  SilkFlowBackground,
  CausticLightBackground,
  ContourFieldBackground,
  OrbitalGlowBackground,
];
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe.each(components)("shader background", (Component) => {
  it("renders stable seeded HTML and hydrates with semantic content intact", async () => {
    const element = (
      <Component seed={29}>
        <h1>Explore the possibilities</h1>
        <a href="#continue">Continue</a>
      </Component>
    );
    const html = renderToString(element);
    expect(html).toBe(renderToString(element));
    expect(html).not.toContain("<canvas");
    expect(html).toContain('data-slot="shader-background-fallback"');
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    const error = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, element, { onRecoverableError: error });
    });
    expect(error).not.toHaveBeenCalled();
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelector("h1")).toHaveTextContent(
      "Explore the possibilities",
    );
    await act(async () => root.unmount());
    container.remove();
  });
  it("preserves foreground events, refs and accessibility while paused", async () => {
    const ref = createRef<HTMLDivElement>(),
      click = vi.fn();
    const { container } = render(
      <Component ref={ref} id="scene" animate={false}>
        <h2>Welcome</h2>
        <button onClick={click}>Get started</button>
      </Component>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Get started" }));
    expect(click).toHaveBeenCalledOnce();
    expect(ref.current).toHaveAttribute("id", "scene");
    expect(ref.current).toHaveAttribute("data-state", "static");
    expect(
      container.querySelector('[data-slot="shader-background-layer"]'),
    ).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("canvas")).toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });
});

it("bounds drawing buffers for high DPI, huge heroes, and low GPU limits", () => {
  for (const [w, h, dpr, limit] of [
    [1920, 1080, 4, 4096],
    [100000, 10000, 2, 4096],
    [800, 600, 1, 256],
    [390, 844, 3, 4096],
  ]) {
    const size = bufferSize(w!, h!, dpr!, limit!)!;
    expect(size[0] * size[1]).toBeLessThanOrEqual(1_000_000);
    expect(Math.max(...size)).toBeLessThanOrEqual(limit!);
    expect(size[0] / w!).toBeLessThanOrEqual(1.5);
  }
  expect(bufferSize(0, 100, 1)).toBeNull();
  expect(bufferSize(NaN, 100, 1)).toBeNull();
  expect(bufferSize(100, Infinity, 1)).toBeNull();
});
