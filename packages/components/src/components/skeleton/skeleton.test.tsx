import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
  skeletonClassNames,
} from ".";

describe("Skeleton", () => {
  it("renders decorative layout placeholders", () => {
    render(
      <div>
        <Skeleton data-testid="block" animation="shimmer" />
        <SkeletonText lines={2} data-testid="text" />
        <SkeletonAvatar data-testid="avatar" />
        <SkeletonButton data-testid="button" />
      </div>,
    );

    expect(screen.getByTestId("block")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("text").children).toHaveLength(2);
    expect(screen.getByTestId("avatar")).toHaveAttribute(
      "data-slot",
      "skeleton-avatar",
    );
    expect(screen.getByTestId("button")).toHaveAttribute(
      "data-slot",
      "skeleton-button",
    );
    expect(
      skeletonClassNames({ animation: "none", className: "custom" }),
    ).toContain("custom");
  });
});
