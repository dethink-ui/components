import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Box,
  Button,
  DethinkProvider,
  Flex,
  FlexItem,
  Heading,
  Link,
  Stack,
  Text,
  type FlexAlign,
  type FlexContent,
  type FlexDirection,
  type FlexDisplay,
  type FlexElement,
  type FlexGap,
  type FlexItemAlign,
  type FlexItemBasis,
  type FlexJustify,
  type FlexWrap,
} from "@dethink/components";
import { forwardRef, type AnchorHTMLAttributes } from "react";

const meta = {
  title: "Components/Flex",
  component: Flex,
  args: {
    as: "div",
    children: "Flex content",
    display: "flex",
    direction: "row",
    wrap: "nowrap",
    gap: "none",
    align: "stretch",
    justify: "start",
    content: "stretch",
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
    display: {
      control: "inline-radio",
      options: ["flex", "inline-flex"],
    },
    direction: {
      control: "inline-radio",
      options: ["row", "column"],
    },
    wrap: {
      control: "inline-radio",
      options: ["nowrap", "wrap"],
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
      options: ["start", "center", "end", "between", "around", "evenly"],
    },
    content: {
      control: "inline-radio",
      options: [
        "start",
        "center",
        "end",
        "between",
        "around",
        "evenly",
        "stretch",
      ],
    },
  },
} satisfies Meta<typeof Flex>;

export default meta;

type Story = StoryObj<typeof meta>;

const elements: FlexElement[] = [
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
const displays: FlexDisplay[] = ["flex", "inline-flex"];
const directions: FlexDirection[] = ["row", "column"];
const wraps: FlexWrap[] = ["nowrap", "wrap"];
const gaps: FlexGap[] = ["none", "1", "2", "3", "4", "5", "6", "8", "10", "12"];
const aligns: FlexAlign[] = ["stretch", "start", "center", "end", "baseline"];
const justifies: FlexJustify[] = [
  "start",
  "center",
  "end",
  "between",
  "around",
  "evenly",
];
const contents: FlexContent[] = [
  "start",
  "center",
  "end",
  "between",
  "around",
  "evenly",
  "stretch",
];
const itemBases: FlexItemBasis[] = [
  "auto",
  "0",
  "full",
  "xs",
  "sm",
  "md",
  "lg",
];
const itemAligns: FlexItemAlign[] = [
  "auto",
  "stretch",
  "start",
  "center",
  "end",
  "baseline",
];

const RouterAnchor = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, children, ...props }, ref) => (
  <a ref={ref} href={to} {...props}>
    {children}
  </a>
));
RouterAnchor.displayName = "RouterAnchor";

function TokenTile({ label }: { label: string }) {
  return (
    <Box border="default" p="3" radius="md" surface="background">
      <Text size="sm" weight="medium">
        {label}
      </Text>
    </Box>
  );
}

function FilterChip({ children }: { children: string }) {
  return (
    <Button size="sm" variant="outline">
      {children}
    </Button>
  );
}

export const Base: Story = {};

export const ToolbarComposition: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Flex as="header" align="center" gap="4" justify="between" wrap="wrap">
        <Stack gap="1">
          <Heading level={2} visualLevel={4}>
            Pipelines
          </Heading>
          <Text size="sm" tone="muted">
            Monitor automation runs and owner handoffs.
          </Text>
        </Stack>
        <Flex align="center" gap="2" wrap="wrap">
          <Button variant="outline">Export</Button>
          <Button>New pipeline</Button>
        </Flex>
      </Flex>
    </DethinkProvider>
  ),
};

export const DirectionAndDisplayModes: Story = {
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
            <Flex
              direction={direction}
              gap="3"
              align={direction === "row" ? "center" : "stretch"}
            >
              <Text size="sm" tone="muted" weight="medium">
                direction={direction}
              </Text>
              <TokenTile label="Alpha" />
              <TokenTile label="Beta" />
            </Flex>
          </Box>
        ))}
      </Box>
      <Box className="mt-4" display="grid" gap="4" role="list">
        {displays.map((display) => (
          <Box key={display} role="listitem">
            <Text
              className="me-3"
              as="span"
              size="sm"
              tone="muted"
              weight="medium"
            >
              display={display}
            </Text>
            <Flex display={display} gap="2" align="center">
              <TokenTile label="Inline group" />
              <TokenTile label="Aligned" />
            </Flex>
          </Box>
        ))}
      </Box>
    </DethinkProvider>
  ),
};

