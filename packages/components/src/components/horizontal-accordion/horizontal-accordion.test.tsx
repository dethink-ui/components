import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  HorizontalAccordion,
  HorizontalAccordionBlade,
  HorizontalAccordionItem,
  HorizontalAccordionPanel,
  type HorizontalAccordionProps,
  type HorizontalAccordionValue,
} from "./horizontal-accordion";

function BasicAccordion(props: Partial<HorizontalAccordionProps>) {
  return (
    <HorizontalAccordion {...props}>
      <HorizontalAccordion.Item value="one" data-testid="item-one">
        <HorizontalAccordion.Blade>One</HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel data-testid="panel-one">
          One panel
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="two" data-testid="item-two">
        <HorizontalAccordion.Blade>Two</HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel data-testid="panel-two">
          Two panel
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
    </HorizontalAccordion>
  );
}

function itemState(testId: string) {
  return screen.getByTestId(testId).getAttribute("data-state");
}

describe("HorizontalAccordion state", () => {
  it("renders with no active item when no defaultValue is provided", () => {
    render(<BasicAccordion />);

    expect(itemState("item-one")).toBe("inactive");
    expect(itemState("item-two")).toBe("inactive");
    expect(screen.getByTestId("panel-one")).not.toBeVisible();
    expect(screen.getByTestId("panel-two")).not.toBeVisible();
  });

  it("activates the defaultValue item in uncontrolled mode", () => {
    render(<BasicAccordion defaultValue="two" />);

    expect(itemState("item-two")).toBe("active");
    expect(screen.getByTestId("panel-two")).toBeVisible();
    expect(screen.getByTestId("panel-one")).not.toBeVisible();
  });

  it("activates an inactive blade on click and reports the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicAccordion onValueChange={onValueChange} />);

    await user.click(screen.getByText("Two"));

    expect(itemState("item-two")).toBe("active");
    expect(onValueChange).toHaveBeenCalledWith("two");
  });

  it("collapses the active item when its blade is clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicAccordion defaultValue="one" onValueChange={onValueChange} />);

    await user.click(screen.getByText("One"));

    expect(itemState("item-one")).toBe("inactive");
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  it("does not collapse the active item when collapsible is false", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <BasicAccordion
        collapsible={false}
        defaultValue="one"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByText("One"));

    expect(itemState("item-one")).toBe("active");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps controlled state owned by the parent", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicAccordion value="one" onValueChange={onValueChange} />);

    await user.click(screen.getByText("Two"));

    expect(itemState("item-one")).toBe("active");
    expect(itemState("item-two")).toBe("inactive");
    expect(onValueChange).toHaveBeenCalledWith("two");
  });

  it("follows controlled value updates from the parent", async () => {
    function ControlledHarness() {
      const [value, setValue] = useState<HorizontalAccordionValue>("one");

      return <BasicAccordion value={value} onValueChange={setValue} />;
    }

    const user = userEvent.setup();
    render(<ControlledHarness />);

    await user.click(screen.getByText("Two"));

    expect(itemState("item-two")).toBe("active");

    await user.click(screen.getByText("Two"));

    expect(itemState("item-two")).toBe("inactive");
  });

  it("treats an explicit undefined value as controlled and collapsed", () => {
    render(<BasicAccordion value={undefined} />);

    expect(itemState("item-one")).toBe("inactive");
    expect(itemState("item-two")).toBe("inactive");
  });
});

describe("HorizontalAccordion panels", () => {
  it("keeps inactive panel content mounted by default", () => {
    render(<BasicAccordion defaultValue="one" />);

    expect(screen.getByText("Two panel")).toBeInTheDocument();
  });

  it("unmounts inactive panel children with unmountInactivePanels", () => {
    render(<BasicAccordion defaultValue="one" unmountInactivePanels />);

    expect(screen.queryByText("Two panel")).not.toBeInTheDocument();
    expect(screen.getByText("One panel")).toBeInTheDocument();
  });
});

