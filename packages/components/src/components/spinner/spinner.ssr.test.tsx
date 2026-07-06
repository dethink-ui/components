import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Spinner } from ".";

describe("Spinner SSR", () => {
  it("renders on the server", () => {
    expect(renderToString(<Spinner label="Loading" />)).toContain(
      'data-slot="spinner"',
    );
  });
});
