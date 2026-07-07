import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  expect,
  userEvent,
  waitFor,
  within,
} from "storybook/test";
import {
  Container,
  DethinkProvider,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  FieldDescription,
  Stack,
  Text,
  defineDethinkTheme,
  drawerBackgroundWrapperClassNames,
} from "@dethink/components";

const drawerTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.98 0.012 225)",
      foreground: "oklch(0.18 0.05 252)",
      muted: "oklch(0.93 0.03 225)",
      mutedForeground: "oklch(0.42 0.07 245)",
      border: "oklch(0.82 0.04 225)",
      ring: "oklch(0.56 0.18 188)",
      primary: "oklch(0.48 0.16 188)",
      primaryForeground: "oklch(0.98 0.012 225)",
    },
    dark: {
      background: "oklch(0.16 0.04 252)",
      foreground: "oklch(0.96 0.02 230)",
      muted: "oklch(0.24 0.05 252)",
      mutedForeground: "oklch(0.76 0.05 230)",
      border: "oklch(0.34 0.05 252)",
      ring: "oklch(0.72 0.15 188)",
      primary: "oklch(0.7 0.15 188)",
      primaryForeground: "oklch(0.15 0.04 252)",
    },
  },
  density: {
    comfortable: {
      control: "3rem",
      gap: "0.875rem",
    },
  },
  radii: {
    lg: "1.25rem",
  },
});

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  argTypes: {
    backgroundScale: {
      control: "boolean",
    },
    defaultOpen: {
      control: "boolean",
    },
    dimension: {
      control: "text",
    },
    direction: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    edgeSwipeToOpen: {
      control: "boolean",
    },
    modal: {
      control: "boolean",
    },
    motionPreset: {
      control: "select",
      options: ["none", "subtle", "standard", "expressive"],
    },
    open: {
      control: false,
    },
    reducedMotion: {
      control: "boolean",
    },
    fullSize: {
      control: "boolean",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Drawer {...args} direction="right">
          <DrawerTrigger>Open cart</DrawerTrigger>
          <DrawerContent dismissible>
            <DrawerHeader>
              <DrawerTitle>Your cart</DrawerTitle>
              <DrawerDescription>
                Review items before checkout.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm text-foreground">
              Two dashboard seats and one report export credit.
            </div>
            <DrawerFooter>
              <DrawerClose variant="outline">Cancel</DrawerClose>
              <DrawerClose>Checkout</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open cart" });

    await userEvent.click(trigger);
    await expect(
      await page.findByRole("dialog", { name: "Your cart" }),
    ).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Checkout" }));
    await waitFor(() => {
      expect(page.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
  },
};

export const Directions: Story = {
  render: function DirectionsStory() {
    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="md">
          <Stack direction="horizontal" gap="3" wrap="wrap">
            {(["top", "bottom", "left", "right"] as const).map((direction) => (
              <Drawer direction={direction} key={direction}>
                <DrawerTrigger variant="outline">
                  Open {direction}
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>{`${direction[0]!.toUpperCase()}${direction.slice(1)} drawer`}</DrawerTitle>
                    <DrawerDescription>
                      Anchored to the {direction} edge.
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <DrawerClose>Close</DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            ))}
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const Sizing: Story = {
  render: function SizingStory() {
    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="md">
          <Stack direction="horizontal" gap="3" wrap="wrap">
            <Drawer direction="right" fullSize>
              <DrawerTrigger variant="outline">Full-height rail</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Full-height rail</DrawerTitle>
                  <DrawerDescription>
                    `fullSize` maps to width for side drawers.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose>Close</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            <Drawer direction="bottom" dimension="72dvh">
              <DrawerTrigger variant="outline">Custom sheet height</DrawerTrigger>
              <DrawerContent>
                <DrawerHandle aria-label="Drag custom-height sheet" />
                <DrawerHeader>
                  <DrawerTitle>Custom sheet height</DrawerTitle>
                  <DrawerDescription>
                    `dimension=&quot;72dvh&quot;` maps to height for top/bottom drawers.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose>Close</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const Controlled: Story = {
  render: function ControlledDrawerStory() {
    const [open, setOpen] = useState(false);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <Drawer direction="bottom" open={open} onOpenChange={setOpen}>
              <DrawerTrigger>Open controlled drawer</DrawerTrigger>
              <DrawerContent>
                {({ close }) => (
                  <>
                    <DrawerHeader>
                      <DrawerTitle>Controlled drawer</DrawerTitle>
                      <DrawerDescription>
                        The open state is owned by the consuming app.
                      </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                      <button
                        className="text-sm text-muted-foreground"
                        type="button"
                        onClick={close}
                      >
                        Close from render prop
                      </button>
                    </DrawerFooter>
                  </>
                )}
              </DrawerContent>
            </Drawer>
            <FieldDescription>Drawer state: {open ? "open" : "closed"}</FieldDescription>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const PersistentInspectorPushPanel: Story = {
  render: function PushPanelStory() {
    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="lg">
          <div className="flex min-h-[24rem] overflow-hidden rounded-lg border border-border">
            <main className="flex-1 p-[var(--dt-space-6)] text-sm text-foreground">
              <p className="font-medium">Record list</p>
              <p className="mt-[var(--dt-space-2)] text-muted-foreground">
                Selecting a row opens a persistent, non-modal inspector rail
                alongside this content instead of overlaying it.
              </p>
            </main>
            <Drawer direction="right" modal={false}>
              <DrawerTrigger className="self-start rounded-none border-b border-border">
                Toggle inspector
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Record inspector</DrawerTitle>
                  <DrawerDescription>
                    Push-mode drawers shift layout instead of overlaying it.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm text-foreground">
                  <button className="text-primary" type="button">
                    Edit record
                  </button>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </Container>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Toggle inspector" });

    await userEvent.click(trigger);
    await expect(
      await canvas.findByRole("dialog", { name: "Record inspector" }),
    ).toBeVisible();
    await expect(canvas.getByText("Record list")).toBeVisible();
  },
};

export const NonDismissable: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Drawer direction="right">
          <DrawerTrigger>Open locked drawer</DrawerTrigger>
          <DrawerContent keyboardDismissDisabled>
            <DrawerHeader>
              <DrawerTitle>Explicit close required</DrawerTitle>
              <DrawerDescription>
                Keyboard dismissal is disabled, so a visible close action remains.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>Close drawer</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="compact" dir="rtl" className="p-6">
      <Container size="sm">
        <Drawer defaultOpen direction="right">
          <DrawerTrigger>Open themed drawer</DrawerTrigger>
          <DrawerContent size="sm">
            <DrawerHeader>
              <DrawerTitle>Workspace direction</DrawerTitle>
              <DrawerDescription>
                Provider theme, density, and direction cross the portal. The
                `right` anchor stays physical and does not flip under RTL.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole("dialog", { name: "Workspace direction" });
    const portalHost = dialog.closest<HTMLElement>(
      '[data-slot="drawer-portal-container"]',
    );

    if (!portalHost) {
      throw new Error("Drawer story expected a provider-aware portal host.");
    }

    await expect(portalHost).toHaveAttribute("data-theme", "dark");
    await expect(portalHost).toHaveAttribute("data-density", "compact");
    await expect(portalHost).toHaveAttribute("dir", "rtl");
  },
};

export const BottomSheetWithSnapPoints: Story = {
  render: function SnapPointsStory() {
    const [activeSnapPoint, setActiveSnapPoint] = useState(0.5);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <Drawer
              activeSnapPoint={activeSnapPoint}
              direction="bottom"
              onActiveSnapPointChange={setActiveSnapPoint}
              snapPoints={[0.3, 0.6, 1]}
            >
              <DrawerTrigger>Open filters sheet</DrawerTrigger>
              <DrawerContent>
                <DrawerHandle aria-label="Drag to resize filters sheet" />
                <DrawerHeader>
                  <DrawerTitle>Filters</DrawerTitle>
                  <DrawerDescription>
                    Drag the handle between 30%, 60%, and fully open, or flick
                    down fast to dismiss before reaching the lowest stop.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm text-foreground">
                  Status, owner, and last-updated filters live here.
                </div>
              </DrawerContent>
            </Drawer>
            <FieldDescription>
              Active snap point: {activeSnapPoint}
            </FieldDescription>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Open filters sheet" }));
    await expect(
      await page.findByRole("dialog", { name: "Filters" }),
    ).toBeVisible();
    await expect(page.getByLabelText("Drag to resize filters sheet")).toBeVisible();
  },
};

export const DragToDismiss: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Drawer defaultOpen direction="bottom">
          <DrawerTrigger>Open dismissable sheet</DrawerTrigger>
          <DrawerContent dismissible>
            <DrawerHandle aria-label="Drag down to dismiss" />
            <DrawerHeader>
              <DrawerTitle>Quick preview</DrawerTitle>
              <DrawerDescription>
                A slow drag needs to cross the close threshold distance; a fast
                downward flick dismisses immediately regardless of distance.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);

    await expect(
      await page.findByRole("dialog", { name: "Quick preview" }),
    ).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(page.queryByRole("dialog")).not.toBeInTheDocument();
    });
  },
};

export const ReducedMotionFallback: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Drawer defaultOpen direction="bottom" reducedMotion snapPoints={[0.4, 1]}>
          <DrawerTrigger>Open sheet</DrawerTrigger>
          <DrawerContent dismissible>
            <DrawerHandle aria-label="Static handle, drag disabled" />
            <DrawerHeader>
              <DrawerTitle>Reduced motion</DrawerTitle>
              <DrawerDescription>
                The handle is a static, non-interactive bar and drag is fully
                disabled, but trigger, close, outside click, and Escape still
                open and close the sheet through plain CSS transitions.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole("dialog", { name: "Reduced motion" });
    const content = dialog.closest<HTMLElement>('[data-slot="drawer-content"]');

    if (!content) {
      throw new Error("Drawer reduced-motion story expected rendered content.");
    }

    await expect(content).toHaveClass(
      "motion-safe:transition-[transform,opacity,filter]",
    );
    await userEvent.click(page.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(page.queryByRole("dialog")).not.toBeInTheDocument();
    });
  },
};

