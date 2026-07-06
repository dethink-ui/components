import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Breadcrumb } from ".";

expect.extend(toHaveNoViolations);

describe("Breadcrumb accessibility", () => {
  it("has no axe violations for baseline and current-page states", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Breadcrumb accessibility smoke">
          <Breadcrumb
            items={[
              { key: "home", label: "Home", href: "/" },
              { key: "settings", label: "Settings", href: "/settings" },
              { key: "billing", label: "Billing" },
            ]}
          />
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for collapsed overflow content", async () => {
    const user = userEvent.setup();

    render(
      <DethinkProvider theme="dark">
        <Breadcrumb
          items={[
            { key: "home", label: "Home", href: "/" },
            { key: "workspace", label: "Workspace", href: "/workspace" },
            { key: "project", label: "Project", href: "/workspace/project" },
            {
              key: "report",
              label: "Quarterly report",
              href: "/workspace/project/report",
            },
            { key: "current", label: "Revenue detail" },
          ]}
          maxItems={4}
          overflowLabel="Show hidden breadcrumb items"
        />
      </DethinkProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Show hidden breadcrumb items" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Show hidden breadcrumb items" }),
    ).toBeInTheDocument();
    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });
});
