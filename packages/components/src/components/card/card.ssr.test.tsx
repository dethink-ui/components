import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from ".";

describe("Card SSR", () => {
  it("renders Card and slot markup on the server", () => {
    const markup = renderToString(
      <Card as="article">
        <CardHeader>
          <CardTitle as="h2">Server card</CardTitle>
          <CardDescription>Rendered on the server.</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter justify="end">Footer</CardFooter>
      </Card>,
    );

    expect(markup).toContain('data-slot="card"');
    expect(markup).toContain('data-slot="card-header"');
    expect(markup).toContain('data-slot="card-title"');
    expect(markup).toContain('data-slot="card-description"');
    expect(markup).toContain('data-slot="card-action"');
    expect(markup).toContain('data-slot="card-content"');
    expect(markup).toContain('data-slot="card-footer"');
    expect(markup).toContain('data-justify="end"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <Card border="muted" radius="md" shadow="md" spacing="lg" surface="muted">
        <CardHeader>
          <CardTitle>Hydrate card</CardTitle>
          <CardDescription>Stable SSR card.</CardDescription>
        </CardHeader>
        <CardContent>Hydrate content</CardContent>
      </Card>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <Card
          border="muted"
          radius="md"
          shadow="md"
          spacing="lg"
          surface="muted"
        >
          <CardHeader>
            <CardTitle>Hydrate card</CardTitle>
            <CardDescription>Stable SSR card.</CardDescription>
          </CardHeader>
          <CardContent>Hydrate content</CardContent>
        </Card>,
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
