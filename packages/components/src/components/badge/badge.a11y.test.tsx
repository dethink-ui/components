import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Link } from "../link";
import { Badge } from ".";

expect.extend(toHaveNoViolations);

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="m4 8 2.5 2.5L12 5" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M8 3 2.5 13h11L8 3Z" />
      <path d="M8 6.5v2.75M8 11.5h.01" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

describe("Badge accessibility", () => {
  it("has no axe violations for text-backed status badges and native recipes", async () => {
    const { container } = render(
      <main aria-label="Badge smoke">
        <div>
          <Badge icon={<CheckIcon />} tone="success">
            Sync complete
          </Badge>
          <Badge icon={<WarningIcon />} tone="warning">
            Needs review
          </Badge>
          <Badge tone="destructive">Payment failed</Badge>
          <Badge tone="info">AI generated</Badge>
        </div>
        <div>
          <Link href="/deployments" underline="none">
            <Badge icon={<WarningIcon />} tone="warning" variant="outline">
              View blocked deployments
            </Badge>
          </Link>
          <span>
            <Badge tone="primary">Filter: production</Badge>
            <IconButton
              aria-label="Remove production filter"
              size="xs"
              variant="ghost"
            >
              <XIcon />
            </IconButton>
          </span>
          <Button variant="outline" size="sm">
            Clear all filters
          </Button>
        </div>
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
