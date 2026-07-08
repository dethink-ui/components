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
  RadioGroup,
  RadioGroupItem,
  Stack,
} from "@dethink/components";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  argTypes: {
    controlSize: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    invalid: {
      control: "boolean",
    },
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <FieldSet>
          <FieldLegend>Plan</FieldLegend>
          <RadioGroup {...args} name="plan" defaultValue="team">
            <FieldGroup>
              <Field id="plan-starter" orientation="horizontal">
                <FieldControl asChild>
                  <RadioGroupItem value="starter" />
                </FieldControl>
                <FieldLabel>Starter</FieldLabel>
              </Field>
              <Field id="plan-team" orientation="horizontal">
                <FieldControl asChild>
                  <RadioGroupItem value="team" />
                </FieldControl>
                <FieldLabel>Team</FieldLabel>
              </Field>
            </FieldGroup>
          </RadioGroup>
        </FieldSet>
      </Container>
    </DethinkProvider>
  ),
};

export const FieldSetComposition: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Form>
          <FieldSet aria-describedby="response-mode-help">
            <FieldLegend>Response mode</FieldLegend>
            <FieldDescription id="response-mode-help">
              Choose how much work the assistant should do before replying.
            </FieldDescription>
            <RadioGroup name="responseMode" defaultValue="balanced">
              <FieldGroup>
                <Field id="mode-fast" orientation="horizontal">
                  <FieldControl asChild>
                    <RadioGroupItem value="fast" />
                  </FieldControl>
                  <FieldContent>
                    <FieldLabel>Fast</FieldLabel>
                    <FieldDescription>
                      Prefer short answers and low latency.
                    </FieldDescription>
                  </FieldContent>
                </Field>
                <Field id="mode-balanced" orientation="horizontal">
                  <FieldControl asChild>
                    <RadioGroupItem value="balanced" />
                  </FieldControl>
                  <FieldContent>
                    <FieldLabel>Balanced</FieldLabel>
                    <FieldDescription>
                      Balance detail with responsiveness.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </RadioGroup>
          </FieldSet>
        </Form>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fast = canvas.getByLabelText("Fast");

    await userEvent.click(fast);

    await expect(fast).toBeChecked();
  },
};

export const Controlled: Story = {
  render: function ControlledRadioGroupStory() {
    const [value, setValue] = useState("viewer");

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <FieldSet>
              <FieldLegend>Default role</FieldLegend>
              <RadioGroup name="role" value={value} onValueChange={setValue}>
                <FieldGroup>
                  <Field id="role-viewer" orientation="horizontal">
                    <FieldControl asChild>
                      <RadioGroupItem value="viewer" />
                    </FieldControl>
                    <FieldLabel>Viewer</FieldLabel>
                  </Field>
                  <Field id="role-admin" orientation="horizontal">
                    <FieldControl asChild>
                      <RadioGroupItem value="admin" />
                    </FieldControl>
                    <FieldLabel>Admin</FieldLabel>
                  </Field>
                </FieldGroup>
              </RadioGroup>
            </FieldSet>
            <FieldDescription>Selected role: {value}</FieldDescription>
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
        <FieldSet aria-describedby="model-error">
          <FieldLegend variant="label">Model family</FieldLegend>
          <RadioGroup name="modelFamily" invalid required>
            <FieldGroup>
              <Field id="model-fast" orientation="horizontal" invalid required>
                <FieldControl asChild>
                  <RadioGroupItem value="fast" />
                </FieldControl>
                <FieldLabel>Fast</FieldLabel>
              </Field>
              <Field
                id="model-reasoning"
                orientation="horizontal"
                invalid
                required
              >
                <FieldControl asChild>
                  <RadioGroupItem value="reasoning" />
                </FieldControl>
                <FieldLabel>Reasoning</FieldLabel>
              </Field>
            </FieldGroup>
          </RadioGroup>
          <FieldError id="model-error">Select a model family.</FieldError>
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
          <FieldSet>
            <FieldLegend>Locked billing cycle</FieldLegend>
            <RadioGroup name="billingCycle" defaultValue="annual" readOnly>
              <Field id="cycle-monthly" orientation="horizontal">
                <FieldControl asChild>
                  <RadioGroupItem value="monthly" />
                </FieldControl>
                <FieldLabel>Monthly</FieldLabel>
              </Field>
              <Field id="cycle-annual" orientation="horizontal">
                <FieldControl asChild>
                  <RadioGroupItem value="annual" />
                </FieldControl>
                <FieldLabel>Annual</FieldLabel>
              </Field>
            </RadioGroup>
          </FieldSet>
          <FieldSet disabled>
            <FieldLegend>Unavailable region</FieldLegend>
            <RadioGroup name="region" defaultValue="eu" disabled>
              <Field id="region-us" orientation="horizontal">
                <FieldControl asChild>
                  <RadioGroupItem value="us" />
                </FieldControl>
                <FieldLabel>United States</FieldLabel>
              </Field>
              <Field id="region-eu" orientation="horizontal">
                <FieldControl asChild>
                  <RadioGroupItem value="eu" />
                </FieldControl>
                <FieldLabel>Europe</FieldLabel>
              </Field>
            </RadioGroup>
          </FieldSet>
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
            <CardTitle>Project defaults</CardTitle>
            <CardDescription>
              RadioGroup keeps all options visible for compact settings forms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldLegend>Issue assignment</FieldLegend>
              <RadioGroup
                name="assignment"
                defaultValue="balanced"
                orientation="horizontal"
              >
                <Field id="assignment-round-robin" orientation="horizontal">
                  <FieldControl asChild>
                    <RadioGroupItem value="round-robin" />
                  </FieldControl>
                  <FieldLabel>Round robin</FieldLabel>
                </Field>
                <Field id="assignment-balanced" orientation="horizontal">
                  <FieldControl asChild>
                    <RadioGroupItem value="balanced" />
                  </FieldControl>
                  <FieldLabel>Balanced load</FieldLabel>
                </Field>
              </RadioGroup>
            </FieldSet>
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
            <FieldSet>
              <FieldLegend>{theme === "dark" ? "מצב" : "Mode"}</FieldLegend>
              <RadioGroup
                name={`mode-${theme}`}
                defaultValue="balanced"
                orientation="horizontal"
              >
                <Field id={`radio-fast-${theme}`} orientation="horizontal">
                  <FieldControl asChild>
                    <RadioGroupItem value="fast" />
                  </FieldControl>
                  <FieldLabel>{theme === "dark" ? "מהיר" : "Fast"}</FieldLabel>
                </Field>
                <Field id={`radio-balanced-${theme}`} orientation="horizontal">
                  <FieldControl asChild>
                    <RadioGroupItem value="balanced" />
                  </FieldControl>
                  <FieldLabel>
                    {theme === "dark" ? "מאוזן" : "Balanced"}
                  </FieldLabel>
                </Field>
              </RadioGroup>
            </FieldSet>
          </Container>
        </DethinkProvider>
      ))}
    </div>
  ),
};
