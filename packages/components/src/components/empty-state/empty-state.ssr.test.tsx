import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmptyState } from ".";

describe("EmptyState SSR", () => {
  it("renders on the server", () => {
    expect(renderToString(<EmptyState title="No data" />)).toContain(
      'data-slot="empty-state"',
    );
  });
});
