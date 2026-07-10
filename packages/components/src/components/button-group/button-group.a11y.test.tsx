import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { ButtonGroup, ButtonGroupSeparator } from ".";

expect.extend(toHaveNoViolations);

describe("ButtonGroup accessibility", () => {
  it("has no axe violations across labelled group patterns", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main>
          <h1 id="document-actions">Document actions</h1>
          <ButtonGroup aria-labelledby="document-actions">
            <Button>Save</Button>
            <ButtonGroupSeparator />
            <Button disabled>Archive</Button>
            <IconButton aria-label="More document actions">
              <span aria-hidden="true">•••</span>
            </IconButton>
          </ButtonGroup>

          <ButtonGroup
            aria-label="Record actions"
            mode="separated"
            orientation="vertical"
          >
            <Button variant="outline">Duplicate</Button>
            <Button loading>Publishing</Button>
            <Button variant="destructive">Delete</Button>
          </ButtonGroup>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