describe("HorizontalAccordion composition", () => {
  it("throws for duplicate item values in development", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() =>
      render(
        <HorizontalAccordion>
          <HorizontalAccordionItem value="one">
            <HorizontalAccordionBlade>One</HorizontalAccordionBlade>
            <HorizontalAccordionPanel>One panel</HorizontalAccordionPanel>
          </HorizontalAccordionItem>
          <HorizontalAccordionItem value="one">
            <HorizontalAccordionBlade>Duplicate</HorizontalAccordionBlade>
            <HorizontalAccordionPanel>Duplicate panel</HorizontalAccordionPanel>
          </HorizontalAccordionItem>
        </HorizontalAccordion>,
      ),
    ).toThrow('Duplicate HorizontalAccordion.Item value "one".');

    consoleError.mockRestore();
  });

  it("throws when an item does not contain exactly one blade and one panel", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() =>
      render(
        <HorizontalAccordion>
          <HorizontalAccordionItem value="one">
            <HorizontalAccordionBlade>One</HorizontalAccordionBlade>
          </HorizontalAccordionItem>
        </HorizontalAccordion>,
      ),
    ).toThrow(
      'HorizontalAccordion.Item "one" must contain exactly one Blade and one Panel.',
    );

    consoleError.mockRestore();
  });

  it("supports named-export composition alongside static properties", async () => {
    const user = userEvent.setup();
    render(
      <HorizontalAccordion>
        <HorizontalAccordionItem value="one" data-testid="item-one">
          <HorizontalAccordionBlade>One</HorizontalAccordionBlade>
          <HorizontalAccordionPanel>One panel</HorizontalAccordionPanel>
        </HorizontalAccordionItem>
      </HorizontalAccordion>,
    );

    await user.click(screen.getByText("One"));

    expect(itemState("item-one")).toBe("active");
  });

  it("throws when parts are used outside the accordion", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() =>
      render(<HorizontalAccordionPanel>Loose panel</HorizontalAccordionPanel>),
    ).toThrow("HorizontalAccordion.Panel must be used within HorizontalAccordion.");

    consoleError.mockRestore();
  });
});

function ThreeItemAccordion(props: Partial<HorizontalAccordionProps>) {
  return (
    <HorizontalAccordion {...props}>
      <HorizontalAccordion.Item value="one" data-testid="item-one">
        <HorizontalAccordion.Blade>One</HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>One panel</HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="two" data-testid="item-two">
        <HorizontalAccordion.Blade>Two</HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>Two panel</HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="three" data-testid="item-three">
        <HorizontalAccordion.Blade>Three</HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>Three panel</HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
    </HorizontalAccordion>
  );
}

function DisabledMiddleAccordion(props: Partial<HorizontalAccordionProps>) {
  return (
    <HorizontalAccordion {...props}>
      <HorizontalAccordion.Item value="one">
        <HorizontalAccordion.Blade>One</HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>One panel</HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="two">
        <HorizontalAccordion.Blade disabled>Two</HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>Two panel</HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="three">
        <HorizontalAccordion.Blade>Three</HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>Three panel</HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
    </HorizontalAccordion>
  );
}

