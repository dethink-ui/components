import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Box,
  Button,
  Container,
  DethinkProvider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  type GridAlign,
  type GridColumns,
  type GridContent,
  type GridElement,
  type GridGap,
  type GridItemAlign,
  type GridItemJustify,
  type GridItemSpan,
  type GridJustify,
  type GridRows,
} from "@dethink/components";
import { forwardRef, type AnchorHTMLAttributes } from "react";

const meta = {
  title: "Components/Grid",
  component: Grid,
  args: {
    as: "div",
    children: "Grid content",
    columns: "1",
    rows: "none",
    gap: "none",
    align: "stretch",
    justify: "stretch",
    alignContent: "start",
    justifyContent: "start",
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
      ],
    },
    columns: {
      control: "select",
      options: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "12",
        "auto-fit-xs",
        "auto-fit-sm",
        "auto-fit-md",
        "auto-fit-lg",
      ],
    },
    rows: {
      control: "select",
      options: ["none", "1", "2", "3", "4", "5", "6"],
    },
    gap: {
      control: "select",
      options: ["none", "1", "2", "3", "4", "5", "6", "8", "10", "12"],
    },
    align: {
      control: "inline-radio",
      options: ["stretch", "start", "center", "end"],
    },
    justify: {
      control: "inline-radio",
      options: ["stretch", "start", "center", "end"],
    },
    alignContent: {
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
    justifyContent: {
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
} satisfies Meta<typeof Grid>;

export default meta;

type Story = StoryObj<typeof meta>;

const elements: GridElement[] = [
  "section",
  "article",
  "nav",
  "header",
  "footer",
  "ul",
  "ol",
  "form",
  "fieldset",
];
const columns: GridColumns[] = ["1", "2", "3", "4", "5", "6", "12"];
const autoFitColumns: GridColumns[] = [
  "auto-fit-xs",
  "auto-fit-sm",
  "auto-fit-md",
  "auto-fit-lg",
];
const rows: GridRows[] = ["none", "1", "2", "3", "4"];
const gaps: GridGap[] = ["none", "1", "2", "3", "4", "5", "6", "8", "10", "12"];
const aligns: GridAlign[] = ["stretch", "start", "center", "end"];
const justifies: GridJustify[] = ["stretch", "start", "center", "end"];
const contents: GridContent[] = [
  "start",
  "center",
  "end",
  "between",
  "around",
  "evenly",
  "stretch",
];
const itemSpans: GridItemSpan[] = ["1", "2", "3", "4", "full"];
const itemAligns: GridItemAlign[] = [
  "auto",
  "stretch",
  "start",
  "center",
  "end",
];
const itemJustifies: GridItemJustify[] = [
  "auto",
  "stretch",
  "start",
  "center",
  "end",
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

function MetricTile({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "default";
}) {
  return (
    <Box border="default" p="4" radius="md" surface="background">
      <Stack gap="1">
        <Text size="sm" tone={tone}>
          {label}
        </Text>
        <Text size="lg" weight="semibold">
          {value}
        </Text>
      </Stack>
    </Box>
  );
}

function ResourceCard({ label, status }: { label: string; status: string }) {
  return (
    <Box border="default" p="4" radius="md" surface="background">
      <Stack gap="3">
        <Flex align="center" justify="between" gap="3">
          <Text weight="medium">{label}</Text>
          <Text size="sm" tone="muted">
            {status}
          </Text>
        </Flex>
        <Text size="sm" tone="muted">
          Production workspace layout with token spacing and stable DOM order.
        </Text>
      </Stack>
    </Box>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <Box border="default" p="3" radius="md" surface="background">
      <Stack gap="1">
        <Text size="sm" weight="medium">
          {label}
        </Text>
        <Text size="sm" tone="muted">
          {value}
        </Text>
      </Stack>
    </Box>
  );
}

export const Base: Story = {};

export const FixedColumns: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="5">
        {columns.map((column) => (
          <Stack key={column} gap="2">
            <Text size="sm" tone="muted" weight="medium">
              {column} columns
            </Text>
            <Grid columns={column} gap="2">
              {Array.from({
                length: column === "12" ? 12 : Number(column),
              }).map((_, index) => (
                <Box
                  key={index}
                  border="default"
                  p="3"
                  radius="md"
                  surface="muted"
                >
                  <Text size="sm">{index + 1}</Text>
                </Box>
              ))}
            </Grid>
          </Stack>
        ))}
      </Stack>
    </DethinkProvider>
  ),
};

