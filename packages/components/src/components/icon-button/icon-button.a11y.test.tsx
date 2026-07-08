import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  IconButton,
  type IconButtonShape,
  type IconButtonSize,
  type IconButtonVariant,
} from ".";

expect.extend(toHaveNoViolations);

const variants: IconButtonVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];
const sizes: IconButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
const shapes: IconButtonShape[] = ["square", "circle"];

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

describe("IconButton accessibility", () => {
  it("has no axe violations for baseline variants, sizes, and states", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="IconButton accessibility smoke">
          <div>
            {variants.map((variant) => (
              <IconButton
                key={variant}
                aria-label={`${variant} action`}
                variant={variant}
              >
                <PlusIcon />
              </IconButton>
            ))}
          </div>
          <div>
            {sizes.map((size) => (
              <IconButton key={size} aria-label={`${size} action`} size={size}>
                <PlusIcon />
              </IconButton>
            ))}
          </div>
          <div>
            {shapes.map((shape) => (
              <IconButton
                key={shape}
                aria-label={`${shape} action`}
                shape={shape}
              >
                <PlusIcon />
              </IconButton>
            ))}
          </div>
          <div>
            <span id="labelledby-action">Refresh metrics</span>
            <IconButton aria-labelledby="labelledby-action">
              <PlusIcon />
            </IconButton>
            <IconButton aria-label="Disabled action" disabled>
              <PlusIcon />
            </IconButton>
            <IconButton aria-label="Loading action" loading>
              <PlusIcon />
            </IconButton>
            <IconButton aria-label="Pressed action" aria-pressed="true">
              <PlusIcon />
            </IconButton>
          </div>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
