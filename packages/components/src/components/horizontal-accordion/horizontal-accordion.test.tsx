import { render, screen } from "@testing-library/react";
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
