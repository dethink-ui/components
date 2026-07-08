import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Form,
} from "../form-field";
import { Input } from "../input";
import { NumberInput } from "../number-input";
import { Textarea } from "../textarea";

describe("Input controls suite", () => {
  it("composes all controls in a native form", () => {
    render(
      <Form aria-label="Settings form">
        <Field id="settings-name">
          <FieldLabel>Name</FieldLabel>
          <FieldControl asChild>
            <Input name="name" defaultValue="Operations" />
          </FieldControl>
        </Field>
        <Field id="settings-notes">
          <FieldLabel>Notes</FieldLabel>
          <FieldControl asChild>
            <Textarea name="notes" defaultValue="Review weekly." rows={3} />
          </FieldControl>
        </Field>
        <Field id="settings-quota">
          <FieldLabel>Quota</FieldLabel>
          <FieldControl asChild>
            <NumberInput name="quota" defaultValue="025" numberMode="numeric" />
          </FieldControl>
          <FieldDescription>
            Values remain strings until app validation.
          </FieldDescription>
        </Field>
      </Form>,
    );

    const form = screen.getByRole("form", { name: "Settings form" });
    const formData = new FormData(form as HTMLFormElement);

    expect(formData.get("name")).toBe("Operations");
    expect(formData.get("notes")).toBe("Review weekly.");
    expect(formData.get("quota")).toBe("025");
    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "data-slot",
      "field-control",
    );
    expect(screen.getByLabelText("Notes")).toHaveAttribute(
      "data-slot",
      "field-control",
    );
    expect(screen.getByLabelText("Quota")).toHaveAttribute(
      "inputmode",
      "numeric",
    );
  });
});
