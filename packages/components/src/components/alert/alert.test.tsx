import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Alert, Callout, alertClassNames } from ".";

describe("Alert and Callout", () => {
  it("uses urgency-aware roles and dismiss actions", () => {
    const onDismiss = vi.fn();

    render(
      <>
        <Alert
          urgency="assertive"
          tone="destructive"
          title="Sync failed"
          description="Try again before leaving."
          onDismiss={onDismiss}
        />
        <Callout title="Tip" description="Use filters to narrow the table." />
      </>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Sync failed");
    expect(
      screen.getByText("Tip").closest('[data-slot="callout"]'),
    ).not.toHaveAttribute("role");

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("composes tone and variant classes", () => {
    expect(
      alertClassNames({
        className: "custom",
        tone: "success",
        variant: "outline",
      }),
    ).toContain("custom");
  });
});
