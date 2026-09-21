import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRef } from "react";
import { Spinner, spinnerClassNames, type SpinnerVariant } from ".";

const variants: SpinnerVariant[] = [
  "ring",
  "dots",
  "bouncing-dot",
  "moving-rings",
];

describe("Spinner", () => {
  it.each(variants)(
    "preserves semantics and forwarded props for %s",
    (variant) => {
      const ref = createRef<HTMLSpanElement>();
      const { rerender } = render(
        <Spinner
          ref={ref}
          variant={variant}
          size="xl"
          tone="info"
          label="Loading records"
          className="custom"
        />,
      );
      const spinner = screen.getByRole("status", { name: "Loading records" });
      expect(ref.current).toBe(spinner);
      expect(spinner).toHaveAttribute("data-variant", variant);
      expect(spinner).toHaveAttribute("data-size", "xl");
      expect(spinner).toHaveAttribute("data-tone", "info");
      expect(spinner).toHaveClass("custom");
      rerender(<Spinner variant={variant} aria-label="Refreshing records" />);
      expect(
        screen.getByRole("status", { name: "Refreshing records" }),
      ).toBeInTheDocument();
      rerender(<Spinner variant={variant} data-testid="decoration" />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByTestId("decoration")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    },
  );
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
