import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";
import {
  Inspector,
  InspectorNumber,
  InspectorProperty,
  InspectorSection,
  InspectorSelect,
  InspectorSwitch,
  InspectorText,
  type InspectorChangeDetails,
  type InspectorValue,
} from ".";

const initial = {
  name: "Card",
  visible: true,
  layout: { width: 120, rotation: 0 },
  align: "start",
};

function Harness({
  onChange,
  value: startValue = initial,
}: {
  onChange?: (next: InspectorValue, details: InspectorChangeDetails) => void;
  value?: InspectorValue | null;
}) {
  const [value, setValue] = useState<InspectorValue | null>(startValue);

  return (
    <Inspector
      aria-label="Shape properties"
      value={value}
      onValueChange={(next, details) => {
        setValue(next);
        onChange?.(next, details);
      }}
    >
      <InspectorSection title="Layout">
        <InspectorProperty path="name" label="Name">
          <InspectorText
            validate={(text) => (text.trim() ? null : "Name is required.")}
          />
        </InspectorProperty>
        <InspectorProperty path="layout.width" label="Width">
          <InspectorNumber min={1} max={500} unit="px" />
        </InspectorProperty>
        <InspectorProperty path="layout.rotation" label="Rotation">
          <InspectorNumber step={0.5} unit="deg" />
        </InspectorProperty>
        <InspectorProperty path="visible" label="Visible">
          <InspectorSwitch />
        </InspectorProperty>
        <InspectorProperty path="align" label="Align">
          <InspectorSelect
            options={[
              { value: "start", label: "Start" },
              { value: "center", label: "Center" },
            ]}
          />
        </InspectorProperty>
      </InspectorSection>
    </Inspector>
  );
}

it("commits numbers on Enter and reports the path and value", async () => {
  const change = vi.fn();
  render(<Harness onChange={change} />);
  const width = screen.getByRole("spinbutton", { name: "Width" });

  expect(width).toHaveValue("120");
  expect(width).toHaveAttribute("aria-valuetext", "120 px");
  await userEvent.clear(width);
  await userEvent.type(width, "180{Enter}");

  expect(change).toHaveBeenCalledTimes(1);
  expect(change.mock.calls[0]?.[1]).toEqual({
    path: "layout.width",
    value: 180,
  });
  expect(change.mock.calls[0]?.[0]).toMatchObject({
    layout: { width: 180, rotation: 0 },
  });
});

it("clamps to bounds, accepts a typed unit, and steps with arrow keys", async () => {
  const change = vi.fn();
  render(<Harness onChange={change} />);
  const width = screen.getByRole("spinbutton", { name: "Width" });

  await userEvent.clear(width);
  await userEvent.type(width, "900px");
  await userEvent.tab();
  expect(width).toHaveValue("500");

  await userEvent.click(width);
  await userEvent.keyboard("{ArrowDown}{ArrowDown}");
  expect(width).toHaveValue("498");

  const rotation = screen.getByRole("spinbutton", { name: "Rotation" });
  await userEvent.click(rotation);
  await userEvent.keyboard("{ArrowUp}");
  expect(rotation).toHaveValue("0.5");
  expect(change).toHaveBeenLastCalledWith(expect.anything(), {
    path: "layout.rotation",
    value: 0.5,
  });
});

it("rejects invalid numbers with a message and reverts on Escape", async () => {
  const change = vi.fn();
  render(<Harness onChange={change} />);
  const width = screen.getByRole("spinbutton", { name: "Width" });

  await userEvent.clear(width);
  await userEvent.type(width, "wide{Enter}");

  expect(change).not.toHaveBeenCalled();
  expect(width).toHaveAttribute("aria-invalid", "true");
  expect(width).toHaveAccessibleDescription("Enter a number.");

  await userEvent.keyboard("{Escape}");
  expect(width).toHaveValue("120");
  expect(width).not.toHaveAttribute("aria-invalid");
  expect(screen.queryByText("Enter a number.")).not.toBeInTheDocument();
});

it("validates text drafts and keeps the previous value", async () => {
  const change = vi.fn();
  render(<Harness onChange={change} />);
  const name = screen.getByRole("textbox", { name: "Name" });

  await userEvent.clear(name);
  await userEvent.tab();
  expect(change).not.toHaveBeenCalled();
  expect(name).toHaveAccessibleDescription("Name is required.");

  await userEvent.type(name, "Hero card{Enter}");
  expect(change).toHaveBeenLastCalledWith(expect.anything(), {
    path: "name",
    value: "Hero card",
  });
  expect(name).toHaveAccessibleDescription("");
});

it("toggles switches and selects options", async () => {
  const change = vi.fn();
  render(<Harness onChange={change} />);

  await userEvent.click(screen.getByRole("switch", { name: "Visible" }));
  expect(change).toHaveBeenLastCalledWith(expect.anything(), {
    path: "visible",
    value: false,
  });

  await userEvent.click(screen.getByRole("button", { name: /Align/ }));
  await userEvent.click(await screen.findByRole("option", { name: "Center" }));
  expect(change).toHaveBeenLastCalledWith(expect.anything(), {
    path: "align",
    value: "center",
  });
});

