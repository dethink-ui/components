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
  FieldTitle,
  Form,
} from ".";

describe("Field SSR", () => {
  it("renders Field markup on the server", () => {
    const markup = renderToString(
      <Form action="/save" method="post">
        <FieldSet>
          <FieldLegend>Server group</FieldLegend>
          <FieldGroup>
            <Field id="server-field" invalid required>
              <FieldLabel>Server field</FieldLabel>
              <FieldControl asChild>
                <input />
              </FieldControl>
              <FieldDescription>Rendered on the server.</FieldDescription>
              <FieldError>Server field is invalid.</FieldError>
            </Field>
          </FieldGroup>
        </FieldSet>
      </Form>,
    );

    expect(markup).toContain('data-slot="form"');
    expect(markup).toContain('data-slot="field-set"');
    expect(markup).toContain('data-slot="field-legend"');
    expect(markup).toContain('data-slot="field-group"');
    expect(markup).toContain('data-slot="field"');
    expect(markup).toContain('data-slot="field-label"');
    expect(markup).toContain('data-slot="field-control"');
    expect(markup).toContain('data-slot="field-description"');
    expect(markup).toContain('data-slot="field-error"');
    expect(markup).toContain('id="server-field"');
    expect(markup).toContain('id="server-field-description"');
    expect(markup).toContain('id="server-field-error"');
    expect(markup).toContain(
      'aria-describedby="server-field-description server-field-error"',
    );
    expect(markup).toContain('aria-errormessage="server-field-error"');
    expect(markup).toContain('aria-invalid="true"');
  });

  it("hydrates generated IDs without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    const field = (
      <Field invalid>
        <FieldContent>
          <FieldTitle>Hydrate field</FieldTitle>
          <FieldDescription>Stable generated description.</FieldDescription>
        </FieldContent>
        <FieldLabel>Hydrate field label</FieldLabel>
        <FieldControl asChild>
          <input />
        </FieldControl>
        <FieldError>Stable generated error.</FieldError>
      </Field>
    );

    container.innerHTML = renderToString(field);

    const inputBeforeHydration = container.querySelector("input");
    const serverDescription =
      inputBeforeHydration?.getAttribute("aria-describedby");
    const serverErrorMessage =
      inputBeforeHydration?.getAttribute("aria-errormessage");

    expect(serverDescription).toContain("-description");
    expect(serverDescription).toContain("-error");
    expect(serverErrorMessage).toContain("-error");

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
