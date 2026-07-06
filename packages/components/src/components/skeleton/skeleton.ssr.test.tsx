import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SkeletonText } from ".";

describe("Skeleton SSR", () => {
  it("renders on the server", () => {
    expect(renderToString(<SkeletonText />)).toContain(
      'data-slot="skeleton-text"',
    );
  });
});
