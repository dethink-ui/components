import { act, createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { axe } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShaderHeroText, shaderHeroTextAnimations } from ".";

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

describe("ShaderHeroText semantic fallback", () => {
  it.each(shaderHeroTextAnimations)(
    "renders %s as readable server HTML and hydrates without a canvas",
    async (animation) => {
      const element = (
        <ShaderHeroText
          animation={animation}
          text={"Ideas come together.\nStay curious."}
        />
      );
      const html = renderToString(element);
      expect(html).toContain("Ideas come together.");
      expect(html).not.toContain("<canvas");
      expect(html).not.toContain('data-rendering="true"');
      const container = document.createElement("div");
      container.innerHTML = html;
      document.body.append(container);
      const recover = vi.fn();
      let root: ReturnType<typeof hydrateRoot>;
      await act(async () => {
        root = hydrateRoot(container, element, { onRecoverableError: recover });
      });
      expect(recover).not.toHaveBeenCalled();
      expect(container.querySelector("h1")?.textContent).toBe(
        "Ideas come together.\nStay curious.",
      );
      expect(container.querySelector("canvas")).toBeNull();
      await act(async () => root.unmount());
      container.remove();
    },
  );

  it("forwards semantics, accessible label, native props and ref without firing callbacks for static output", async () => {
    const start = vi.fn(),
      complete = vi.fn(),
      ref = createRef<HTMLElement>();
    const { container, rerender } = render(
      // Semantic heading content is supplied through the text prop.
      // eslint-disable-next-line jsx-a11y/heading-has-content
      <ShaderHeroText
        as="h2"
        text="Visible words"
        ariaLabel="Accessible words"
        ref={ref}
        id="hero"
        reducedMotion="always"
        onAnimationStart={start}
        onAnimationComplete={complete}
      />,
    );
    const heading = screen.getByRole("heading", {
      name: "Accessible words",
      level: 2,
    });
    expect(ref.current).toBe(heading);
    expect(heading).toHaveAttribute("id", "hero");
    expect((await axe(container)).violations).toEqual([]);
    rerender(
      <ShaderHeroText as="p" text="Updated words" reducedMotion="always" />,
    );
    expect(screen.getByText("Updated words").closest("p")).not.toBeNull();
    expect(start).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });

  it("does not initialize WebGL for an inactive manual trigger", () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    render(
      <ShaderHeroText
        text="Wait for an action"
        trigger="manual"
        active={false}
      />,
    );
    expect(getContext).not.toHaveBeenCalled();
    getContext.mockRestore();
  });
});
