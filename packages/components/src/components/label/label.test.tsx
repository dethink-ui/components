import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../form-field";
import { Label, labelClassNames, type LabelMarker, type LabelSize } from ".";

describe("Label", () => {
  it("renders a native label with explicit control association", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label htmlFor="workspace-name">Workspace name</Label>
        <input id="workspace-name" />
      </div>,
    );

    const label = screen.getByText("Workspace name");
    const input = screen.getByLabelText("Workspace name");

    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "workspace-name");
    expect(label).toHaveAttribute("data-slot", "label");
    expect(label).toHaveAttribute("data-size", "md");
    expect(label).not.toHaveAttribute("role");
    expect(label).not.toHaveAttribute("tabindex");
    expect(label).not.toHaveAttribute("data-required");
    expect(label).not.toHaveAttribute("data-optional");

    await user.click(label);

    expect(input).toHaveFocus();
  });

  it("renders visible required and optional markers with configurable content", () => {
    render(
      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Label htmlFor="notes" optional optionalMarker="Optional">
          Notes
        </Label>
        <Label htmlFor="hidden-required" required requiredMarker={false}>
          Hidden required
        </Label>
      </div>,
    );

    const requiredLabel = screen.getByText("Email").closest("label");
    const optionalLabel = screen.getByText("Notes").closest("label");
    const hiddenRequiredLabel = screen
      .getByText("Hidden required")
      .closest("label");

    expect(requiredLabel).toHaveAttribute("data-required", "true");
    expect(requiredLabel).not.toHaveAttribute("data-optional");
    expect(
      within(requiredLabel as HTMLLabelElement).getByText("(required)"),
    ).toHaveAttribute("data-slot", "label-required-marker");

    expect(optionalLabel).toHaveAttribute("data-optional", "true");
    expect(optionalLabel).not.toHaveAttribute("data-required");
    expect(
      within(optionalLabel as HTMLLabelElement).getByText("Optional"),
    ).toHaveAttribute("data-slot", "label-optional-marker");

    expect(hiddenRequiredLabel).toHaveAttribute("data-required", "true");
    expect(
      within(hiddenRequiredLabel as HTMLLabelElement).queryByText("(required)"),
    ).not.toBeInTheDocument();
  });

  it("exposes disabled, invalid, required, optional, and size state without mutating controls", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label htmlFor="manual-control" disabled invalid required size="lg">
          Manual control
        </Label>
        <input id="manual-control" />
      </div>,
    );

    const label = screen.getByText("Manual control").closest("label");
    const input = screen.getByLabelText(/Manual control/);

    expect(label).toHaveAttribute("data-disabled", "true");
    expect(label).toHaveAttribute("data-invalid", "true");
    expect(label).toHaveAttribute("data-required", "true");
    expect(label).toHaveAttribute("data-size", "lg");
    expect(input).not.toBeDisabled();
    expect(input).not.toBeRequired();
    expect(input).not.toHaveAttribute("aria-invalid");

    await user.click(label as HTMLLabelElement);

    expect(input).toHaveFocus();
  });

  it("merges consumer classes, native label attributes, and refs", () => {
    const ref = createRef<HTMLLabelElement>();

    render(
      <Label
        ref={ref}
        className="custom-label"
        htmlFor="custom-id"
        id="custom-label"
        title="Custom label title"
        size="sm"
      >
        Custom label
      </Label>,
    );

    const label = screen.getByText("Custom label");

    expect(label).toHaveAttribute("id", "custom-label");
    expect(label).toHaveAttribute("for", "custom-id");
    expect(label).toHaveAttribute("title", "Custom label title");
    expect(label).toHaveClass("custom-label");
    expect(ref.current).toBe(label);
    expect(
      labelClassNames({ className: "custom-label", size: "lg" }),
    ).toContain("custom-label");
    expect(labelClassNames({ size: "lg" })).toContain("text-base");
  });

  it("coexists with FieldLabel without replacing FormField relationships", () => {
    render(
      <div>
        <Field id="field-owned-email" invalid required>
          <FieldLabel>Field-owned email</FieldLabel>
          <FieldControl asChild>
            <input type="email" />
          </FieldControl>
          <FieldDescription>Use a monitored inbox.</FieldDescription>
          <FieldError>Enter a valid email address.</FieldError>
        </Field>
        <div>
          <Label htmlFor="standalone-email" required>
            Standalone email
          </Label>
          <input id="standalone-email" type="email" />
        </div>
      </div>,
    );

    const fieldInput = screen.getByLabelText(/Field-owned email/);
    const standaloneInput = screen.getByLabelText(/Standalone email/);

    expect(fieldInput).toHaveAttribute("id", "field-owned-email");
    expect(fieldInput).toHaveAttribute(
      "aria-describedby",
      "field-owned-email-description field-owned-email-error",
    );
    expect(fieldInput).toHaveAttribute(
      "aria-errormessage",
      "field-owned-email-error",
    );
    expect(fieldInput).toHaveAttribute("aria-invalid", "true");
    expect(fieldInput).toBeRequired();
    expect(standaloneInput).toHaveAttribute("id", "standalone-email");
    expect(standaloneInput).not.toBeRequired();
    expect(standaloneInput).not.toHaveAttribute("aria-describedby");
    expect(standaloneInput).not.toHaveAttribute("aria-invalid");
  });

  it("rejects unsupported public values at the TypeScript boundary", () => {
    const marker: LabelMarker = false;
    const size: LabelSize = "md";
    const valid = (
      <Label optionalMarker={marker} size={size}>
        Valid label
      </Label>
    );
    // @ts-expect-error Label sizes use constrained density-friendly values.
    const invalidSize = <Label size="xl">Large label</Label>;

    expect(valid).toBeTruthy();
    expect(invalidSize).toBeTruthy();
  });

  it("declares dependency-free registry metadata", () => {
    const registryItem = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "../../registry/items/label.json"),
        "utf8",
      ),
    ) as {
      dependencies: string[];
      devDependencies: string[];
      files: Array<{ path: string; type: string }>;
      name: string;
      registryDependencies: string[];
    };

    expect(registryItem.name).toBe("label");
    expect(registryItem.dependencies).toEqual([]);
    expect(registryItem.devDependencies).toEqual([]);
    expect(registryItem.registryDependencies).toEqual(["dethink-base"]);
    expect(registryItem.files).toEqual([
      {
        path: "packages/components/src/components/label/label.tsx",
        type: "registry:component",
      },
      {
        path: "packages/components/src/components/label/index.ts",
        type: "registry:component",
      },
      {
        path: "packages/components/src/utils/cn.ts",
        type: "registry:lib",
      },
    ]);
    expect(JSON.stringify(registryItem)).not.toContain("motion");
    expect(JSON.stringify(registryItem)).not.toContain("react-aria");
  });
});
