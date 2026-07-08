import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  DethinkProvider,
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Form,
  Stack,
  Switch,
} from "@dethink/components";

const meta = {
  title: "Components/Switch",
  component: Switch,
  argTypes: {
    controlSize: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    invalid: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Field id="base-switch" orientation="horizontal">
          <FieldContent>
            <FieldLabel>Enable notifications</FieldLabel>
          </FieldContent>
          <FieldControl asChild>
            <Switch {...args} name="notifications" value="enabled" />
          </FieldControl>
        </Field>
      </Container>
    </DethinkProvider>
  ),
};

export const FieldComposition: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Form>
          <Field id="two-factor-auth" orientation="horizontal">
            <FieldContent>
              <FieldLabel>Multi-factor authentication</FieldLabel>
              <FieldDescription>
                Require a second verification step for every sign in.
              </FieldDescription>
            </FieldContent>
            <FieldControl asChild>
              <Switch name="twoFactor" value="enabled" defaultChecked />
            </FieldControl>
          </Field>
        </Form>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Multi-factor authentication");
    const switchInput = canvas.getByRole("switch", {
      name: "Multi-factor authentication",
    });

    await userEvent.click(label);

    await expect(switchInput).toHaveFocus();
    await expect(switchInput).not.toBeChecked();
  },
};

export const Controlled: Story = {
  render: function ControlledSwitchStory() {
    const [checked, setChecked] = useState(false);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Field id="controlled-switch" orientation="horizontal">
            <FieldContent>
              <FieldLabel>Rollout guardrails</FieldLabel>
              <FieldDescription>
                Keep the label stable while state changes.
              </FieldDescription>
            </FieldContent>
            <FieldControl asChild>
              <Switch checked={checked} onCheckedChange={setChecked} />
            </FieldControl>
          </Field>
        </Container>
      </DethinkProvider>
    );
  },
};

export const InvalidRequired: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Field id="admin-mfa" orientation="horizontal" invalid required>
          <FieldContent>
            <FieldLabel>Require admin MFA</FieldLabel>
            <FieldDescription>
              Applies to owners and billing administrators.
            </FieldDescription>
            <FieldError>Enable this setting before inviting admins.</FieldError>
          </FieldContent>
          <FieldControl asChild>
            <Switch name="adminMfa" value="enabled" />
          </FieldControl>
        </Field>
      </Container>
    </DethinkProvider>
  ),
};

export const DisabledAndReadOnly: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="4">
          <Field id="readonly-switch-story" orientation="horizontal" readOnly>
            <FieldContent>
              <FieldLabel>Inherited from organization policy</FieldLabel>
              <FieldDescription>
                Managed by your workspace owner.
              </FieldDescription>
            </FieldContent>
            <FieldControl asChild>
              <Switch readOnly defaultChecked />
            </FieldControl>
          </Field>
          <Field id="disabled-switch-story" orientation="horizontal" disabled>
            <FieldContent>
              <FieldLabel>Requires enterprise plan</FieldLabel>
              <FieldDescription>
                Upgrade before enabling this control.
              </FieldDescription>
            </FieldContent>
            <FieldControl asChild>
              <Switch disabled />
            </FieldControl>
          </Field>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
};

export const SettingsCard: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="md">
        <Card as="section">
          <CardHeader>
            <CardTitle>Security settings</CardTitle>
            <CardDescription>
              Switches are binary on/off settings with stable labels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form>
              <Field id="setting-mfa" orientation="horizontal">
                <FieldContent>
                  <FieldLabel>Multi-factor authentication</FieldLabel>
                  <FieldDescription>
                    Require a second verification step for privileged users.
                  </FieldDescription>
                </FieldContent>
                <FieldControl asChild>
                  <Switch name="mfa" value="enabled" defaultChecked />
                </FieldControl>
              </Field>
              <Field id="setting-session-alerts" orientation="horizontal">
                <FieldContent>
                  <FieldLabel>Session alerts</FieldLabel>
                  <FieldDescription>
                    Notify owners when sessions start from new locations.
                  </FieldDescription>
                </FieldContent>
                <FieldControl asChild>
                  <Switch name="sessionAlerts" value="enabled" />
                </FieldControl>
              </Field>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </DethinkProvider>
  ),
};

export const GroupedSwitches: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <FieldSet>
          <FieldLegend>AI tool permissions</FieldLegend>
          <FieldGroup>
            <Field id="tool-browser" orientation="horizontal">
              <FieldContent>
                <FieldLabel>Browser tool</FieldLabel>
                <FieldDescription>
                  Allow website inspection during tasks.
                </FieldDescription>
              </FieldContent>
              <FieldControl asChild>
                <Switch name="browserTool" value="enabled" defaultChecked />
              </FieldControl>
            </Field>
            <Field id="tool-terminal" orientation="horizontal">
              <FieldContent>
                <FieldLabel>Terminal tool</FieldLabel>
                <FieldDescription>
                  Allow local command execution.
                </FieldDescription>
              </FieldContent>
              <FieldControl asChild>
                <Switch name="terminalTool" value="enabled" />
              </FieldControl>
            </Field>
          </FieldGroup>
        </FieldSet>
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <div className="grid gap-4">
      {(["light", "dark"] as const).map((theme) => (
        <DethinkProvider
          key={theme}
          density={theme === "light" ? "compact" : "comfortable"}
          dir={theme === "dark" ? "rtl" : "ltr"}
          theme={theme}
          className="border-border rounded-lg border p-6"
        >
          <Container size="sm">
            <Field id={`switch-${theme}`} orientation="horizontal">
              <FieldContent>
                <FieldLabel>
                  {theme === "dark" ? "קבלת התראות" : "Receive alerts"}
                </FieldLabel>
                <FieldDescription>
                  {theme === "dark"
                    ? "RTL, density, and dark mode share the same switch contract."
                    : "Compact density keeps the switch aligned in settings rows."}
                </FieldDescription>
              </FieldContent>
              <FieldControl asChild>
                <Switch defaultChecked />
              </FieldControl>
            </Field>
          </Container>
        </DethinkProvider>
      ))}
    </div>
  ),
};
