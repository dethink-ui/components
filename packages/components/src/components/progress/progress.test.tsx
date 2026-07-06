import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Progress,
  ProgressCircle,
  clampProgressValue,
  getProgressPercent,
} from ".";

describe("Progress", () => {
  it("clamps determinate values and exposes progressbar semantics", () => {
    render(<Progress label="Import" value={120} showValue />);

    const progress = screen.getByRole("progressbar", { name: "Import" });

    expect(progress).toHaveAttribute("aria-valuenow", "100");
    expect(progress).toHaveAttribute("aria-valuetext", "100%");
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(clampProgressValue({ value: -10 })).toBe(0);
    expect(getProgressPercent({ value: 25, max: 50 })).toBe(50);
  });

  it("supports indeterminate linear and circular states", () => {
    render(
      <>
        <Progress aria-label="Sync" indeterminate />
        <ProgressCircle label="Upload" value={50} showValue />
      </>,
    );

    expect(screen.getByRole("progressbar", { name: "Sync" })).not.toHaveAttribute(
      "aria-valuenow",
    );
    expect(screen.getByRole("progressbar", { name: "Upload" })).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
  });
});