export const WrappingAndAxisGaps: Story = {
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
            <Flex wrap={wrap} gap="2" rowGap="3" columnGap="2">
              {[
                "Analytics",
                "Billing",
                "Identity",
                "Support",
                "Data export",
                "Audit log",
              ].map((label) => (
                <FilterChip key={label}>{label}</FilterChip>
              ))}
            </Flex>
          </Stack>
        ))}
        <Box display="grid" gap="3" className="sm:grid-cols-2 lg:grid-cols-5">
          {gaps.map((gap) => (
            <Box
              key={gap}
              border="default"
              p="3"
              radius="md"
              surface="background"
            >
              <Flex direction="column" gap={gap}>
                <Text size="sm" tone="muted" weight="medium">
                  gap={gap}
                </Text>
                <TokenTile label="First" />
                <TokenTile label="Second" />
              </Flex>
            </Box>
          ))}
        </Box>
      </Stack>
    </DethinkProvider>
  ),
};

export const AlignmentAndDistribution: Story = {
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
              <Flex align={align} gap="2" className="min-h-28">
                <Text size="sm" tone="muted" weight="medium">
                  align={align}
                </Text>
                <Button size="sm" variant="outline">
                  Action
                </Button>
              </Flex>
            </Box>
          ))}
        </Box>
        <Box display="grid" gap="3" className="lg:grid-cols-3">
          {justifies.map((justify) => (
            <Box
              key={justify}
              border="default"
              p="3"
              radius="md"
              surface="background"
            >
              <Flex justify={justify} gap="2" className="min-h-20">
                <TokenTile label="A" />
                <TokenTile label="B" />
              </Flex>
              <Text className="mt-2" size="sm" tone="muted" weight="medium">
                justify={justify}
              </Text>
            </Box>
          ))}
        </Box>
        <Box display="grid" gap="3" className="lg:grid-cols-4">
          {contents.map((content) => (
            <Box
              key={content}
              border="default"
              p="3"
              radius="md"
              surface="background"
            >
              <Flex
                content={content}
                gap="2"
                rowGap="2"
                wrap="wrap"
                className="min-h-28"
              >
                <TokenTile label="One" />
                <TokenTile label="Two" />
                <TokenTile label="Three" />
              </Flex>
              <Text className="mt-2" size="sm" tone="muted" weight="medium">
                content={content}
              </Text>
            </Box>
          ))}
        </Box>
      </Stack>
    </DethinkProvider>
  ),
};

export const FlexItems: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="5">
        <Flex gap="3" wrap="wrap">
          {itemBases.map((basis) => (
            <FlexItem key={basis} basis={basis} grow="1" minInlineSize="0">
              <Box border="default" p="3" radius="md" surface="background">
                <Text size="sm" tone="muted" weight="medium">
                  basis={basis}
                </Text>
                <Text size="sm">Flexible item</Text>
              </Box>
            </FlexItem>
          ))}
        </Flex>
        <Box display="grid" gap="3" className="lg:grid-cols-3">
          {itemAligns.map((align) => (
            <Flex
              key={align}
              asChild
              align="stretch"
              gap="3"
              className="border-border min-h-28 rounded-md border p-3"
            >
              <section>
                <FlexItem align={align}>
                  <Button size="sm" variant="outline">
                    align={align}
                  </Button>
                </FlexItem>
                <FlexItem grow="1">
                  <Text size="sm" tone="muted">
                    Container alignment stays stable.
                  </Text>
                </FlexItem>
              </section>
            </Flex>
          ))}
        </Box>
      </Stack>
    </DethinkProvider>
  ),
};

export const LongContentShrink: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Flex gap="3" align="center" className="max-w-xl">
        <FlexItem>
          <Box p="2" radius="full" surface="primary">
            <Text size="sm" weight="semibold">
              URL
            </Text>
          </Box>
        </FlexItem>
        <FlexItem grow="1" minInlineSize="0">
          <Text className="truncate" size="sm">
            https://example.com/accounts/acme-corporation/workflows/production-deployment/audit-events
          </Text>
        </FlexItem>
        <FlexItem shrink="0">
          <Button size="sm" variant="outline">
            Copy
          </Button>
        </FlexItem>
      </Flex>
    </DethinkProvider>
  ),
};

