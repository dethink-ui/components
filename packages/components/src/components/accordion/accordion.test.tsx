import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Accordion,
  AccordionBlade,
  AccordionContent,
  AccordionItem,
  type AccordionMultipleValue,
  type AccordionSingleProps,
  type AccordionValue,
} from "./accordion";

function BasicAccordion(props: Partial<AccordionSingleProps> = {}) {
  return (
    <Accordion motionPreset="none" {...props}>
      <Accordion.Item value="one" data-testid="item-one">
        <Accordion.Blade>One</Accordion.Blade>
        <Accordion.Content data-testid="content-one">
          One panel
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="two" data-testid="item-two">
        <Accordion.Blade>Two</Accordion.Blade>
        <Accordion.Content data-testid="content-two">
          Two panel
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

function itemState(testId: string) {
  return screen.getByTestId(testId).getAttribute("data-state");
}

describe("Accordion single state", () => {
  it("renders closed by default", () => {
    render(<BasicAccordion />);

    expect(itemState("item-one")).toBe("closed");
    expect(itemState("item-two")).toBe("closed");
    expect(screen.queryByText("One panel")).not.toBeInTheDocument();
    expect(screen.queryByText("Two panel")).not.toBeInTheDocument();
  });

  it("opens the defaultValue item in uncontrolled single mode", () => {
    render(<BasicAccordion defaultValue="one" />);

    expect(itemState("item-one")).toBe("open");
    expect(screen.getByText("One panel")).toBeVisible();
    expect(screen.queryByText("Two panel")).not.toBeInTheDocument();
  });

  it("opens one item at a time and reports value changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicAccordion defaultValue="one" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Two" }));

    expect(itemState("item-one")).toBe("closed");
    expect(itemState("item-two")).toBe("open");
    expect(onValueChange).toHaveBeenCalledWith("two");
  });

  it("closes the open item when clicked again by default", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicAccordion defaultValue="one" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "One" }));

    expect(itemState("item-one")).toBe("closed");
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  it("keeps the open item when collapsible is false", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <BasicAccordion
        collapsible={false}
        defaultValue="one"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "One" }));

    expect(itemState("item-one")).toBe("open");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps controlled single state owned by the parent", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicAccordion value="one" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Two" }));

    expect(itemState("item-one")).toBe("open");
    expect(itemState("item-two")).toBe("closed");
    expect(onValueChange).toHaveBeenCalledWith("two");
  });

  it("follows controlled single updates from the parent", async () => {
    function ControlledHarness() {
      const [value, setValue] = useState<AccordionValue>("one");

      return (
        <BasicAccordion
          value={value}
          onValueChange={setValue}
          motionPreset="none"
        />
      );
    }

    const user = userEvent.setup();
    render(<ControlledHarness />);

    await user.click(screen.getByRole("button", { name: "Two" }));

    expect(itemState("item-two")).toBe("open");
  });
});

describe("Accordion multiple state", () => {
  function MultipleAccordion({
    onValueChange,
    value,
  }: {
    onValueChange?: (value: AccordionMultipleValue) => void;
    value?: AccordionMultipleValue;
  }) {
    return (
      <Accordion
        defaultValue={["one"]}
        motionPreset="none"
        onValueChange={onValueChange}
        type="multiple"
        {...(value ? { value } : {})}
      >
        <Accordion.Item value="one" data-testid="item-one">
          <Accordion.Blade>One</Accordion.Blade>
          <Accordion.Content>One panel</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="two" data-testid="item-two">
          <Accordion.Blade>Two</Accordion.Blade>
          <Accordion.Content>Two panel</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );
  }

  it("keeps multiple blades open until clicked closed", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<MultipleAccordion onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Two" }));

    expect(itemState("item-one")).toBe("open");
    expect(itemState("item-two")).toBe("open");
    expect(onValueChange).toHaveBeenLastCalledWith(["one", "two"]);

    await user.click(screen.getByRole("button", { name: "One" }));

    expect(itemState("item-one")).toBe("closed");
    expect(itemState("item-two")).toBe("open");
    expect(onValueChange).toHaveBeenLastCalledWith(["two"]);
  });

  it("keeps controlled multiple state owned by the parent", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<MultipleAccordion onValueChange={onValueChange} value={["one"]} />);

    await user.click(screen.getByRole("button", { name: "Two" }));

    expect(itemState("item-one")).toBe("open");
    expect(itemState("item-two")).toBe("closed");
    expect(onValueChange).toHaveBeenCalledWith(["one", "two"]);
  });
});

