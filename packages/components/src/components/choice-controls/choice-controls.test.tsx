import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Checkbox,
  DethinkProvider,
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
  RadioGroup,
  RadioGroupItem,
  Switch,
  checkboxClassNames,
  radioGroupClassNames,
  radioGroupItemClassNames,
  switchClassNames,
  type CheckboxCheckedState,
  type CheckboxControlSize,
  type RadioGroupControlSize,
  type RadioGroupItemProps,
  type RadioGroupOrientation,
  type RadioGroupProps,
  type SwitchControlSize,
  type SwitchProps,
} from "../../index";

describe("Choice controls suite", () => {
  it("exports the package surface for all choice primitives", () => {
    const checkboxState: CheckboxCheckedState = "indeterminate";
    const checkboxSize: CheckboxControlSize = "md";
    const radioSize: RadioGroupControlSize = "sm";
    const radioOrientation: RadioGroupOrientation = "horizontal";
    const radioProps: Pick<RadioGroupProps, "orientation"> = {
      orientation: radioOrientation,
    };
    const radioItemProps: Pick<RadioGroupItemProps, "value"> = {
      value: "balanced",
    };
    const switchSize: SwitchControlSize = "lg";
    const switchProps: Pick<SwitchProps, "checked"> = { checked: true };

    expect(Checkbox).toBeTypeOf("object");
    expect(RadioGroup).toBeTypeOf("object");
    expect(RadioGroupItem).toBeTypeOf("object");
    expect(Switch).toBeTypeOf("object");
    expect(checkboxClassNames({ controlSize: checkboxSize })).toContain(
      "--choice-control-size",
    );
    expect(radioGroupClassNames(radioProps)).toContain("sm:flex");
    expect(radioGroupItemClassNames({ controlSize: radioSize })).toContain(
      "--choice-control-size",
    );
    expect(switchClassNames({ controlSize: switchSize })).toContain(
      "--switch-height",
    );
    expect(checkboxState).toBe("indeterminate");
    expect(radioItemProps.value).toBe("balanced");
    expect(switchProps.checked).toBe(true);
  });

  it("composes all controls through native forms, FieldControl, and FieldSet groups", async () => {
    const user = userEvent.setup();

    render(
      <DethinkProvider theme="light">
        <Form aria-label="Choice controls form">
          <FieldSet>
            <FieldLegend>Notification channels</FieldLegend>
            <FieldDescription>
              Choose the channels submitted by the form.
            </FieldDescription>
            <FieldGroup>
              <Field id="suite-email" orientation="horizontal">
                <FieldControl asChild>
                  <Checkbox name="channels" value="email" defaultChecked />
                </FieldControl>
                <FieldLabel>Email notifications</FieldLabel>
              </Field>
              <Field id="suite-slack" orientation="horizontal">
                <FieldControl asChild>
                  <Checkbox name="channels" value="slack" />
                </FieldControl>
                <FieldLabel>Slack notifications</FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Default workflow mode</FieldLegend>
            <RadioGroup
              name="workflowMode"
              defaultValue="balanced"
              orientation="horizontal"
            >
              <Field id="suite-mode-fast" orientation="horizontal">
                <FieldControl asChild>
                  <RadioGroupItem value="fast" />
                </FieldControl>
                <FieldLabel>Fast</FieldLabel>
              </Field>
              <Field id="suite-mode-balanced" orientation="horizontal">
                <FieldControl asChild>
                  <RadioGroupItem value="balanced" />
                </FieldControl>
                <FieldLabel>Balanced</FieldLabel>
              </Field>
            </RadioGroup>
          </FieldSet>

          <Field id="suite-browser-tool" orientation="horizontal">
            <FieldContent>
              <FieldLabel>Browser tool</FieldLabel>
              <FieldDescription>
                Allow website inspection during agent tasks.
              </FieldDescription>
            </FieldContent>
            <FieldControl asChild>
              <Switch name="browserTool" value="enabled" defaultChecked />
            </FieldControl>
          </Field>

          <Field id="suite-admin-mfa" orientation="horizontal" invalid required>
            <FieldContent>
              <FieldLabel>Require admin MFA</FieldLabel>
              <FieldDescription>
                Protect owner and billing actions.
              </FieldDescription>
              <FieldError>Enable MFA before inviting admins.</FieldError>
            </FieldContent>
            <FieldControl asChild>
              <Switch name="adminMfa" value="enabled" />
            </FieldControl>
          </Field>
        </Form>
      </DethinkProvider>,
    );

    const form = screen.getByRole("form", { name: "Choice controls form" });
    const email = screen.getByLabelText("Email notifications");
    const balanced = screen.getByLabelText("Balanced");
    const browserTool = screen.getByRole("switch", { name: "Browser tool" });
    const adminMfa = screen.getByRole("switch", { name: "Require admin MFA" });
    const formData = new FormData(form as HTMLFormElement);

    expect(
      screen.getByRole("group", { name: "Notification channels" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Default workflow mode" }),
    ).toBeInTheDocument();
    expect(email).toHaveAttribute("type", "checkbox");
    expect(email).not.toHaveAttribute("role");
    expect(balanced).toHaveAttribute("type", "radio");
    expect(balanced).not.toHaveAttribute("role");
    expect(browserTool).toHaveAttribute("type", "checkbox");
    expect(browserTool).toHaveAttribute("role", "switch");
    expect(adminMfa).toHaveAttribute("aria-invalid", "true");
    expect(adminMfa).toBeRequired();
    expect(formData.getAll("channels")).toEqual(["email"]);
    expect(formData.get("workflowMode")).toBe("balanced");
    expect(formData.get("browserTool")).toBe("enabled");
    expect(formData.get("adminMfa")).toBeNull();

    await user.click(browserTool);

    expect(
      screen.getByRole("switch", { name: "Browser tool" }),
    ).not.toBeChecked();
    expect(new FormData(form as HTMLFormElement).get("browserTool")).toBeNull();
  });
});