describe("HorizontalAccordion disclosure semantics", () => {
  it("wires blades and panels with the disclosure pattern", () => {
    render(<BasicAccordion aria-label="Sections" defaultValue="one" />);

    const group = screen.getByRole("group", { name: "Sections" });
    const activeBlade = screen.getByRole("button", { name: "One" });
    const panel = screen.getByRole("region", { name: "One" });

    expect(group).toBeInTheDocument();
    expect(activeBlade).toHaveAttribute("aria-expanded", "true");
    expect(activeBlade).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", activeBlade.id);
    expect(screen.getByRole("button", { name: "Two" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("keeps exactly one blade in the tab order", () => {
    render(<ThreeItemAccordion defaultValue="two" />);

    expect(screen.getByRole("button", { name: "Two" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(screen.getByRole("button", { name: "Three" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("falls back to the first enabled blade as the tab stop", () => {
    render(<DisabledMiddleAccordion />);

    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(screen.getByRole("button", { name: "Two" })).not.toHaveAttribute(
      "tabindex",
    );
  });
});

describe("HorizontalAccordion keyboard", () => {
  it("moves focus with arrow keys and wraps at the edges", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion />);

    await user.tab();
    expect(screen.getByRole("button", { name: "One" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Two" })).toHaveFocus();

    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByRole("button", { name: "One" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Three" })).toHaveFocus();
  });

  it("skips disabled blades during arrow navigation", async () => {
    const user = userEvent.setup();
    render(<DisabledMiddleAccordion />);

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("button", { name: "Three" })).toHaveFocus();
  });

  it("supports Home and End", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion defaultValue="two" />);

    await user.tab();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Three" })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "One" })).toHaveFocus();
  });

  it("activates the focused blade with Enter and Space", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion />);

    await user.tab();
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");
    expect(itemState("item-two")).toBe("active");

    await user.keyboard("{ArrowRight}");
    await user.keyboard(" ");
    expect(itemState("item-three")).toBe("active");
  });

  it("does not activate on focus in manual activation mode", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion />);

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(itemState("item-two")).toBe("inactive");
  });

  it("activates on focus in automatic activation mode", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion activationMode="automatic" />);

    await user.tab();
    expect(itemState("item-one")).toBe("active");

    await user.keyboard("{ArrowRight}");
    expect(itemState("item-two")).toBe("active");
  });

  it("flips arrow direction in RTL", async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <ThreeItemAccordion />
      </div>,
    );

    await user.tab();
    await user.keyboard("{ArrowLeft}");

    expect(screen.getByRole("button", { name: "Two" })).toHaveFocus();
  });
});

function activeLayer(scope: HTMLElement) {
  return scope.querySelector(
    '[data-slot="horizontal-accordion-blade-active-layer"]',
  );
}

describe("HorizontalAccordion motion", () => {
  it("renders the active layer only on the active blade", () => {
    render(<BasicAccordion defaultValue="one" />);

    const bladeOne = screen.getByRole("button", { name: "One" });
    const bladeTwo = screen.getByRole("button", { name: "Two" });

    expect(activeLayer(bladeOne)).not.toBeNull();
    expect(activeLayer(bladeOne)).toHaveAttribute("aria-hidden", "true");
    expect(activeLayer(bladeTwo)).toBeNull();
  });

  it("moves the active layer to a newly activated blade", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion defaultValue="one" />);

    await user.click(screen.getByRole("button", { name: "Two" }));

    expect(activeLayer(screen.getByRole("button", { name: "One" }))).toBeNull();
    expect(
      activeLayer(screen.getByRole("button", { name: "Two" })),
    ).not.toBeNull();
  });

  it("keeps active layers independent across instances", () => {
    render(
      <>
        <HorizontalAccordion defaultValue="a" data-testid="first">
          <HorizontalAccordion.Item value="a">
            <HorizontalAccordion.Blade>A</HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel>A panel</HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
        </HorizontalAccordion>
        <HorizontalAccordion defaultValue="b" data-testid="second">
          <HorizontalAccordion.Item value="b">
            <HorizontalAccordion.Blade>B</HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel>B panel</HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
        </HorizontalAccordion>
      </>,
    );

    expect(activeLayer(screen.getByTestId("first"))).not.toBeNull();
    expect(activeLayer(screen.getByTestId("second"))).not.toBeNull();
  });

  it("disables content choreography with animation.content false", () => {
    const { container } = render(
      <BasicAccordion animation={{ content: false }} defaultValue="one" />,
    );

    const root = container.querySelector('[data-slot="horizontal-accordion"]');

    expect(root).toHaveAttribute("data-content-animation", "off");
    expect(
      container.querySelector(
        '[data-slot="horizontal-accordion-panel-content"]',
      ),
    ).toBeNull();
    expect(screen.getByTestId("panel-two")).not.toBeVisible();
  });

  it("hides a collapsed panel after the content exit settles", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion defaultValue="one" />);

    await user.click(screen.getByRole("button", { name: "One" }));

    await waitFor(() => {
      expect(screen.getByTestId("panel-one")).not.toBeVisible();
    });
  });

  it("unmounts panel children after the exit animation with unmountInactivePanels", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion defaultValue="one" unmountInactivePanels />);

    expect(screen.getByText("One panel")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Two" }));

    await waitFor(() => {
      expect(screen.queryByText("One panel")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Two panel")).toBeInTheDocument();
  });
});

describe("HorizontalAccordion styling contract", () => {
  it("exposes data-slot attributes and geometry custom properties", () => {
    const { container } = render(<BasicAccordion bladeWidth={96} height={320} />);
    const root = container.querySelector('[data-slot="horizontal-accordion"]');

    expect(root).not.toBeNull();
    expect(root).toHaveStyle({
      "--horizontal-accordion-blade-width": "96px",
      "--horizontal-accordion-height": "320px",
    });
    expect(
      container.querySelectorAll('[data-slot="horizontal-accordion-blade"]'),
    ).toHaveLength(2);
  });

  it("resolves icon position aliases and label orientation attributes", () => {
    render(
      <HorizontalAccordion defaultValue="one">
        <HorizontalAccordion.Item value="one">
          <HorizontalAccordion.Blade iconPosition="bottom">
            <HorizontalAccordion.BladeIcon data-testid="icon">
              *
            </HorizontalAccordion.BladeIcon>
            <HorizontalAccordion.BladeLabel
              data-testid="label"
              direction="top-to-bottom"
              orientation="vertical"
            >
              One
            </HorizontalAccordion.BladeLabel>
          </HorizontalAccordion.Blade>
          <HorizontalAccordion.Panel>One panel</HorizontalAccordion.Panel>
        </HorizontalAccordion.Item>
      </HorizontalAccordion>,
    );

    const blade = screen.getByRole("button");

    expect(blade).toHaveAttribute("data-icon-position", "end");
    expect(screen.getByTestId("icon")).toHaveAttribute("data-state", "active");
    expect(screen.getByTestId("label")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
    expect(screen.getByTestId("label")).toHaveAttribute(
      "data-direction",
      "top-to-bottom",
    );
  });

  it("merges consumer classes after default classes", () => {
    render(<BasicAccordion className="custom-root" data-testid="root" />);

    const root = screen.getByTestId("root");

    expect(root.className).toContain("custom-root");
  });

  it("keeps disabled blades inert", async () => {
    const user = userEvent.setup();
    render(
      <HorizontalAccordion>
        <HorizontalAccordion.Item value="one" data-testid="item-one">
          <HorizontalAccordion.Blade disabled>One</HorizontalAccordion.Blade>
          <HorizontalAccordion.Panel>One panel</HorizontalAccordion.Panel>
        </HorizontalAccordion.Item>
      </HorizontalAccordion>,
    );

    await user.click(screen.getByText("One"));

    expect(itemState("item-one")).toBe("inactive");
  });
});
