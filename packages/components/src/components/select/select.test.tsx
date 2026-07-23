import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Select, SelectItem, selectClassNames, selectItemClassNames } from ".";

const workspaceItems = [
  { label: "Production", value: "production" },
  { label: "Staging", value: "staging" },
  { label: "Sandbox", value: "sandbox" },
];

const richWorkspaceItems = [
  {
    description: "Receives production deploys.",
    label: "Production",
    value: "production",
  },
  {
    description: "Mirrors release candidates.",
    label: "Staging",
    value: "staging",
  },
];

describe("Select", () => {
  it("renders a labeled trigger with classes, refs, placeholder, and static items", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();

    const { container } = render(
      <Select
        ref={ref}
        className="custom-select"
        controlSize="lg"
        label="Workspace"
        name="workspace"
        placeholder="Choose workspace"
      >
        <SelectItem value="production">Production</SelectItem>
        <SelectItem value="staging">Staging</SelectItem>
      </Select>,
    );

    const root = container.querySelector('[data-slot="select"]');
    const trigger = screen.getByRole("button", { name: /Workspace/ });

    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveClass("custom-select");
    expect(ref.current).toBe(root);
    expect(trigger).toHaveAttribute("data-slot", "select-trigger");
    expect(trigger).toHaveTextContent("Choose workspace");
    expect(selectClassNames({ className: "custom-select" })).toContain(
      "custom-select",
    );
    expect(selectItemClassNames({ className: "custom-item" })).toContain(
      "custom-item",
    );

    await user.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Production" })).toHaveAttribute(
      "data-value",
      "production",
    );
  });

  it("provides typeahead text for rich static option content", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    try {
      render(
        <Select defaultOpen label="Workspace">
          <SelectItem value="production">
            <strong>Production</strong>
            <span>Receives production deploys.</span>
          </SelectItem>
        </Select>,
      );

      expect(warn).not.toHaveBeenCalledWith(
        expect.stringContaining("textValue prop is required"),
      );
    } finally {
      warn.mockRestore();
    }
  });

  it("supports controlled value changes", async () => {
    const user = userEvent.setup();

    function ControlledSelect() {
      const [value, setValue] = useState("staging");

      return (
        <>
          <Select label="Environment" value={value} onValueChange={setValue}>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
          </Select>
          <output>{value}</output>
        </>
      );
    }

    render(<ControlledSelect />);

    expect(
      screen.getByRole("button", { name: /Environment/ }),
    ).toHaveTextContent("Staging");

    await user.click(screen.getByRole("button", { name: /Environment/ }));
    await user.click(screen.getByRole("option", { name: "Production" }));

    const trigger = screen.getByRole("button", { name: /Environment/ });

    expect(trigger).toHaveTextContent("Production");
    expect(
      trigger.querySelector('[data-slot="select-item-indicator"]'),
    ).toBeNull();
    expect(
      trigger.querySelector('[data-slot="select-item-content"]'),
    ).toBeNull();
    expect(screen.getByText("production")).toBeInTheDocument();
  });

  it("supports uncontrolled values and native form data", async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Select form">
        <Select label="Region" name="region" defaultValue="eu">
          <SelectItem value="us">US</SelectItem>
          <SelectItem value="eu">EU</SelectItem>
        </Select>
      </form>,
    );

    const trigger = screen.getByRole("button", { name: /Region/ });
    const form = screen.getByRole("form", { name: "Select form" });
    const formData = new FormData(form as HTMLFormElement);

    expect(trigger).toHaveTextContent("EU");
    expect(formData.get("region")).toBe("eu");

    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "US" }));

    expect(new FormData(form as HTMLFormElement).get("region")).toBe("us");
  });

  it("supports controlled and uncontrolled open state", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    const { rerender } = render(
      <Select
        label="Open workspace"
        defaultOpen
        onOpenChange={handleOpenChange}
      >
        <SelectItem value="production">Production</SelectItem>
        <SelectItem value="staging">Staging</SelectItem>
      </Select>,
    );

    const listbox = screen.getByRole("listbox");

    expect(listbox).toBeInTheDocument();

    listbox.focus();
    expect(listbox).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(handleOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <Select label="Open workspace" open onOpenChange={handleOpenChange}>
        <SelectItem value="production">Production</SelectItem>
        <SelectItem value="staging">Staging</SelectItem>
      </Select>,
    );

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("supports data-driven items with render-function children", async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();

    render(
      <Select
        label="Default workspace"
        items={workspaceItems}
        defaultValue="sandbox"
        onValueChange={handleValueChange}
      >
        {(item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        )}
      </Select>,
    );

    expect(
      screen.getByRole("button", { name: /Default workspace/ }),
    ).toHaveTextContent("Sandbox");

    await user.click(screen.getByRole("button", { name: /Default workspace/ }));
    await user.click(screen.getByRole("option", { name: "Production" }));

    expect(handleValueChange).toHaveBeenCalledWith("production");
  });

  it("preserves extra fields in data-driven item typing", () => {
    const valid = (
      <Select label="Rich workspace" items={richWorkspaceItems}>
        {(item) => (
          <SelectItem value={item.value} textValue={item.description}>
            {item.label}
          </SelectItem>
        )}
      </Select>
    );

    expect(valid).toBeTruthy();
  });

  it("mirrors provider context onto the body portal host for initially open menus", () => {
    render(
      <DethinkProvider
        className="custom-provider"
        data-testid="select-provider"
        theme="dark"
        density="compact"
        dir="rtl"
      >
        <Select
          label="Provider workspace"
          defaultOpen
          defaultValue="production"
        >
          <SelectItem value="production">Production</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
        </Select>
      </DethinkProvider>,
    );

    const popover = screen
      .getByRole("listbox")
      .closest<HTMLElement>('[data-slot="select-popover"]');
    const portalHost = popover?.closest<HTMLElement>(
      '[data-slot="select-portal-container"]',
    );
    const provider = screen.getByTestId("select-provider");

    if (!popover || !portalHost) {
      throw new Error("Select popover should render inside a portal host.");
    }

    expect(document.body).toContainElement(portalHost);
    expect(provider).not.toContainElement(popover);
    expect(portalHost).toHaveAttribute("data-dethink-provider", "");
    expect(portalHost).toHaveAttribute("data-theme", "dark");
    expect(portalHost).toHaveAttribute("data-density", "compact");
    expect(portalHost).toHaveAttribute("dir", "rtl");
    expect(portalHost).toHaveClass("custom-provider");
  });

  it.each(["grammar", "spelling"] as const)(
    "preserves aria-invalid=%s while styling the invalid state",
    (ariaInvalid) => {
      const { container } = render(
        <Select aria-invalid={ariaInvalid} label="Reviewed workspace">
          <SelectItem value="production">Production</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
        </Select>,
      );

      const root = container.querySelector('[data-slot="select"]');
      const trigger = screen.getByRole("button", {
        name: /Reviewed workspace/,
      });

      expect(root).toHaveAttribute("data-invalid", "true");
      expect(trigger).toHaveAttribute("aria-invalid", ariaInvalid);
      expect(trigger).toHaveAttribute("data-invalid", "true");
    },
  );

  it("exposes disabled, read-only, required, and invalid states", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Select
        disabled
        invalid
        label="Locked workspace"
        readOnly
        required
        defaultValue="production"
      >
        <SelectItem value="production">Production</SelectItem>
        <SelectItem value="staging">Staging</SelectItem>
      </Select>,
    );

    const root = container.querySelector('[data-slot="select"]');
    const trigger = screen.getByRole("button", { name: /Locked workspace/ });

    expect(root).toHaveAttribute("data-disabled", "true");
    expect(root).toHaveAttribute("data-invalid", "true");
    expect(root).toHaveAttribute("data-readonly", "true");
    expect(root).toHaveAttribute("data-required", "true");
    expect(trigger).toHaveAttribute("data-invalid", "true");
    expect(trigger).toHaveAttribute("data-readonly", "true");
    expect(trigger).toBeDisabled();

    await user.click(trigger);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps read-only selects focusable while preventing menu changes", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    const handleValueChange = vi.fn();

    const { container } = render(
      <Select
        readOnly
        label="Inherited workspace"
        defaultValue="production"
        onOpenChange={handleOpenChange}
        onValueChange={handleValueChange}
      >
        <SelectItem value="production">Production</SelectItem>
        <SelectItem value="staging">Staging</SelectItem>
      </Select>,
    );

    const root = container.querySelector('[data-slot="select"]');
    const trigger = screen.getByRole("button", { name: /Inherited workspace/ });

    expect(root).toHaveAttribute("data-readonly", "true");
    expect(trigger).toHaveAttribute("data-readonly", "true");
    expect(trigger).not.toBeDisabled();

    await user.click(trigger);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(handleOpenChange).not.toHaveBeenCalled();
    expect(handleValueChange).not.toHaveBeenCalled();
  });

  it("forces controlled read-only open state closed", () => {
    render(
      <Select
        readOnly
        open
        label="Read-only open workspace"
        defaultValue="production"
      >
        <SelectItem value="production">Production</SelectItem>
        <SelectItem value="staging">Staging</SelectItem>
      </Select>,
    );

    expect(
      screen.queryByRole("listbox", { name: /Read-only open workspace/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
