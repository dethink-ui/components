import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTrigger,
  tabsPanelClassNames,
  tabsTriggerClassNames,
  type TabsProps,
  type TabsValue,
} from ".";

function BasicTabs(props: Partial<TabsProps> = {}) {
  return (
    <Tabs aria-label="Workspace sections" {...props}>
      <TabsList aria-label="Workspace sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsPanel value="overview">Overview panel</TabsPanel>
      <TabsPanel value="billing">Billing panel</TabsPanel>
      <TabsPanel value="security">Security panel</TabsPanel>
    </Tabs>
  );
}

describe("Tabs state and anatomy", () => {
  it("renders the first enabled tab as selected by default", () => {
    render(<BasicTabs />);

    const overview = screen.getByRole("tab", { name: "Overview" });
    const panel = screen.getByRole("tabpanel", { name: "Overview" });

    expect(screen.getByRole("tablist", { name: "Workspace sections" }));
    expect(overview).toHaveAttribute("aria-selected", "true");
    expect(overview).toHaveAttribute("data-state", "active");
    expect(overview).toHaveAttribute("data-selected", "true");
    expect(overview).toHaveAttribute("tabindex", "0");
    expect(panel).toHaveTextContent("Overview panel");
    expect(overview.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(overview.id);
    expect(
      overview.querySelector('[data-slot="tabs-active-layer"]'),
    ).toBeTruthy();
  });

  it("selects tabs with pointer input and reports value changes once", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicTabs defaultValue="overview" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("tab", { name: "Billing" }));

    expect(screen.getByRole("tab", { name: "Billing" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel", { name: "Billing" })).toHaveTextContent(
      "Billing panel",
    );
    expect(screen.queryByText("Overview panel")).not.toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("billing");
  });

  it("keeps controlled value owned by the parent", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicTabs value="overview" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("tab", { name: "Billing" }));

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(onValueChange).toHaveBeenCalledWith("billing");
  });

  it("follows controlled updates from the parent", async () => {
    function Harness() {
      const [value, setValue] = useState<TabsValue>("overview");

      return <BasicTabs value={value} onValueChange={setValue} />;
    }

    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("tab", { name: "Security" }));

    expect(screen.getByRole("tab", { name: "Security" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("tabpanel", { name: "Security" }),
    ).toHaveTextContent("Security panel");
  });

  it("preserves inactive force-mounted panels while hidden", () => {
    render(
      <Tabs defaultValue="one">
        <Tabs.List aria-label="Sections">
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger value="two">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="one">One panel</Tabs.Panel>
        <Tabs.Panel forceMount data-testid="two-panel" value="two">
          Two panel
        </Tabs.Panel>
      </Tabs>,
    );

    expect(screen.getByText("Two panel")).toBeInTheDocument();
    expect(screen.getByTestId("two-panel")).not.toBeVisible();
    expect(screen.getByTestId("two-panel")).toHaveAttribute(
      "data-state",
      "inactive",
    );
  });

  it("keeps collapsible triggers labeled and icon-bearing while collapsed", () => {
    render(
      <Tabs collapsible defaultValue="explore">
        <Tabs.List aria-label="Rail">
          <Tabs.Trigger
            value="explore"
            icon={<svg data-testid="explore-icon" aria-hidden />}
          >
            Explore
          </Tabs.Trigger>
          <Tabs.Trigger
            value="inbox"
            icon={<svg data-testid="inbox-icon" aria-hidden />}
          >
            Inbox
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="explore">Explore panel</Tabs.Panel>
        <Tabs.Panel value="inbox">Inbox panel</Tabs.Panel>
      </Tabs>,
    );

    // The selected trigger and the collapsed trigger both keep their text as the
    // accessible name, so the label must stay in the DOM even while visually clipped.
    const explore = screen.getByRole("tab", { name: "Explore" });
    const inbox = screen.getByRole("tab", { name: "Inbox" });

    expect(explore).toHaveAttribute("data-selected", "true");
    expect(explore).toHaveAttribute("data-collapsible", "true");
    expect(inbox).not.toHaveAttribute("data-selected");
    expect(inbox).toHaveAttribute("data-collapsible", "true");
    expect(screen.getByTestId("explore-icon")).toBeInTheDocument();
    expect(screen.getByTestId("inbox-icon")).toBeInTheDocument();
    expect(inbox).toHaveTextContent("Inbox");
  });

  it("composes refs, class names, variants, and size data", () => {
    const rootRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();

    render(
      <Tabs
        ref={rootRef}
        className="custom-tabs"
        defaultValue="one"
        size="lg"
        variant="line"
      >
        <Tabs.List className="custom-list" aria-label="Sections">
          <Tabs.Trigger ref={triggerRef} className="custom-trigger" value="one">
            One
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel className="custom-panel" value="one">
          One panel
        </Tabs.Panel>
      </Tabs>,
    );

    expect(rootRef.current).toHaveAttribute("data-slot", "tabs");
    expect(rootRef.current).toHaveAttribute("data-variant", "line");
    expect(rootRef.current).toHaveAttribute("data-size", "lg");
    expect(rootRef.current).toHaveClass("custom-tabs");
    expect(triggerRef.current).toHaveClass("custom-trigger");
    expect(screen.getByRole("tablist")).toHaveClass("custom-list");
    expect(screen.getByRole("tabpanel")).toHaveClass("custom-panel");
  });

  it("exposes class-name helpers", () => {
    expect(tabsTriggerClassNames({ variant: "line" })).toContain(
      "data-[selected=true]:text-primary",
    );
    expect(tabsPanelClassNames({ className: "extra" })).toContain("extra");
  });
});