export const PersistentInspectorWithHandle: Story = {
  render: function PushHandleStory() {
    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="lg">
          <div className="flex min-h-[24rem] overflow-hidden rounded-lg border border-border">
            <main className="flex-1 p-[var(--dt-space-6)] text-sm text-foreground">
              <p className="font-medium">Record list</p>
              <p className="mt-[var(--dt-space-2)] text-muted-foreground">
                The inspector rail supports the same handle and snap points as
                an overlay drawer, without trapping focus or dimming this
                content.
              </p>
            </main>
            <Drawer defaultOpen direction="right" modal={false} snapPoints={[0.5, 1]}>
              <DrawerTrigger className="self-start rounded-none border-b border-border">
                Toggle inspector
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHandle aria-label="Drag to resize inspector" />
                <DrawerHeader>
                  <DrawerTitle>Record inspector</DrawerTitle>
                  <DrawerDescription>
                    Drag the handle to widen or narrow the panel.
                  </DrawerDescription>
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
          </div>
        </Container>
      </DethinkProvider>
    );
  },
};

export const NestedDrillDownEdit: Story = {
  render: function NestedDrillDownEditStory() {
    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Drawer defaultOpen direction="right">
            <DrawerTrigger>Open record</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Record</DrawerTitle>
                <DrawerDescription>
                  Opening the nested edit drawer recedes this one — same
                  spring primitives as drag-to-dismiss, not a separate
                  animation path.
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm text-foreground">
                Status: <span className="font-medium">In review</span>
              </div>
              <Drawer direction="right">
                <DrawerTrigger className="ms-[var(--dt-space-6)]" variant="outline">
                  Edit status
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Edit status</DrawerTitle>
                    <DrawerDescription>
                      A drawer opened from inside another drawer.
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <DrawerClose>Done</DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </DrawerContent>
          </Drawer>
        </Container>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const parentDialog = await page.findByRole("dialog", { name: "Record" });
    const parentContent = parentDialog.closest<HTMLElement>(
      '[data-slot="drawer-content"]',
    );

    if (!parentContent) {
      throw new Error("Expected the parent drawer's content element.");
    }

    await expect(parentContent).not.toHaveAttribute("data-drawer-receded", "true");

    await userEvent.click(canvas.getByRole("button", { name: "Edit status" }));
    await page.findByRole("dialog", { name: "Edit status" });

    await waitFor(() => {
      expect(parentContent).toHaveAttribute("data-drawer-receded", "true");
    });

    await userEvent.click(page.getByRole("button", { name: "Done" }));

    await waitFor(() => {
      expect(page.queryByRole("dialog", { name: "Edit status" })).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(parentContent).not.toHaveAttribute("data-drawer-receded", "true");
    });
  },
};