export const MediaRow: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Flex gap="4" align="start" className="max-w-2xl">
        <FlexItem shrink="0">
          <Box
            aria-hidden="true"
            className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-md text-lg font-semibold"
          >
            AP
          </Box>
        </FlexItem>
        <FlexItem grow="1" minInlineSize="0">
          <Stack gap="2">
            <Flex gap="2" align="center" justify="between" wrap="wrap">
              <Heading level={3} visualLevel={5}>
                Audit pipeline
              </Heading>
              <Text size="sm" tone="muted">
                Updated 4m ago
              </Text>
            </Flex>
            <Text tone="muted">
              Flex keeps the media object, summary copy, and trailing metadata
              aligned without changing reading order.
            </Text>
          </Stack>
        </FlexItem>
        <FlexItem shrink="0">
          <Button size="sm" variant="outline">
            Open
          </Button>
        </FlexItem>
      </Flex>
    </DethinkProvider>
  ),
};

export const FormActionRow: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <form aria-label="Invite teammate">
        <Stack gap="4">
          <Stack gap="2">
            <label className="text-sm font-medium" htmlFor="flex-invite-email">
              Teammate email
            </label>
            <input
              id="flex-invite-email"
              className="h-density-control border-input bg-background rounded-md border px-3 text-sm"
              placeholder="name@example.com"
              type="email"
            />
          </Stack>
          <Flex gap="3" align="center" justify="between" wrap="wrap">
            <Text size="sm" tone="muted">
              Invitations expire after seven days.
            </Text>
            <Flex gap="2" align="center" wrap="wrap">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Send invite</Button>
            </Flex>
          </Flex>
        </Stack>
      </form>
    </DethinkProvider>
  ),
};

export const PromptInputShell: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box border="default" p="3" radius="lg" surface="background">
        <Stack gap="3">
          <label className="sr-only" htmlFor="flex-prompt">
            Ask assistant
          </label>
          <textarea
            id="flex-prompt"
            className="border-input bg-background min-h-24 w-full resize-none rounded-md border p-3 text-sm"
            placeholder="Summarize deployment risk for the current release"
          />
          <Flex gap="3" align="center" justify="between" wrap="wrap">
            <Flex gap="2" align="center" wrap="wrap">
              <Button size="sm" type="button" variant="outline">
                Attach
              </Button>
              <Button size="sm" type="button" variant="ghost">
                Model
              </Button>
            </Flex>
            <FlexItem shrink="0">
              <Button size="sm" type="button">
                Send
              </Button>
            </FlexItem>
          </Flex>
        </Stack>
      </Box>
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
            <Flex
              as={element}
              direction="column"
              gap="2"
              {...(element === "nav"
                ? { "aria-label": "Flex story navigation" }
                : {})}
              {...(element === "form"
                ? { "aria-label": "Flex story form" }
                : {})}
            >
              {element === "ul" || element === "ol" ? (
                <>
                  <FlexItem as="li">
                    <Text size="sm" weight="medium">
                      {element}
                    </Text>
                  </FlexItem>
                  <FlexItem as="li">
                    <Text size="sm" tone="muted">
                      Direct list item semantics remain native.
                    </Text>
                  </FlexItem>
                </>
              ) : element === "form" ? (
                <>
                  <label
                    className="text-sm font-medium"
                    htmlFor="flex-story-filter"
                  >
                    Filter
                  </label>
                  <input
                    id="flex-story-filter"
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
                    Semantic wrapper with Flex layout.
                  </Text>
                </>
              )}
            </Flex>
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
      <Flex gap="3" align="center" wrap="wrap">
        <Flex
          asChild
          gap="2"
          align="center"
          className="border-primary bg-background text-primary hover:bg-muted focus-visible:ring-ring rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <RouterAnchor to="/dashboard">Router link child</RouterAnchor>
        </Flex>
        <FlexItem
          asChild
          basis="sm"
          grow="1"
          minInlineSize="0"
          className="border-input bg-muted rounded-md border px-3 py-2 text-sm font-medium"
        >
          <button type="button">FlexItem button child</button>
        </FlexItem>
      </Flex>
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
                Dark compact Flex
              </Heading>
              <Text tone="muted">
                Density tokens tune controls while Flex keeps spacing explicit.
              </Text>
            </Stack>
          </Box>
          <Flex gap="2" align="center" wrap="wrap">
            <Button size="sm">Approve</Button>
            <Button size="sm" variant="outline">
              Review
            </Button>
          </Flex>
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
              RTL Flex layout
            </Heading>
            <Text align="start" tone="muted">
              Gap-based spacing avoids physical left and right child margins.
            </Text>
          </Stack>
          <Flex gap="2" align="center" wrap="wrap">
            <Link href="#rtl-flex">تفاصيل</Link>
            <Button size="sm" variant="outline">
              إجراء
            </Button>
          </Flex>
        </Stack>
      </DethinkProvider>
    </div>
  ),
};
