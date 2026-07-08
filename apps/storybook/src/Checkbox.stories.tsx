import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
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
} from "@dethink/components";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  argTypes: {
    controlSize: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    invalid: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Field id="base-checkbox" orientation="horizontal">
          <FieldControl asChild>
            <Checkbox {...args} name="baseCheckbox" value="yes" />
          </FieldControl>
          <FieldLabel>Receive product updates</FieldLabel>
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
          <Field id="weekly-summary" orientation="horizontal">
            <FieldControl asChild>
              <Checkbox name="weeklySummary" value="enabled" defaultChecked />
            </FieldControl>
            <FieldContent>
              <FieldLabel>Weekly summary</FieldLabel>
              <FieldDescription>
                Send owners an adoption and reliability summary every Monday.
              </FieldDescription>
            </FieldContent>
          </Field>
        </Form>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Weekly summary");
    const checkbox = canvas.getByLabelText("Weekly summary");

    await userEvent.click(label);

    await expect(checkbox).toHaveFocus();
    await expect(checkbox).not.toBeChecked();
  },
};

export const Indeterminate: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Field id="all-permissions" orientation="horizontal">
          <FieldControl asChild>
            <Checkbox defaultChecked="indeterminate" name="permissions" />
          </FieldControl>
          <FieldContent>
            <FieldLabel>Select all permissions</FieldLabel>
            <FieldDescription>
              Some permissions are enabled for the selected role.
            </FieldDescription>
          </FieldContent>
        </Field>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByLabelText("Select all permissions");

    await expect(checkbox).toHaveAttribute("aria-checked", "mixed");
  },
};

export const Controlled: Story = {
  render: function ControlledCheckboxStory() {
    const [checked, setChecked] = useState(false);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <Field id="controlled-checkbox" orientation="horizontal">
              <FieldControl asChild>
                <Checkbox
                  checked={checked}
                  onCheckedChange={(nextChecked) =>
                    setChecked(nextChecked === true)
                  }
                />
              </FieldControl>
              <FieldLabel>Enable rollout guardrails</FieldLabel>
            </Field>
            <Button
              type="button"
              variant="outline"
              onClick={() => setChecked((value) => !value)}
            >
              {checked ? "Disable" : "Enable"}
            </Button>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const InvalidRequired: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <FieldSet aria-describedby="channels-error">
          <FieldLegend variant="label">Notification channels</FieldLegend>
          <FieldGroup>
            <Field id="channel-email" orientation="horizontal" invalid>
              <FieldControl asChild>
                <Checkbox name="channels" value="email" aria-invalid="true" />
              </FieldControl>
              <FieldLabel>Email</FieldLabel>
            </Field>
            <Field id="channel-slack" orientation="horizontal" invalid>
              <FieldControl asChild>
                <Checkbox name="channels" value="slack" aria-invalid="true" />
              </FieldControl>
              <FieldLabel>Slack</FieldLabel>
            </Field>
          </FieldGroup>
          <FieldError id="channels-error">
            Select at least one notification channel.
          </FieldError>
        </FieldSet>
      </Container>
    </DethinkProvider>
  ),
};

export const DisabledAndReadOnly: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="4">
          <Field id="readonly-checkbox" orientation="horizontal" readOnly>
            <FieldControl asChild>
              <Checkbox readOnly defaultChecked />
            </FieldControl>
            <FieldLabel>Inherited from organization policy</FieldLabel>
          </Field>
          <Field id="disabled-checkbox" orientation="horizontal" disabled>
            <FieldControl asChild>
              <Checkbox disabled />
            </FieldControl>
            <FieldLabel>Requires billing admin access</FieldLabel>
          </Field>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
};

export const AuthAndSettingsCard: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="md">
        <Card as="section">
          <CardHeader>
            <CardTitle>Authentication preferences</CardTitle>
            <CardDescription>
              Checkbox keeps native form submission while Field primitives own
              labels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form action="/preferences" method="post">
              <Field id="remember-device" orientation="horizontal">
                <FieldControl asChild>
                  <Checkbox name="rememberDevice" value="yes" />
                </FieldControl>
                <FieldContent>
                  <FieldLabel>Remember this device</FieldLabel>
                  <FieldDescription>
                    Skip additional verification on this browser for 30 days.
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field id="security-digest" orientation="horizontal">
                <FieldControl asChild>
                  <Checkbox name="securityDigest" value="yes" defaultChecked />
                </FieldControl>
                <FieldContent>
                  <FieldLabel>Security digest</FieldLabel>
                  <FieldDescription>
                    Email a weekly summary of sign-ins and policy changes.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </Form>
          </CardContent>
        </Card>
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
            <Field id={`checkbox-${theme}`} orientation="horizontal">
              <FieldControl asChild>
                <Checkbox defaultChecked />
              </FieldControl>
              <FieldContent>
                <FieldLabel>
                  {theme === "dark" ? "קבלת התראות" : "Receive alerts"}
                </FieldLabel>
                <FieldDescription>
                  {theme === "dark"
                    ? "RTL, density, and dark mode share the same checkbox contract."
                    : "Compact density keeps the checkbox aligned in settings rows."}
                </FieldDescription>
              </FieldContent>
            </Field>
          </Container>
        </DethinkProvider>
      ))}
    </div>
  ),
};
