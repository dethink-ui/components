import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Form,
} from "../form-field";
import { Checkbox } from "../checkbox";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Switch } from "../switch";

expect.extend(toHaveNoViolations);

describe("Choice controls suite accessibility", () => {
  it("has no axe violations for visible labels, groups, invalid wiring, and state boundaries", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Choice controls accessibility smoke">
          <Form>
            <FieldSet aria-describedby="suite-permissions-help suite-permissions-error">
              <FieldLegend>Permission choices</FieldLegend>
              <FieldDescription id="suite-permissions-help">
                Choose at least one permission for the selected role.
              </FieldDescription>
              <FieldGroup>
                <Field id="suite-permission-read" orientation="horizontal">
                  <FieldControl asChild>
                    <Checkbox name="permissions" value="read" defaultChecked />
                  </FieldControl>
                  <FieldLabel>Read records</FieldLabel>
                </Field>
                <Field
                  id="suite-permission-write"
                  orientation="horizontal"
                  invalid
                >
                  <FieldControl asChild>
                    <Checkbox
                      name="permissions"
                      value="write"
                      aria-invalid="true"
                    />
                  </FieldControl>
                  <FieldLabel>Write records</FieldLabel>
                </Field>
                <Field
                  id="suite-permission-all"
                  orientation="horizontal"
                  readOnly
                >
                  <FieldControl asChild>
                    <Checkbox defaultChecked="indeterminate" readOnly />
                  </FieldControl>
                  <FieldLabel>Select all permissions</FieldLabel>
                </Field>
              </FieldGroup>
              <FieldError id="suite-permissions-error">
                Confirm write access before saving.
              </FieldError>
            </FieldSet>

            <FieldSet aria-describedby="suite-model-help">
              <FieldLegend>AI model setting</FieldLegend>
              <FieldDescription id="suite-model-help">
                Radio options stay native and mutually exclusive.
              </FieldDescription>
              <RadioGroup name="modelFamily" defaultValue="balanced" required>
                <Field id="suite-model-fast" orientation="horizontal">
                  <FieldControl asChild>
                    <RadioGroupItem value="fast" />
                  </FieldControl>
                  <FieldLabel>Fast model</FieldLabel>
                </Field>
                <Field id="suite-model-balanced" orientation="horizontal">
                  <FieldControl asChild>
                    <RadioGroupItem value="balanced" />
                  </FieldControl>
                  <FieldLabel>Balanced model</FieldLabel>
                </Field>
              </RadioGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>AI tool switches</FieldLegend>
              <FieldGroup>
                <Field id="suite-tool-browser" orientation="horizontal">
                  <FieldContent>
                    <FieldLabel>Browser tool</FieldLabel>
                    <FieldDescription>
                      The label remains stable as state changes.
                    </FieldDescription>
                  </FieldContent>
                  <FieldControl asChild>
                    <Switch name="browserTool" value="enabled" defaultChecked />
                  </FieldControl>
                </Field>
                <Field
                  id="suite-tool-terminal"
                  orientation="horizontal"
                  disabled
                >
                  <FieldContent>
                    <FieldLabel>Terminal tool</FieldLabel>
                    <FieldDescription>
                      Disabled by workspace policy.
                    </FieldDescription>
                  </FieldContent>
                  <FieldControl asChild>
                    <Switch name="terminalTool" value="enabled" disabled />
                  </FieldControl>
                </Field>
                <Field
                  id="suite-tool-network"
                  orientation="horizontal"
                  readOnly
                >
                  <FieldContent>
                    <FieldLabel>Network access</FieldLabel>
                    <FieldDescription>
                      Read-only inherited environment setting.
                    </FieldDescription>
                  </FieldContent>
                  <FieldControl asChild>
                    <Switch
                      name="networkAccess"
                      value="enabled"
                      readOnly
                      defaultChecked
                    />
                  </FieldControl>
                </Field>
              </FieldGroup>
            </FieldSet>
          </Form>
        </main>
      </DethinkProvider>,
    );

    expect(screen.getByLabelText("Select all permissions")).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
    expect(screen.getByLabelText("Write records")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Balanced model")).toHaveAttribute(
      "type",
      "radio",
    );
    expect(screen.getByRole("switch", { name: "Browser tool" })).toBeChecked();
    expect(
      screen.getByRole("switch", { name: "Terminal tool" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("switch", { name: "Network access" }),
    ).toHaveAttribute("aria-readonly", "true");

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
