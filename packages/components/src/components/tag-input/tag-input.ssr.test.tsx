import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TagInput } from ".";

describe("TagInput SSR", () => {
  it("renders tag input markup on the server", () => {
    const html = renderToString(
      <TagInput
        label="Labels"
        name="labels"
        defaultValue={["finance", "priority"]}
      />,
    );

    expect(html).toContain('data-slot="tag-input"');
    expect(html).toContain('data-slot="tag-input-field"');
    expect(html).toContain("Labels");
    expect(html).toContain("finance");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const props = {
      defaultValue: ["finance", "priority"],
      label: "Labels",
      name: "labels",
    };
    const container = document.createElement("div");
    container.innerHTML = renderToString(<TagInput {...props} />);

    await act(async () => {
      hydrateRoot(container, <TagInput {...props} />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
