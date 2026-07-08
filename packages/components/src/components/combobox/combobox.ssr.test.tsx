import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Combobox, ComboboxItem } from ".";

describe("Combobox SSR", () => {
  it("renders combobox markup on the server", () => {
    const html = renderToString(
      <Combobox label="Workspace" name="workspace" defaultValue="production">
        <ComboboxItem value="production">Production</ComboboxItem>
        <ComboboxItem value="staging">Staging</ComboboxItem>
      </Combobox>,
    );

    expect(html).toContain('data-slot="combobox"');
    expect(html).toContain('data-slot="combobox-input"');
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
      <Combobox {...props}>
        <ComboboxItem value="production">Production</ComboboxItem>
        <ComboboxItem value="staging">Staging</ComboboxItem>
      </Combobox>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <Combobox {...props}>
          <ComboboxItem value="production">Production</ComboboxItem>
          <ComboboxItem value="staging">Staging</ComboboxItem>
        </Combobox>,
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
      <Combobox
        defaultValue="sandbox"
        label="Workspace"
        items={[
          { label: "Production", value: "production" },
          { label: "Sandbox", value: "sandbox" },
        ]}
      >
        {(item) => <ComboboxItem value={item.value}>{item.label}</ComboboxItem>}
      </Combobox>,
    );

    expect(html).toContain("Workspace");
    expect(html).toContain("Sandbox");
    expect(html).toContain('data-slot="combobox-input"');
  });
});
