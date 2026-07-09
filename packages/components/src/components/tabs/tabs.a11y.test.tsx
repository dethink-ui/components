import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Tabs } from ".";

expect.extend(toHaveNoViolations);

describe("Tabs accessibility", () => {
  it("has no axe violations for labelled horizontal tabs", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <Tabs defaultValue="profile" motionPreset="none">
          <Tabs.List aria-label="Account sections">
            <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
            <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
            <Tabs.Trigger disabled value="security">
              Security
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="profile">Profile preferences.</Tabs.Panel>
          <Tabs.Panel forceMount value="billing">
            Billing preferences.
          </Tabs.Panel>
          <Tabs.Panel forceMount value="security">
            Security preferences.
          </Tabs.Panel>
        </Tabs>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for vertical manual tabs", async () => {
    const { container } = render(
      <DethinkProvider theme="dark">
        <Tabs
          activationMode="manual"
          defaultValue="overview"
          motionPreset="none"
          orientation="vertical"
          variant="line"
        >
          <Tabs.List aria-label="Workspace sections">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="overview">Overview panel.</Tabs.Panel>
          <Tabs.Panel value="activity">Activity panel.</Tabs.Panel>
        </Tabs>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
