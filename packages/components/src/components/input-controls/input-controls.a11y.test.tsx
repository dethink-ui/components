import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Form,
} from "../form-field";
import { Input } from "../input";
import { NumberInput } from "../number-input";
import { Textarea } from "../textarea";

expect.extend(toHaveNoViolations);

describe("Input controls suite accessibility", () => {
  it("has no axe violations for mixed visible-label controls", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Input controls suite accessibility smoke">
          <Form>
            <Field id="suite-name" required>
              <FieldLabel>Name</FieldLabel>
              <FieldControl asChild>
                <Input name="name" />
              </FieldControl>
              <FieldDescription>
                Visible label and helper text.
              </FieldDescription>
            </Field>
            <Field id="suite-notes">
              <FieldLabel>Notes</FieldLabel>
              <FieldControl asChild>
                <Textarea name="notes" rows={4} />
              </FieldControl>
            </Field>
            <Field id="suite-quota" invalid>
              <FieldLabel>Quota</FieldLabel>
              <FieldControl asChild>
                <NumberInput name="quota" defaultValue="0" />
              </FieldControl>
              <FieldError>Enter a quota above zero.</FieldError>
            </Field>
          </Form>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
