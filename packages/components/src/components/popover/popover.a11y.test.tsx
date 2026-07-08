import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from ".";

expect.extend(toHaveNoViolations);

describe("Popover accessibility", () => {
  it("has no axe violations for labelled interactive popover content", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <Popover>
          <PopoverTrigger>Open workspace filters</PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Workspace filters</PopoverTitle>
              <PopoverDescription>
                Tune the reporting scope before refreshing the dashboard.
              </PopoverDescription>
            </PopoverHeader>
            <PopoverFooter>
              <PopoverClose>Done</PopoverClose>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </DethinkProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Open workspace filters" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Workspace filters" }),
    ).toBeInTheDocument();
    await expect(
      axe(container.ownerDocument.body),
    ).resolves.toHaveNoViolations();
  });

  it("has no axe violations when the visible title is hidden accessibly", async () => {
    const user = userEvent.setup();

    render(
      <DethinkProvider theme="light">
        <Popover>
          <PopoverTrigger>Open compact popover</PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle visuallyHidden>Compact filters</PopoverTitle>
              <PopoverDescription>
                The accessible name remains available to assistive technology.
              </PopoverDescription>
            </PopoverHeader>
            <PopoverClose />
          </PopoverContent>
        </Popover>
      </DethinkProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Open compact popover" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Compact filters" }),
    ).toBeInTheDocument();
    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });
});
