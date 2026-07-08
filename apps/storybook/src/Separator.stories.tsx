import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Box,
  Button,
  Container,
  DethinkProvider,
  Divider,
  Flex,
  Grid,
  Heading,
  Separator,
  Stack,
  Text,
  type SeparatorElement,
  type SeparatorOrientation,
  type SeparatorSpacing,
  type SeparatorThickness,
  type SeparatorTone,
} from "@dethink/components";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

const meta = {
  title: "Components/Separator",
  component: Separator,
  args: {
    as: "hr",
    decorative: false,
    orientation: "horizontal",
    spacing: "none",
    thickness: "1",
    tone: "default",
  },
  argTypes: {
    as: {
      control: "inline-radio",
      options: ["hr", "div", "span"],
    },
    decorative: {
      control: "boolean",
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    spacing: {
      control: "select",
      options: ["none", "1", "2", "3", "4", "6", "8"],
    },
    thickness: {
      control: "inline-radio",
      options: ["1", "2"],
    },
    tone: {
      control: "inline-radio",
      options: ["default", "muted", "strong"],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

const elements: SeparatorElement[] = ["hr", "div", "span"];
const orientations: SeparatorOrientation[] = ["horizontal", "vertical"];
const thicknesses: SeparatorThickness[] = ["1", "2"];
const tones: SeparatorTone[] = ["default", "muted", "strong"];
const spacings: SeparatorSpacing[] = ["none", "1", "2", "3", "4", "6", "8"];

const RouterSpan = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & { to: string }
>(({ to: _to, ...props }, ref) => <span ref={ref} {...props} />);
RouterSpan.displayName = "RouterSpan";

function Panel({ children }: { children: ReactNode }) {
  return (
    <Box border="default" p="4" radius="md" surface="background">
      {children}
    </Box>
  );
}

export const Base: Story = {};

export const HorizontalAndVertical: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="5">
        <Stack gap="3">
          <Text weight="medium">Horizontal section boundary</Text>
          <Separator />
          <Text size="sm" tone="muted">
            Section content continues after the separator.
          </Text>
        </Stack>
        <Flex align="center" gap="3" className="min-h-12">
          <Button variant="outline">Export</Button>
          <Separator as="div" orientation="vertical" />
          <Button>New workflow</Button>
        </Flex>
      </Stack>
    </DethinkProvider>
  ),
};

export const SemanticAndDecorative: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Grid columns="auto-fit-sm" gap="4">
        <Panel>
          <Stack gap="3">
            <Heading level={2} visualLevel={4}>
              Semantic
            </Heading>
            <Separator />
            <Text size="sm" tone="muted">
              Native thematic break with separator semantics.
            </Text>
          </Stack>
        </Panel>
        <Panel>
          <Stack gap="3">
            <Heading level={2} visualLevel={4}>
              Decorative
            </Heading>
            <Separator decorative />
            <Text size="sm" tone="muted">
              Visual-only line hidden from assistive technologies.
            </Text>
          </Stack>
        </Panel>
      </Grid>
    </DethinkProvider>
  ),
};

export const ThicknessToneAndSpacing: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="6">
        <Grid columns="auto-fit-xs" gap="4">
          {thicknesses.map((thickness) => (
            <Panel key={thickness}>
              <Stack gap="3">
                <Text size="sm" weight="medium">
                  thickness {thickness}
                </Text>
                <Separator thickness={thickness} />
              </Stack>
            </Panel>
          ))}
        </Grid>
        <Grid columns="auto-fit-xs" gap="4">
          {tones.map((tone) => (
            <Panel key={tone}>
              <Stack gap="3">
                <Text size="sm" weight="medium">
                  tone {tone}
                </Text>
                <Separator tone={tone} />
              </Stack>
            </Panel>
          ))}
        </Grid>
        <Grid columns="auto-fit-xs" gap="4">
          {spacings.map((spacing) => (
            <Panel key={spacing}>
              <Text size="sm" weight="medium">
                spacing {spacing}
              </Text>
              <Separator spacing={spacing} />
              <Text size="sm" tone="muted">
                Boundaries keep vertical rhythm tokenized.
              </Text>
            </Panel>
          ))}
        </Grid>
      </Stack>
    </DethinkProvider>
  ),
};

