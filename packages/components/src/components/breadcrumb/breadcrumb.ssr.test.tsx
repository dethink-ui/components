import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb } from ".";

const items = [
  { key: "home", label: "Home", href: "/" },
  { key: "workspace", label: "Workspace", href: "/workspace" },
  { key: "report", label: "Report", href: "/workspace/report" },
  { key: "current", label: "Revenue detail" },
];

describe("Breadcrumb SSR", () => {
  it("renders default and collapsed breadcrumb markup on the server", () => {
    expect(renderToString(<Breadcrumb items={items.slice(0, 3)} />)).toContain(
      'data-slot="breadcrumb"',
    );
    expect(renderToString(<Breadcrumb items={items} maxItems={3} />)).toContain(
      'data-slot="breadcrumb-overflow"',
    );
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <Breadcrumb items={items} maxItems={3} />,
    );

    await act(async () => {
      hydrateRoot(container, <Breadcrumb items={items} maxItems={3} />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
