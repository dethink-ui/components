import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Box,
  Button,
  DethinkProvider,
  Heading,
  Link,
  Stack,
  Text,
  type StackAlign,
  type StackDirection,
  type StackElement,
  type StackGap,
  type StackJustify,
  type StackWrap,
} from "@dethink/components";
import { forwardRef, type AnchorHTMLAttributes } from "react";

const meta = {
  title: "Components/Stack",
  component: Stack,
  args: {
    as: "div",
    children: "Stack content",
    direction: "vertical",
    gap: "4",
    align: "stretch",
    justify: "start",
    wrap: "nowrap",
  },
  argTypes: {
    as: {
      control: "select",
      options: [
        "div",
        "section",
        "article",
        "main",
        "aside",
        "nav",
        "header",
        "footer",
        "ul",
        "ol",
        "li",
        "form",
        "fieldset",
        "span",
      ],
    },
    direction: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
    gap: {
      control: "select",
      options: ["none", "1", "2", "3", "4", "5", "6", "8", "10", "12"],
    },
    align: {
      control: "inline-radio",
      options: ["stretch", "start", "center", "end", "baseline"],
    },
    justify: {
      control: "inline-radio",
      options: ["start", "center", "end", "between"],
    },
    wrap: {
      control: "inline-radio",
      options: ["nowrap", "wrap"],
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;

type Story = StoryObj<typeof meta>;

const elements: StackElement[] = [
  "section",
  "article",
  "nav",
  "header",
  "footer",
  "ul",
  "ol",
  "form",
  "fieldset",
  "span",
];
const gaps: StackGap[] = [
  "none",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
];
const aligns: StackAlign[] = ["stretch", "start", "center", "end", "baseline"];
const justifies: StackJustify[] = ["start", "center", "end", "between"];
const directions: StackDirection[] = ["vertical", "horizontal"];
const wraps: StackWrap[] = ["nowrap", "wrap"];

const RouterAnchor = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, children, ...props }, ref) => (
  <a ref={ref} href={to} {...props}>
    {children}
  </a>
));
RouterAnchor.displayName = "RouterAnchor";

function MetricCard({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <Box border="default" p="4" radius="md" surface="background">
      <Stack gap="2">
        <Text size="sm" tone="muted" weight="medium">
          {label}
        </Text>
        <Heading level={3} visualLevel={4}>
          {value}
        </Heading>
        <Text size="sm" tone="muted">
          {detail}
        </Text>
      </Stack>
    </Box>
  );
}

export const Base: Story = {};

export const VerticalComposition: Story = {
  args: {
    direction: "horizontal",
  },

  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack as="section" aria-labelledby="stack-overview" gap="5">
        <Stack gap="2">
          <Heading id="stack-overview" level={2} visualLevel={3}>
            Operations overview
          </Heading>
          <Text tone="muted">
            Review delivery health, ownership, and follow-up actions.
          </Text>
        </Stack>
        <Box display="grid" gap="3" className="md:grid-cols-3">
          <MetricCard detail="Up 8% this week" label="Deploys" value="148" />
          <MetricCard detail="Within target" label="Lead time" value="2.4h" />
          <MetricCard
            detail="No active incident"
            label="Reliability"
            value="99.98%"
          />
        </Box>
      </Stack>
    </DethinkProvider>
  ),
};

export const HorizontalToolbar: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack
        as="header"
        direction="horizontal"
        gap="3"
        align="center"
        justify="between"
      >
        <Stack gap="1">
          <Heading level={2} visualLevel={4}>
            Integrations
          </Heading>
          <Text size="sm" tone="muted">
            Production connectors and sync health.
          </Text>
        </Stack>
        <Stack direction="horizontal" gap="2" align="center" wrap="wrap">
          <Button variant="outline">Export</Button>
          <Button>New connector</Button>
        </Stack>
      </Stack>
    </DethinkProvider>
  ),
};

export const GapMatrix: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box display="grid" gap="4" className="sm:grid-cols-2 lg:grid-cols-5">
        {gaps.map((gap) => (
          <Box
            key={gap}
            border="default"
            p="3"
            radius="md"
            surface="background"
          >
            <Stack gap={gap}>
              <Text size="sm" tone="muted" weight="medium">
                gap={gap}
              </Text>
              <Box p="2" radius="sm" surface="muted">
                <Text size="sm">First</Text>
              </Box>
              <Box p="2" radius="sm" surface="muted">
                <Text size="sm">Second</Text>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>
    </DethinkProvider>
  ),
};

export const AlignmentAndJustification: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="4">
        <Box display="grid" gap="3" className="lg:grid-cols-5">
          {aligns.map((align) => (
            <Box
              key={align}
              border="default"
              p="3"
              radius="md"
              surface="background"
            >
              <Stack align={align} gap="2" className="min-h-28">
                <Text size="sm" tone="muted" weight="medium">
                  align={align}
                </Text>
                <Button size="sm" variant="outline">
                  Action
                </Button>
              </Stack>
            </Box>
          ))}
        </Box>
        <Box display="grid" gap="3" className="lg:grid-cols-4">
          {justifies.map((justify) => (
            <Box
              key={justify}
              border="default"
              p="3"
              radius="md"
              surface="background"
            >
              <Stack justify={justify} gap="2" className="min-h-32">
                <Text size="sm" tone="muted" weight="medium">
                  justify={justify}
                </Text>
                <Text size="sm">Content block</Text>
              </Stack>
            </Box>
          ))}
        </Box>
      </Stack>
    </DethinkProvider>
  ),
};

