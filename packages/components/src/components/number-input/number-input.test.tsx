import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../form-field";
import { NumberInput, numberInputClassNames } from ".";

describe("NumberInput", () => {
  it("defaults to text input semantics with decimal input mode", () => {
    const ref = createRef<HTMLInputElement>();

    render(
      <NumberInput
        ref={ref}
        className="custom-number-input"
        controlSize="lg"
        defaultValue="001.50"
        max="100"
        min="0"
        name="budget"
        pattern="[0-9]*"
        placeholder="0.00"
        step="0.25"
      />,
    );

    const input = screen.getByPlaceholderText("0.00");

    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("data-slot", "number-input");
    expect(input).toHaveAttribute("data-size", "lg");
    expect(input).toHaveAttribute("data-number-mode", "decimal");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "100");
    expect(input).toHaveAttribute("step", "0.25");
    expect(input).toHaveAttribute("pattern", "[0-9]*");
    expect(input).toHaveValue("001.50");
    expect(input).toHaveClass("custom-number-input");
    expect(
      numberInputClassNames({ className: "custom-number-input" }),
    ).toContain("custom-number-input");
    expect(ref.current).toBe(input);
  });

  it("supports numeric keyboard mode and explicit native number type", () => {
    render(
      <>
        <NumberInput
          aria-label="Seats"
          numberMode="numeric"
          defaultValue="12"
        />
        <NumberInput
          aria-label="Native quantity"
          type="number"
          min="1"
          max="10"
          step="1"
          defaultValue="3"
        />
      </>,
    );

    expect(screen.getByLabelText("Seats")).toHaveAttribute(
      "inputmode",
      "numeric",
    );
    expect(screen.getByLabelText("Seats")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Native quantity")).toHaveAttribute(
      "type",
      "number",
    );
  });

  it("preserves controlled string value behavior", async () => {
    const user = userEvent.setup();

    function ControlledNumberInput() {
      const [value, setValue] = useState("001");

      return (
        <>
          <NumberInput
            aria-label="Quota"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <output>{value}</output>
        </>
      );
    }

    render(<ControlledNumberInput />);

    const input = screen.getByLabelText("Quota");

    await user.clear(input);
    await user.type(input, "001.25");

    expect(input).toHaveValue("001.25");
    expect(screen.getByText("001.25")).toBeInTheDocument();
  });

  it("participates in native form data without coercing values", () => {
    render(
      <form aria-label="Number form">
        <NumberInput name="quota" defaultValue="001.25" />
      </form>,
    );

    const form = screen.getByRole("form", { name: "Number form" });
    const formData = new FormData(form as HTMLFormElement);

    expect(formData.get("quota")).toBe("001.25");
  });

  it("exposes invalid, disabled, required, and read-only state", () => {
    render(
      <NumberInput
        aria-label="Locked budget"
        disabled
        invalid
        readOnly
        required
        value="100"
      />,
    );

    const input = screen.getByLabelText("Locked budget");

    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("data-disabled", "true");
    expect(input).toHaveAttribute("data-invalid", "true");
    expect(input).toHaveAttribute("data-readonly", "true");
    expect(input).toHaveAttribute("data-required", "true");
  });

  it("composes with FieldControl relationships", () => {
    render(
      <Field id="monthly-budget" invalid required>
        <FieldLabel>Monthly budget</FieldLabel>
        <FieldControl asChild>
          <NumberInput name="budget" defaultValue="1000" />
        </FieldControl>
        <FieldDescription>Enter a whole number of dollars.</FieldDescription>
        <FieldError>Budget must be greater than zero.</FieldError>
      </Field>,
    );

    const input = screen.getByLabelText(/Monthly budget/);

    expect(input).toHaveAttribute("id", "monthly-budget");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "monthly-budget-description monthly-budget-error",
    );
    expect(input).toHaveAttribute("aria-errormessage", "monthly-budget-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("data-slot", "field-control");
    expect(input).toHaveClass(numberInputClassNames());
  });
});