export const SharedElementEntrance: Story = {
  render: function SharedElementEntranceStory() {
    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <FieldDescription>
              `DrawerContent`&apos;s `layoutId` is a passthrough to the
              underlying Motion element. Pair it with a `motion.*` trigger
              elsewhere in your app sharing the same `layoutId` for a
              shared-layout &quot;magic move&quot; entrance; this story
              exercises the passthrough itself.
            </FieldDescription>
            <Drawer direction="bottom">
              <DrawerTrigger>Open card</DrawerTrigger>
              <DrawerContent layoutId="drawer-shared-card-1">
                <DrawerHeader>
                  <DrawerTitle>Shared card</DrawerTitle>
                  <DrawerDescription>
                    This content carries `layoutId=&quot;drawer-shared-card-1&quot;`.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose>Close</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Open card" }));
    await expect(
      await page.findByRole("dialog", { name: "Shared card" }),
    ).toBeVisible();
  },
};

export const MotionPresets: Story = {
  render: function MotionPresetsStory() {
    const presets = ["none", "subtle", "standard", "expressive"] as const;

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="md">
          <Stack direction="horizontal" gap="3" wrap="wrap">
            {presets.map((motionPreset) => (
              <Drawer direction="bottom" key={motionPreset} motionPreset={motionPreset}>
                <DrawerTrigger variant="outline">{motionPreset}</DrawerTrigger>
                <DrawerContent>
                  <DrawerHandle aria-label={`Drag handle (${motionPreset})`} />
                  <DrawerHeader>
                    <DrawerTitle>{`${motionPreset} preset`}</DrawerTitle>
                    <DrawerDescription>
                      Duration, spring stiffness, and recede/drag feel all
                      come from this preset. `none` always falls back to
                      the CSS-only path.
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <DrawerClose>Close</DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            ))}
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    for (const motionPreset of ["none", "subtle", "standard", "expressive"]) {
      await userEvent.click(canvas.getByRole("button", { name: motionPreset }));

      const dialog = await page.findByRole("dialog", { name: `${motionPreset} preset` });
      const content = dialog.closest<HTMLElement>('[data-slot="drawer-content"]');

      await expect(content).toHaveAttribute("data-motion", motionPreset);

      await userEvent.click(page.getByRole("button", { name: "Close" }));
      await waitFor(() => {
        expect(page.queryByRole("dialog")).not.toBeInTheDocument();
      });
    }
  },
};
export const BackgroundScale: Story = {
  render: function BackgroundScaleStory() {
    return (
      <DethinkProvider theme="light" className="p-6">
        <div
          data-drawer-background-wrapper=""
          className={drawerBackgroundWrapperClassNames({
            className: "rounded-lg border border-border bg-background p-[var(--dt-space-6)]",
          })}
        >
          <p className="text-sm font-medium text-foreground">Dashboard</p>
          <p className="mt-[var(--dt-space-2)] text-sm text-muted-foreground">
            The element carrying `data-drawer-background-wrapper` scales down
            and dims while a `backgroundScale` modal Drawer is open, the
            iOS-style effect vaul calls `shouldScaleBackground`.
          </p>
          <Container size="sm">
            <Drawer backgroundScale direction="bottom">
              <DrawerTrigger className="mt-[var(--dt-space-3)]">
                Open sheet
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Background scales down</DrawerTitle>
                  <DrawerDescription>
                    Close this sheet to see the page content scale back up.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose>Close</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </Container>
        </div>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const wrapper = canvasElement.querySelector<HTMLElement>(
      "[data-drawer-background-wrapper]",
    );

    if (!wrapper) {
      throw new Error("Expected a data-drawer-background-wrapper element.");
    }

    await expect(wrapper).not.toHaveAttribute("data-drawer-background-scale");

    await userEvent.click(canvas.getByRole("button", { name: "Open sheet" }));
    await page.findByRole("dialog", { name: "Background scales down" });

    await waitFor(() => {
      expect(wrapper).toHaveAttribute("data-drawer-background-scale", "scaled");
    });

    await userEvent.click(page.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(wrapper).not.toHaveAttribute("data-drawer-background-scale");
    });
  },
};

