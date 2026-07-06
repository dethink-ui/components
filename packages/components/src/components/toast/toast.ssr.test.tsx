import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ToastProvider, ToastViewport } from ".";

describe("Toast SSR", () => {
  it("renders provider and viewport on the server", () => {
    expect(
      renderToString(
        <ToastProvider motion="none">
          <ToastViewport />
        </ToastProvider>,
      ),
    ).toContain('data-slot="toast-viewport"');
  });
});
