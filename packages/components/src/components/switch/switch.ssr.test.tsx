import { act } from "react";
import { PassThrough } from "node:stream";
import { hydrateRoot } from "react-dom/client";
import { renderToPipeableStream, renderToString } from "react-dom/server";
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
  it("streams and hydrates a checked spring switch without replacing the input", async () => {
    const field = <Switch spring defaultChecked aria-label="Spring setting" />;
    const markup = await new Promise<string>((resolve, reject) => {
      const output = new PassThrough();
      let html = "";
      output.on("data", (chunk) => {
        html += chunk.toString();
      });
      output.on("end", () => resolve(html));
      const stream = renderToPipeableStream(field, {
        onAllReady() {
          stream.pipe(output);
        },
        onError: reject,
      });
    });
    const container = document.createElement("div");
    container.innerHTML = markup;
    const input = container.querySelector("input")!;
    expect(input.checked).toBe(true);
    const recover = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, field, { onRecoverableError: recover });
    });
    expect(container.querySelector("input")).toBe(input);
    expect(input.checked).toBe(true);
    expect(recover).not.toHaveBeenCalled();
    await act(async () => {
      root.unmount();
    });
  });

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
