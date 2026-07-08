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
  FieldControl,
  FieldDescription,
  FieldLabel,
  Form,
  Grid,
  Label,
  Stack,
  Text,
} from "@dethink/components";

const meta = {
  title: "Components/Label",
  component: Label,
  args: {
    children: "Workspace name",
    size: "md",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

const nativeInputClasses =
  "min-h-density-control w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm outline-none motion-safe:transition-[border-color,box-shadow] motion-safe:duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/15 sm:text-sm";

export const NativeAssociation: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <form className="grid gap-[var(--dt-space-2)]">
          <Label htmlFor="label-workspace" required>
            Workspace name
          </Label>
          <input
            id="label-workspace"
            name="workspace"
            required
            className={nativeInputClasses}
            placeholder="Acme Operations"
          />
        </form>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Workspace name");
    const input = canvas.getByLabelText(/Workspace name/);

    await userEvent.click(label);

    await expect(input).toHaveFocus();
    await expect(input).toBeRequired();
  },
};

export const RequiredAndOptionalMarkers: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="4">
          <div className="grid gap-[var(--dt-space-2)]">
            <Label htmlFor="label-owner" required requiredMarker="Required">
              Owner email
            </Label>
            <input
              id="label-owner"
              type="email"
              className={nativeInputClasses}
              required
              defaultValue="owner@example.com"
            />
          </div>
          <div className="grid gap-[var(--dt-space-2)]">
            <Label htmlFor="label-notes" optional optionalMarker="Optional">
              Internal notes
            </Label>
            <textarea
              id="label-notes"
              className={`${nativeInputClasses} min-h-24 resize-y`}
              defaultValue="Coordinate launch review before production traffic."
            />
          </div>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
};

export const DisabledAndInvalidStates: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="4">
          <div className="grid gap-[var(--dt-space-2)]">
            <Label htmlFor="label-api-key" disabled>
              API key name
            </Label>
            <input
              id="label-api-key"
              className={nativeInputClasses}
              disabled
              defaultValue="Production key"
            />
          </div>
          <div className="grid gap-[var(--dt-space-2)]">
            <Label htmlFor="label-billing" invalid required>
              Billing email
            </Label>
            <input
              id="label-billing"
              type="email"
              className={nativeInputClasses}
              aria-describedby="label-billing-error"
              aria-invalid="true"
              required
              defaultValue="billing"
            />
            <Text id="label-billing-error" size="xs" tone="destructive">
              Enter a valid billing email address.
            </Text>
          </div>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
};

export const WithFormField: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="md">
        <Card>
          <CardHeader>
            <CardTitle as="h2">Workspace settings</CardTitle>
            <CardDescription>
              Configure workspace naming, routing, and account-level defaults.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form>
              <Field id="field-owned-name" required>
                <FieldLabel>Workspace name</FieldLabel>
                <FieldControl asChild>
                  <input className={nativeInputClasses} required />
                </FieldControl>
                <FieldDescription>
                  This name appears in navigation and shared reports.
                </FieldDescription>
              </Field>
              <div className="grid gap-[var(--dt-space-2)]">
                <Label htmlFor="standalone-domain" optional>
                  Custom domain
                </Label>
                <input
                  id="standalone-domain"
                  className={nativeInputClasses}
                  placeholder="dashboard.example.com"
                />
              </div>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <Grid columns="1" gap="4">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="bg-background p-6"
      >
        <Container size="sm">
          <form className="grid gap-[var(--dt-density-gap)]">
            <Label htmlFor="compact-label" required size="sm">
              API key name
            </Label>
            <input
              id="compact-label"
              className={nativeInputClasses}
              required
              defaultValue="Production key"
            />
          </form>
        </Container>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="p-6"
      >
        <Container size="sm">
          <form className="grid gap-[var(--dt-density-gap)]">
            <Label htmlFor="rtl-label" optional optionalMarker="اختياري">
              اسم الفريق
            </Label>
            <input
              id="rtl-label"
              className={nativeInputClasses}
              defaultValue="عمليات"
            />
          </form>
        </Container>
      </DethinkProvider>
    </Grid>
  ),
};
