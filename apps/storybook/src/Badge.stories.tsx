import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Info,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DethinkProvider,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type BadgeSize,
  type BadgeTone,
  type BadgeVariant,
} from "@dethink/components";

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: {
    children: "Queued",
    size: "md",
    tone: "neutral",
    variant: "soft",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"],
    },
    tone: {
      control: "inline-radio",
      options: [
        "neutral",
        "primary",
        "success",
        "warning",
        "destructive",
        "info",
      ],
    },
    variant: {
      control: "inline-radio",
      options: ["solid", "soft", "outline", "subtle"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

const variants: BadgeVariant[] = ["solid", "soft", "outline", "subtle"];
const tones: Array<{
  label: string;
  status: string;
  tone: BadgeTone;
  icon: typeof CircleDot;
}> = [
  {
    icon: CircleDot,
    label: "Neutral",
    status: "No owner",
    tone: "neutral",
  },
  {
    icon: Sparkles,
    label: "Primary",
    status: "Featured",
    tone: "primary",
  },
  {
    icon: CheckCircle2,
    label: "Success",
    status: "Healthy",
    tone: "success",
  },
  {
    icon: AlertTriangle,
    label: "Warning",
    status: "Needs review",
    tone: "warning",
  },
  {
    icon: XCircle,
    label: "Destructive",
    status: "Failed",
    tone: "destructive",
  },
  {
    icon: Info,
    label: "Info",
    status: "AI assisted",
    tone: "info",
  },
];
const sizes: BadgeSize[] = ["xs", "sm", "md", "lg"];
const highContrastStyle = {
  "--dt-color-background-light": "oklch(1 0 0)",
  "--dt-color-foreground-light": "oklch(0 0 0)",
  "--dt-color-muted-light": "oklch(0.94 0 0)",
  "--dt-color-muted-foreground-light": "oklch(0.2 0 0)",
  "--dt-color-border-light": "oklch(0 0 0)",
  "--dt-color-primary-light": "oklch(0.22 0.17 260)",
  "--dt-color-primary-foreground-light": "oklch(1 0 0)",
  "--dt-color-success-light": "oklch(0.34 0.14 145)",
  "--dt-color-success-foreground-light": "oklch(1 0 0)",
  "--dt-color-warning-light": "oklch(0.63 0.17 75)",
  "--dt-color-warning-foreground-light": "oklch(0 0 0)",
  "--dt-color-destructive-light": "oklch(0.45 0.22 28)",
  "--dt-color-destructive-foreground-light": "oklch(1 0 0)",
  "--dt-color-info-light": "oklch(0.32 0.16 245)",
  "--dt-color-info-foreground-light": "oklch(1 0 0)",
} as CSSProperties;

export const Base: Story = {};

export const ToneAndVariantMatrix: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border grid gap-4 rounded-lg border p-6"
    >
      {variants.map((variant) => (
        <div key={variant} className="grid gap-2">
          <h2 className="text-muted-foreground text-sm font-medium capitalize">
            {variant}
          </h2>
          <div className="gap-density-gap flex flex-wrap items-center">
            {tones.map(({ icon: Icon, status, tone }) => (
              <Badge key={tone} icon={<Icon />} tone={tone} variant={variant}>
                {status}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </DethinkProvider>
  ),
};

export const IconPlacement: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        <Badge icon={<CheckCircle2 />} tone="success">
          Sync complete
        </Badge>
        <Badge icon={<Clock3 />} iconPlacement="trailing" tone="warning">
          Review pending
        </Badge>
        <Badge
          leadingIcon={<Sparkles />}
          trailingIcon={<ArrowRight />}
          tone="info"
          variant="outline"
        >
          AI draft ready
        </Badge>
      </div>
    </DethinkProvider>
  ),
};

export const DenseTableUsage: Story = {
  render: () => (
    <DethinkProvider
      density="compact"
      theme="light"
      className="border-border max-w-4xl rounded-lg border p-4"
    >
      <Table density="compact">
        <TableCaption placement="top">
          Deployment queue status by environment
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="end">Errors</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            {
              errors: "0",
              icon: CheckCircle2,
              service: "Billing worker",
              status: "Healthy",
              tone: "success" as const,
              variant: "soft" as const,
            },
            {
              errors: "3",
              icon: AlertTriangle,
              service: "Import pipeline",
              status: "Needs review",
              tone: "warning" as const,
              variant: "outline" as const,
            },
            {
              errors: "12",
              icon: XCircle,
              service: "Email sender",
              status: "Failed",
              tone: "destructive" as const,
              variant: "solid" as const,
            },
          ].map(({ errors, icon: Icon, service, status, tone, variant }) => (
            <TableRow key={service}>
              <TableCell>{service}</TableCell>
              <TableCell>Production</TableCell>
              <TableCell>
                <Badge icon={<Icon />} size="xs" tone={tone} variant={variant}>
                  {status}
                </Badge>
              </TableCell>
              <TableCell align="end" numeric>
                {errors}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DethinkProvider>
  ),
};

export const CardHeaderUsage: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="grid max-w-4xl gap-4 md:grid-cols-2"
    >
      <Card>
        <CardHeader>
          <CardTitle as="h2">Workspace rollout</CardTitle>
          <CardDescription>
            Migration health across active customer accounts.
          </CardDescription>
          <CardAction>
            <Badge icon={<CheckCircle2 />} tone="success" variant="soft">
              On track
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="gap-density-gap flex flex-wrap">
            <Badge tone="info" variant="outline">
              48 accounts
            </Badge>
            <Badge tone="warning" variant="subtle">
              3 need review
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle as="h2">AI review queue</CardTitle>
          <CardDescription>
            Generated summaries waiting for human approval.
          </CardDescription>
          <CardAction>
            <Badge icon={<Sparkles />} tone="primary" variant="solid">
              AI assisted
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="gap-density-gap flex flex-wrap">
            <Badge tone="neutral">12 drafts</Badge>
            <Badge tone="destructive" variant="outline">
              1 blocked
            </Badge>
          </div>
        </CardContent>
      </Card>
    </DethinkProvider>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <DethinkProvider
          key={theme}
          theme={theme}
          className="border-border rounded-lg border p-6"
        >
          <div className="grid gap-3">
            <h2 className="text-muted-foreground text-sm font-medium capitalize">
              {theme}
            </h2>
            <div className="gap-density-gap flex flex-wrap">
              {tones.map(({ icon: Icon, status, tone }) => (
                <Badge key={tone} icon={<Icon />} tone={tone}>
                  {status}
                </Badge>
              ))}
            </div>
          </div>
        </DethinkProvider>
      ))}
    </div>
  ),
};

