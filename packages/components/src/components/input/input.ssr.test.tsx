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
import { Input } from ".";

describe("Input SSR", () => {
  it("renders native input markup on the server", () => {
    const markup = renderToString(
      <Field id="server-input" invalid>
        <FieldLabel>Server input</FieldLabel>
        <FieldControl asChild>
          <Input name="serverInput" defaultValue="server" />
        </FieldControl>
        <FieldDescription>Rendered on the server.</FieldDescription>
        <FieldError>Server input is invalid.</FieldError>
      </Field>,
    );

    expect(markup).toContain('data-slot="field-control"');
    expect(markup).toContain('name="serverInput"');
    expect(markup).toContain('value="server"');
    expect(markup).toContain(
      'aria-describedby="server-input-description server-input-error"',
    );
    expect(markup).toContain('aria-errormessage="server-input-error"');
    expect(markup).toContain('aria-invalid="true"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const field = (
      <Field invalid>
        <FieldLabel>Hydrate input</FieldLabel>
        <FieldControl asChild>
          <Input defaultValue="Hydrated" />
        </FieldControl>
        <FieldDescription>Stable generated description.</FieldDescription>
        <FieldError>Stable generated error.</FieldError>
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
