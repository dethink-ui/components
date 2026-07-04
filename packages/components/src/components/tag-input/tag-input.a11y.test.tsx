import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { TagInput } from ".";

expect.extend(toHaveNoViolations);

describe("TagInput accessibility", () => {
  it("has no axe violations for labelled tags with description", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <TagInput
          description="Press enter, comma, or tab to add a tag."
          label="Labels"
          name="labels"
          defaultValue={["finance", "priority"]}
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for invalid required state", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <TagInput
          invalid
          required
          errorMessage="Add at least one recipient."
          label="Recipients"
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