export const BackgroundScaleReducedMotion: Story = {
  render: function BackgroundScaleReducedMotionStory() {
    return (
      <DethinkProvider theme="light" className="p-6">
        <div
          data-drawer-background-wrapper=""
          className={drawerBackgroundWrapperClassNames({
            className: "rounded-lg border border-border bg-background p-[var(--dt-space-6)]",
          })}
        >
          <p className="text-sm font-medium text-foreground">Dashboard</p>
          <p className="mt-[var(--dt-space-2)] text-sm text-muted-foreground">
            Under reduced motion the wrapper only dims. It never scales,
            regardless of `backgroundScale`.
          </p>
          <Container size="sm">
            <Drawer backgroundScale direction="bottom" reducedMotion>
              <DrawerTrigger className="mt-[var(--dt-space-3)]">
                Open sheet
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Dim-only fallback</DrawerTitle>
                  <DrawerDescription>
                    The scale transform is dropped; only the dim/opacity
                    transition remains.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose>Close</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </Container>
        </div>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const wrapper = canvasElement.querySelector<HTMLElement>(
      "[data-drawer-background-wrapper]",
    );

    if (!wrapper) {
      throw new Error("Expected a data-drawer-background-wrapper element.");
    }

    await userEvent.click(canvas.getByRole("button", { name: "Open sheet" }));
    await page.findByRole("dialog", { name: "Dim-only fallback" });

    await waitFor(() => {
      expect(wrapper).toHaveAttribute("data-drawer-background-scale", "dimmed");
    });
  },
};

export const EdgeSwipeToOpen: Story = {
  render: function EdgeSwipeToOpenStory() {
    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <FieldDescription>
              Swipe from the left edge of this frame toward the center, or
              use the trigger below.
            </FieldDescription>
            <Drawer direction="left" edgeSwipeToOpen>
              <DrawerTrigger variant="outline">Open navigation</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Navigation</DrawerTitle>
                  <DrawerDescription>
                    Opened via the trigger or an edge swipe from the left.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose>Close</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const zone = canvasElement.querySelector('[data-slot="drawer-edge-swipe-zone"]');

    await expect(zone).toHaveAttribute("data-direction", "left");
    await expect(zone).toHaveAttribute("aria-hidden", "true");

    await userEvent.click(canvas.getByRole("button", { name: "Open navigation" }));
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole("dialog", {
        name: "Navigation",
      }),
    ).toBeVisible();
    await expect(
      canvasElement.querySelector('[data-slot="drawer-edge-swipe-zone"]'),
    ).not.toBeInTheDocument();
  },
};

