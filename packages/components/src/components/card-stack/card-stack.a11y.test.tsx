import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Button } from "../button";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { CardStack } from ".";

expect.extend(toHaveNoViolations);

describe("CardStack accessibility", () => {
  it("has no axe violations and exposes only active nested controls", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <CardStack aria-label="Review cards">
          <Card as="article">
            <CardHeader>
              <CardTitle>Active card</CardTitle>
            </CardHeader>
            <CardContent>
              <Button>Open active card</Button>
            </CardContent>
          </Card>
          <Card as="article">
            <CardHeader>
              <CardTitle>Inactive card</CardTitle>
            </CardHeader>
            <CardContent>
              <Button>Open inactive card</Button>
            </CardContent>
          </Card>
        </CardStack>
      </DethinkProvider>,
    );

    const stack = screen.getByRole("group", { name: "Review cards" });

    expect(stack).toHaveAttribute("data-slot", "card-stack");
    expect(
      screen.getByRole("button", { name: "Show next card" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Open active card" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Open inactive card" }),
    ).toBeNull();

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
