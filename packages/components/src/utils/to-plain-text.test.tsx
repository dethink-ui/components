// Verifies rich option content can provide an accessible typeahead value.

import { describe, expect, it } from "vitest";

import { toPlainText } from "./to-plain-text";

describe("toPlainText", () => {
  it("collects text from nested option content", () => {
    expect(
      toPlainText(
        <>
          <strong>Production</strong>
          <span>Receives production deploys.</span>
        </>,
      ),
    ).toBe("Production Receives production deploys.");
  });

  it("ignores empty values while preserving plain labels", () => {
    expect(toPlainText(["Staging", null, false, 2])).toBe("Staging 2");
  });
});