export const DensityMatrix: Story = {
  render: () => (
    <div className="grid gap-4">
      {(["compact", "default", "comfortable"] as const).map((density) => (
        <DethinkProvider
          key={density}
          density={density}
          theme="light"
          className="border-border rounded-lg border p-6"
        >
          <div className="gap-density-gap flex flex-wrap items-center">
            <span className="text-muted-foreground min-w-24 text-sm font-medium">
              {density}
            </span>
            {sizes.map((size) => (
              <Badge key={size} icon={<CheckCircle2 />} size={size}>
                {size}
              </Badge>
            ))}
          </div>
        </DethinkProvider>
      ))}
    </div>
  ),
};

export const HighContrast: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      style={highContrastStyle}
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        {tones.map(({ icon: Icon, status, tone }) => (
          <Badge key={tone} icon={<Icon />} tone={tone} variant="outline">
            {status}
          </Badge>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const RightToLeft: Story = {
  render: () => (
    <DethinkProvider
      dir="rtl"
      theme="light"
      className="border-border max-w-3xl rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        <Badge icon={<CheckCircle2 />} tone="success">
          مكتمل
        </Badge>
        <Badge icon={<Clock3 />} iconPlacement="trailing" tone="warning">
          بانتظار المراجعة
        </Badge>
        <Badge leadingIcon={<Info />} trailingIcon={<ArrowRight />} tone="info">
          معلومات الحساب
        </Badge>
      </div>
    </DethinkProvider>
  ),
};

export const NativeInteractionRecipes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border flex max-w-3xl flex-wrap items-center gap-4 rounded-lg border p-6"
    >
      <Link href="/deployments" underline="none">
        <Badge icon={<AlertTriangle />} tone="warning" variant="outline">
          View blocked deployments
        </Badge>
      </Link>
      <span className="inline-flex items-center gap-[var(--dt-space-1)]">
        <Badge tone="primary">Filter: production</Badge>
        <IconButton
          aria-label="Remove production filter"
          size="xs"
          variant="ghost"
        >
          <X />
        </IconButton>
      </span>
      <Button leftIcon={<X />} size="sm" variant="outline">
        Clear all filters
      </Button>
    </DethinkProvider>
  ),
};
