import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
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

function ChoiceControlsFixture() {
  return (
    <Form>
      <FieldSet>
        <FieldLegend>Server permissions</FieldLegend>
        <FieldGroup>
          <Field id="server-read" orientation="horizontal">
            <FieldControl asChild>
              <Checkbox name="permissions" value="read" defaultChecked />
            </FieldControl>
            <FieldLabel>Read records</FieldLabel>
          </Field>
          <Field id="server-all" orientation="horizontal">
            <FieldControl asChild>
              <Checkbox defaultChecked="indeterminate" />
            </FieldControl>
            <FieldLabel>Select all records</FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend>Server model</FieldLegend>
        <RadioGroup name="serverModel" defaultValue="balanced">
          <Field id="server-model-fast" orientation="horizontal">
            <FieldControl asChild>
              <RadioGroupItem value="fast" />
            </FieldControl>
            <FieldLabel>Fast model</FieldLabel>
          </Field>
          <Field id="server-model-balanced" orientation="horizontal">
            <FieldControl asChild>
              <RadioGroupItem value="balanced" />
            </FieldControl>
            <FieldLabel>Balanced model</FieldLabel>
          </Field>
        </RadioGroup>
      </FieldSet>
      <Field id="server-switch" orientation="horizontal" invalid required>
        <FieldContent>
          <FieldLabel>Server switch</FieldLabel>
          <FieldDescription>
            Hydrates with stable switch semantics.
          </FieldDescription>
          <FieldError>Server switch is invalid.</FieldError>
        </FieldContent>
        <FieldControl asChild>
          <Switch name="serverSwitch" value="enabled" defaultChecked />
        </FieldControl>
      </Field>
    </Form>
  );
}

describe("Choice controls suite SSR", () => {
  it("server-renders native checkbox, radio, and switch markup together", () => {
    const markup = renderToString(<ChoiceControlsFixture />);

    expect(markup).toContain('data-slot="checkbox-input"');
    expect(markup).toContain('aria-checked="mixed"');
    expect(markup).toContain('data-slot="radio-group"');
    expect(markup).toContain('data-slot="radio-group-item-input"');
    expect(markup).toContain('name="serverModel"');
    expect(markup).toContain('value="balanced"');
    expect(markup).toContain('data-slot="switch-input"');
    expect(markup).toContain('role="switch"');
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('name="serverSwitch"');
    expect(markup).toContain('aria-errormessage="server-switch-error"');
  });

  it("hydrates the full suite without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const fixture = <ChoiceControlsFixture />;

    container.innerHTML = renderToString(fixture);

    await act(async () => {
      hydrateRoot(container, fixture);
    });

    const mixedCheckbox = container.querySelector("[aria-checked='mixed']");

    expect((mixedCheckbox as HTMLInputElement | null)?.indeterminate).toBe(
      true,
    );
    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
