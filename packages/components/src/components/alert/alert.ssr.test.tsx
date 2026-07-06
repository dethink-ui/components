import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Alert, Callout } from ".";

describe("Alert SSR", () => {
  it("renders alert and callout on the server", () => {
    expect(renderToString(<Alert title="Saved" />)).toContain('data-slot="alert"');
    expect(renderToString(<Callout title="Tip" />)).toContain('data-slot="callout"');
  });
});
