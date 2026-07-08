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
  RadioGroup,
  RadioGroupItem,
  Stack,
  Switch,
} from "@dethink/components";

const meta = {
  title: "Components/ChoiceControls",
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const NativeFormComposition: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="md">
        <Card as="section">
          <CardHeader>
            <CardTitle>Workspace preferences</CardTitle>
            <CardDescription>
              Checkbox, RadioGroup, and Switch stay native while FieldControl
              owns labels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form action="/preferences" method="post">
              <Stack gap="5">
                <FieldSet>
                  <FieldLegend>Authentication preferences</FieldLegend>
                  <FieldGroup>
                    <Field id="choice-remember-device" orientation="horizontal">
                      <FieldControl asChild>
                        <Checkbox name="rememberDevice" value="yes" />
                      </FieldControl>
                      <FieldContent>
                        <FieldLabel>Remember this device</FieldLabel>
                        <FieldDescription>
                          Skip extra verification on trusted browsers.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field id="choice-security-digest" orientation="horizontal">
                      <FieldControl asChild>
                        <Checkbox
                          name="securityDigest"
                          value="yes"
                          defaultChecked
                        />
                      </FieldControl>
                      <FieldContent>
                        <FieldLabel>Security digest</FieldLabel>
                        <FieldDescription>
                          Email weekly sign-in and policy summaries.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Default response mode</FieldLegend>
                  <RadioGroup
                    name="responseMode"
                    defaultValue="balanced"
                    orientation="horizontal"
                  >
                    <Field id="choice-response-fast" orientation="horizontal">
                      <FieldControl asChild>
                        <RadioGroupItem value="fast" />
                      </FieldControl>
                      <FieldLabel>Fast</FieldLabel>
                    </Field>
                    <Field
                      id="choice-response-balanced"
                      orientation="horizontal"
                    >
                      <FieldControl asChild>
                        <RadioGroupItem value="balanced" />
                      </FieldControl>
                      <FieldLabel>Balanced</FieldLabel>
                    </Field>
                    <Field
                      id="choice-response-careful"
                      orientation="horizontal"
                    >
                      <FieldControl asChild>
                        <RadioGroupItem value="careful" />
                      </FieldControl>
                      <FieldLabel>Careful</FieldLabel>
                    </Field>
                  </RadioGroup>
                </FieldSet>

                <Field id="choice-mfa" orientation="horizontal" required>
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

                <Field
                  id="choice-admin-mfa"
                  orientation="horizontal"
                  invalid
                  required
                >
                  <FieldContent>
                    <FieldLabel>Require admin MFA</FieldLabel>
                    <FieldDescription>
                      Protect owner and billing actions.
                    </FieldDescription>
                    <FieldError>Enable this before inviting admins.</FieldError>
                  </FieldContent>
                  <FieldControl asChild>
                    <Switch name="adminMfa" value="enabled" />
                  </FieldControl>
                </Field>

                <Button type="submit">Save preferences</Button>
              </Stack>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rememberDevice = canvas.getByLabelText("Remember this device");
    const carefulMode = canvas.getByLabelText("Careful");
    const mfa = canvas.getByRole("switch", {
      name: "Multi-factor authentication",
    });

    await userEvent.click(rememberDevice);
    await userEvent.click(carefulMode);
    await userEvent.click(mfa);

    await expect(rememberDevice).toBeChecked();
    await expect(carefulMode).toBeChecked();
    await expect(mfa).not.toBeChecked();
    await expect(
      canvas.getByRole("switch", { name: "Multi-factor authentication" }),
    ).toBeInTheDocument();
  },
};