describe("Tabs keyboard behavior", () => {
  it("moves focus with horizontal arrows, Home, and End while skipping disabled tabs", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="one">
        <Tabs.List aria-label="Sections">
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger disabled value="two">
            Two
          </Tabs.Trigger>
          <Tabs.Trigger value="three">Three</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="one">One panel</Tabs.Panel>
        <Tabs.Panel value="two">Two panel</Tabs.Panel>
        <Tabs.Panel value="three">Three panel</Tabs.Panel>
      </Tabs>,
    );

    const one = screen.getByRole("tab", { name: "One" });
    const three = screen.getByRole("tab", { name: "Three" });

    one.focus();
    await user.keyboard("{ArrowRight}");
    expect(three).toHaveFocus();
    expect(three).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowRight}");
    expect(one).toHaveFocus();

    await user.keyboard("{End}");
    expect(three).toHaveFocus();

    await user.keyboard("{Home}");
    expect(one).toHaveFocus();
  });

  it("respects loop=false at tablist boundaries", async () => {
    const user = userEvent.setup();
    render(<BasicTabs loop={false} />);

    const overview = screen.getByRole("tab", { name: "Overview" });

    overview.focus();
    await user.keyboard("{ArrowLeft}");

    expect(overview).toHaveFocus();
  });

  it("uses vertical arrow keys in vertical orientation", async () => {
    const user = userEvent.setup();
    render(<BasicTabs orientation="vertical" />);

    const tablist = screen.getByRole("tablist", {
      name: "Workspace sections",
    });
    const overview = screen.getByRole("tab", { name: "Overview" });
    const billing = screen.getByRole("tab", { name: "Billing" });

    expect(tablist).toHaveAttribute("aria-orientation", "vertical");

    overview.focus();
    await user.keyboard("{ArrowDown}");
    expect(billing).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(overview).toHaveFocus();
  });

  it("requires Enter or Space in manual activation mode", async () => {
    const user = userEvent.setup();
    render(<BasicTabs activationMode="manual" />);

    const overview = screen.getByRole("tab", { name: "Overview" });
    const billing = screen.getByRole("tab", { name: "Billing" });

    overview.focus();
    await user.keyboard("{ArrowRight}");

    expect(billing).toHaveFocus();
    expect(overview).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Enter}");

    expect(billing).toHaveAttribute("aria-selected", "true");
  });

  it("resolves horizontal arrow direction in RTL", async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <BasicTabs defaultValue="billing" />
      </div>,
    );

    const billing = screen.getByRole("tab", { name: "Billing" });
    const overview = screen.getByRole("tab", { name: "Overview" });

    billing.focus();
    await user.keyboard("{ArrowRight}");

    expect(overview).toHaveFocus();
  });
});

describe("Tabs motion states", () => {
  it("renders enabled shared-layout active layer by default", () => {
    render(<BasicTabs defaultValue="billing" />);

    const billing = screen.getByRole("tab", { name: "Billing" });
    const activeLayer = billing.querySelector(
      '[data-slot="tabs-active-layer"]',
    );

    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "pill");
    expect(billing).toHaveAttribute("data-motion-preset", "standard");
    expect(activeLayer).toHaveAttribute("aria-hidden", "true");
    expect(activeLayer).toHaveAttribute("data-motion-enabled", "true");
    expect(activeLayer).toHaveAttribute("data-motion-preset", "standard");
  });

  it("renders a static active layer for motionPreset='none'", () => {
    render(<BasicTabs defaultValue="billing" motionPreset="none" />);

    const root = screen
      .getByRole("tab", { name: "Billing" })
      .closest('[data-slot="tabs"]');
    const activeLayer = screen
      .getByRole("tab", { name: "Billing" })
      .querySelector('[data-slot="tabs-active-layer"]');

    expect(root).toHaveAttribute("data-reduced-motion", "true");
    expect(activeLayer).toHaveAttribute("data-reduced-motion", "true");
    expect(activeLayer).not.toHaveAttribute("data-motion-enabled");
  });

  it("disables all triggers when the root is disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <BasicTabs
        defaultValue="overview"
        disabled
        onValueChange={onValueChange}
      />,
    );

    const billing = screen.getByRole("tab", { name: "Billing" });

    expect(billing).toBeDisabled();

    await user.click(billing);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
