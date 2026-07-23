import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Combobox,
  ComboboxItem,
  comboboxClassNames,
  comboboxItemClassNames,
} from ".";

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

describe("Combobox", () => {
  it("renders a labeled input with classes, refs, placeholder, and static items", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();

    const { container } = render(
      <Combobox
        ref={ref}
        className="custom-combobox"
        controlSize="lg"
        label="Workspace"
        name="workspace"
        placeholder="Search workspaces"
      >
        <ComboboxItem value="production">Production</ComboboxItem>
        <ComboboxItem value="staging">Staging</ComboboxItem>
      </Combobox>,
    );

    const root = container.querySelector('[data-slot="combobox"]');
    const input = screen.getByRole("combobox", { name: /Workspace/ });
    const button = screen.getByRole("button", { name: /Show options/ });

    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveClass("custom-combobox");
    expect(ref.current).toBe(root);
    expect(input).toHaveAttribute("data-slot", "combobox-input");
    expect(input).toHaveAttribute("placeholder", "Search workspaces");
    expect(comboboxClassNames({ className: "custom-combobox" })).toContain(
      "custom-combobox",
    );
    expect(comboboxItemClassNames({ className: "custom-item" })).toContain(
      "custom-item",
    );

    await user.click(button);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Production" })).toHaveAttribute(
      "data-value",
      "production",
    );
  });

  it("provides typeahead text for rich static option content", async () => {
    const user = userEvent.setup();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    try {
      render(
        <Combobox label="Workspace">
          <ComboboxItem value="production">
            <strong>Production</strong>
            <span>Receives production deploys.</span>
          </ComboboxItem>
        </Combobox>,
      );

      await user.click(screen.getByRole("button", { name: /Show options/ }));

      expect(warn).not.toHaveBeenCalledWith(
        expect.stringContaining("textValue prop is required"),
      );
    } finally {
      warn.mockRestore();
    }
  });

  it("supports controlled value and input changes", async () => {
    const user = userEvent.setup();

    function ControlledCombobox() {
      const [value, setValue] = useState<string | null>("staging");
      const [inputValue, setInputValue] = useState("Staging");
      const itemLabels: Record<string, string> = {
        production: "Production",
        staging: "Staging",
      };
      const handleValueChange = (nextValue: string | null) => {
        setValue(nextValue);
        setInputValue(nextValue ? itemLabels[nextValue] : "");
      };

      return (
        <>
          <Combobox
            label="Environment"
            value={value}
            inputValue={inputValue}
            onValueChange={handleValueChange}
            onInputValueChange={setInputValue}
          >
            <ComboboxItem value="production">Production</ComboboxItem>
            <ComboboxItem value="staging">Staging</ComboboxItem>
          </Combobox>
          <output>{value ?? "none"}</output>
          <output>{inputValue}</output>
        </>
      );
    }

    render(<ControlledCombobox />);

    const input = screen.getByRole("combobox", { name: /Environment/ });

    expect(input).toHaveValue("Staging");

    await user.click(screen.getByRole("button", { name: /Show options/ }));
    await user.click(screen.getByRole("option", { name: "Production" }));

    expect(input).toHaveValue("Production");
    expect(screen.getByText("production")).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "Sta");

    expect(input).toHaveValue("Sta");
    expect(screen.getByText("Sta")).toBeInTheDocument();
  });

  it("supports uncontrolled values and native form data", async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Combobox form">
        <Combobox label="Region" name="region" defaultValue="eu">
          <ComboboxItem value="us">US</ComboboxItem>
          <ComboboxItem value="eu">EU</ComboboxItem>
        </Combobox>
      </form>,
    );

    const input = screen.getByRole("combobox", { name: /Region/ });
    const form = screen.getByRole("form", { name: "Combobox form" });
    const formData = new FormData(form as HTMLFormElement);

    expect(input).toHaveValue("EU");
    expect(formData.get("region")).toBe("eu");

    await user.click(screen.getByRole("button", { name: /Show options/ }));
    await user.click(screen.getByRole("option", { name: "US" }));

    expect(new FormData(form as HTMLFormElement).get("region")).toBe("us");
  });

  it("submits selected item text when formValue is text", () => {
    render(
      <form aria-label="Text value form">
        <Combobox
          formValue="text"
          label="Deployment target"
          name="target"
          defaultValue="staging"
        >
          <ComboboxItem value="production">Production</ComboboxItem>
          <ComboboxItem value="staging">Staging</ComboboxItem>
        </Combobox>
      </form>,
    );

    const form = screen.getByRole("form", { name: "Text value form" });

    expect(new FormData(form as HTMLFormElement).get("target")).toBe("Staging");
  });

  it("does not submit disabled named values", () => {
    render(
      <form aria-label="Disabled value form">
        <Combobox
          disabled
          label="Deployment target"
          name="target"
          defaultValue="staging"
        >
          <ComboboxItem value="production">Production</ComboboxItem>
          <ComboboxItem value="staging">Staging</ComboboxItem>
        </Combobox>
      </form>,
    );

    const form = screen.getByRole("form", { name: "Disabled value form" });

    expect(new FormData(form as HTMLFormElement).has("target")).toBe(false);
  });

  it("supports user-driven open state changes", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    render(
      <Combobox label="Open workspace" onOpenChange={handleOpenChange}>
        <ComboboxItem value="production">Production</ComboboxItem>
        <ComboboxItem value="staging">Staging</ComboboxItem>
      </Combobox>,
    );

    await user.click(screen.getByRole("button", { name: /Show options/ }));

    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(handleOpenChange).toHaveBeenCalledWith(true, "manual");

    await user.keyboard("{Escape}");

    expect(handleOpenChange).toHaveBeenCalledWith(false, undefined);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("supports data-driven items with render-function children", async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();

    render(
      <Combobox
        label="Default workspace"
        items={workspaceItems}
        defaultValue="sandbox"
        onValueChange={handleValueChange}
      >
        {(item) => (
          <ComboboxItem key={item.value} value={item.value}>
            {item.label}
          </ComboboxItem>
        )}
      </Combobox>,
    );

    expect(
      screen.getByRole("combobox", { name: /Default workspace/ }),
    ).toHaveValue("Sandbox");

    await user.click(screen.getByRole("button", { name: /Show options/ }));
    await user.click(screen.getByRole("option", { name: "Production" }));

    expect(handleValueChange).toHaveBeenCalledWith("production");
  });

  it("preserves extra fields in data-driven item typing", () => {
    const valid = (
      <Combobox label="Rich workspace" items={richWorkspaceItems}>
        {(item) => (
          <ComboboxItem value={item.value} textValue={item.description}>
            {item.label}
          </ComboboxItem>
        )}
      </Combobox>
    );

    expect(valid).toBeTruthy();
  });

  it("mirrors provider context onto the body portal host for initially open menus", async () => {
    render(
      <DethinkProvider
        className="custom-provider"
        data-testid="combobox-provider"
        theme="dark"
        density="compact"
        dir="rtl"
      >
        <Combobox label="Provider workspace" defaultValue="production">
          <ComboboxItem value="production">Production</ComboboxItem>
          <ComboboxItem value="staging">Staging</ComboboxItem>
        </Combobox>
      </DethinkProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: /Show options/ }));

    const popover = (await screen.findByRole("listbox")).closest<HTMLElement>(
      '[data-slot="combobox-popover"]',
    );
    const portalHost = popover?.closest<HTMLElement>(
      '[data-slot="combobox-portal-container"]',
    );
    const provider = screen.getByTestId("combobox-provider");

    if (!popover || !portalHost) {
      throw new Error("Combobox popover should render inside a portal host.");
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
        <Combobox aria-invalid={ariaInvalid} label="Reviewed workspace">
          <ComboboxItem value="production">Production</ComboboxItem>
          <ComboboxItem value="staging">Staging</ComboboxItem>
        </Combobox>,
      );

      const root = container.querySelector('[data-slot="combobox"]');
      const control = container.querySelector('[data-slot="combobox-control"]');
      const input = screen.getByRole("combobox", {
        name: /Reviewed workspace/,
      });

      expect(root).toHaveAttribute("data-invalid", "true");
      expect(control).toHaveAttribute("data-invalid", "true");
      expect(input).toHaveAttribute("aria-invalid", ariaInvalid);
    },
  );

  it("exposes disabled, read-only, required, and invalid states", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Combobox
        disabled
        invalid
        label="Locked workspace"
        readOnly
        required
        defaultValue="production"
      >
        <ComboboxItem value="production">Production</ComboboxItem>
        <ComboboxItem value="staging">Staging</ComboboxItem>
      </Combobox>,
    );

    const root = container.querySelector('[data-slot="combobox"]');
    const control = container.querySelector('[data-slot="combobox-control"]');
    const input = screen.getByRole("combobox", { name: /Locked workspace/ });

    expect(root).toHaveAttribute("data-disabled", "true");
    expect(root).toHaveAttribute("data-invalid", "true");
    expect(root).toHaveAttribute("data-readonly", "true");
    expect(root).toHaveAttribute("data-required", "true");
    expect(control).toHaveAttribute("data-invalid", "true");
    expect(control).toHaveAttribute("data-readonly", "true");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("readonly");

    await user.click(input);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps read-only comboboxes focusable while preventing menu changes", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    const handleValueChange = vi.fn();
    const handleInputValueChange = vi.fn();

    const { container } = render(
      <Combobox
        readOnly
        label="Inherited workspace"
        defaultValue="production"
        onInputValueChange={handleInputValueChange}
        onOpenChange={handleOpenChange}
        onValueChange={handleValueChange}
      >
        <ComboboxItem value="production">Production</ComboboxItem>
        <ComboboxItem value="staging">Staging</ComboboxItem>
      </Combobox>,
    );

    const root = container.querySelector('[data-slot="combobox"]');
    const input = screen.getByRole("combobox", { name: /Inherited workspace/ });

    expect(root).toHaveAttribute("data-readonly", "true");
    expect(input).toHaveAttribute("readonly");
    expect(input).not.toBeDisabled();

    handleInputValueChange.mockClear();

    await user.click(screen.getByRole("button", { name: /Show options/ }));
    await user.type(input, "Sandbox");

    expect(input).toHaveValue("Production");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(handleOpenChange).not.toHaveBeenCalled();
    expect(handleInputValueChange).not.toHaveBeenCalled();
    expect(handleValueChange).not.toHaveBeenCalled();
  });
});