export const WrappingRows: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="5">
        {wraps.map((wrap) => (
          <Stack key={wrap} gap="2">
            <Text size="sm" tone="muted" weight="medium">
              wrap={wrap}
            </Text>
            <Stack direction="horizontal" gap="2" align="center" wrap={wrap}>
              {[
                "Analytics",
                "Billing",
                "Identity",
                "Support",
                "Data export",
                "Audit log",
              ].map((label) => (
                <Button key={label} size="sm" variant="outline">
                  {label}
                </Button>
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </DethinkProvider>
  ),
};

export const SemanticElements: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box display="grid" gap="3" className="sm:grid-cols-2 lg:grid-cols-3">
        {elements.map((element) => (
          <Box
            key={element}
            border="default"
            p="3"
            radius="md"
            surface="background"
          >
            <Stack
              as={element}
              gap="2"
              {...(element === "nav"
                ? { "aria-label": "Stack story navigation" }
                : {})}
              {...(element === "form"
                ? { "aria-label": "Stack story form" }
                : {})}
            >
              {element === "ul" || element === "ol" ? (
                <>
                  <Stack as="li" gap="1">
                    <Text size="sm" weight="medium">
                      {element}
                    </Text>
                  </Stack>
                  <Stack as="li" gap="1">
                    <Text size="sm" tone="muted">
                      Direct list item semantics remain native.
                    </Text>
                  </Stack>
                </>
              ) : element === "form" ? (
                <>
                  <label
                    className="text-sm font-medium"
                    htmlFor="stack-story-filter"
                  >
                    Filter
                  </label>
                  <input
                    id="stack-story-filter"
                    className="h-density-control border-input bg-background rounded-md border px-3 text-sm"
                    placeholder="Status"
                  />
                </>
              ) : element === "fieldset" ? (
                <>
                  <legend className="text-sm font-medium">
                    Notification channels
                  </legend>
                  <label className="text-muted-foreground text-sm">
                    <input className="me-2" type="checkbox" /> Email
                  </label>
                </>
              ) : (
                <>
                  <Text
                    as={element === "span" ? "span" : "p"}
                    size="sm"
                    tone="muted"
                    weight="medium"
                  >
                    {element}
                  </Text>
                  <Text as={element === "span" ? "span" : "p"} size="sm">
                    Semantic wrapper with Stack spacing.
                  </Text>
                </>
              )}
            </Stack>
          </Box>
        ))}
      </Box>
    </DethinkProvider>
  ),
};

export const DirectionModes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box display="grid" gap="4" className="lg:grid-cols-2">
        {directions.map((direction) => (
          <Box
            key={direction}
            border="default"
            p="4"
            radius="md"
            surface="background"
          >
            <Stack
              direction={direction}
              gap="3"
              align={direction === "horizontal" ? "center" : "stretch"}
            >
              <Text size="sm" tone="muted" weight="medium">
                direction={direction}
              </Text>
              <Box p="3" radius="sm" surface="muted">
                <Text size="sm">Alpha</Text>
              </Box>
              <Box p="3" radius="sm" surface="muted">
                <Text size="sm">Beta</Text>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>
    </DethinkProvider>
  ),
};

export const AsChildComposition: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack direction="horizontal" gap="3" align="center" wrap="wrap">
        <Stack
          asChild
          direction="horizontal"
          gap="2"
          align="center"
          className="border-primary bg-background text-primary hover:bg-muted focus-visible:ring-ring rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <RouterAnchor to="/dashboard">Router link child</RouterAnchor>
        </Stack>
        <Stack
          asChild
          direction="horizontal"
          gap="2"
          align="center"
          className="border-input bg-muted hover:bg-background focus-visible:ring-ring rounded-full border px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <button type="button">Native button child</button>
        </Stack>
      </Stack>
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
        <Stack gap="3">
          <Box border="default" p="4" radius="md" surface="background">
            <Stack gap="2">
              <Heading level={2} visualLevel={4}>
                Dark compact Stack
              </Heading>
              <Text tone="muted">
                Density tokens tune controls while Stack keeps spacing explicit.
              </Text>
            </Stack>
          </Box>
          <Stack direction="horizontal" gap="2" align="center" wrap="wrap">
            <Button size="sm">Approve</Button>
            <Button size="sm" variant="outline">
              Review
            </Button>
          </Stack>
        </Stack>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-6"
      >
        <Stack gap="3">
          <Stack gap="2">
            <Heading align="start" level={2} visualLevel={4}>
              RTL Stack layout
            </Heading>
            <Text align="start" tone="muted">
              Gap-based spacing avoids physical left and right child margins.
            </Text>
          </Stack>
          <Stack direction="horizontal" gap="2" align="center" wrap="wrap">
            <Link href="#rtl-stack">تفاصيل</Link>
            <Button size="sm" variant="outline">
              إجراء
            </Button>
          </Stack>
        </Stack>
      </DethinkProvider>
    </div>
  ),
};
