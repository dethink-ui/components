import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { AsyncSelect } from ".";

expect.extend(toHaveNoViolations);

describe("AsyncSelect accessibility", () => {
  it("has no axe violations for labelled async state", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <AsyncSelect
          description="Search server-owned accounts."
          errorMessage="Choose an account."
          inputValue="acm"
          invalid
          items={[]}
          label="Account"
          loading
          name="account"
          required
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for multiple selected chips", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <AsyncSelect
          selectionMode="multiple"
          label="Owners"
          items={[{ label: "Acme Operations", value: "acme" }]}
          value={["acme"]}
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
