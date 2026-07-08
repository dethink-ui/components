import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  DethinkProvider,
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Form,
  NumberInput,
  Stack,
} from "@dethink/components";

const meta = {
  title: "Components/NumberInput",
  component: NumberInput,
  args: {
    placeholder: "0.00",
  },
  argTypes: {
    controlSize: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    numberMode: {
      control: "inline-radio",
      options: ["decimal", "numeric"],
    },
    type: {
      control: "inline-radio",
      options: ["text", "number"],
    },
    invalid: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <NumberInput {...args} aria-label="Base number input" />
      </Container>
    </DethinkProvider>
  ),
};

export const FieldComposition: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Form>
          <Field id="seat-count" required>
            <FieldLabel>Seat count</FieldLabel>
            <FieldControl asChild>
              <NumberInput
                name="seats"
                numberMode="numeric"
                placeholder="12"
                pattern="[0-9]*"
              />
            </FieldControl>
            <FieldDescription>
              Stored as native form text until application code validates it.
            </FieldDescription>
          </Field>
        </Form>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Seat count");
    const input = canvas.getByLabelText(/Seat count/);

    await userEvent.click(label);

    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute("inputmode", "numeric");
  },
};

export const DecimalBudget: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Field id="monthly-budget">
          <FieldLabel>Monthly budget</FieldLabel>
          <FieldControl asChild>
            <NumberInput
              name="budget"
              defaultValue="1250.00"
              min="0"
              step="0.01"
            />
          </FieldControl>
          <FieldDescription>
            The control preserves the string value and leaves formatting to app
            code.
          </FieldDescription>
        </Field>
      </Container>
    </DethinkProvider>
  ),
};

export const NativeNumberOptIn: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Field id="native-quantity">
          <FieldLabel>Native quantity</FieldLabel>
          <FieldControl asChild>
            <NumberInput
              type="number"
              name="quantity"
              defaultValue="3"
              min="1"
              max="10"
              step="1"
            />
          </FieldControl>
          <FieldDescription>
            Use native number behavior only when browser spinbutton semantics
            are wanted.
          </FieldDescription>
        </Field>
      </Container>
    </DethinkProvider>
  ),
};

export const InvalidRequired: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Field id="quota" invalid required>
          <FieldLabel>Quota</FieldLabel>
          <FieldControl asChild>
            <NumberInput name="quota" defaultValue="0" numberMode="numeric" />
          </FieldControl>
          <FieldDescription>Quota must be greater than zero.</FieldDescription>
          <FieldError>Enter a quota above zero.</FieldError>
        </Field>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/Quota/);

    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAttribute("aria-errormessage", "quota-error");
  },
};

export const DisabledAndReadOnly: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="4">
          <Field id="fixed-plan" readOnly>
            <FieldLabel>Fixed plan seats</FieldLabel>
            <FieldControl asChild>
              <NumberInput readOnly numberMode="numeric" defaultValue="50" />
            </FieldControl>
          </Field>
          <Field id="locked-budget" disabled>
            <FieldLabel>Locked budget</FieldLabel>
            <FieldControl asChild>
              <NumberInput disabled defaultValue="2500.00" />
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
      <Container size="sm">
        <Card as="section">
          <CardHeader>
            <CardTitle>Usage limits</CardTitle>
            <CardDescription>
              Numeric values remain strings until application validation runs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form action="/limits" method="post">
              <Field id="limit-seats">
                <FieldLabel>Seats</FieldLabel>
                <FieldControl asChild>
                  <NumberInput
                    name="seats"
                    numberMode="numeric"
                    defaultValue="25"
                  />
                </FieldControl>
              </Field>
              <Field id="limit-budget">
                <FieldLabel>Budget</FieldLabel>
                <FieldControl asChild>
                  <NumberInput
                    name="budget"
                    defaultValue="5000.00"
                    step="0.01"
                  />
                </FieldControl>
              </Field>
              <Button type="submit">Save limits</Button>
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
            <Field id={`number-input-${theme}`}>
              <FieldLabel>{theme === "dark" ? "מכסה" : "Quota"}</FieldLabel>
              <FieldControl asChild>
                <NumberInput
                  defaultValue={theme === "dark" ? "250" : "125"}
                  name={`quota-${theme}`}
                  numberMode="numeric"
                />
              </FieldControl>
              <FieldDescription>
                {theme === "dark"
                  ? "RTL, density, and dark mode share the same numeric-entry contract."
                  : "Compact density keeps numeric fields scannable."}
              </FieldDescription>
            </Field>
          </Container>
        </DethinkProvider>
      ))}
    </div>
  ),
};
