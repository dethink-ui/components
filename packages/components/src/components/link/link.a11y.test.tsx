import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Link, type LinkUnderline, type LinkVariant } from ".";

expect.extend(toHaveNoViolations);

const variants: LinkVariant[] = ["default", "muted", "nav", "destructive"];
const underlines: LinkUnderline[] = ["hover", "always", "none"];

describe("Link accessibility", () => {
  it("has no axe violations for baseline navigation patterns", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Link accessibility smoke">
          <p>
            View the{" "}
            <Link href="/docs" underline="always">
              component documentation
            </Link>{" "}
            before installing.
          </p>
          <nav aria-label="Primary">
            {variants.map((variant, index) => (
              <Link
                key={variant}
                aria-current={index === 0 ? "page" : undefined}
                href={`/${variant}`}
                variant={variant}
                underline="none"
              >
                {variant} section
              </Link>
            ))}
          </nav>
          <div>
            {underlines.map((underline) => (
              <Link
                key={underline}
                href={`/${underline}`}
                underline={underline}
              >
                {underline} underline
              </Link>
            ))}
          </div>
          <Link href="https://example.com" target="_blank">
            External reference
          </Link>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
