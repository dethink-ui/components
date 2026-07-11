import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Card } from "../card";
import { CardScroller, CardScrollerItem } from ".";

function Example() {
  return (
    <CardScroller defaultValue="one">
      <CardScrollerItem label="One" value="one">
        <Card>One</Card>
      </CardScrollerItem>
    </CardScroller>
  );
}

describe("CardScroller SSR", () => {
  it("renders stable server markup and hydrates without mismatches", async () => {
    const markup = renderToString(<Example />);
    expect(markup).toContain('data-slot="card-scroller"');
    expect(markup).toContain('type="radio"');
    const container = document.createElement("div");
    container.innerHTML = markup;
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    await act(async () => {
      hydrateRoot(container, <Example />);
    });
    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);
    consoleError.mockRestore();
  });
});
