import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { Spinner, type SpinnerVariant } from ".";

describe("Spinner SSR", () => {
  it.each<SpinnerVariant>(["ring", "dots", "bouncing-dot", "moving-rings"])(
    "hydrates %s without replacing markup",
    async (variant) => {
      const element = <Spinner variant={variant} label="Loading" />;
      const container = document.createElement("div");
      container.innerHTML = renderToString(element);
      const serverNode = container.firstElementChild;
      const errors: unknown[] = [];
      let root: ReturnType<typeof hydrateRoot>;
      await act(async () => {
        root = hydrateRoot(container, element, {
          onRecoverableError: (error) => errors.push(error),
        });
      });
      expect(errors).toEqual([]);
      expect(container.firstElementChild).toBe(serverNode);
      await act(async () => root.unmount());
    },
  );
  it("renders on the server", () => {
    expect(renderToString(<Spinner label="Loading" />)).toContain(
      'data-slot="spinner"',
    );
  });
});
