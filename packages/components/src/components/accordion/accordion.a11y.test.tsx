import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Accordion } from "./accordion";

expect.extend(toHaveNoViolations);

function ChevronIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path
        d="m5.5 3.5 4 4.5-4 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

describe("Accordion accessibility", () => {
  it("has no axe violations with mixed blade content", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Accordion
          aria-label="Settings sections"
          defaultValue="profile"
          motionPreset="none"
        >
          <Accordion.Item value="profile">
            <Accordion.Blade>
              <Accordion.BladeIcon>
                <ChevronIcon />
              </Accordion.BladeIcon>
              <Accordion.BladeText>Profile</Accordion.BladeText>
            </Accordion.Blade>
            <Accordion.Content>
              <p>Profile preferences.</p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="billing">
            <Accordion.Blade aria-label="Billing">
              <Accordion.BladeIcon>
                <ChevronIcon />
              </Accordion.BladeIcon>
            </Accordion.Blade>
            <Accordion.Content>
              <p>Billing preferences.</p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item disabled value="security">
            <Accordion.Blade>
              <Accordion.BladeText>Security</Accordion.BladeText>
            </Accordion.Blade>
            <Accordion.Content>
              <p>Security preferences.</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations with multiple open content", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Accordion
          aria-label="FAQ sections"
          defaultValue={["one", "two"]}
          motionPreset="none"
          type="multiple"
        >
          <Accordion.Item value="one">
            <Accordion.Blade>One</Accordion.Blade>
            <Accordion.Content>
              <p>One answer.</p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="two">
            <Accordion.Blade>Two</Accordion.Blade>
            <Accordion.Content>
              <p>Two answer.</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
