import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DethinkProvider,
  Heading,
  Text,
  Typography,
  type HeadingLevel,
  type HeadingVisualLevel,
  type TextSize,
  type TypographyAlign,
  type TypographyTone,
  type TypographyVariant,
  type TypographyWeight,
} from "@dethink/components";

const meta = {
  title: "Components/Typography",
  component: Typography,
  args: {
    children: "Typography copy",
    variant: "body",
    tone: "default",
    align: "start",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: [
        "display",
        "heading",
        "title",
        "subtitle",
        "body",
        "caption",
        "label",
      ],
    },
    tone: {
      control: "inline-radio",
      options: [
        "default",
        "muted",
        "subtle",
        "primary",
        "success",
        "warning",
        "destructive",
      ],
    },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end", "justify"],
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

const headingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];
const visualLevels: HeadingVisualLevel[] = [1, 2, 3, 4, 5, 6];
const textSizes: TextSize[] = ["xs", "sm", "md", "lg", "xl"];
const tones: TypographyTone[] = [
  "default",
  "muted",
  "subtle",
  "primary",
  "success",
  "warning",
  "destructive",
];
const variants: TypographyVariant[] = [
  "display",
  "heading",
  "title",
  "subtitle",
  "body",
  "caption",
  "label",
];
const weights: TypographyWeight[] = ["regular", "medium", "semibold", "bold"];
const alignments: TypographyAlign[] = ["start", "center", "end", "justify"];

export const Base: Story = {};

export const HeadingScale: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="space-y-4">
        {headingLevels.map((level) => (
          <Heading key={level} level={level}>
            Heading level {level}
          </Heading>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const SemanticAndVisualLevels: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="space-y-4">
        <Heading level={2} visualLevel={4}>
          Semantic h2 styled like visual level 4
        </Heading>
        <Text tone="muted">
          The document outline remains an h2 while the visual rhythm can match a
          compact card or panel.
        </Text>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visualLevels.map((visualLevel) => (
            <div
              key={visualLevel}
              className="border-border bg-muted/30 rounded-md border p-3"
            >
              <Heading level={3} visualLevel={visualLevel}>
                Visual {visualLevel}
              </Heading>
              <Text size="sm" tone="muted">
                Rendered as h3
              </Text>
            </div>
          ))}
        </div>
      </div>
    </DethinkProvider>
  ),
};

export const TextScale: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="space-y-3">
        {textSizes.map((size) => (
          <Text key={size} size={size}>
            {size} text keeps application copy readable across dense dashboards.
          </Text>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const Variants: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="space-y-4">
        {variants.map((variant) => (
          <Typography key={variant} variant={variant}>
            {variant} typography variant
          </Typography>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const TonesAndWeights: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {tones.map((tone) => (
            <Text key={tone} tone={tone} weight="medium">
              {tone} tone with explicit text meaning
            </Text>
          ))}
        </div>
        <div className="space-y-3">
          {weights.map((weight) => (
            <Text key={weight} weight={weight}>
              {weight} weight
            </Text>
          ))}
        </div>
      </div>
    </DethinkProvider>
  ),
};

export const Alignment: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {alignments.map((align) => (
          <div
            key={align}
            className="border-border bg-muted/30 rounded-md border p-3"
          >
            <Text align={align}>
              {align} aligned copy demonstrates logical alignment utilities for
              internationalized layouts.
            </Text>
          </div>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const TruncationAndClamp: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-xl rounded-lg border p-6"
    >
      <div className="space-y-4">
        <div className="border-border bg-muted/30 rounded-md border p-3">
          <Text truncate weight="semibold">
            Very long customer workspace name that should truncate inside narrow
            dashboard navigation
          </Text>
        </div>
        <div className="border-border bg-muted/30 rounded-md border p-3">
          <Text lineClamp={3} tone="muted">
            Product activity generated a long operational summary after
            importing events, validating customer records, checking the billing
            pipeline, and reconciling dashboard metrics from multiple source
            systems.
          </Text>
        </div>
      </div>
    </DethinkProvider>
  ),
};

export const DashboardCopy: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="border-border bg-background rounded-md border p-4">
          <Text as="span" size="sm" tone="muted" weight="medium">
            Pipeline
          </Text>
          <Heading className="mt-2" level={2} visualLevel={4}>
            Customer sync
          </Heading>
          <Text className="mt-2" lineClamp={2} size="sm" tone="muted">
            Records imported from CRM, support, and billing sources.
          </Text>
        </section>
        <section className="border-border bg-background rounded-md border p-4">
          <Text as="span" size="sm" tone="success" weight="semibold">
            Complete
          </Text>
          <Heading className="mt-2" level={2} visualLevel={4}>
            Data checks
          </Heading>
          <Text className="mt-2" size="sm" tone="muted">
            Validation finished without blocking errors.
          </Text>
        </section>
        <section className="border-border bg-background rounded-md border p-4">
          <Text as="span" size="sm" tone="warning" weight="semibold">
            Attention
          </Text>
          <Heading className="mt-2" level={2} visualLevel={4}>
            Billing drift
          </Heading>
          <Text className="mt-2" lineClamp={2} size="sm" tone="muted">
            Two accounts need manual review before the next export run.
          </Text>
        </section>
      </div>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="border-border rounded-lg border p-6"
      >
        <div className="space-y-3">
          <Heading level={2} visualLevel={3}>
            Dark compact typography
          </Heading>
          <Text tone="muted">
            Text primitives keep readable contrast while inheriting compact
            density from the provider.
          </Text>
          <Text tone="primary" weight="semibold">
            Primary emphasis
          </Text>
        </div>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-6"
      >
        <div className="space-y-3">
          <Heading align="start" level={2} visualLevel={3}>
            RTL logical start
          </Heading>
          <Text align="start" tone="muted">
            Logical alignment uses start and end rather than physical left and
            right.
          </Text>
          <Text align="end" size="sm" tone="subtle">
            End aligned metadata
          </Text>
        </div>
      </DethinkProvider>
    </div>
  ),
};