it("reflects external value changes when no draft is pending", () => {
  const { rerender } = render(
    <Inspector value={{ width: 10 }}>
      <InspectorProperty path="width" label="Width">
        <InspectorNumber />
      </InspectorProperty>
    </Inspector>,
  );

  rerender(
    <Inspector value={{ width: 42 }}>
      <InspectorProperty path="width" label="Width">
        <InspectorNumber />
      </InspectorProperty>
    </Inspector>,
  );

  expect(screen.getByRole("spinbutton", { name: "Width" })).toHaveValue("42");
});

it("collapses sections, hides their controls, and supports controlled state", async () => {
  const openChange = vi.fn();
  render(<Harness />);
  const trigger = screen.getByRole("button", { name: "Layout" });

  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("group", { name: "Layout" })).toBeVisible();
  await userEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(
    document.getElementById(trigger.getAttribute("aria-controls")!),
  ).toHaveAttribute("inert");

  const { rerender } = render(
    <Inspector value={{}}>
      <InspectorSection title="Fill" open={false} onOpenChange={openChange}>
        <p>content</p>
      </InspectorSection>
    </Inspector>,
  );
  const fill = screen.getByRole("button", { name: "Fill" });
  await userEvent.click(fill);
  expect(openChange).toHaveBeenCalledWith(true);
  expect(fill).toHaveAttribute("aria-expanded", "false");
  rerender(
    <Inspector value={{}}>
      <InspectorSection title="Fill" open onOpenChange={openChange}>
        <p>content</p>
      </InspectorSection>
    </Inspector>,
  );
  expect(fill).toHaveAttribute("aria-expanded", "true");
});

it("renders non-collapsible sections as plain headings", () => {
  render(
    <Inspector value={{}}>
      <InspectorSection title="Summary" collapsible={false} headingLevel={2}>
        <p>content</p>
      </InspectorSection>
    </Inspector>,
  );

  expect(
    screen.getByRole("heading", { level: 2, name: "Summary" }),
  ).toBeVisible();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("explains disabled and read-only properties", async () => {
  const change = vi.fn();
  render(
    <Inspector value={{ width: 10, locked: true }} onValueChange={change}>
      <InspectorProperty
        path="width"
        label="Width"
        disabled
        disabledReason="Width is set by the layout grid."
      >
        <InspectorNumber />
      </InspectorProperty>
      <InspectorProperty
        path="locked"
        label="Locked"
        readOnly
        disabledReason="Only owners can unlock."
      >
        <InspectorSwitch />
      </InspectorProperty>
    </Inspector>,
  );

  const width = screen.getByRole("spinbutton", { name: "Width" });
  expect(width).toBeDisabled();
  expect(width).toHaveAccessibleDescription("Width is set by the layout grid.");
  const locked = screen.getByRole("switch", { name: "Locked" });
  expect(locked).toHaveAccessibleDescription("Only owners can unlock.");
  await userEvent.click(locked);
  expect(change).not.toHaveBeenCalled();
});

it("shows consumer errors and descriptions", () => {
  render(
    <Inspector value={{ slug: "x" }}>
      <InspectorProperty
        path="slug"
        label="Slug"
        description="Used in the URL."
        error="Slug is taken."
      >
        <InspectorText />
      </InspectorProperty>
    </Inspector>,
  );

  const slug = screen.getByRole("textbox", { name: "Slug" });
  expect(slug).toHaveAttribute("aria-invalid", "true");
  expect(slug).toHaveAccessibleDescription("Used in the URL. Slug is taken.");
});

it("discards an unfinished draft when the selected object changes", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(
    <Inspector value={{ name: "Card" }} onValueChange={change}>
      <InspectorProperty path="name" label="Name">
        <InspectorText validate={(text) => (text ? null : "Required.")} />
      </InspectorProperty>
    </Inspector>,
  );
  const name = screen.getByRole("textbox", { name: "Name" });

  await user.clear(name);
  await user.keyboard("{Enter}");
  expect(name).toHaveAttribute("aria-invalid", "true");

  rerender(
    <Inspector value={{ name: "Button" }} onValueChange={change}>
      <InspectorProperty path="name" label="Name">
        <InspectorText validate={(text) => (text ? null : "Required.")} />
      </InspectorProperty>
    </Inspector>,
  );

  expect(name).toHaveValue("Button");
  expect(name).not.toHaveAttribute("aria-invalid");
  await user.tab();
  expect(change).not.toHaveBeenCalled();
});

it("does not carry a draft to another object with the same value", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const renderSelection = (value: InspectorValue, selectionKey?: string) => (
    <Inspector value={value} selectionKey={selectionKey} onValueChange={change}>
      <InspectorProperty path="name" label="Name">
        <InspectorText />
      </InspectorProperty>
    </Inspector>
  );
  const { rerender } = render(renderSelection({ name: "Card" }));
  const name = screen.getByRole("textbox", { name: "Name" });

  await user.type(name, " A");
  rerender(renderSelection({ name: "Card" }));
  expect(name).toHaveValue("Card");
  await user.tab();
  expect(change).not.toHaveBeenCalled();

  // A stable selection key keeps the draft across rebuilt values.
  const same = { name: "Card" };
  rerender(renderSelection(same, "a"));
  await user.type(name, " A");
  rerender(renderSelection({ ...same }, "a"));
  expect(name).toHaveValue("Card A");
  rerender(renderSelection({ ...same }, "b"));
  expect(name).toHaveValue("Card");
  await user.tab();
  expect(change).not.toHaveBeenCalled();
});