describe("Accordion disabled and mounted content behavior", () => {
  it("does not toggle disabled root or item blades", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Accordion motionPreset="none" onValueChange={onValueChange}>
        <Accordion.Item value="one" data-testid="item-one">
          <Accordion.Blade>One</Accordion.Blade>
          <Accordion.Content>One panel</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item disabled value="two" data-testid="item-two">
          <Accordion.Blade>Two</Accordion.Blade>
          <Accordion.Content>Two panel</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    await user.click(screen.getByRole("button", { name: "Two" }));

    expect(itemState("item-two")).toBe("closed");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("forceMount preserves closed content in the DOM", () => {
    render(
      <Accordion motionPreset="none">
        <Accordion.Item value="one">
          <Accordion.Blade>One</Accordion.Blade>
          <Accordion.Content forceMount data-testid="content-one">
            One panel
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    expect(screen.getByText("One panel")).toBeInTheDocument();
    expect(screen.getByTestId("content-one")).not.toBeVisible();
  });
});

describe("Accordion keyboard behavior", () => {
  it("moves focus with ArrowUp, ArrowDown, Home, and End while skipping disabled blades", async () => {
    const user = userEvent.setup();
    render(
      <Accordion motionPreset="none">
        <Accordion.Item value="one">
          <Accordion.Blade>One</Accordion.Blade>
          <Accordion.Content>One panel</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item disabled value="two">
          <Accordion.Blade>Two</Accordion.Blade>
          <Accordion.Content>Two panel</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="three">
          <Accordion.Blade>Three</Accordion.Blade>
          <Accordion.Content>Three panel</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    const one = screen.getByRole("button", { name: "One" });
    const three = screen.getByRole("button", { name: "Three" });

    one.focus();
    await user.keyboard("{ArrowDown}");
    expect(three).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(one).toHaveFocus();

    await user.keyboard("{End}");
    expect(three).toHaveFocus();

    await user.keyboard("{Home}");
    expect(one).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByText("One panel")).toBeVisible();
  });

  it("returns focus to the blade when open content closes around focused content", async () => {
    function FocusReturnHarness() {
      const [value, setValue] = useState<AccordionValue>("one");

      return (
        <Accordion motionPreset="none" onValueChange={setValue} value={value}>
          <Accordion.Item value="one">
            <Accordion.Blade>One</Accordion.Blade>
            <Accordion.Content>
              <button type="button" onClick={() => setValue(undefined)}>
                Close from content
              </button>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      );
    }

    const user = userEvent.setup();
    render(<FocusReturnHarness />);

    await user.click(
      screen.getByRole("button", { name: "Close from content" }),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "One" })).toHaveFocus(),
    );
  });
});

describe("Accordion composition", () => {
  it("supports named-export composition alongside static properties", async () => {
    const user = userEvent.setup();
    render(
      <Accordion motionPreset="none">
        <AccordionItem value="one" data-testid="item-one">
          <AccordionBlade>One</AccordionBlade>
          <AccordionContent>One panel</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    await user.click(screen.getByRole("button", { name: "One" }));

    expect(itemState("item-one")).toBe("open");
  });

  it("throws for duplicate item values in development", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() =>
      render(
        <Accordion>
          <AccordionItem value="one">
            <AccordionBlade>One</AccordionBlade>
            <AccordionContent>One panel</AccordionContent>
          </AccordionItem>
          <AccordionItem value="one">
            <AccordionBlade>Duplicate</AccordionBlade>
            <AccordionContent>Duplicate panel</AccordionContent>
          </AccordionItem>
        </Accordion>,
      ),
    ).toThrow('Duplicate Accordion.Item value "one".');

    consoleError.mockRestore();
  });

  it("throws when an item lacks exactly one blade and one content", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() =>
      render(
        <Accordion>
          <AccordionItem value="one">
            <AccordionBlade>One</AccordionBlade>
          </AccordionItem>
        </Accordion>,
      ),
    ).toThrow(
      'Accordion.Item "one" must contain exactly one Blade and one Content.',
    );

    consoleError.mockRestore();
  });

  it("throws when parts are used outside Accordion", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<AccordionContent>Loose</AccordionContent>)).toThrow(
      "Accordion.Content must be used within Accordion.",
    );

    consoleError.mockRestore();
  });
});
