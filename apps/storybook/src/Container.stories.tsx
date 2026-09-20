import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Box,
  Container,
  DethinkProvider,
  Heading,
  Text,
  type ContainerAlign,
  type ContainerElement,
  type ContainerGutter,
  type ContainerSize,
} from "@dethink/components";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

const meta = {
  title: "Components/Container",
  component: Container,
  args: {
    as: "div",
    children: "Container content",
    size: "xl",
    gutter: "md",
    align: "center",
  },
  argTypes: {
    as: {
      control: "select",
      options: [
        "div",
        "main",
        "section",
        "article",
        "header",
        "footer",
        "aside",
        "nav",
      ],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "xl", "2xl", "full"],
    },
    gutter: {
      control: "inline-radio",
      options: ["none", "sm", "md", "lg", "xl"],
    },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end"],
    },
    fluid: {
      control: "boolean",
    },
    safeArea: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

const elements: ContainerElement[] = [
  "main",
  "section",
  "article",
  "header",
  "footer",
  "aside",
  "nav",
];
const sizes: ContainerSize[] = ["sm", "md", "lg", "xl", "2xl", "full"];
const gutters: ContainerGutter[] = ["none", "sm", "md", "lg", "xl"];
const alignments: ContainerAlign[] = ["start", "center", "end"];

const RouterAnchor = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, children, ...props }, ref) => (
  <a ref={ref} href={to} {...props}>
    {children}
  </a>
));
RouterAnchor.displayName = "RouterAnchor";

function WidthSample({
  children,
  label,
}: {
  children?: ReactNode;
  label: string;
}) {
  return (
    <Box border="default" p="3" radius="md" surface="background">
      <Text size="sm" tone="muted" weight="medium">
        {label}
      </Text>
      <Box className="bg-primary mt-3 h-2 rounded-full" />
      {children}
    </Box>
  );
}

export const Base: Story = {};

export const Sizes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box display="grid" gap="4">
        {sizes.map((size) => (
          <Box key={size} border="default" p="3" radius="md" surface="muted">
            <Container size={size}>
              <WidthSample label={`size=${size}`} />
            </Container>
          </Box>
        ))}
      </Box>
    </DethinkProvider>
  ),
};

export const Gutters: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box display="grid" gap="4">
        {gutters.map((gutter) => (
          <Box key={gutter} border="default" radius="md" surface="muted">
            <Container gutter={gutter} size="lg">
              <WidthSample label={`gutter=${gutter}`}>
                <Text className="mt-2" size="sm" tone="muted">
                  The outer band has no padding; Container owns the viewport
                  gutter.
                </Text>
              </WidthSample>
            </Container>
          </Box>
        ))}
      </Box>
    </DethinkProvider>
  ),
};

export const FluidAndNoGutter: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box display="grid" gap="4">
        <Container fluid gutter="lg">
          <Box border="default" p="4" radius="md" surface="background">
            <Heading level={2} visualLevel={4}>
              Fluid product surface
            </Heading>
            <Text className="mt-2" tone="muted">
              Fluid removes the max-width constraint while preserving page
              gutters.
            </Text>
          </Box>
        </Container>
        <Container fluid gutter="none">
          <Box border="primary" p="4" radius="md" surface="muted">
            <Text weight="medium">No-gutter dense workspace area</Text>
          </Box>
        </Container>
      </Box>
    </DethinkProvider>
  ),
};

export const Alignment: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Box border="default" p="3" radius="md" surface="muted">
        <Box display="grid" gap="4">
          {alignments.map((align) => (
            <Container key={align} align={align} gutter="none" size="sm">
              <WidthSample label={`align=${align}`} />
            </Container>
          ))}
        </Box>
      </Box>
    </DethinkProvider>
  ),
};

export const FullWidthBand: Story = {
  render: () => (
    <DethinkProvider theme="light" className="border-border rounded-lg border">
      <Box as="section" surface="muted" className="py-8">
        <Container
          as="section"
          aria-labelledby="container-band-title"
          size="lg"
        >
          <Box
            display="grid"
            gap="4"
            className="md:grid-cols-[1fr_auto] md:items-center"
          >
            <Box>
              <Heading id="container-band-title" level={2} visualLevel={3}>
                Full-width band, constrained content
              </Heading>
              <Text className="mt-2" tone="muted">
                Container constrains the readable content. Box owns the band
                surface.
              </Text>
            </Box>
            <Box border="success" p="3" radius="md" surface="background">
              <Text size="sm" tone="success" weight="semibold">
                Healthy layout
              </Text>
            </Box>
          </Box>
        </Container>
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
      <Box display="grid" gap="3" className="lg:grid-cols-2">
        {elements.map((element) => (
          <Container
            key={element}
            as={element}
            gutter="sm"
            size="sm"
            {...(element === "nav"
              ? { "aria-label": "Container story navigation" }
              : {})}
          >
            <Box border="default" p="3" radius="md" surface="background">
              <Text as="span" size="sm" tone="muted" weight="medium">
                {element}
              </Text>
              <Text className="mt-2" size="sm">
                Semantic element with Container width and gutters.
              </Text>
            </Box>
          </Container>
        ))}
      </Box>
    </DethinkProvider>
  ),
};

export const SafeArea: Story = {
  render: () => (
    <DethinkProvider theme="light" className="border-border rounded-lg border">
      <Box surface="muted" className="py-6">
        <Container safeArea gutter="lg" size="xl">
          <Box border="default" p="4" radius="md" surface="background">
            <Heading level={2} visualLevel={4}>
              Safe-area-aware gutter
            </Heading>
            <Text className="mt-2" tone="muted">
              The selected gutter is preserved while physical safe-area insets
              can increase the left and right padding on viewport-adjacent
              surfaces.
            </Text>
          </Box>
        </Container>
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
      <Container
        asChild
        size="md"
        className="border-primary bg-background text-primary hover:bg-muted focus-visible:ring-ring block rounded-md border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <RouterAnchor to="/dashboard">
          Router link composed with Container
        </RouterAnchor>
      </Container>
    </DethinkProvider>
  ),
};

export const BoxComposition: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Container as="section" aria-labelledby="container-box-title" size="lg">
        <Box display="grid" gap="4">
          <Box>
            <Heading id="container-box-title" level={2} visualLevel={3}>
              Container plus Box
            </Heading>
            <Text className="mt-2" tone="muted">
              Container handles page width. Box handles panel surface, spacing,
              and borders.
            </Text>
          </Box>
          <Box display="grid" gap="3" className="md:grid-cols-3">
            {["Plan", "Build", "Verify"].map((label) => (
              <Box
                key={label}
                border="default"
                p="4"
                radius="md"
                surface="background"
              >
                <Text weight="semibold">{label}</Text>
                <Text className="mt-2" size="sm" tone="muted">
                  Layout primitives compose without hidden behavior.
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
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
        <Container size="md">
          <Box border="default" p="4" radius="md" surface="background">
            <Heading level={2} visualLevel={4}>
              Dark compact Container
            </Heading>
            <Text className="mt-2" tone="muted">
              Container supplies width and gutter behavior while dark tokens
              come from nested content.
            </Text>
          </Box>
        </Container>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-6"
      >
        <Container align="start" size="md">
          <Box border="default" p="4" radius="md" surface="background">
            <Heading align="start" level={2} visualLevel={4}>
              RTL inline alignment
            </Heading>
            <Text align="start" className="mt-2" tone="muted">
              Start alignment and symmetric gutters follow the writing
              direction.
            </Text>
          </Box>
        </Container>
      </DethinkProvider>
    </div>
  ),
};