it("does not commit drafts after the inspector becomes read-only", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const renderPanel = (readOnly: boolean) => (
    <Inspector
      value={initial}
      selectionKey="card"
      readOnly={readOnly}
      onValueChange={change}
    >
      <InspectorProperty path="name" label="Name">
        <InspectorText />
      </InspectorProperty>
      <InspectorProperty path="layout.width" label="Width">
        <InspectorNumber />
      </InspectorProperty>
    </Inspector>
  );
  const { rerender } = render(renderPanel(false));
  const name = screen.getByRole("textbox", { name: "Name" });
  const width = screen.getByRole("spinbutton", { name: "Width" });

  await user.type(name, " A");
  rerender(renderPanel(true));
  expect(name).toHaveValue("Card");
  await user.tab();

  rerender(renderPanel(false));
  await user.clear(width);
  await user.type(width, "42");
  rerender(renderPanel(true));
  await user.tab();

  expect(change).not.toHaveBeenCalled();
});

it("builds later commits on the accepted value after a rejected edit", async () => {
  const user = userEvent.setup();
  // The parent accepts name edits and rejects width edits.
  function Rejecting({ onChange }: { onChange: typeof change }) {
    const [value, setValue] = useState<InspectorValue>({
      name: "Card",
      width: 10,
    });

    return (
      <Inspector
        value={value}
        onValueChange={(next, details) => {
          onChange(next, details);
          if (details.path !== "width") setValue(next);
        }}
      >
        <InspectorProperty path="width" label="Width">
          <InspectorNumber />
        </InspectorProperty>
        <InspectorProperty path="name" label="Name">
          <InspectorText />
        </InspectorProperty>
      </Inspector>
    );
  }
  const change = vi.fn();

  render(<Rejecting onChange={change} />);
  const width = screen.getByRole("spinbutton", { name: "Width" });

  await user.clear(width);
  await user.type(width, "20{Enter}");
  expect(change).toHaveBeenLastCalledWith(
    { name: "Card", width: 20 },
    { path: "width", value: 20 },
  );
  expect(width).toHaveValue("10");

  const name = screen.getByRole("textbox", { name: "Name" });
  await user.type(name, "s{Enter}");
  expect(change).toHaveBeenLastCalledWith(
    { name: "Cards", width: 10 },
    { path: "name", value: "Cards" },
  );
});

it("keeps rounded numbers inside their bounds", async () => {
  const user = userEvent.setup();
  const change = vi.fn();

  render(
    <Inspector value={{ low: 0, high: 0.4 }} onValueChange={change}>
      <InspectorProperty path="high" label="High">
        <InspectorNumber max={0.5} />
      </InspectorProperty>
      <InspectorProperty path="low" label="Low">
        <InspectorNumber min={0.5} max={10} />
      </InspectorProperty>
    </Inspector>,
  );

  const high = screen.getByRole("spinbutton", { name: "High" });
  await user.clear(high);
  await user.type(high, "2{Enter}");
  expect(change).toHaveBeenLastCalledWith(expect.anything(), {
    path: "high",
    value: 0,
  });

  const low = screen.getByRole("spinbutton", { name: "Low" });
  await user.clear(low);
  await user.type(low, "0{Enter}");
  expect(change).toHaveBeenLastCalledWith(expect.anything(), {
    path: "low",
    value: 1,
  });
});

it("renders the default or custom empty state when nothing is selected", () => {
  const { rerender } = render(<Inspector value={null} />);
  expect(screen.getByText("Nothing selected")).toBeVisible();

  rerender(<Inspector value={undefined} emptyState={<p>Pick a layer</p>} />);
  expect(screen.getByText("Pick a layer")).toBeVisible();
});

it("throws a helpful error when a property is used outside an inspector", () => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);

  expect(() =>
    render(
      <InspectorProperty path="a" label="A">
        <InspectorText />
      </InspectorProperty>,
    ),
  ).toThrow(/inside <Inspector>/);
});
