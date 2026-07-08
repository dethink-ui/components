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
import { Textarea, textareaClassNames } from ".";

describe("Textarea", () => {
  it("renders a native textarea with attributes, classes, and refs", () => {
    const ref = createRef<HTMLTextAreaElement>();

    render(
      <Textarea
        ref={ref}
        className="custom-textarea"
        controlSize="lg"
        defaultValue="Initial note"
        maxLength={200}
        minLength={5}
        name="note"
        placeholder="Write a note"
        rows={6}
        resize="both"
      />,
    );

    const textarea = screen.getByPlaceholderText("Write a note");

    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("data-slot", "textarea");
    expect(textarea).toHaveAttribute("data-size", "lg");
    expect(textarea).toHaveAttribute("data-resize", "both");
    expect(textarea).toHaveAttribute("maxlength", "200");
    expect(textarea).toHaveAttribute("minlength", "5");
    expect(textarea).toHaveAttribute("name", "note");
    expect(textarea).toHaveAttribute("rows", "6");
    expect(textarea).toHaveValue("Initial note");
    expect(textarea).toHaveClass("custom-textarea", "resize");
    expect(textareaClassNames({ className: "custom-textarea" })).toContain(
      "custom-textarea",
    );
    expect(ref.current).toBe(textarea);
  });

  it("preserves controlled value behavior", async () => {
    const user = userEvent.setup();

    function ControlledTextarea() {
      const [value, setValue] = useState("Draft");

      return (
        <>
          <Textarea
            aria-label="Release note"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <output aria-label="Release note mirror">{value}</output>
        </>
      );
    }

    render(<ControlledTextarea />);

    const textarea = screen.getByLabelText("Release note");

    await user.clear(textarea);
    await user.type(textarea, "Shipped");

    expect(textarea).toHaveValue("Shipped");
    expect(screen.getByLabelText("Release note mirror")).toHaveTextContent(
      "Shipped",
    );
  });

  it("participates in native form data", () => {
    render(
      <form aria-label="Textarea form">
        <Textarea name="summary" defaultValue="Quarterly summary" />
      </form>,
    );

    const form = screen.getByRole("form", { name: "Textarea form" });
    const formData = new FormData(form as HTMLFormElement);

    expect(formData.get("summary")).toBe("Quarterly summary");
  });

  it("exposes invalid, disabled, required, and read-only state", () => {
    render(
      <Textarea
        aria-label="Locked note"
        disabled
        invalid
        readOnly
        required
        value="Locked"
      />,
    );

    const textarea = screen.getByLabelText("Locked note");

    expect(textarea).toBeDisabled();
    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute("readonly");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("data-disabled", "true");
    expect(textarea).toHaveAttribute("data-invalid", "true");
    expect(textarea).toHaveAttribute("data-readonly", "true");
    expect(textarea).toHaveAttribute("data-required", "true");
  });

  it("composes with FieldControl relationships", () => {
    render(
      <Field id="incident-summary" invalid required>
        <FieldLabel>Incident summary</FieldLabel>
        <FieldControl asChild>
          <Textarea name="summary" defaultValue="Too short" rows={4} />
        </FieldControl>
        <FieldDescription>
          Summarize customer impact and owner action.
        </FieldDescription>
        <FieldError>Add more detail before submitting.</FieldError>
      </Field>,
    );

    const textarea = screen.getByLabelText(/Incident summary/);

    expect(textarea).toHaveAttribute("id", "incident-summary");
    expect(textarea).toHaveAttribute(
      "aria-describedby",
      "incident-summary-description incident-summary-error",
    );
    expect(textarea).toHaveAttribute(
      "aria-errormessage",
      "incident-summary-error",
    );
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute("data-slot", "field-control");
    expect(textarea).toHaveClass(textareaClassNames());
  });
});