export const AutoFitResourceGrid: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="5">
        {autoFitColumns.map((column) => (
          <Stack key={column} gap="2">
            <Text size="sm" tone="muted" weight="medium">
              {column}
            </Text>
            <Grid columns={column} gap="3">
              {[
                ["Identity", "Healthy"],
                ["Billing", "Review"],
                ["Integrations", "Healthy"],
                ["Exports", "Queued"],
              ].map(([label, status]) => (
                <GridItem key={label} minInlineSize="0">
                  <ResourceCard label={label} status={status} />
                </GridItem>
              ))}
            </Grid>
          </Stack>
        ))}
      </Stack>
    </DethinkProvider>
  ),
};

export const RowsAndAxisGaps: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="5">
        <Grid columns="4" rows="2" gap="3" rowGap="5" columnGap="2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Box
              key={index}
              border="default"
              p="3"
              radius="md"
              surface="background"
            >
              <Text size="sm">Cell {index + 1}</Text>
            </Box>
          ))}
        </Grid>
        <Grid columns="auto-fit-xs" gap="3">
          {rows.map((row) => (
            <Box key={row} border="default" p="3" radius="md" surface="muted">
              <Text size="sm" weight="medium">
                rows={row}
              </Text>
            </Box>
          ))}
        </Grid>
        <Grid columns="auto-fit-xs" gap="2">
          {gaps.map((gap) => (
            <Box
              key={gap}
              border="default"
              p="3"
              radius="md"
              surface="background"
            >
              <Text size="sm">gap {gap}</Text>
            </Box>
          ))}
        </Grid>
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
      <Stack gap="5">
        <Grid columns="4" gap="3">
          {aligns.map((align) => (
            <Grid
              key={align}
              align={align}
              columns="2"
              gap="2"
              className="border-border min-h-24 rounded-md border p-2"
            >
              <Text size="sm" tone="muted">
                align {align}
              </Text>
              <Button size="sm" variant="outline">
                Action
              </Button>
            </Grid>
          ))}
        </Grid>
        <Grid columns="4" gap="3">
          {justifies.map((justify) => (
            <Grid
              key={justify}
              justify={justify}
              columns="2"
              gap="2"
              className="border-border rounded-md border p-2"
            >
              <Text size="sm" tone="muted">
                justify {justify}
              </Text>
              <Button size="sm" variant="outline">
                Action
              </Button>
            </Grid>
          ))}
        </Grid>
        <Grid columns="auto-fit-xs" gap="3">
          {contents.map((content) => (
            <Grid
              key={content}
              alignContent={content}
              justifyContent={content}
              columns="1"
              gap="2"
              className="border-border min-h-28 rounded-md border p-2"
            >
              <Text size="sm" tone="muted">
                content {content}
              </Text>
              <Box border="default" p="2" radius="sm" surface="muted">
                <Text size="sm">Track</Text>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </DethinkProvider>
  ),
};

export const ItemSpansAndLongContent: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Grid columns="6" gap="3">
        <GridItem colSpan="full">
          <MetricTile label="Workspace health" value="97.4%" tone="default" />
        </GridItem>
        <GridItem colSpan="3" rowSpan="2" minInlineSize="0">
          <Box
            border="default"
            p="4"
            radius="md"
            surface="background"
            className="h-full"
          >
            <Stack gap="3">
              <Heading level={2} visualLevel={4}>
                Long resource identifier
              </Heading>
              <Text className="truncate" tone="muted">
                org_production_workspace_identifier_with_a_long_unbroken_token_0123456789
              </Text>
              <Button variant="outline">Open resource</Button>
            </Stack>
          </Box>
        </GridItem>
        {itemSpans.map((span) => (
          <GridItem
            key={span}
            colSpan={span === "full" ? "3" : span}
            minInlineSize="0"
          >
            <MetricTile
              label={`Span ${span}`}
              value={span === "full" ? "All" : `${span}x`}
            />
          </GridItem>
        ))}
      </Grid>
    </DethinkProvider>
  ),
};

export const ItemSelfAlignment: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Grid columns="auto-fit-xs" gap="3">
        {itemAligns.map((align) => (
          <GridItem
            key={align}
            align={align}
            className="border-border min-h-28 rounded-md border p-3"
          >
            <Text size="sm">align {align}</Text>
          </GridItem>
        ))}
        {itemJustifies.map((justify) => (
          <GridItem
            key={justify}
            justify={justify}
            className="border-border min-h-28 rounded-md border p-3"
          >
            <Text size="sm">justify {justify}</Text>
          </GridItem>
        ))}
      </Grid>
    </DethinkProvider>
  ),
};

