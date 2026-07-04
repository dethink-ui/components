import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AsyncSelect } from ".";

describe("AsyncSelect SSR", () => {
  it("renders single async select markup on the server", () => {
    const html = renderToString(
      <AsyncSelect
        label="Account"
        name="account"
        defaultValue="acme"
        items={[{ label: "Acme Operations", value: "acme" }]}
      />,
    );

    expect(html).toContain('data-slot="async-select"');
    expect(html).toContain('data-selection-mode="single"');
    expect(html).toContain("Account");
    expect(html).toContain("acme");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const props = {
      defaultValue: "acme",
      items: [{ label: "Acme Operations", value: "acme" }],
      label: "Account",
      name: "account",
    };
    const container = document.createElement("div");
    container.innerHTML = renderToString(<AsyncSelect {...props} />);

    await act(async () => {
      hydrateRoot(container, <AsyncSelect {...props} />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("renders multiple async select markup on the server", () => {
    const html = renderToString(
      <AsyncSelect
        selectionMode="multiple"
        label="Owners"
        defaultValue={["acme"]}
        items={[{ label: "Acme Operations", value: "acme" }]}
      />,
    );

    expect(html).toContain('data-selection-mode="multiple"');
    expect(html).toContain("Acme Operations");
  });
});
