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
import { Checkbox } from ".";

describe("Checkbox SSR", () => {
  it("renders native checkbox markup on the server", () => {
    const markup = renderToString(
      <Field id="server-checkbox" invalid>
        <FieldControl asChild>
          <Checkbox
            name="serverCheckbox"
            value="yes"
            defaultChecked="indeterminate"
          />
        </FieldControl>
        <FieldLabel>Server checkbox</FieldLabel>
        <FieldDescription>Rendered on the server.</FieldDescription>
        <FieldError>Server checkbox is invalid.</FieldError>
      </Field>,
    );

    expect(markup).toContain('data-slot="field-control"');
    expect(markup).toContain('data-slot="checkbox-input"');
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('name="serverCheckbox"');
    expect(markup).toContain('value="yes"');
    expect(markup).toContain('aria-checked="mixed"');
    expect(markup).toContain(
      'aria-describedby="server-checkbox-description server-checkbox-error"',
    );
    expect(markup).toContain('aria-errormessage="server-checkbox-error"');
    expect(markup).toContain('aria-invalid="true"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const field = (
      <Field invalid>
        <FieldControl asChild>
          <Checkbox defaultChecked="indeterminate" />
        </FieldControl>
        <FieldLabel>Hydrate checkbox</FieldLabel>
        <FieldDescription>Stable generated description.</FieldDescription>
        <FieldError>Stable generated error.</FieldError>
      </Field>
    );

    container.innerHTML = renderToString(field);

    await act(async () => {
      hydrateRoot(container, field);
    });

    const checkbox = container.querySelector("[data-slot='checkbox-input']");

    expect((checkbox as HTMLInputElement | null)?.indeterminate).toBe(true);
    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