export const ToolbarMenuSettingsAndForm: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="6">
        <Flex align="center" gap="3" wrap="wrap">
          <Button variant="outline">Duplicate</Button>
          <Separator as="div" decorative orientation="vertical" />
          <Button variant="outline">Archive</Button>
          <Button>Publish</Button>
        </Flex>
        <Box border="default" p="4" radius="md" surface="background">
          <Stack gap="3">
            <Heading level={2} visualLevel={4}>
              Settings
            </Heading>
            <Separator />
            <Grid columns="auto-fit-xs" gap="3">
              {["Region", "Plan", "Seats"].map((label) => (
                <Box
                  key={label}
                  border="default"
                  p="3"
                  radius="md"
                  surface="muted"
                >
                  <Text size="sm" weight="medium">
                    {label}
                  </Text>
                </Box>
              ))}
            </Grid>
          </Stack>
        </Box>
        <Box asChild border="default" p="4" radius="md" surface="background">
          <form aria-label="Example separator form">
            <Stack gap="3">
              <Text weight="medium">Notification routing</Text>
              <Separator decorative />
              <label className="grid gap-2 text-sm" htmlFor="separator-email">
                Email
                <input
                  id="separator-email"
                  className="h-density-control border-input bg-background rounded-md border px-3"
                  placeholder="ops@example.com"
                />
              </label>
            </Stack>
          </form>
        </Box>
      </Stack>
    </DethinkProvider>
  ),
};

export const ElementModesAndAsChild: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="5">
        <Grid columns="auto-fit-xs" gap="3">
          {elements.map((element) => (
            <Panel key={element}>
              <Stack gap="3">
                <Text size="sm" weight="medium">
                  as {element}
                </Text>
                <Separator as={element} />
              </Stack>
            </Panel>
          ))}
        </Grid>
        <Stack gap="3">
          <Text weight="medium">asChild composition</Text>
          <Separator asChild>
            <RouterSpan to="#separator-as-child" />
          </Separator>
          <Divider decorative tone="muted" />
        </Stack>
      </Stack>
    </DethinkProvider>
  ),
};

export const OrientationMatrix: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Grid columns="auto-fit-sm" gap="4">
        {orientations.map((orientation) => (
          <Panel key={orientation}>
            <Stack gap="3">
              <Text size="sm" weight="medium">
                {orientation}
              </Text>
              {orientation === "horizontal" ? (
                <Separator orientation={orientation} />
              ) : (
                <Flex align="center" gap="3" className="min-h-14">
                  <Text size="sm">Before</Text>
                  <Separator as="div" orientation={orientation} />
                  <Text size="sm">After</Text>
                </Flex>
              )}
            </Stack>
          </Panel>
        ))}
      </Grid>
    </DethinkProvider>
  ),
};

export const ResponsiveClassNameComposition: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="3">
        <Text weight="medium">Responsive rhythm</Text>
        <Separator spacing="2" className="sm:my-4 lg:my-6" />
        <Text size="sm" tone="muted">
          Consumer classes remain the escape hatch for breakpoint-specific
          spacing.
        </Text>
      </Stack>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <Grid columns="1" gap="4">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="border-border bg-background rounded-lg border p-6"
      >
        <Stack gap="3" dir="rtl">
          <Text weight="medium">RTL compact dark</Text>
          <Separator tone="strong" />
          <Flex align="center" gap="3">
            <Button variant="outline">Export</Button>
            <Separator as="div" decorative orientation="vertical" />
            <Button>Save</Button>
          </Flex>
        </Stack>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        className="border-border bg-background rounded-lg border p-6"
      >
        <Container size="md">
          <Stack gap="4">
            <Text weight="medium">Comfortable light</Text>
            <Separator spacing="2" tone="muted" />
            <Text size="sm" tone="muted">
              Separator spacing follows the same density context as surrounding
              layout.
            </Text>
          </Stack>
        </Container>
      </DethinkProvider>
    </Grid>
  ),
};