export const EdgeSwipeToOpenRTL: Story = {
  render: function EdgeSwipeToOpenRTLStory() {
    return (
      <DethinkProvider theme="light" dir="rtl" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <FieldDescription>
              In an RTL provider, pick `direction="right"` for a
              reading-direction-conventional navigation drawer — the edge
              hit-region follows the drawer's own physical `direction` and
              does not auto-flip.
            </FieldDescription>
            <Drawer direction="right" edgeSwipeToOpen>
              <DrawerTrigger variant="outline">فتح التنقل</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>التنقل</DrawerTitle>
                  <DrawerDescription>
                    Opened via the trigger or an edge swipe from the right.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose>إغلاق</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const zone = canvasElement.querySelector('[data-slot="drawer-edge-swipe-zone"]');

    await expect(zone).toHaveAttribute("data-direction", "right");
  },
};

export const EdgeSwipeDisabledByDefault: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Drawer direction="left">
          <DrawerTrigger variant="outline">Open navigation</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Navigation</DrawerTitle>
              <DrawerDescription>
                `edgeSwipeToOpen` defaults to `false`: no hit-region is
                rendered, and only the trigger opens this drawer.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="drawer-edge-swipe-zone"]'),
    ).not.toBeInTheDocument();
  },
};

function DrawerThemeMatrixSet({ label }: { label: string }) {
  return (
    <Stack gap="3">
      <Stack direction="horizontal" gap="2" wrap="wrap">
        {(["top", "bottom", "left", "right"] as const).map((direction) => (
          <Drawer direction={direction} key={direction}>
            <DrawerTrigger variant="outline">{`${label} ${direction}`}</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{`${label} ${direction}`}</DrawerTitle>
                <DrawerDescription>Modal mode.</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose>Close</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ))}
      </Stack>
      <div className="flex min-h-[8rem] overflow-hidden rounded-md border border-border">
        <main className="flex-1 p-[var(--dt-space-3)] text-xs text-muted-foreground">
          Push-mode sibling content
        </main>
        <Drawer defaultOpen direction="right" modal={false}>
          <DrawerTrigger
            className="self-start rounded-none border-b border-border"
            variant="ghost"
          >
            {`${label} push`}
          </DrawerTrigger>
          <DrawerContent size="sm">
            <DrawerHeader>
              <DrawerTitle>{`${label} push`}</DrawerTitle>
              <DrawerDescription>Non-modal push mode.</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </div>
    </Stack>
  );
}

