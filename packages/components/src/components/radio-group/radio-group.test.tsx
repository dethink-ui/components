import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../form-field";
import {
  RadioGroup,
  RadioGroupItem,
  radioGroupClassNames,
  radioGroupItemClassNames,
} from ".";

describe("RadioGroup", () => {
  it("renders native radio inputs with group state, attributes, classes, and refs", () => {
    const ref = createRef<HTMLInputElement>();

    render(
      <RadioGroup
        aria-label="Plan"
        className="custom-group"
        controlSize="lg"
        defaultValue="pro"
        name="plan"
        orientation="horizontal"
      >
        <label htmlFor="plan-free">Free</label>
        <RadioGroupItem id="plan-free" value="free" />
        <label htmlFor="plan-pro">Pro</label>
        <RadioGroupItem
          ref={ref}
          className="custom-item"
          id="plan-pro"
          value="pro"
        />
      </RadioGroup>,
    );

    const group = screen.getByLabelText("Plan");
    const free = screen.getByLabelText("Free");
    const pro = screen.getByLabelText("Pro");
    const proRoot = pro.closest("[data-slot='radio-group-item']");
    const indicator = proRoot?.querySelector(
      "[data-slot='radio-group-item-indicator']",
    );

    expect(group).toHaveAttribute("role", "radiogroup");
    expect(group).toHaveAttribute("aria-orientation", "horizontal");
    expect(group).toHaveAttribute("data-slot", "radio-group");
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveClass("custom-group");
    expect(radioGroupClassNames({ className: "custom-group" })).toContain(
      "custom-group",
    );
    expect(free).toHaveAttribute("type", "radio");
    expect(free).toHaveAttribute("name", "plan");
    expect(free).toHaveAttribute("value", "free");
    expect(free).not.toBeChecked();
    expect(pro).toBeChecked();
    expect(pro).toHaveAttribute("data-slot", "radio-group-item-input");
    expect(pro).toHaveAttribute("data-size", "lg");
    expect(proRoot).toHaveAttribute("data-state", "checked");
    expect(proRoot).toHaveClass("custom-item");
    expect(indicator).toHaveAttribute("data-state", "checked");
    expect(radioGroupItemClassNames({ className: "custom-item" })).toContain(
      "custom-item",
    );
    expect(ref.current).toBe(pro);
  });

  it("preserves controlled value behavior", async () => {
    const user = userEvent.setup();

    function ControlledRadioGroup() {
      const [value, setValue] = useState("manual");

      return (
        <>
          <RadioGroup name="mode" value={value} onValueChange={setValue}>
            <label htmlFor="mode-manual">Manual</label>
            <RadioGroupItem id="mode-manual" value="manual" />
            <label htmlFor="mode-auto">Automatic</label>
            <RadioGroupItem id="mode-auto" value="auto" />
          </RadioGroup>
          <output>{value}</output>
        </>
      );
    }

    render(<ControlledRadioGroup />);

    const automatic = screen.getByLabelText("Automatic");

    await user.click(automatic);

    expect(automatic).toBeChecked();
    expect(screen.getByText("auto")).toBeInTheDocument();
  });

  it("participates in native form data", () => {
    render(
      <form aria-label="Radio form">
        <RadioGroup name="billingCycle" defaultValue="annual">
          <RadioGroupItem aria-label="Monthly" value="monthly" />
          <RadioGroupItem aria-label="Annual" value="annual" />
        </RadioGroup>
      </form>,
    );

    const form = screen.getByRole("form", { name: "Radio form" });
    const formData = new FormData(form as HTMLFormElement);

    expect(formData.get("billingCycle")).toBe("annual");
  });

  it("exposes invalid, disabled, required, and read-only state", () => {
    render(
      <RadioGroup
        aria-label="Region"
        defaultValue="us"
        disabled
        invalid
        name="region"
        readOnly
        required
      >
        <RadioGroupItem aria-label="US" value="us" />
      </RadioGroup>,
    );

    const radio = screen.getByLabelText("US");
    const root = radio.closest("[data-slot='radio-group-item']");
    const group = screen.getByRole("radiogroup", { name: "Region" });

    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-required", "true");
    expect(radio).toBeDisabled();
    expect(radio).toBeRequired();
    expect(radio).toHaveAttribute("readonly");
    expect(radio).toHaveAttribute("aria-invalid", "true");
    expect(radio).toHaveAttribute("aria-readonly", "true");
    expect(root).toHaveAttribute("data-disabled", "true");
    expect(root).toHaveAttribute("data-invalid", "true");
    expect(root).toHaveAttribute("data-readonly", "true");
    expect(root).toHaveAttribute("data-required", "true");
  });

  it("prevents read-only user changes without emitting value changes", async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();
    const handleChange = vi.fn();

    render(
      <RadioGroup
        name="readonlyMode"
        defaultValue="manual"
        readOnly
        onValueChange={handleValueChange}
      >
        <label htmlFor="readonly-manual">Manual</label>
        <RadioGroupItem id="readonly-manual" value="manual" />
        <label htmlFor="readonly-auto">Automatic</label>
        <RadioGroupItem
          id="readonly-auto"
          value="auto"
          onChange={handleChange}
        />
      </RadioGroup>,
    );

    const manual = screen.getByLabelText("Manual");
    const automatic = screen.getByLabelText("Automatic");

    await user.click(automatic);

    expect(manual).toBeChecked();
    expect(automatic).not.toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();
    expect(handleValueChange).not.toHaveBeenCalled();
  });

  it("supports keyboard selection through native radios", async () => {
    const user = userEvent.setup();

    render(
      <RadioGroup name="density" defaultValue="compact">
        <label htmlFor="density-compact">Compact</label>
        <RadioGroupItem id="density-compact" value="compact" />
        <label htmlFor="density-comfortable">Comfortable</label>
        <RadioGroupItem id="density-comfortable" value="comfortable" />
      </RadioGroup>,
    );

    const comfortable = screen.getByLabelText("Comfortable");

    comfortable.focus();
    await user.keyboard("[Space]");

    expect(comfortable).toBeChecked();
  });

  it("preserves item onChange before group value changes", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleValueChange = vi.fn();

    render(
      <RadioGroup
        name="delivery"
        defaultValue="standard"
        onValueChange={handleValueChange}
      >
        <label htmlFor="delivery-standard">Standard</label>
        <RadioGroupItem id="delivery-standard" value="standard" />
        <label htmlFor="delivery-priority">Priority</label>
        <RadioGroupItem
          id="delivery-priority"
          value="priority"
          onChange={handleChange}
        />
      </RadioGroup>,
    );

    const priority = screen.getByLabelText("Priority");

    await user.click(priority);

    expect(priority).toBeChecked();
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleValueChange).toHaveBeenCalledWith("priority");
  });

  it("composes with FieldSet, FieldControl, and error relationships", () => {
    render(
      <FieldSet aria-describedby="response-mode-help response-mode-error">
        <FieldLegend>Response mode</FieldLegend>
        <FieldDescription id="response-mode-help">
          Choose how the assistant should answer.
        </FieldDescription>
        <RadioGroup
          name="responseMode"
          defaultValue="balanced"
          invalid
          required
        >
          <FieldGroup>
            <Field id="response-fast" orientation="horizontal" invalid>
              <FieldControl asChild>
                <RadioGroupItem value="fast" />
              </FieldControl>
              <FieldLabel>Fast</FieldLabel>
            </Field>
            <Field id="response-balanced" orientation="horizontal" invalid>
              <FieldControl asChild>
                <RadioGroupItem value="balanced" />
              </FieldControl>
              <FieldLabel>Balanced</FieldLabel>
            </Field>
          </FieldGroup>
        </RadioGroup>
        <FieldError id="response-mode-error">
          Select a response mode.
        </FieldError>
      </FieldSet>,
    );

    const fast = screen.getByLabelText("Fast");
    const balanced = screen.getByLabelText("Balanced");

    expect(fast).toHaveAttribute("id", "response-fast");
    expect(fast).toHaveAttribute("aria-invalid", "true");
    expect(fast).toBeRequired();
    expect(balanced).toBeChecked();
    expect(balanced.closest("[data-slot='field-control']")).toHaveClass(
      radioGroupItemClassNames(),
    );
  });
});
