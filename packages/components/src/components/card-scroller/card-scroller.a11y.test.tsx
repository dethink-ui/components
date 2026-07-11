import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Card, CardContent, CardTitle } from "../card";
import { CardScroller, CardScrollerItem } from ".";

expect.extend(toHaveNoViolations);

describe("CardScroller accessibility", () => {
  it("has no automated accessibility violations", async () => {
    const { container } = render(
      <main>
        <CardScroller aria-label="Choose a workspace" defaultValue="design">
          <CardScrollerItem label="Design workspace" value="design">
            <Card>
              <CardTitle>Design</CardTitle>
              <CardContent>12 projects</CardContent>
            </Card>
          </CardScrollerItem>
          <CardScrollerItem label="Engineering workspace" value="engineering">
            <Card>
              <CardTitle>Engineering</CardTitle>
              <CardContent>8 projects</CardContent>
            </Card>
          </CardScrollerItem>
        </CardScroller>
      </main>,
    );
    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
