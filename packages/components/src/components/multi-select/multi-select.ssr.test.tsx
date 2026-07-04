import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  MultiSelect,
  MultiSelectItem,
} from ".";

describe("MultiSelect SSR", () => {
  it("renders multiselect markup on the server", () => {
    const html = renderToString(
      <MultiSelect
        label="Workspaces"
        name="workspaces"
        defaultValue={["production"]}
      >
        <MultiSelectItem value="production">Production</MultiSelectItem>
        <MultiSelectItem value="staging">Staging</MultiSelectItem>
      </MultiSelect>,
    );

    expect(html).toContain('data-slot="multi-select"');
    expect(html).toContain('data-slot="multi-select-control"');
    expect(html).toContain("Workspaces");
    expect(html).toContain("production");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const props = {
      defaultValue: ["production"],
      label: "Workspaces",
      name: "workspaces",
    };
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <MultiSelect {...props}>
        <MultiSelectItem value="production">Production</MultiSelectItem>
        <MultiSelectItem value="staging">Staging</MultiSelectItem>
      </MultiSelect>,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <MultiSelect {...props}>
          <MultiSelectItem value="production">Production</MultiSelectItem>
          <MultiSelectItem value="staging">Staging</MultiSelectItem>
        </MultiSelect>,
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
      <MultiSelect
        defaultValue={["sandbox"]}
        label="Workspaces"
        items={[
          { label: "Production", value: "production" },
          { label: "Sandbox", value: "sandbox" },
        ]}
      >
        {(item) => (
          <MultiSelectItem value={item.value}>{item.label}</MultiSelectItem>
        )}
      </MultiSelect>,
    );

    expect(html).toContain("Workspaces");
    expect(html).toContain("Sandbox");
    expect(html).toContain('data-slot="multi-select-control"');
  });
});
