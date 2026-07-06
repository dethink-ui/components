import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { ToastProvider, ToastViewport } from ".";

expect.extend(toHaveNoViolations);

describe("Toast accessibility", () => {
  it("has no axe violations for actionable toasts", async () => {
    const { container } = render(
      <main aria-label="Toast smoke">
        <ToastProvider
          defaultToasts={[
            {
              action: {
                label: "Undo",
                onClick: () => undefined,
              },
              description: "Workspace settings were saved.",
              id: "saved",
              persistent: true,
              title: "Saved",
              tone: "success",
            },
          ]}
          motion="none"
        >
          <ToastViewport />
        </ToastProvider>
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
