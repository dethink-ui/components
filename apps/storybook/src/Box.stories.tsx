import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Box,
  DethinkProvider,
  Heading,
  Text,
  type BoxBorder,
  type BoxDisplay,
  type BoxElement,
  type BoxOverflow,
  type BoxRadius,
  type BoxSpacing,
  type BoxSurface,
} from "@dethink/components";
import { forwardRef, type AnchorHTMLAttributes } from "react";

const meta = {
  title: "Components/Box",
  component: Box,
  args: {
    as: "div",
    children: "Box content",
    p: "4",
    radius: "md",
    surface: "muted",
    border: "default",
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
        "span",
      ],
    },
    display: {
      control: "inline-radio",
      options: [
        "block",
        "inline",
        "inline-block",
        "contents",
        "flex",
        "inline-flex",
        "grid",
      ],
    },
    p: {
      control: "select",
      options: ["none", "1", "2", "3", "4", "5", "6", "8", "10", "12"],
    },
    surface: {
      control: "inline-radio",
      options: [
        "transparent",
        "background",
        "muted",
        "primary",
        "destructive",
        "success",
        "warning",
        "info",
      ],
    },
    border: {
      control: "inline-radio",
      options: [
        "none",
        "default",
        "muted",
        "input",
        "primary",
        "destructive",
        "success",
        "warning",
        "info",
      ],
    },
    radius: {
      control: "inline-radio",
      options: ["none", "sm", "md", "lg", "full"],
    },
    overflow: {
      control: "inline-radio",
      options: ["visible", "hidden", "clip", "auto"],
    },
  },
} satisfies Meta<typeof Box>;

export default meta;

type Story = StoryObj<typeof meta>;

const elements: BoxElement[] = [
  "section",
  "article",
  "main",
  "aside",
  "nav",
  "header",
  "footer",
  "ul",
  "ol",
  "span",
];
const displays: BoxDisplay[] = [
  "block",
  "inline",
  "inline-block",
  "contents",
  "flex",
  "inline-flex",
  "grid",
];
const spacings: BoxSpacing[] = [
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
const surfaces: BoxSurface[] = [
  "background",
  "muted",
  "primary",
  "destructive",
  "success",
  "warning",
  "info",
];
const borders: BoxBorder[] = [
  "default",
  "muted",
  "input",
  "primary",
  "destructive",
  "success",
  "warning",
  "info",
];
const radii: BoxRadius[] = ["none", "sm", "md", "lg", "full"];
const overflows: BoxOverflow[] = ["visible", "hidden", "clip", "auto"];

const RouterAnchor = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);
RouterAnchor.displayName = "RouterAnchor";

export const Base: Story = {};

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
            as={element}
            border="default"
            p="3"
            radius="md"
            surface="background"
            {...(element === "nav"
              ? { "aria-label": "Box story navigation" }
              : {})}
          >
            {element === "ul" || element === "ol" ? (
              <Box as="li">
                <Text as="span" size="sm" tone="muted" weight="medium">
                  {element}
                </Text>
                <Text className="mt-2" size="sm">
                  Native list item with valid direct list semantics.
                </Text>
              </Box>
            ) : (
              <>
                <Text as="span" size="sm" tone="muted" weight="medium">
                  {element}
                </Text>
                <Text className="mt-2" size="sm">
                  Semantic wrapper with Box tokens.
                </Text>
              </>
            )}
          </Box>
        ))}
      </Box>
    </DethinkProvider>
  ),
};

export const SpacingTokens: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box display="grid" gap="3" className="sm:grid-cols-2 lg:grid-cols-5">
        {spacings.map((spacing) => (
          <Box
            key={spacing}
            border="default"
            p={spacing}
            radius="md"
            surface="muted"
            className="min-h-20"
          >
            <Box border="input" p="2" radius="sm" surface="background">
              <Text size="sm" weight="medium">
                p={spacing}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </DethinkProvider>
  ),
};

export const LogicalSpacingRtl: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      density="comfortable"
      dir="rtl"
      className="border-border rounded-lg border p-6"
    >
      <Box display="grid" gap="4" className="lg:grid-cols-2">
        <Box
          border="default"
          p="4"
          pe="8"
          ps="3"
          radius="md"
          surface="background"
        >
          <Text size="sm" tone="muted" weight="medium">
            RTL logical padding
          </Text>
          <Heading className="mt-2" level={2} visualLevel={4}>
            Start and end follow writing direction
          </Heading>
        </Box>
        <Box border="default" p="4" radius="md" surface="muted">
          <Box border="primary" ms="8" p="3" radius="md" surface="background">
            <Text size="sm">
              This inner Box uses ms=8, so its offset stays logical in RTL.
            </Text>
          </Box>
        </Box>
      </Box>
    </DethinkProvider>
  ),
};

