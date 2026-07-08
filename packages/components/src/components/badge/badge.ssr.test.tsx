import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Badge } from ".";

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="m4 8 2.5 2.5L12 5" />
    </svg>
  );
}

describe("Badge SSR", () => {
  it("renders deterministic badge markup on the server", () => {
    const markup = renderToString(
      <Badge icon={<CheckIcon />} tone="success" variant="solid" size="sm">
        Operational
      </Badge>,
    );

    expect(markup).toContain('data-slot="badge"');
    expect(markup).toContain('data-tone="success"');
    expect(markup).toContain('data-variant="solid"');
    expect(markup).toContain('data-size="sm"');
    expect(markup).toContain('data-slot="badge-leading-icon"');
    expect(markup).toContain("Operational");
  });
});
