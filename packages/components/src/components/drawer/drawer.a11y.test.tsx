import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerDirection,
} from ".";

expect.extend(toHaveNoViolations);

describe("Drawer accessibility (modal mode)", () => {
  it("has no axe violations for a labelled drawer", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <Drawer direction="right">
          <DrawerTrigger>Open filters</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerDescription>
                Narrow results by workspace status.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>Done</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Open filters" }));

    await expect(
      axe(container.ownerDocument.body),
    ).resolves.toHaveNoViolations();
  });

  it("has no axe violations when the visible title is hidden accessibly", async () => {
    const user = userEvent.setup();
    render(
      <DethinkProvider theme="light">
        <Drawer direction="bottom">
          <DrawerTrigger>Open compact sheet</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle visuallyHidden>Compact sheet</DrawerTitle>
              <DrawerDescription>
                Compact surfaces still expose an accessible name.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerClose />
          </DrawerContent>
        </Drawer>
      </DethinkProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Open compact sheet" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Compact sheet" }),
    ).toBeInTheDocument();
    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });
});

describe("Drawer accessibility (every direction)", () => {
  it.each<DrawerDirection>(["top", "bottom", "left", "right"])(
    "has no axe violations for a labelled modal drawer anchored to %s",
    async (direction) => {
      const user = userEvent.setup();
      const { container } = render(
        <DethinkProvider theme="light">
          <Drawer direction={direction}>
            <DrawerTrigger>{`Open ${direction} drawer`}</DrawerTrigger>
            <DrawerContent>
              <DrawerHandle aria-label="Drag handle" />
              <DrawerHeader>
                <DrawerTitle>{`${direction} drawer`}</DrawerTitle>
                <DrawerDescription>
                  Anchored to the {direction} edge.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose>Done</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </DethinkProvider>,
      );

      await user.click(
        screen.getByRole("button", { name: `Open ${direction} drawer` }),
      );

      await expect(
        axe(container.ownerDocument.body),
      ).resolves.toHaveNoViolations();
    },
  );
});

describe("Drawer accessibility (reduced motion)", () => {
  it("has no axe violations for a modal drawer with the reducedMotion override", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Drawer
          defaultOpen
          direction="bottom"
          reducedMotion
          snapPoints={[0.4, 1]}
        >
          <DrawerTrigger>Open sheet</DrawerTrigger>
          <DrawerContent>
            <DrawerHandle aria-label="Static handle" />
            <DrawerHeader>
              <DrawerTitle>Reduced motion</DrawerTitle>
              <DrawerDescription>
                Drag is disabled; trigger, close, and Escape remain operable.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for a push-mode drawer with the reducedMotion override", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Drawer defaultOpen direction="left" modal={false} reducedMotion>
          <DrawerTrigger>Toggle inspector</DrawerTrigger>
          <DrawerContent>
            <DrawerHandle aria-label="Static handle" />
            <DrawerHeader>
              <DrawerTitle>Inspector</DrawerTitle>
              <DrawerDescription>Persistent record details.</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});

describe("Drawer accessibility (nested drawers)", () => {
  it("has no axe violations with a nested drawer open on top of its parent", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <Drawer defaultOpen direction="right">
          <DrawerTrigger>Open record</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Record</DrawerTitle>
              <DrawerDescription>Row details.</DrawerDescription>
            </DrawerHeader>
            <Drawer direction="right">
              <DrawerTrigger>Edit field</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Edit field</DrawerTitle>
                  <DrawerDescription>Nested edit flow.</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose>Done</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </DrawerContent>
        </Drawer>
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Edit field" }));
    await screen.findByRole("dialog", { name: "Edit field" });

    await expect(
      axe(container.ownerDocument.body),
    ).resolves.toHaveNoViolations();
  });
});

describe("Drawer accessibility (background scale and edge swipe)", () => {
  it("has no axe violations with backgroundScale and edgeSwipeToOpen enabled", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <div data-drawer-background-wrapper="">
          <Drawer backgroundScale direction="left" edgeSwipeToOpen>
            <DrawerTrigger>Open navigation</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Navigation</DrawerTitle>
                <DrawerDescription>Primary app navigation.</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose>Done</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: "Open navigation" }));

    await expect(axe(document.body)).resolves.toHaveNoViolations();
  });
});

describe("Drawer accessibility (push mode)", () => {
  it("has no axe violations for a labelled non-modal push drawer", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Drawer defaultOpen direction="left" modal={false}>
          <DrawerTrigger>Toggle inspector</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Inspector</DrawerTitle>
              <DrawerDescription>Persistent record details.</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