export const ProductPatterns: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="xl">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card as="section">
            <CardHeader>
              <CardTitle>Feature flags</CardTitle>
              <CardDescription>
                Settings rows use stable switch labels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form>
                <Field id="flag-beta-dashboard" orientation="horizontal">
                  <FieldContent>
                    <FieldLabel>Beta dashboard</FieldLabel>
                    <FieldDescription>
                      Expose the new operations dashboard.
                    </FieldDescription>
                  </FieldContent>
                  <FieldControl asChild>
                    <Switch
                      name="betaDashboard"
                      value="enabled"
                      defaultChecked
                    />
                  </FieldControl>
                </Field>
                <Field id="flag-fast-sync" orientation="horizontal" readOnly>
                  <FieldContent>
                    <FieldLabel>Fast sync</FieldLabel>
                    <FieldDescription>
                      Inherited from organization policy.
                    </FieldDescription>
                  </FieldContent>
                  <FieldControl asChild>
                    <Switch
                      name="fastSync"
                      value="enabled"
                      readOnly
                      defaultChecked
                    />
                  </FieldControl>
                </Field>
              </Form>
            </CardContent>
          </Card>

          <Card as="section">
            <CardHeader>
              <CardTitle>CRUD filters</CardTitle>
              <CardDescription>
                Checkbox groups submit native array values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldLegend>Status</FieldLegend>
                <FieldGroup>
                  <Field id="filter-open" orientation="horizontal">
                    <FieldControl asChild>
                      <Checkbox name="status" value="open" defaultChecked />
                    </FieldControl>
                    <FieldLabel>Open</FieldLabel>
                  </Field>
                  <Field id="filter-blocked" orientation="horizontal">
                    <FieldControl asChild>
                      <Checkbox name="status" value="blocked" />
                    </FieldControl>
                    <FieldLabel>Blocked</FieldLabel>
                  </Field>
                  <Field id="filter-archived" orientation="horizontal" disabled>
                    <FieldControl asChild>
                      <Checkbox name="status" value="archived" disabled />
                    </FieldControl>
                    <FieldLabel>Archived</FieldLabel>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>

          <Card as="section">
            <CardHeader>
              <CardTitle>Permission choices</CardTitle>
              <CardDescription>
                Mixed state documents partial role access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet aria-describedby="permissions-error">
                <FieldLegend>Role access</FieldLegend>
                <FieldGroup>
                  <Field id="permission-all" orientation="horizontal">
                    <FieldControl asChild>
                      <Checkbox defaultChecked="indeterminate" readOnly />
                    </FieldControl>
                    <FieldLabel>Select all permissions</FieldLabel>
                  </Field>
                  <Field id="permission-read" orientation="horizontal">
                    <FieldControl asChild>
                      <Checkbox
                        name="permissions"
                        value="read"
                        defaultChecked
                      />
                    </FieldControl>
                    <FieldLabel>Read records</FieldLabel>
                  </Field>
                  <Field id="permission-write" orientation="horizontal" invalid>
                    <FieldControl asChild>
                      <Checkbox
                        name="permissions"
                        value="write"
                        aria-invalid="true"
                      />
                    </FieldControl>
                    <FieldLabel>Write records</FieldLabel>
                  </Field>
                </FieldGroup>
                <FieldError id="permissions-error">
                  Confirm write access before saving.
                </FieldError>
              </FieldSet>
            </CardContent>
          </Card>

          <Card as="section">
            <CardHeader>
              <CardTitle>AI model and tools</CardTitle>
              <CardDescription>
                Radio values and tool switches share form wiring.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Stack gap="5">
                <FieldSet>
                  <FieldLegend>Model family</FieldLegend>
                  <RadioGroup name="modelFamily" defaultValue="balanced">
                    <Field id="model-fast-suite" orientation="horizontal">
                      <FieldControl asChild>
                        <RadioGroupItem value="fast" />
                      </FieldControl>
                      <FieldLabel>Fast model</FieldLabel>
                    </Field>
                    <Field id="model-balanced-suite" orientation="horizontal">
                      <FieldControl asChild>
                        <RadioGroupItem value="balanced" />
                      </FieldControl>
                      <FieldLabel>Balanced model</FieldLabel>
                    </Field>
                  </RadioGroup>
                </FieldSet>
                <FieldSet>
                  <FieldLegend>Tool access</FieldLegend>
                  <FieldGroup>
                    <Field id="tool-browser-suite" orientation="horizontal">
                      <FieldContent>
                        <FieldLabel>Browser tool</FieldLabel>
                        <FieldDescription>
                          Allow website inspection.
                        </FieldDescription>
                      </FieldContent>
                      <FieldControl asChild>
                        <Switch
                          name="browserTool"
                          value="enabled"
                          defaultChecked
                        />
                      </FieldControl>
                    </Field>
                    <Field id="tool-terminal-suite" orientation="horizontal">
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
              </Stack>
            </CardContent>
          </Card>
        </div>
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeDensityRTLAndResponsive: Story = {
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
          <Container size="lg">
            <Form>
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <FieldSet>
                  <FieldLegend>
                    {theme === "dark" ? "RTL choices" : "Responsive choices"}
                  </FieldLegend>
                  <FieldGroup>
                    <Field
                      id={`suite-checkbox-${theme}`}
                      orientation="horizontal"
                    >
                      <FieldControl asChild>
                        <Checkbox
                          name={`density-${theme}`}
                          value="compact"
                          defaultChecked
                        />
                      </FieldControl>
                      <FieldContent>
                        <FieldLabel>Compact density</FieldLabel>
                        <FieldDescription>
                          Logical spacing keeps labels aligned.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field
                      id={`suite-switch-${theme}`}
                      orientation="horizontal"
                    >
                      <FieldContent>
                        <FieldLabel>Receive alerts</FieldLabel>
                        <FieldDescription>
                          Switch thumb placement uses logical margins.
                        </FieldDescription>
                      </FieldContent>
                      <FieldControl asChild>
                        <Switch
                          name={`alerts-${theme}`}
                          value="enabled"
                          defaultChecked
                        />
                      </FieldControl>
                    </Field>
                  </FieldGroup>
                </FieldSet>
                <FieldSet>
                  <FieldLegend>Layout mode</FieldLegend>
                  <RadioGroup
                    name={`layout-${theme}`}
                    defaultValue="comfortable"
                    orientation="horizontal"
                  >
                    <Field
                      id={`layout-compact-${theme}`}
                      orientation="horizontal"
                    >
                      <FieldControl asChild>
                        <RadioGroupItem value="compact" />
                      </FieldControl>
                      <FieldLabel>Compact</FieldLabel>
                    </Field>
                    <Field
                      id={`layout-comfortable-${theme}`}
                      orientation="horizontal"
                    >
                      <FieldControl asChild>
                        <RadioGroupItem value="comfortable" />
                      </FieldControl>
                      <FieldLabel>Comfortable</FieldLabel>
                    </Field>
                  </RadioGroup>
                </FieldSet>
              </div>
            </Form>
          </Container>
        </DethinkProvider>
      ))}
    </div>
  ),
};