export const SurfacesAndBorders: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box display="grid" gap="4" className="lg:grid-cols-2">
        <Box display="grid" gap="3">
          {surfaces.map((surface) => (
            <Box key={surface} p="4" radius="md" surface={surface}>
              <Text size="sm" weight="semibold">
                {surface} surface
              </Text>
            </Box>
          ))}
        </Box>
        <Box display="grid" gap="3">
          {borders.map((border) => (
            <Box
              key={border}
              border={border}
              p="4"
              radius="md"
              surface="background"
            >
              <Text size="sm" weight="semibold">
                {border} border
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </DethinkProvider>
  ),
};

export const RadiusAndOverflow: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box display="grid" gap="4" className="lg:grid-cols-2">
        <Box display="grid" gap="3" className="sm:grid-cols-2">
          {radii.map((radius) => (
            <Box
              key={radius}
              border="default"
              p="4"
              radius={radius}
              surface="muted"
            >
              <Text size="sm" weight="medium">
                radius={radius}
              </Text>
            </Box>
          ))}
        </Box>
        <Box display="grid" gap="3" className="sm:grid-cols-2">
          {overflows.map((overflow) => (
            <Box
              key={overflow}
              border="default"
              overflow={overflow}
              p="4"
              radius="md"
              surface="background"
              className="h-24"
            >
              <Text size="sm" weight="medium">
                overflow={overflow}
              </Text>
              <Text className="mt-2 w-48" size="sm" tone="muted">
                Long operational content demonstrates clipping and scroll
                behavior.
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </DethinkProvider>
  ),
};

export const DisplayModes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box display="grid" gap="3" className="lg:grid-cols-3">
        {displays.map((display) => {
          const hasChildGap = display.includes("flex") || display === "grid";
          const isContents = display === "contents";

          return (
            <Box
              key={display}
              border={isContents ? "none" : "default"}
              display={display}
              gap={hasChildGap ? "2" : undefined}
              p={isContents ? undefined : "3"}
              radius={isContents ? "none" : "md"}
              surface={isContents ? "transparent" : "background"}
            >
              {isContents ? (
                <>
                  <Box border="default" p="3" radius="md" surface="background">
                    <Text size="sm" weight="medium">
                      contents
                    </Text>
                  </Box>
                  <Box border="default" p="3" radius="md" surface="muted">
                    <Text size="sm">Child boxes join the parent grid.</Text>
                  </Box>
                </>
              ) : (
                <>
                  <Text size="sm" weight="medium">
                    {display}
                  </Text>
                  {hasChildGap ? (
                    <>
                      <Box p="2" radius="sm" surface="muted">
                        <Text size="sm">A</Text>
                      </Box>
                      <Box p="2" radius="sm" surface="muted">
                        <Text size="sm">B</Text>
                      </Box>
                    </>
                  ) : (
                    <Text className="mt-2" size="sm" tone="muted">
                      Box can opt into this display mode.
                    </Text>
                  )}
                </>
              )}
            </Box>
          );
        })}
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
      <Box display="flex" gap="3" className="flex-wrap items-center">
        <Box
          asChild
          border="primary"
          p="3"
          radius="md"
          surface="background"
          className="text-primary hover:bg-muted focus-visible:ring-ring text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <RouterAnchor to="/dashboard">
            Router link composed with Box
          </RouterAnchor>
        </Box>
        <Box
          asChild
          border="input"
          p="3"
          radius="full"
          surface="muted"
          className="hover:bg-background focus-visible:ring-ring text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <button type="button">Native button child</button>
        </Box>
      </Box>
    </DethinkProvider>
  ),
};

export const DashboardSection: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box
        as="section"
        aria-labelledby="box-dashboard-title"
        display="grid"
        gap="4"
      >
        <Box
          as="header"
          display="flex"
          gap="4"
          className="items-start justify-between"
        >
          <Box>
            <Heading id="box-dashboard-title" level={2} visualLevel={3}>
              Usage summary
            </Heading>
            <Text className="mt-1" tone="muted">
              Box handles layout structure while copy and actions stay semantic.
            </Text>
          </Box>
          <Box border="success" p="2" radius="md" surface="background">
            <Text size="sm" tone="success" weight="semibold">
              Healthy
            </Text>
          </Box>
        </Box>
        <Box display="grid" gap="3" className="md:grid-cols-3">
          {[
            ["Requests", "2.4M", "Up 12%"],
            ["Latency", "142 ms", "Down 8%"],
            ["Errors", "0.03%", "Stable"],
          ].map(([label, value, detail]) => (
            <Box
              key={label}
              border="default"
              p="4"
              radius="md"
              surface="background"
            >
              <Text size="sm" tone="muted" weight="medium">
                {label}
              </Text>
              <Heading className="mt-2" level={3} visualLevel={4}>
                {value}
              </Heading>
              <Text className="mt-2" size="sm" tone="muted">
                {detail}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
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
        <Box display="grid" gap="3">
          <Box border="default" p="4" radius="md" surface="background">
            <Heading level={2} visualLevel={4}>
              Dark compact Box
            </Heading>
            <Text className="mt-2" tone="muted">
              Surfaces and borders inherit semantic tokens in dark mode.
            </Text>
          </Box>
          <Box border="info" p="3" radius="md" surface="info">
            <Text size="sm" weight="semibold">
              Tokenized status surface
            </Text>
          </Box>
        </Box>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-6"
      >
        <Box display="grid" gap="3">
          <Box
            border="default"
            p="4"
            pe="8"
            ps="3"
            radius="md"
            surface="background"
          >
            <Heading align="start" level={2} visualLevel={4}>
              RTL Box layout
            </Heading>
            <Text align="start" className="mt-2" tone="muted">
              Logical spacing props keep layout portable across writing
              directions.
            </Text>
          </Box>
          <Box border="warning" p="3" radius="md" surface="warning">
            <Text align="start" size="sm" weight="semibold">
              Warning surface remains token-driven.
            </Text>
          </Box>
        </Box>
      </DethinkProvider>
    </div>
  ),
};