export const DashboardComposition: Story = {
  render: () => (
    <DethinkProvider theme="light" className="bg-background py-8">
      <Container size="2xl">
        <Stack gap="6">
          <Flex
            as="header"
            align="center"
            justify="between"
            gap="4"
            wrap="wrap"
          >
            <Stack gap="1">
              <Heading level={1} visualLevel={3}>
                Operations
              </Heading>
              <Text tone="muted">Live account, queue, and risk summary.</Text>
            </Stack>
            <Button>New workflow</Button>
          </Flex>
          <Grid columns="auto-fit-sm" gap="4">
            <GridItem minInlineSize="0">
              <MetricTile label="Open reviews" value="128" />
            </GridItem>
            <GridItem minInlineSize="0">
              <MetricTile label="SLA coverage" value="99.1%" />
            </GridItem>
            <GridItem minInlineSize="0">
              <MetricTile label="Queued exports" value="24" />
            </GridItem>
            <GridItem minInlineSize="0">
              <MetricTile label="Risk flags" value="6" />
            </GridItem>
          </Grid>
          <Grid columns="3" gap="4">
            <GridItem colSpan="2" minInlineSize="0">
              <Box border="default" p="5" radius="md" surface="background">
                <Stack gap="4">
                  <Heading level={2} visualLevel={4}>
                    Review queue
                  </Heading>
                  <Grid columns="auto-fit-xs" gap="3">
                    {["Priority", "Owner", "Region", "Status"].map((label) => (
                      <SettingField key={label} label={label} value="Active" />
                    ))}
                  </Grid>
                </Stack>
              </Box>
            </GridItem>
            <GridItem minInlineSize="0">
              <Box
                border="default"
                p="5"
                radius="md"
                surface="muted"
                className="h-full"
              >
                <Stack gap="3">
                  <Heading level={2} visualLevel={4}>
                    Handoff
                  </Heading>
                  <Text tone="muted">
                    Three owners are available for reassignment.
                  </Text>
                  <Button variant="outline">Assign owner</Button>
                </Stack>
              </Box>
            </GridItem>
          </Grid>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
};

export const SettingsAndComparison: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Grid columns="auto-fit-md" gap="4">
        <Box border="default" p="5" radius="md" surface="background">
          <Stack gap="4">
            <Heading level={2} visualLevel={4}>
              Workspace settings
            </Heading>
            <Grid columns="2" gap="3">
              <SettingField label="Region" value="EU West" />
              <SettingField label="Plan" value="Business" />
              <SettingField label="Seats" value="42 active" />
              <SettingField label="SSO" value="Required" />
            </Grid>
          </Stack>
        </Box>
        <Box border="default" p="5" radius="md" surface="muted">
          <Stack gap="4">
            <Heading level={2} visualLevel={4}>
              Plan comparison
            </Heading>
            <Grid columns="3" gap="2">
              {["Starter", "Business", "Enterprise"].map((label) => (
                <Box
                  key={label}
                  border="default"
                  p="3"
                  radius="md"
                  surface="background"
                >
                  <Text size="sm" weight="medium">
                    {label}
                  </Text>
                </Box>
              ))}
            </Grid>
          </Stack>
        </Box>
      </Grid>
    </DethinkProvider>
  ),
};

export const SemanticElementsAndAsChild: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Stack gap="5">
        <Grid as="ul" columns="auto-fit-xs" gap="3">
          {elements.slice(0, 6).map((element) => (
            <GridItem key={element} as="li">
              <Box border="default" p="3" radius="md" surface="background">
                <Text size="sm">{element}</Text>
              </Box>
            </GridItem>
          ))}
        </Grid>
        <Grid asChild columns="2" gap="3">
          <section
            aria-labelledby="grid-as-child-title"
            className="border-border rounded-md border p-4"
          >
            <Heading id="grid-as-child-title" level={2} visualLevel={4}>
              Composed section
            </Heading>
            <GridItem asChild colSpan="2">
              <RouterAnchor
                to="#grid-as-child-link"
                className="border-border text-primary rounded-md border p-3"
              >
                Router-style grid item
              </RouterAnchor>
            </GridItem>
          </section>
        </Grid>
      </Stack>
    </DethinkProvider>
  ),
};

export const ResponsiveClassNameComposition: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Grid columns="1" gap="3" className="sm:grid-cols-2 lg:grid-cols-4">
        {["Backlog", "In review", "Blocked", "Released"].map((label) => (
          <GridItem key={label} minInlineSize="0">
            <ResourceCard label={label} status="Responsive" />
          </GridItem>
        ))}
      </Grid>
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
        <Grid columns="auto-fit-xs" gap="3" dir="rtl">
          <ResourceCard label="RTL queue" status="Ready" />
          <ResourceCard label="Compact density" status="Active" />
          <ResourceCard label="Dark theme" status="Stable" />
        </Grid>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        className="border-border bg-background rounded-lg border p-6"
      >
        <Grid columns="auto-fit-xs" gap="4">
          <ResourceCard label="Comfortable spacing" status="Ready" />
          <ResourceCard label="Token surfaces" status="Active" />
          <ResourceCard label="Responsive cards" status="Stable" />
        </Grid>
      </DethinkProvider>
    </Grid>
  ),
};
