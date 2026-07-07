import { createRef, useRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import {
  DRAWER_BACKGROUND_SCALE_ATTRIBUTE,
  DRAWER_BACKGROUND_WRAPPER_ATTRIBUTE,
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
import {
  useDrawerDrag,
  type DrawerDragMotionProps,
} from "./drawer-motion";

interface TestMotionValue {
  get: () => number;
}

function getTranslateMotionValue(
  style: DrawerDragMotionProps["style"],
): TestMotionValue {
  return ("x" in style ? style.x : style.y) as unknown as TestMotionValue;
}

function readTranslateValue(value: TestMotionValue | null): number {
  if (!value) {
    throw new Error("Expected drawer drag probe to capture a translate value.");
  }

  return value.get();
}

function DrawerDragProbe({
  direction,
  onTranslateValue,
  open,
}: {
  direction: DrawerDirection;
  onTranslateValue: (value: TestMotionValue) => void;
  open: boolean;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { getMotionProps } = useDrawerDrag({
    closeThreshold: 0.25,
    contentRef,
    direction,
    motionPreset: "standard",
    onOpenChange: vi.fn(),
    open,
    velocityThreshold: 500,
  });
  const motionProps = getMotionProps(true);

  onTranslateValue(getTranslateMotionValue(motionProps.style));

  return <div ref={contentRef} />;
}

describe("Drawer motion (enabled)", () => {
  it("starts a first open from the current direction after changing direction while closed", () => {
    let translateValue: TestMotionValue | null = null;
    const captureTranslateValue = (value: TestMotionValue) => {
      translateValue = value;
    };

    const { rerender } = render(
      <DrawerDragProbe
        direction="right"
        onTranslateValue={captureTranslateValue}
        open={false}
      />,
    );

    expect(readTranslateValue(translateValue)).toBeGreaterThan(0);

    rerender(
      <DrawerDragProbe
        direction="top"
        onTranslateValue={captureTranslateValue}
        open
      />,
    );

    expect(readTranslateValue(translateValue)).toBeLessThan(0);
  });

  it("renders a draggable handle and does not error on pointer-down drag initiation", async () => {
    const user = userEvent.setup();

    render(
      <Drawer defaultOpen direction="bottom">
        <DrawerTrigger>Open sheet</DrawerTrigger>
        <DrawerContent>
          <DrawerHandle data-testid="drawer-handle" />
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Drag from the handle to resize.</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
    );

    const handle = screen.getByTestId("drawer-handle");

    expect(handle).toHaveAttribute("data-slot", "drawer-handle");
    expect(handle).toHaveAttribute("aria-hidden", "true");
    expect(handle).toHaveAttribute("data-direction", "bottom");
    expect(handle).toHaveClass("h-8", "w-full", "cursor-grab", "after:w-12");

    expect(() => {
      fireEvent.pointerDown(handle, { pointerId: 1 });
    }).not.toThrow();

    screen.getByRole("dialog", { name: "Filters" }).focus();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("overlays side handles without reserving drawer height", () => {
    const { rerender } = render(
      <Drawer defaultOpen direction="right">
        <DrawerTrigger>Open event</DrawerTrigger>
        <DrawerContent>
          <DrawerHandle data-testid="side-handle" />
          <DrawerTitle>Event detail</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(screen.getByTestId("side-handle")).toHaveAttribute(
      "data-direction",
      "right",
    );
    expect(screen.getByTestId("side-handle")).toHaveClass(
      "data-[direction=right]:absolute",
      "data-[direction=right]:inset-y-0",
      "data-[direction=right]:left-0",
      "data-[direction=right]:h-full",
      "data-[direction=right]:w-8",
    );

    rerender(
      <Drawer defaultOpen direction="left">
        <DrawerTrigger>Open event</DrawerTrigger>
        <DrawerContent>
          <DrawerHandle data-testid="side-handle" />
          <DrawerTitle>Event detail</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(screen.getByTestId("side-handle")).toHaveAttribute(
      "data-direction",
      "left",
    );
    expect(screen.getByTestId("side-handle")).toHaveClass(
      "data-[direction=left]:absolute",
      "data-[direction=left]:inset-y-0",
      "data-[direction=left]:right-0",
      "data-[direction=left]:h-full",
      "data-[direction=left]:w-8",
    );
  });

  it("applies data-direction and data-modal attributes to motion-driven content", () => {
    render(
      <Drawer defaultOpen direction="left">
        <DrawerTrigger>Open inspector</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Inspector</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const content = screen
      .getByRole("dialog", { name: "Inspector" })
      .closest('[data-slot="drawer-content"]');

    expect(content).toHaveAttribute("data-direction", "left");
    expect(content).toHaveAttribute("data-modal", "true");
  });

  it("accepts snapPoints and defaultSnapPoint without throwing and without an initial change callback", () => {
    const handleActiveSnapPointChange = vi.fn();

    render(
      <Drawer
        defaultOpen
        defaultSnapPoint={0.6}
        direction="bottom"
        onActiveSnapPointChange={handleActiveSnapPointChange}
        snapPoints={[0.3, 0.6, 1]}
      >
        <DrawerTrigger>Open sheet</DrawerTrigger>
        <DrawerContent>
          <DrawerHandle />
          <DrawerTitle>Bottom sheet</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(screen.getByRole("dialog", { name: "Bottom sheet" })).toBeInTheDocument();
    expect(handleActiveSnapPointChange).not.toHaveBeenCalled();
  });

  it("supports push mode with a handle and snap points", async () => {
    const user = userEvent.setup();

    render(
      <Drawer defaultOpen={false} direction="right" modal={false} snapPoints={[0.4, 1]}>
        <DrawerTrigger>Open inspector</DrawerTrigger>
        <DrawerContent>
          <DrawerHandle data-testid="push-handle" />
          <DrawerTitle>Push inspector</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(screen.getByTestId("push-handle")).toHaveAttribute(
      "data-slot",
      "drawer-handle",
    );
    expect(
      document.querySelector('[data-slot="drawer-content"]'),
    ).toHaveAttribute("data-state", "closed");

    await user.click(screen.getByRole("button", { name: "Open inspector" }));

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="drawer-content"]'),
      ).toHaveAttribute("data-state", "open");
    });
  });
});

describe("Drawer motion (reduced motion override)", () => {
  function renderReducedMotionDrawer() {
    const contentRef = createRef<HTMLDivElement>();

    return render(
      <MotionConfig reducedMotion="always">
        <Drawer defaultOpen direction="bottom">
          <DrawerTrigger>Open sheet</DrawerTrigger>
          <DrawerContent ref={contentRef}>
            <DrawerHandle data-testid="reduced-motion-handle" />
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerDescription>
                Reduced motion disables drag but keeps every other control
                working.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>Done</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </MotionConfig>,
    );
  }

  it("renders the handle as an inert, non-draggable static bar", () => {
    renderReducedMotionDrawer();

    const handle = screen.getByTestId("reduced-motion-handle");

    expect(handle).toHaveAttribute("data-slot", "drawer-handle");
    expect(handle).toHaveAttribute("aria-hidden", "true");
    expect(handle).toHaveClass("h-8", "w-full", "after:w-12");

    expect(() => {
      fireEvent.pointerDown(handle, { pointerId: 1 });
    }).not.toThrow();
  });

  it("keeps the CSS-only open/close/dismiss path fully operable via trigger, close button, and Escape", async () => {
    const user = userEvent.setup();

    renderReducedMotionDrawer();

    const dialog = screen.getByRole("dialog", { name: "Filters" });

    expect(dialog).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    expect(await screen.findByRole("dialog", { name: "Filters" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("keeps push mode fully operable via trigger and Escape under reduced motion", async () => {
    const user = userEvent.setup();

    render(
      <MotionConfig reducedMotion="always">
        <Drawer defaultOpen={false} direction="left" modal={false}>
          <DrawerTrigger>Toggle inspector</DrawerTrigger>
          <DrawerContent>
            <DrawerHandle />
            <DrawerTitle>Inspector</DrawerTitle>
          </DrawerContent>
        </Drawer>
      </MotionConfig>,
    );

    await user.click(screen.getByRole("button", { name: "Toggle inspector" }));

    const panel = await screen.findByRole("dialog", { name: "Inspector" });

    expect(panel).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="drawer-content"]'),
      ).toHaveAttribute("data-state", "closed");
    });
  });

  it("supports an explicit reducedMotion prop override without relying on MotionConfig", () => {
    render(
      <Drawer defaultOpen direction="bottom" reducedMotion>
        <DrawerTrigger>Open sheet</DrawerTrigger>
        <DrawerContent>
          <DrawerHandle data-testid="prop-override-handle" />
          <DrawerTitle>Prop override</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const content = screen
      .getByRole("dialog", { name: "Prop override" })
      .closest('[data-slot="drawer-content"]');

    expect(content).toHaveAttribute("data-reduced-motion", "true");
    expect(() => {
      fireEvent.pointerDown(screen.getByTestId("prop-override-handle"), {
        pointerId: 1,
      });
    }).not.toThrow();
  });
});

describe("Drawer motionPreset", () => {
  it("defaults data-motion to 'standard'", () => {
    render(
      <Drawer defaultOpen direction="bottom">
        <DrawerTrigger>Open sheet</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Default preset</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const content = screen
      .getByRole("dialog", { name: "Default preset" })
      .closest('[data-slot="drawer-content"]');

    expect(content).toHaveAttribute("data-motion", "standard");
    expect(content).toHaveAttribute("data-motion-direction", "bottom");
  });

  it.each(["none", "subtle", "standard", "expressive"] as const)(
    "exposes data-motion=%s and keeps trigger/close operable",
    async (motionPreset) => {
      const user = userEvent.setup();

      render(
        <Drawer defaultOpen direction="left" motionPreset={motionPreset}>
          <DrawerTrigger>Open panel</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>{`Preset ${motionPreset}`}</DrawerTitle>
            <DrawerFooter>
              <DrawerClose>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>,
      );

      const content = screen
        .getByRole("dialog", { name: `Preset ${motionPreset}` })
        .closest('[data-slot="drawer-content"]');

      expect(content).toHaveAttribute("data-motion", motionPreset);
      expect(content).toHaveAttribute("data-motion-direction", "left");

      await user.click(screen.getByRole("button", { name: "Close" }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    },
  );

  it("forces the CSS-only fallback (motionPreset='none') even without an explicit reducedMotion prop", () => {
    render(
      <Drawer defaultOpen direction="bottom" motionPreset="none">
        <DrawerTrigger>Open sheet</DrawerTrigger>
        <DrawerContent>
          <DrawerHandle data-testid="none-preset-handle" />
          <DrawerTitle>None preset</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const content = screen
      .getByRole("dialog", { name: "None preset" })
      .closest('[data-slot="drawer-content"]');

    expect(content).toHaveAttribute("data-motion", "none");
    expect(content).not.toHaveAttribute("data-reduced-motion", "true");
    expect(() => {
      fireEvent.pointerDown(screen.getByTestId("none-preset-handle"), {
        pointerId: 1,
      });
    }).not.toThrow();
  });

  it("applies data-motion in push mode too", () => {
    render(
      <Drawer defaultOpen direction="right" modal={false} motionPreset="expressive">
        <DrawerTrigger>Toggle inspector</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Inspector</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(document.querySelector('[data-slot="drawer-content"]')).toHaveAttribute(
      "data-motion",
      "expressive",
    );
  });
});

describe("Drawer layoutId passthrough", () => {
  it("accepts a layoutId without throwing in modal mode", async () => {
    const user = userEvent.setup();

    render(
      <Drawer direction="bottom">
        <DrawerTrigger>Open card</DrawerTrigger>
        <DrawerContent layoutId="card-1">
          <DrawerTitle>Shared card</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open card" }));

    expect(await screen.findByRole("dialog", { name: "Shared card" })).toBeInTheDocument();
  });

  it("accepts a layoutId without throwing in push mode", async () => {
    const user = userEvent.setup();

    render(
      <Drawer defaultOpen={false} direction="right" modal={false}>
        <DrawerTrigger>Toggle inspector</DrawerTrigger>
        <DrawerContent layoutId="card-2">
          <DrawerTitle>Shared inspector</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Toggle inspector" }));

    expect(await screen.findByRole("dialog", { name: "Shared inspector" })).toBeInTheDocument();
  });
});

describe("Drawer nested/stacked drawers", () => {
  it("recedes the parent drawer's content while a nested child drawer is open, and un-recedes on close", async () => {
    const user = userEvent.setup();

    render(
      <Drawer defaultOpen direction="right">
        <DrawerTrigger>Open parent</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Parent</DrawerTitle>
          <Drawer direction="right">
            <DrawerTrigger>Open child</DrawerTrigger>
            <DrawerContent>
              <DrawerTitle>Child</DrawerTitle>
              <DrawerFooter>
                <DrawerClose>Close child</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </DrawerContent>
      </Drawer>,
    );

    const parentContent = screen
      .getByRole("dialog", { name: "Parent" })
      .closest('[data-slot="drawer-content"]');

    expect(parentContent).not.toHaveAttribute("data-drawer-receded", "true");

    await user.click(screen.getByRole("button", { name: "Open child" }));
    await screen.findByRole("dialog", { name: "Child" });

    await waitFor(() => {
      expect(parentContent).toHaveAttribute("data-drawer-receded", "true");
    });

    await user.click(screen.getByRole("button", { name: "Close child" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Child" })).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(parentContent).not.toHaveAttribute("data-drawer-receded", "true");
    });
  });

  it("does not recede a drawer with no open nested children", () => {
    render(
      <Drawer defaultOpen direction="bottom">
        <DrawerTrigger>Open sheet</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Standalone</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const content = screen
      .getByRole("dialog", { name: "Standalone" })
      .closest('[data-slot="drawer-content"]');

    expect(content).not.toHaveAttribute("data-drawer-receded");
  });

  it("keeps a nested child drawer's dialog accessible (not aria-hidden) while its parent is open", async () => {
    const user = userEvent.setup();

    render(
      <Drawer defaultOpen direction="right">
        <DrawerTrigger>Open parent</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Parent</DrawerTitle>
          <Drawer direction="right">
            <DrawerTrigger>Open child</DrawerTrigger>
            <DrawerContent>
              <DrawerTitle>Child</DrawerTitle>
            </DrawerContent>
          </Drawer>
        </DrawerContent>
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open child" }));

    const childDialog = await screen.findByRole("dialog", { name: "Child" });

    expect(childDialog).toBeVisible();
    expect(childDialog.closest('[aria-hidden="true"]')).toBeNull();
  });
});

describe("Drawer backgroundScale", () => {
  it("marks a data-drawer-background-wrapper element 'scaled' while a modal backgroundScale drawer is open", async () => {
    const user = userEvent.setup();
    const wrapper = document.createElement("div");

    wrapper.setAttribute(DRAWER_BACKGROUND_WRAPPER_ATTRIBUTE, "");
    document.body.appendChild(wrapper);

    render(
      <Drawer backgroundScale direction="bottom">
        <DrawerTrigger>Open sheet</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Scaled background</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(wrapper.hasAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(false);

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    await screen.findByRole("dialog", { name: "Scaled background" });

    await waitFor(() => {
      expect(wrapper.getAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe("scaled");
    });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(wrapper.hasAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(false);
    });

    wrapper.remove();
  });

  it("does not mark the wrapper when backgroundScale is not set", async () => {
    const user = userEvent.setup();
    const wrapper = document.createElement("div");

    wrapper.setAttribute(DRAWER_BACKGROUND_WRAPPER_ATTRIBUTE, "");
    document.body.appendChild(wrapper);

    render(
      <Drawer direction="bottom">
        <DrawerTrigger>Open sheet</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>No background scale</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    await screen.findByRole("dialog", { name: "No background scale" });

    expect(wrapper.hasAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(false);

    wrapper.remove();
  });

  it("marks the wrapper 'dimmed' (not 'scaled') under reduced motion", async () => {
    const user = userEvent.setup();
    const wrapper = document.createElement("div");

    wrapper.setAttribute(DRAWER_BACKGROUND_WRAPPER_ATTRIBUTE, "");
    document.body.appendChild(wrapper);

    render(
      <Drawer backgroundScale direction="bottom" reducedMotion>
        <DrawerTrigger>Open sheet</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Reduced motion background</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    await screen.findByRole("dialog", { name: "Reduced motion background" });

    await waitFor(() => {
      expect(wrapper.getAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe("dimmed");
    });

    wrapper.remove();
  });
});

describe("Drawer edgeSwipeToOpen", () => {
  it("is not rendered by default", () => {
    render(
      <Drawer direction="left">
        <DrawerTrigger>Open inspector</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Inspector</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(
      document.querySelector('[data-slot="drawer-edge-swipe-zone"]'),
    ).not.toBeInTheDocument();
  });

  it("renders an edge hit-region pinned to the drawer's direction while closed, and hides it once open", async () => {
    const user = userEvent.setup();

    render(
      <Drawer direction="left" edgeSwipeToOpen>
        <DrawerTrigger>Open inspector</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Inspector</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const zone = document.querySelector('[data-slot="drawer-edge-swipe-zone"]');

    expect(zone).toHaveAttribute("data-direction", "left");
    expect(zone).toHaveAttribute("aria-hidden", "true");

    expect(() => {
      fireEvent.pointerDown(zone!, { pointerId: 1 });
    }).not.toThrow();

    await user.click(screen.getByRole("button", { name: "Open inspector" }));
    await screen.findByRole("dialog", { name: "Inspector" });

    expect(
      document.querySelector('[data-slot="drawer-edge-swipe-zone"]'),
    ).not.toBeInTheDocument();
  });

  it("does not render the hit-region under an explicit reducedMotion override", () => {
    render(
      <Drawer direction="right" edgeSwipeToOpen reducedMotion>
        <DrawerTrigger>Open inspector</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Inspector</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    expect(
      document.querySelector('[data-slot="drawer-edge-swipe-zone"]'),
    ).not.toBeInTheDocument();
  });

  it("respects a configurable hit-region size", () => {
    render(
      <Drawer direction="top" edgeSwipeHitRegionSize={40} edgeSwipeToOpen>
        <DrawerTrigger>Open banner</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Banner</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const zone = document.querySelector<HTMLElement>(
      '[data-slot="drawer-edge-swipe-zone"]',
    );

    expect(zone).toHaveStyle({ height: "40px" });
  });
});
