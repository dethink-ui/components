import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Avatar } from ".";

expect.extend(toHaveNoViolations);

function BotIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M5 6.5h6M6.25 9h.01M9.75 9h.01M4 12.5h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.5V2.5h-1V4h-3V2.5h-1V4H4a2 2 0 0 0-2 2v4.5a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M6.5 7.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM11.5 8a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5ZM2.5 13a4 4 0 0 1 8 0M9.5 13a3 3 0 0 1 4-2.83" />
    </svg>
  );
}

describe("Avatar accessibility", () => {
  it("has no axe violations for named images, fallback identities, and decorative adjacent-name usage", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Avatar accessibility smoke">
          <div>
            <Avatar
              alt="Customer success lead"
              name="Ada Lovelace"
              src="/avatars/ada.png"
            />
            <Avatar name="Grace Hopper" />
            <Avatar fallbackIcon={<BotIcon />} name="AI reviewer" tone="info" />
            <Avatar
              fallbackIcon={<TeamIcon />}
              name="Platform team"
              shape="rounded"
              tone="primary"
            />
          </div>
          <div>
            <Avatar
              decorative
              initials="PM"
              name="Parvesh Malhotra"
              ring="border"
            />
            <span>Parvesh Malhotra</span>
          </div>
          <div>
            <Avatar alt="" name="Model Lab" src="/avatars/model-lab.png" />
            <span>Model Lab</span>
          </div>
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
