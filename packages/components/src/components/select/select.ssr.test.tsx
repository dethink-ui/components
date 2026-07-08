import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Select, SelectItem } from ".";

describe("Select SSR", () => {
  it("renders select markup on the server", () => {
    const html = renderToString(
      <Select label="Workspace" name="workspace" defaultValue="production">
        <SelectItem value="production">Production</SelectItem>
        <SelectItem value="staging">Staging</SelectItem>
      </Select>,
    );

    expect(html).toContain('data-slot="select"');
    expect(html).toContain('data-slot="select-trigger"');
    expect(html).toContain("Workspace");
    expect(html).toContain("production");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const props = {
      defaultValue: "production",
      label: "Workspace",
      name: "workspace",
    };
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <Select {...props}>
        <SelectItem value="production">Production</SelectItem>
        <SelectItem value="staging">Staging</SelectItem>
      </Select>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <Select {...props}>
          <SelectItem value="production">Production</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
        </Select>,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });

  it("renders data-driven items on the server", () => {
    const html = renderToString(
      <Select
        defaultValue="sandbox"
        label="Workspace"
        items={[
          { label: "Production", value: "production" },
          { label: "Sandbox", value: "sandbox" },
        ]}
      >
        {(item) => <SelectItem value={item.value}>{item.label}</SelectItem>}
      </Select>,
    );

    expect(html).toContain("Workspace");
    expect(html).toContain("Sandbox");
    expect(html).toContain('data-slot="select-trigger"');
  });
});
