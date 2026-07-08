import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner, spinnerClassNames } from ".";

describe("Spinner", () => {
  it("is decorative by default and accessible when labelled", () => {
    const { rerender } = render(<Spinner data-testid="spinner" />);

    expect(screen.getByTestId("spinner")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    rerender(<Spinner label="Loading invoices" />);

    expect(
      screen.getByRole("status", { name: "Loading invoices" }),
    ).toHaveAttribute("data-slot", "spinner");
  });

  it("composes class names and variants", () => {
    expect(
      spinnerClassNames({ className: "custom", size: "lg", tone: "info" }),
    ).toContain("custom");
  });
});
