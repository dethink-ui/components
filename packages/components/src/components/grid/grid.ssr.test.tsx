import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Grid, GridItem } from ".";

describe("Grid SSR", () => {
  it("renders Grid and GridItem markup on the server", () => {
    expect(renderToString(<Grid as="section">Server grid</Grid>)).toContain(
      'data-slot="grid"',
    );
    expect(
      renderToString(<GridItem colSpan="2">Server item</GridItem>),
    ).toContain('data-slot="grid-item"');
    expect(
      renderToString(
        <Grid asChild gap="4">
          <a href="/docs">Docs</a>
        </Grid>,
      ),
    ).toContain("<a");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <Grid as="section" columns="auto-fit-sm" gap="4">
        <GridItem colSpan="2" minInlineSize="0">
          Hydrate grid
        </GridItem>
      </Grid>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <Grid as="section" columns="auto-fit-sm" gap="4">
          <GridItem colSpan="2" minInlineSize="0">
            Hydrate grid
          </GridItem>
        </Grid>,
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
