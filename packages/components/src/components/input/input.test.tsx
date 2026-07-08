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
import { Input, inputClassNames } from ".";

describe("Input", () => {
  it("renders a native input with attributes, classes, and refs", () => {
    const ref = createRef<HTMLInputElement>();

    render(
      <Input
        ref={ref}
        autoComplete="email"
        className="custom-input"
        controlSize="lg"
        defaultValue="ops@example.com"
        name="email"
        placeholder="name@example.com"
        type="email"
      />,
    );

    const input = screen.getByPlaceholderText("name@example.com");

    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("data-slot", "input");
    expect(input).toHaveAttribute("data-size", "lg");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveValue("ops@example.com");
    expect(input).toHaveClass("custom-input");
    expect(inputClassNames({ className: "custom-input" })).toContain(
      "custom-input",
    );
    expect(ref.current).toBe(input);
  });

  it("preserves controlled value behavior", async () => {
    const user = userEvent.setup();

    function ControlledInput() {
      const [value, setValue] = useState("Acme");

      return (
        <>
          <Input
            aria-label="Workspace"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <output>{value}</output>
        </>
      );
    }

    render(<ControlledInput />);

    const input = screen.getByLabelText("Workspace");

    await user.clear(input);
    await user.type(input, "Dethink");

    expect(input).toHaveValue("Dethink");
    expect(screen.getByText("Dethink")).toBeInTheDocument();
  });

  it("participates in native form data", () => {
    render(
      <form aria-label="Input form">
        <Input name="workspace" defaultValue="acme" />
      </form>,
    );

    const form = screen.getByRole("form", { name: "Input form" });
    const formData = new FormData(form as HTMLFormElement);

    expect(formData.get("workspace")).toBe("acme");
  });

  it("exposes invalid, disabled, required, and read-only state", () => {
    render(
      <Input
        aria-label="Tenant"
        disabled
        invalid
        readOnly
        required
        value="tenant_123"
      />,
    );

    const input = screen.getByLabelText("Tenant");

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
      <Field id="owner-email" invalid required>
        <FieldLabel>Owner email</FieldLabel>
        <FieldControl asChild>
          <Input name="owner" type="email" defaultValue="owner" />
        </FieldControl>
        <FieldDescription>Use a monitored inbox.</FieldDescription>
        <FieldError>Enter a valid email address.</FieldError>
      </Field>,
    );

    const input = screen.getByLabelText(/Owner email/);

    expect(input).toHaveAttribute("id", "owner-email");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "owner-email-description owner-email-error",
    );
    expect(input).toHaveAttribute("aria-errormessage", "owner-email-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("data-slot", "field-control");
    expect(input).toHaveClass(inputClassNames());
  });
});
