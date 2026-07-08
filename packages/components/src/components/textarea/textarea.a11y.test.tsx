import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../form-field";
import { Textarea } from ".";

expect.extend(toHaveNoViolations);

describe("Textarea accessibility", () => {
  it("has no axe violations with visible labels and descriptions", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Textarea accessibility smoke">
          <Field id="release-note" required>
            <FieldLabel>Release note</FieldLabel>
            <FieldControl asChild>
              <Textarea name="releaseNote" rows={4} />
            </FieldControl>
            <FieldDescription>
              Include customer-visible behavior changes.
            </FieldDescription>
          </Field>
        </main>
      </DethinkProvider>,
    );

    const textarea = screen.getByLabelText(/Release note/);

    expect(textarea).toHaveAttribute(
      "aria-describedby",
      "release-note-description",
    );
    expect(textarea).toBeRequired();

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for invalid field wiring", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Invalid textarea accessibility smoke">
          <Field id="approval-note" invalid>
            <FieldLabel>Approval note</FieldLabel>
            <FieldControl asChild>
              <Textarea defaultValue="No" />
            </FieldControl>
            <FieldError>Explain the approval decision.</FieldError>
          </Field>
        </main>
      </DethinkProvider>,
    );

    const textarea = screen.getByLabelText("Approval note");

    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute(
      "aria-errormessage",
      "approval-note-error",
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
