import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Progress, ProgressCircle } from ".";

describe("Progress SSR", () => {
  it("renders linear and circular progress on the server", () => {
    expect(renderToString(<Progress label="Import" value={30} />)).toContain(
      'data-slot="progress"',
    );
    expect(renderToString(<ProgressCircle label="Upload" value={30} />)).toContain(
      'data-slot="progress-circle"',
    );
  });
});
