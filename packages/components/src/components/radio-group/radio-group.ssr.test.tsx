import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../form-field";
import { RadioGroup, RadioGroupItem } from ".";

describe("RadioGroup SSR", () => {
  it("renders native radio markup on the server", () => {
    const markup = renderToString(
      <RadioGroup name="serverRadio" defaultValue="yes" invalid required>
        <Field id="server-radio-yes" invalid>
          <FieldControl asChild>
            <RadioGroupItem value="yes" />
          </FieldControl>
          <FieldLabel>Server yes</FieldLabel>
          <FieldDescription>Rendered on the server.</FieldDescription>
          <FieldError>Server radio is invalid.</FieldError>
        </Field>
      </RadioGroup>,
    );

    expect(markup).toContain('data-slot="radio-group"');
    expect(markup).toContain('data-slot="radio-group-item-input"');
    expect(markup).toContain('type="radio"');
    expect(markup).toContain('name="serverRadio"');
    expect(markup).toContain('value="yes"');
    expect(markup).toContain('checked=""');
    expect(markup).toContain(
      'aria-describedby="server-radio-yes-description server-radio-yes-error"',
    );
    expect(markup).toContain('aria-errormessage="server-radio-yes-error"');
    expect(markup).toContain('aria-invalid="true"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const field = (
      <RadioGroup defaultValue="one">
        <Field>
          <FieldControl asChild>
            <RadioGroupItem value="one" />
          </FieldControl>
          <FieldLabel>Hydrate one</FieldLabel>
        </Field>
        <Field>
          <FieldControl asChild>
            <RadioGroupItem value="two" />
          </FieldControl>
          <FieldLabel>Hydrate two</FieldLabel>
        </Field>
      </RadioGroup>
    );

    container.innerHTML = renderToString(field);

    await act(async () => {
      hydrateRoot(container, field);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
