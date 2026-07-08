import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../form-field";
import { Checkbox, checkboxClassNames } from ".";

describe("Checkbox", () => {
  it("renders a native checkbox input with attributes, classes, and refs", () => {
    const ref = createRef<HTMLInputElement>();

    render(
      <>
        <label htmlFor="terms">Accept terms</label>
        <Checkbox
          ref={ref}
          className="custom-checkbox"
          controlSize="lg"
          defaultChecked
          id="terms"
          name="terms"
          value="accepted"
        />
      </>,
    );

    const checkbox = screen.getByLabelText("Accept terms");
    const root = checkbox.closest("[data-slot='checkbox']");
    const indicator = root?.querySelector("[data-slot='checkbox-indicator']");

    expect(checkbox.tagName).toBe("INPUT");
    expect(checkbox).toHaveAttribute("data-slot", "checkbox-input");
    expect(checkbox).toHaveAttribute("data-size", "lg");
    expect(checkbox).toHaveAttribute("name", "terms");
    expect(checkbox).toHaveAttribute("type", "checkbox");
    expect(checkbox).toHaveAttribute("value", "accepted");
    expect(checkbox).toBeChecked();
    expect(root).toHaveAttribute("data-state", "checked");
    expect(root).toHaveClass("custom-checkbox");
    expect(indicator).toHaveAttribute("data-state", "checked");
    expect(checkboxClassNames({ className: "custom-checkbox" })).toContain(
      "custom-checkbox",
    );
    expect(ref.current).toBe(checkbox);
  });

  it("preserves controlled checked behavior", async () => {
    const user = userEvent.setup();

    function ControlledCheckbox() {
      const [checked, setChecked] = useState(false);

      return (
        <>
          <label htmlFor="controlled-checkbox">Email updates</label>
          <Checkbox
            id="controlled-checkbox"
            checked={checked}
            onCheckedChange={(nextChecked) => setChecked(nextChecked === true)}
          />
          <output>{checked ? "enabled" : "disabled"}</output>
        </>
      );
    }

    render(<ControlledCheckbox />);

    const checkbox = screen.getByLabelText("Email updates");

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByText("enabled")).toBeInTheDocument();
  });

  it("supports keyboard toggling through the native input", async () => {
    const user = userEvent.setup();

    render(
      <>
        <label htmlFor="keyboard-checkbox">Keyboard checkbox</label>
        <Checkbox id="keyboard-checkbox" />
      </>,
    );

    const checkbox = screen.getByLabelText("Keyboard checkbox");

    checkbox.focus();
    await user.keyboard("[Space]");

    expect(checkbox).toBeChecked();
  });

  it("preserves native onChange before emitting checked changes", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleCheckedChange = vi.fn();

    render(
      <>
        <label htmlFor="change-checkbox">Change checkbox</label>
        <Checkbox
          id="change-checkbox"
          onChange={handleChange}
          onCheckedChange={handleCheckedChange}
        />
      </>,
    );

    await user.click(screen.getByLabelText("Change checkbox"));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it("exposes indeterminate state and resolves to checked on user change", async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();

    render(
      <>
        <label htmlFor="select-all">Select all</label>
        <Checkbox
          id="select-all"
          defaultChecked="indeterminate"
          onCheckedChange={handleCheckedChange}
        />
      </>,
    );

    const checkbox = screen.getByLabelText("Select all") as HTMLInputElement;
    const root = checkbox.closest("[data-slot='checkbox']");

    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    expect(root).toHaveAttribute("data-state", "indeterminate");
    expect(root).toHaveAttribute("data-indeterminate", "true");

    await user.click(checkbox);

    expect(checkbox.indeterminate).toBe(false);
    expect(checkbox).toBeChecked();
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it("participates in native form data", () => {
    render(
      <form aria-label="Checkbox form">
        <Checkbox name="channels" value="email" defaultChecked />
        <Checkbox name="channels" value="sms" />
      </form>,
    );

    const form = screen.getByRole("form", { name: "Checkbox form" });
    const formData = new FormData(form as HTMLFormElement);

    expect(formData.getAll("channels")).toEqual(["email"]);
  });

  it("exposes invalid, disabled, required, and read-only state", () => {
    render(
      <>
        <label htmlFor="locked-choice">Locked choice</label>
        <Checkbox
          id="locked-choice"
          disabled
          invalid
          readOnly
          required
          defaultChecked
        />
      </>,
    );

    const checkbox = screen.getByLabelText("Locked choice");
    const root = checkbox.closest("[data-slot='checkbox']");

    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeRequired();
    expect(checkbox).toHaveAttribute("readonly");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-readonly", "true");
    expect(root).toHaveAttribute("data-disabled", "true");
    expect(root).toHaveAttribute("data-invalid", "true");
    expect(root).toHaveAttribute("data-readonly", "true");
    expect(root).toHaveAttribute("data-required", "true");
  });

  it("prevents read-only user changes without emitting checked changes", async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();
    const handleChange = vi.fn();

    render(
      <>
        <label htmlFor="readonly-checkbox">Read-only checkbox</label>
        <Checkbox
          id="readonly-checkbox"
          readOnly
          defaultChecked
          onChange={handleChange}
          onCheckedChange={handleCheckedChange}
        />
      </>,
    );

    const checkbox = screen.getByLabelText("Read-only checkbox");

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();
    expect(handleCheckedChange).not.toHaveBeenCalled();
  });

  it("composes with FieldControl relationships", () => {
    render(
      <Field id="email-alerts" invalid required>
        <FieldControl asChild>
          <Checkbox name="alerts" value="email" />
        </FieldControl>
        <FieldLabel>Email alerts</FieldLabel>
        <FieldDescription>Send operational reports.</FieldDescription>
        <FieldError>Select at least one alert channel.</FieldError>
      </Field>,
    );

    const checkbox = screen.getByLabelText(/Email alerts/);
    const root = checkbox.closest("[data-slot='field-control']");

    expect(checkbox).toHaveAttribute("id", "email-alerts");
    expect(checkbox).toHaveAttribute(
      "aria-describedby",
      "email-alerts-description email-alerts-error",
    );
    expect(checkbox).toHaveAttribute("aria-errormessage", "email-alerts-error");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toBeRequired();
    expect(root).toHaveClass(checkboxClassNames());
  });
});