export const ProviderThemeMatrix: Story = {
  render: () => (
    <DethinkProvider theme="system" className="p-6">
      <Container size="lg">
        <Stack gap="6">
          <div>
            <Text className="mb-[var(--dt-space-2)]" size="sm" tone="muted">
              Light theme, default density — every direction (modal) plus a
              push-mode panel.
            </Text>
            <DethinkProvider theme="light" density="default">
              <DrawerThemeMatrixSet label="Light" />
            </DethinkProvider>
          </div>
          <div>
            <Text className="mb-[var(--dt-space-2)]" size="sm" tone="muted">
              Dark theme, compact density, RTL direction.
            </Text>
            <DethinkProvider theme="dark" density="compact" dir="rtl">
              <DrawerThemeMatrixSet label="Dark" />
            </DethinkProvider>
          </div>
          <div>
            <Text className="mb-[var(--dt-space-2)]" size="sm" tone="muted">
              System theme, comfortable density.
            </Text>
            <DethinkProvider theme="system" density="comfortable">
              <DrawerThemeMatrixSet label="System" />
            </DethinkProvider>
          </div>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
};

export const NestedProviderPortalScope: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="3">
          <Text size="sm" tone="muted">
            The nested provider owns portal theme, density, direction, and
            custom token scope for both modal and push-mode drawers.
          </Text>
          <DethinkProvider
            theme="dark"
            density="compact"
            dir="rtl"
            themeConfig={drawerTheme}
            className="rounded-md border border-border p-3"
          >
            <Stack gap="3">
              <Drawer defaultOpen direction="right">
                <DrawerTrigger>Nested modal drawer</DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Nested modal</DrawerTitle>
                  </DrawerHeader>
                  <DrawerFooter>
                    <DrawerClose>Close</DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
              <div className="flex min-h-[6rem] overflow-hidden rounded-md border border-border">
                <main className="flex-1 p-[var(--dt-space-2)] text-xs text-muted-foreground">
                  Sibling content
                </main>
                <Drawer defaultOpen direction="right" modal={false}>
                  <DrawerTrigger
                    className="self-start rounded-none border-b border-border"
                    variant="ghost"
                  >
                    Nested push drawer
                  </DrawerTrigger>
                  <DrawerContent size="sm">
                    <DrawerHeader>
                      <DrawerTitle>Nested push</DrawerTitle>
                    </DrawerHeader>
                  </DrawerContent>
                </Drawer>
              </div>
            </Stack>
          </DethinkProvider>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const modalDialog = await page.findByRole("dialog", { name: "Nested modal" });
    const modalPortal = modalDialog.closest<HTMLElement>(
      '[data-slot="drawer-portal-container"]',
    );

    if (!modalPortal) {
      throw new Error("Expected a provider-aware portal host for the modal drawer.");
    }

    await expect(modalPortal).toHaveAttribute("data-theme", "dark");
    await expect(modalPortal).toHaveAttribute("data-density", "compact");
    await expect(modalPortal).toHaveAttribute("dir", "rtl");

    const pushDialog = await page.findByRole("dialog", { name: "Nested push" });
    const pushContent = pushDialog.closest<HTMLElement>('[data-slot="drawer-content"]');

    await expect(pushContent).toBeVisible();
  },
};

