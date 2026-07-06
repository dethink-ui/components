import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Pagination } from ".";

expect.extend(toHaveNoViolations);

describe("Pagination accessibility", () => {
  it("has no axe violations for bounded pagination", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Pagination accessibility smoke">
          <Pagination
            page={4}
            pageCount={12}
            showFirstLast
            onPageChange={() => undefined}
          />
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for unbounded compact pagination", async () => {
    const { container } = render(
      <DethinkProvider theme="dark" density="compact">
        <Pagination
          compact
          hasNextPage
          page={8}
          onPageChange={() => undefined}
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for disabled boundary controls", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Pagination
          page={1}
          pageCount={3}
          showFirstLast
          onPageChange={() => undefined}
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
