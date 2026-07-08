import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Button } from "../button";
import { Link } from "../link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from ".";

expect.extend(toHaveNoViolations);

describe("Card accessibility", () => {
  it("has no axe violations for static cards with heading and action patterns", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Card accessibility smoke">
          <Card as="article" aria-labelledby="card-a11y-title">
            <CardHeader as="header">
              <CardTitle id="card-a11y-title" as="h2">
                Workspace usage
              </CardTitle>
              <CardDescription>
                Static surface with real nested actions.
              </CardDescription>
              <CardAction>
                <Button size="sm" variant="outline">
                  Export
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p>Usage is updated every hour.</p>
            </CardContent>
            <CardFooter justify="between">
              <span>Updated now</span>
              <Link href="/reports">Open report</Link>
            </CardFooter>
          </Card>
        </main>
      </DethinkProvider>,
    );

    const article = screen.getByRole("article", { name: "Workspace usage" });
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Workspace usage",
    });
    const button = screen.getByRole("button", { name: "Export" });
    const link = screen.getByRole("link", { name: "Open report" });

    expect(article).toHaveAttribute("data-slot", "card");
    expect(article).not.toHaveAttribute("role");
    expect(article).not.toHaveAttribute("tabindex");
    expect(heading).toHaveAttribute("data-slot", "card-title");
    expect(button).toHaveAttribute("data-slot", "button");
    expect(link).toHaveAttribute("data-slot", "link");

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