export const ThemeOverrides: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      density="comfortable"
      themeConfig={drawerTheme}
      className="min-h-[24rem] p-6"
    >
      <Container size="sm">
        <Drawer defaultOpen direction="right">
          <DrawerTrigger>Open themed override drawer</DrawerTrigger>
          <DrawerContent showCloseButton closeButtonLabel="Close themed drawer">
            <DrawerHeader>
              <DrawerTitle>Operations review</DrawerTitle>
              <DrawerDescription>
                Provider-level colors, radius, and density flow through the
                drawer portal.
              </DrawerDescription>
            </DrawerHeader>
            <div className="grid gap-[var(--dt-space-4)] px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm text-foreground">
              <div className="rounded-md border border-border bg-muted p-[var(--dt-space-4)]">
                Theme tokens active
              </div>
              <span className="w-fit rounded-sm bg-primary px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-center text-xs font-medium text-primary-foreground">
                Primary
              </span>
            </div>
            <DrawerFooter>
              <DrawerClose variant="outline">Cancel</DrawerClose>
              <DrawerClose>Approve</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole("dialog", { name: "Operations review" });
    const portalHost = dialog.closest<HTMLElement>(
      '[data-slot="drawer-portal-container"]',
    );

    if (!portalHost) {
      throw new Error("Drawer story expected a provider-aware portal host.");
    }

    await expect(portalHost).toHaveAttribute("data-theme", "light");
    await expect(portalHost).toHaveAttribute("data-density", "comfortable");
    await expect(portalHost).toHaveStyle({
      "--dt-color-background-light": "oklch(0.98 0.012 225)",
      "--dt-radius-lg": "1.25rem",
    });
  },
};
