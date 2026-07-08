import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Heading, Text, Typography } from ".";

describe("Typography SSR", () => {
  it("renders semantic text markup on the server", () => {
    expect(
      renderToString(<Heading level={1}>Server heading</Heading>),
    ).toContain('data-slot="heading"');
    expect(renderToString(<Text tone="muted">Server text</Text>)).toContain(
      'data-slot="text"',
    );
    expect(
      renderToString(<Typography variant="caption">Caption</Typography>),
    ).toContain('data-slot="typography"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <section>
        <Heading level={2} visualLevel={4}>
          Hydrate heading
        </Heading>
        <Text tone="muted" lineClamp={2}>
          Hydrate body
        </Text>
      </section>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <section>
          <Heading level={2} visualLevel={4}>
            Hydrate heading
          </Heading>
          <Text tone="muted" lineClamp={2}>
            Hydrate body
          </Text>
        </section>,
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
