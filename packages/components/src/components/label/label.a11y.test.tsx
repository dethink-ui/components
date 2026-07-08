import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Label } from ".";

expect.extend(toHaveNoViolations);

describe("Label accessibility", () => {
  it("has no axe violations for standalone native labels and markers", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Label accessibility smoke">
          <form>
            <div>
              <Label htmlFor="a11y-email" required>
                Billing email
              </Label>
              <input
                id="a11y-email"
                name="email"
                type="email"
                required
                aria-describedby="a11y-email-help"
              />
              <p id="a11y-email-help">Use a monitored finance inbox.</p>
            </div>
            <div>
              <Label htmlFor="a11y-notes" optional>
                Internal notes
              </Label>
              <textarea id="a11y-notes" name="notes" />
            </div>
          </form>
        </main>
      </DethinkProvider>,
    );

    const label = screen.getByText("Billing email");
    const input = screen.getByLabelText(/Billing email/);

    await user.click(label);

    expect(input).toHaveFocus();
    expect(input).toBeRequired();

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for invalid labels paired with explicit errors", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Invalid label accessibility smoke">
          <form>
            <Label htmlFor="a11y-invalid-email" invalid required>
              Billing email
            </Label>
            <input
              id="a11y-invalid-email"
              name="billingEmail"
              type="email"
              required
              aria-invalid="true"
              aria-describedby="a11y-invalid-email-error"
              defaultValue="billing"
            />
            <p id="a11y-invalid-email-error">
              Enter a valid billing email address.
            </p>
          </form>
        </main>
      </DethinkProvider>,
    );

    expect(screen.getByLabelText(/Billing email/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(
      screen.getByText("Enter a valid billing email address."),
    ).toBeVisible();

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
