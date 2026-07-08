import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from ".";

expect.extend(toHaveNoViolations);

describe("Tooltip accessibility", () => {
  it("has no axe violations for supplemental icon-button help", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <Tooltip delay={0} closeDelay={0}>
          <TooltipTrigger aria-label="Refresh report" size="icon">
            R
          </TooltipTrigger>
          <TooltipContent>Refresh report data</TooltipContent>
        </Tooltip>
      </DethinkProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Refresh report" });

    fireEvent.pointerDown(document.body, { pointerType: "mouse" });
    fireEvent.mouseDown(document.body);
    await user.hover(trigger);

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Refresh report data",
    );
    expect(trigger).toHaveAccessibleName("Refresh report");
    await expect(
      axe(container.ownerDocument.body, {
        rules: {
          region: {
            enabled: false,
          },
        },
      }),
    ).resolves.toHaveNoViolations();
  });
});
