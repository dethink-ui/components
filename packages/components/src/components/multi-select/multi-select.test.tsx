import { createRef, useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  MultiSelect,
  MultiSelectItem,
  multiSelectClassNames,
  multiSelectItemClassNames,
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

describe("MultiSelect", () => {
  it("renders a labeled trigger with classes, refs, placeholder, and static items", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();

    const { container } = render(
      <MultiSelect
        ref={ref}
        className="custom-multi-select"
        controlSize="lg"
        label="Workspaces"
        name="workspaces"
        placeholder="Choose workspaces"
      >
        <MultiSelectItem value="production">Production</MultiSelectItem>
        <MultiSelectItem value="staging">Staging</MultiSelectItem>
      </MultiSelect>,
    );

    const root = container.querySelector('[data-slot="multi-select"]');
    const control = container.querySelector(
      '[data-slot="multi-select-control"]',
    );
    const input = screen.getByRole("combobox", { name: /Workspaces/ });
    const trigger = screen.getByRole("button", { name: /Show options/ });

    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveClass("custom-multi-select");
    expect(ref.current).toBe(root);
    expect(control).not.toHaveTextContent("Choose workspacesChoose workspaces");
    expect(input).toHaveAttribute("placeholder", "Choose workspaces");
    expect(
      multiSelectClassNames({ className: "custom-multi-select" }),
    ).toContain("custom-multi-select");
    expect(multiSelectItemClassNames({ className: "custom-item" })).toContain(
      "custom-item",
    );

    await user.click(trigger);

    expect(
      screen.getByRole("combobox", { name: /Workspaces/ }),
    ).toBeInTheDocument();
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
        <MultiSelect label="Workspaces">
          <MultiSelectItem value="production">
            <strong>Production</strong>
            <span>Receives production deploys.</span>
          </MultiSelectItem>
        </MultiSelect>,
      );

      await user.click(screen.getByRole("button", { name: /Show options/ }));

      expect(warn).not.toHaveBeenCalledWith(
        expect.stringContaining("textValue prop is required"),
      );
    } finally {
      warn.mockRestore();
    }
  });

  it("supports controlled value changes and chip removal", async () => {
    const user = userEvent.setup();

    function ControlledMultiSelect() {
      const [value, setValue] = useState(["staging"]);

      return (
        <>
          <MultiSelect
            label="Environments"
            value={value}
            onValueChange={setValue}
          >
            <MultiSelectItem value="production">Production</MultiSelectItem>
            <MultiSelectItem value="staging">Staging</MultiSelectItem>
          </MultiSelect>
          <output>{value.join(",") || "none"}</output>
        </>
      );
    }

    const { container } = render(<ControlledMultiSelect />);

    expect(
      container.querySelector('[data-slot="multi-select-chip"]'),
    ).toHaveTextContent("Staging");
    expect(screen.getByText("staging")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Show options/ }));
    await user.click(screen.getByRole("option", { name: "Production" }));

    expect(screen.getByText("staging,production")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Remove Staging/ }));

    expect(screen.getByText("production")).toBeInTheDocument();
    expect(screen.queryByText("staging,production")).not.toBeInTheDocument();
  });

  it("supports uncontrolled values, clear all, and repeated native form data", async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="MultiSelect form">
        <MultiSelect label="Regions" name="regions" defaultValue={["us", "eu"]}>
          <MultiSelectItem value="us">US</MultiSelectItem>
          <MultiSelectItem value="eu">EU</MultiSelectItem>
          <MultiSelectItem value="apac">APAC</MultiSelectItem>
        </MultiSelect>
      </form>,
    );

    const form = screen.getByRole("form", { name: "MultiSelect form" });

    expect(new FormData(form as HTMLFormElement).getAll("regions")).toEqual([
      "us",
      "eu",
    ]);

    await user.click(screen.getByRole("button", { name: /Show options/ }));
    await user.click(screen.getByRole("option", { name: "APAC" }));

    expect(new FormData(form as HTMLFormElement).getAll("regions")).toEqual([
      "us",
      "eu",
      "apac",
    ]);

    await user.click(
      screen.getByRole("button", { name: /Clear selected options/ }),
    );

    expect(new FormData(form as HTMLFormElement).getAll("regions")).toEqual([]);
  });

  it("does not submit disabled named values", () => {
    render(
      <form aria-label="Disabled MultiSelect form">
        <MultiSelect
          disabled
          label="Regions"
          name="regions"
          defaultValue={["us"]}
        >
          <MultiSelectItem value="us">US</MultiSelectItem>
        </MultiSelect>
      </form>,
    );

    const form = screen.getByRole("form", {
      name: "Disabled MultiSelect form",
    });

    expect(new FormData(form as HTMLFormElement).has("regions")).toBe(false);
  });

  it("filters data-driven items from the search field", async () => {
    const user = userEvent.setup();

    render(
      <MultiSelect label="Default workspaces" items={workspaceItems}>
        {(item) => (
          <MultiSelectItem key={item.value} value={item.value}>
            {item.label}
          </MultiSelectItem>
        )}
      </MultiSelect>,
    );

    await user.click(screen.getByRole("button", { name: /Show options/ }));
    await user.type(
      screen.getByRole("combobox", { name: /Default workspaces/ }),
      "stag",
    );

    const listbox = screen.getByRole("listbox");

    expect(
      within(listbox).getByRole("option", { name: "Staging" }),
    ).toBeInTheDocument();
    expect(
      within(listbox).queryByRole("option", { name: "Production" }),
    ).not.toBeInTheDocument();
  });

  it("opens and filters options when typing into a closed search field", async () => {
    const user = userEvent.setup();

    render(
      <MultiSelect label="Teams">
        <MultiSelectItem value="operations">Operations</MultiSelectItem>
        <MultiSelectItem value="finance">Finance</MultiSelectItem>
        <MultiSelectItem value="revops">RevOps</MultiSelectItem>
      </MultiSelect>,
    );

    await user.click(screen.getByRole("combobox", { name: /Teams/ }));
    await user.type(screen.getByRole("combobox", { name: /Teams/ }), "fin");

    const listbox = await screen.findByRole("listbox");

    expect(
      within(listbox).getByRole("option", { name: "Finance" }),
    ).toBeInTheDocument();
    expect(
      within(listbox).queryByRole("option", { name: "Operations" }),
    ).not.toBeInTheDocument();
  });

  it("renders an empty state when search has no matching items", async () => {
    const user = userEvent.setup();

    render(
      <MultiSelect label="Workspace" emptyMessage="No workspace found">
        <MultiSelectItem value="production">Production</MultiSelectItem>
      </MultiSelect>,
    );

    await user.click(screen.getByRole("button", { name: /Show options/ }));
    await user.type(
      screen.getByRole("combobox", { name: /Workspace/ }),
      "missing",
    );

    expect(screen.getByText("No workspace found")).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("supports user-driven open state changes", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    render(
      <MultiSelect label="Open workspace" onOpenChange={handleOpenChange}>
        <MultiSelectItem value="production">Production</MultiSelectItem>
        <MultiSelectItem value="staging">Staging</MultiSelectItem>
      </MultiSelect>,
    );

    await user.click(screen.getByRole("button", { name: /Show options/ }));

    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    await user.keyboard("{Escape}");

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports disabled options, invalid state, and read-only state", async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();

    const { container } = render(
      <MultiSelect
        disabledKeys={["staging"]}
        errorMessage="Choose at least one available workspace."
        invalid
        label="Reviewed workspaces"
        onValueChange={handleValueChange}
        readOnly
        required
      >
        <MultiSelectItem value="production">Production</MultiSelectItem>
        <MultiSelectItem value="staging">Staging</MultiSelectItem>
      </MultiSelect>,
    );

    const root = container.querySelector('[data-slot="multi-select"]');
    const control = container.querySelector(
      '[data-slot="multi-select-control"]',
    );

    expect(root).toHaveAttribute("data-readonly", "true");
    expect(control).toHaveAttribute("data-invalid", "true");
    expect(control).toHaveAttribute("data-required", "true");
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("Choose at least one available workspace."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Show options/ }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(handleValueChange).not.toHaveBeenCalled();
  });

  it.each(["grammar", "spelling"] as const)(
    "preserves aria-invalid=%s while styling the invalid state",
    (ariaInvalid) => {
      const { container } = render(
        <MultiSelect aria-invalid={ariaInvalid} label="Reviewed workspaces">
          <MultiSelectItem value="production">Production</MultiSelectItem>
        </MultiSelect>,
      );

      const control = container.querySelector(
        '[data-slot="multi-select-control"]',
      );

      expect(control).toHaveAttribute("aria-invalid", ariaInvalid);
      expect(control).toHaveAttribute("data-invalid", "true");
    },
  );

  it("preserves extra fields in data-driven item typing", () => {
    const valid = (
      <MultiSelect label="Rich workspace" items={richWorkspaceItems}>
        {(item) => (
          <MultiSelectItem value={item.value} textValue={item.description}>
            {item.label}
          </MultiSelectItem>
        )}
      </MultiSelect>
    );

    expect(valid).toBeTruthy();
  });

  it("mirrors provider context onto the body portal host for opened menus", async () => {
    const user = userEvent.setup();

    render(
      <DethinkProvider
        className="custom-provider"
        data-testid="multi-select-provider"
        theme="dark"
        density="compact"
        dir="rtl"
      >
        <MultiSelect label="Provider workspace" defaultValue={["production"]}>
          <MultiSelectItem value="production">Production</MultiSelectItem>
          <MultiSelectItem value="staging">Staging</MultiSelectItem>
        </MultiSelect>
      </DethinkProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Show options/ }));

    const popover = screen
      .getByRole("listbox")
      .closest<HTMLElement>('[data-slot="multi-select-popover"]');
    const portalHost = popover?.closest<HTMLElement>(
      '[data-slot="multi-select-portal-container"]',
    );
    const provider = screen.getByTestId("multi-select-provider");

    if (!popover || !portalHost) {
      throw new Error(
        "MultiSelect popover should render inside a portal host.",
      );
    }

    expect(document.body).toContainElement(portalHost);
    expect(provider).not.toContainElement(popover);
    expect(portalHost).toHaveAttribute("data-dethink-provider", "");
    expect(portalHost).toHaveAttribute("data-theme", "dark");
    expect(portalHost).toHaveAttribute("data-density", "compact");
    expect(portalHost).toHaveAttribute("dir", "rtl");
    expect(portalHost).toHaveClass("custom-provider");
  });
});
