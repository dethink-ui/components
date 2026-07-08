import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  RevealButton,
  type RevealButtonSize,
  type RevealButtonVariant,
} from ".";

expect.extend(toHaveNoViolations);

const variants: RevealButtonVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];
const sizes: RevealButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

describe("RevealButton accessibility", () => {
  it("has no axe violations for baseline variants, sizes, and states", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="RevealButton accessibility smoke">
          <div>
            {variants.map((variant) => (
              <RevealButton
                key={variant}
                icon={<PlusIcon />}
                label={`${variant} action`}
                variant={variant}
              />
            ))}
          </div>
          <div>
            {sizes.map((size) => (
              <RevealButton
                key={size}
                icon={<PlusIcon />}
                label={`${size} action`}
                size={size}
              />
            ))}
          </div>
          <div>
            <RevealButton disabled icon={<PlusIcon />} label="Disabled action" />
            <RevealButton icon={<PlusIcon />} label="Loading action" loading />
            <RevealButton
              aria-pressed="true"
              icon={<PlusIcon />}
              label="Pressed action"
            />
            <RevealButton
              icon={<PlusIcon />}
              label="Always visible action"
              labelVisibility="always"
            />
          </div>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
