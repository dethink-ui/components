import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LiveRegionProvider } from ".";

describe("LiveRegion SSR", () => {
  it("renders provider regions on the server", () => {
    expect(renderToString(<LiveRegionProvider>Ready</LiveRegionProvider>)).toContain(
      'data-slot="live-region-polite"',
    );
  });
});
