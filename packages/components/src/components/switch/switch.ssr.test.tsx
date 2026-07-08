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
  FieldLabel,
} from "../form-field";
import { Switch } from ".";

describe("Switch SSR", () => {
  it("renders native switch markup on the server", () => {
    const markup = renderToString(
      <Field id="server-switch" invalid orientation="horizontal">
        <FieldContent>
          <FieldLabel>Server switch</FieldLabel>
          <FieldDescription>Rendered on the server.</FieldDescription>
          <FieldError>Server switch is invalid.</FieldError>
        </FieldContent>
        <FieldControl asChild>
          <Switch name="serverSwitch" value="enabled" defaultChecked />
        </FieldControl>
      </Field>,
    );

    expect(markup).toContain('data-slot="field-control"');
    expect(markup).toContain('data-slot="switch-input"');
    expect(markup).toContain('role="switch"');
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('name="serverSwitch"');
    expect(markup).toContain('value="enabled"');
    expect(markup).toContain('aria-checked="true"');
    expect(markup).toContain(
      'aria-describedby="server-switch-description server-switch-error"',
    );
    expect(markup).toContain('aria-errormessage="server-switch-error"');
    expect(markup).toContain('aria-invalid="true"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const field = (
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel>Hydrate switch</FieldLabel>
        </FieldContent>
        <FieldControl asChild>
          <Switch defaultChecked />
        </FieldControl>
      </Field>
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
