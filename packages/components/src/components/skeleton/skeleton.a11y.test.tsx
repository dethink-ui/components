import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Skeleton, SkeletonAvatar, SkeletonButton, SkeletonText } from ".";

expect.extend(toHaveNoViolations);

describe("Skeleton accessibility", () => {
  it("has no axe violations for decorative placeholders", async () => {
    const { container } = render(
      <main aria-label="Skeleton smoke">
        <SkeletonAvatar />
        <SkeletonText lines={3} />
        <SkeletonButton />
        <Skeleton className="h-24 w-full" />
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
