import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Container,
  DethinkProvider,
  Flex,
  Grid,
  Link,
  Separator,
  Stack,
  Text,
  type CardBorder,
  type CardElement,
  type CardRadius,
  type CardShadow,
  type CardSpacing,
  type CardSurface,
} from "@dethink/components";
import {
  forwardRef,
  type ComponentType,
  type HTMLAttributes,
  type SVGProps,
} from "react";

const workspacePlanningPhoto = new URL(
  "./assets/card/workspace-planning.jpg",
  import.meta.url,
).href;
const infrastructureRackPhoto = new URL(
  "./assets/card/infrastructure-rack.jpg",
  import.meta.url,
).href;
const analyticsDeskPhoto = new URL(
  "./assets/card/analytics-desk.jpg",
  import.meta.url,
).href;

const meta = {
  title: "Components/Card",
  component: Card,
  args: {
    as: "div",
    border: "default",
    radius: "lg",
    shadow: "sm",
    spacing: "md",
    surface: "default",
  },
  argTypes: {
    as: {
      control: "inline-radio",
      options: ["div", "article", "section", "aside", "li"],
    },
    border: {
      control: "inline-radio",
      options: ["default", "muted", "none"],
    },
    radius: {
      control: "inline-radio",
      options: ["md", "lg"],
    },
    shadow: {
      control: "inline-radio",
      options: ["none", "sm", "md"],
    },
    spacing: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    surface: {
      control: "inline-radio",
      options: ["default", "muted", "transparent"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

const elements: CardElement[] = ["div", "article", "section", "aside", "li"];
const nonListElements = elements.filter((element) => element !== "li");
const surfaces: CardSurface[] = ["default", "muted", "transparent"];
const borders: CardBorder[] = ["default", "muted", "none"];
const radii: CardRadius[] = ["md", "lg"];
const shadows: CardShadow[] = ["none", "sm", "md"];
const spacings: CardSpacing[] = ["sm", "md", "lg"];

const RouterArticle = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement> & { to: string }
>(({ to: _to, ...props }, ref) => <article ref={ref} {...props} />);
RouterArticle.displayName = "RouterArticle";

function AnalyticsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      {...props}
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 3-3 3 2 5-7" />
      <path d="M18 7h-4" />
      <path d="M18 7v4" />
    </svg>
  );
}

function InfrastructureIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      {...props}
    >
      <rect width="16" height="6" x="4" y="4" rx="2" />
      <rect width="16" height="6" x="4" y="14" rx="2" />
      <path d="M8 7h.01" />
      <path d="M8 17h.01" />
      <path d="M12 7h4" />
      <path d="M12 17h4" />
    </svg>
  );
}

function WorkflowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      {...props}
    >
      <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M18 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M6 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M8.5 6.5 15.5 9.5" />
      <path d="M8.5 17.5 15.5 13" />
    </svg>
  );
}

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
    <Card as="article">
      <CardHeader>
        <CardTitle as="h3">{label}</CardTitle>
        <CardDescription>{detail}</CardDescription>
      </CardHeader>
      <CardContent>
        <Text as="p" size="xl" weight="semibold">
          {value}
        </Text>
      </CardContent>
    </Card>
  );
}

const photoCards = [
  {
    alt: "Laptop, notebook, and coffee on a collaborative planning table.",
    description: "A high-level brief for active roadmap and stakeholder work.",
    image: workspacePlanningPhoto,
    icon: WorkflowIcon,
    meta: "Planning",
    status: "Updated today",
    title: "Workspace planning",
  },
  {
    alt: "Network equipment with organized cables and soft status lights.",
    description: "Infrastructure readiness, capacity, and incident context.",
    image: infrastructureRackPhoto,
    icon: InfrastructureIcon,
    meta: "Operations",
    status: "Healthy",
    title: "Infrastructure health",
  },
  {
    alt: "Analytics desk with printed charts, a tablet, and a small plant.",
    description: "Product metrics and review summaries for weekly reporting.",
    image: analyticsDeskPhoto,
    icon: AnalyticsIcon,
    meta: "Analytics",
    status: "3 reports",
    title: "Insights review",
  },
] as const;

const iconHeaderCards = [
  {
    description:
      "Prioritize unanswered review requests before the weekly cutover.",
    icon: WorkflowIcon,
    label: "12 open",
    title: "Review queue",
  },
  {
    description:
      "Watch build health and error budgets across production regions.",
    icon: InfrastructureIcon,
    label: "99.98%",
    title: "Runtime health",
  },
  {
    description:
      "Compare adoption, retention, and expansion signals by segment.",
    icon: AnalyticsIcon,
    label: "+18%",
    title: "Growth signals",
  },
] as const;

function IconFrame({
  icon: Icon,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <span
      aria-hidden="true"
      className="border-border bg-muted text-muted-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-md border"
    >
      <Icon className="size-4" />
    </span>
  );
}

export const Base: Story = {
  render: ({ as, border, radius, shadow, spacing, surface }) => (
    <DethinkProvider theme="light" className="p-6">
      <Card
        as={as}
        border={border}
        radius={radius}
        shadow={shadow}
        spacing={spacing}
        surface={surface}
      >
        <CardHeader>
          <CardTitle>Workspace usage</CardTitle>
          <CardDescription>
            Track usage across your active workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Text tone="muted">
            Card owns the framed surface and anatomy while content remains
            regular React.
          </Text>
        </CardContent>
      </Card>
    </DethinkProvider>
  ),
};

export const Anatomy: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Card as="article">
        <CardHeader as="header">
          <CardTitle as="h2">Team workspace</CardTitle>
          <CardDescription>
            Members, usage, and billing state in one surface.
          </CardDescription>
          <CardAction>
            <Button size="sm" variant="outline">
              Manage
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Stack gap="2">
            <Text size="sm">12 active members</Text>
            <Text size="sm" tone="muted">
              Invite limits reset at the start of the next billing cycle.
            </Text>
          </Stack>
        </CardContent>
        <CardFooter justify="between">
          <Text as="span" size="sm" tone="muted">
            Updated 2 minutes ago
          </Text>
          <Link href="#card-anatomy">View details</Link>
        </CardFooter>
      </Card>
    </DethinkProvider>
  ),
};

export const Variants: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Stack gap="5">
        <Grid columns="auto-fit-xs" gap="3">
          {surfaces.map((surface) => (
            <Card key={surface} surface={surface}>
              <CardHeader>
                <CardTitle as="h3">surface {surface}</CardTitle>
                <CardDescription>
                  Token-backed surface treatment.
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </Grid>
        <Grid columns="auto-fit-xs" gap="3">
          {borders.map((border) => (
            <Card key={border} border={border}>
              <CardHeader>
                <CardTitle as="h3">border {border}</CardTitle>
                <CardDescription>Constrained border treatment.</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </Grid>
        <Grid columns="auto-fit-xs" gap="3">
          {radii.map((radius) =>
            shadows.map((shadow) => (
              <Card key={`${radius}-${shadow}`} radius={radius} shadow={shadow}>
                <CardHeader>
                  <CardTitle as="h3">
                    {radius} / {shadow}
                  </CardTitle>
                  <CardDescription>
                    Radius and shadow stay tokenized.
                  </CardDescription>
                </CardHeader>
              </Card>
            )),
          )}
        </Grid>
      </Stack>
    </DethinkProvider>
  ),
};

export const SpacingAndDensity: Story = {
  render: () => (
    <Grid columns="1" gap="4">
      <DethinkProvider theme="light" density="compact" className="p-6">
        <Grid columns="auto-fit-xs" gap="3">
          {spacings.map((spacing) => (
            <Card key={spacing} spacing={spacing}>
              <CardHeader>
                <CardTitle as="h3">compact {spacing}</CardTitle>
                <CardDescription>
                  Padding reacts to density tokens.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Text size="sm">Compact card content remains readable.</Text>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </DethinkProvider>
      <DethinkProvider theme="light" density="comfortable" className="p-6">
        <Card spacing="md">
          <CardHeader>
            <CardTitle>comfortable density</CardTitle>
            <CardDescription>
              Cards inherit the provider density context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text tone="muted">
              The same spacing token expands in comfortable mode.
            </Text>
          </CardContent>
        </Card>
      </DethinkProvider>
    </Grid>
  ),
};

export const DashboardCards: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Grid columns="auto-fit-xs" gap="3">
        <MetricCard detail="Up 12% this week" label="Requests" value="2.4M" />
        <MetricCard detail="Within target" label="Latency" value="132ms" />
        <MetricCard
          detail="No active incident"
          label="Reliability"
          value="99.98%"
        />
      </Grid>
    </DethinkProvider>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Card>
        <CardContent>
          <Stack gap="2">
            <Text weight="medium">Content-only surface</Text>
            <Text tone="muted">
              Use CardContent directly when the surrounding page already owns
              the heading and action controls.
            </Text>
          </Stack>
        </CardContent>
      </Card>
    </DethinkProvider>
  ),
};

export const MediaContent: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Card as="article" className="max-w-xl">
        <div className="bg-muted aspect-[16/9]" aria-hidden="true" />
        <CardHeader>
          <CardTitle as="h2">Deployment overview</CardTitle>
          <CardDescription>
            Media stays regular content; Card only owns the framed surface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Grid columns="auto-fit-xs" gap="3">
            {["Build", "Checks", "Regions"].map((label) => (
              <div key={label} className="border-border rounded-md border p-3">
                <Text size="sm" weight="medium">
                  {label}
                </Text>
                <Text size="sm" tone="muted">
                  Ready
                </Text>
              </div>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </DethinkProvider>
  ),
};

export const EmptyContentStates: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Grid columns="auto-fit-sm" gap="3">
        <Card>
          <CardHeader>
            <CardTitle as="h3">No alerts</CardTitle>
            <CardDescription>
              Nothing needs attention right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text tone="muted">
              When EmptyState lands it should own richer empty UX.
            </Text>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="outline">
              Create monitor
            </Button>
          </CardFooter>
        </Card>
        <Card surface="muted">
          <CardHeader>
            <CardTitle as="h3">Loading placeholder</CardTitle>
            <CardDescription>
              Skeleton will own animated loading states later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Stack gap="2">
              <div className="bg-muted-foreground/20 h-3 rounded-md" />
              <div className="bg-muted-foreground/20 h-3 w-2/3 rounded-md" />
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </DethinkProvider>
  ),
};

export const ResponsiveClassNameComposition: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Card className="sm:[--card-padding:1.25rem] lg:[--card-padding:2rem]">
        <CardHeader>
          <CardTitle>Responsive local rhythm</CardTitle>
          <CardDescription>
            Consumer classes remain the escape hatch for breakpoint-specific
            card layout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Grid columns="auto-fit-xs" gap="3">
            <Text size="sm" tone="muted">
              Small screens keep content stacked.
            </Text>
            <Text size="sm" tone="muted">
              Wider containers can tune local spacing without new Card props.
            </Text>
          </Grid>
        </CardContent>
      </Card>
    </DethinkProvider>
  ),
};

export const SettingsPanel: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="md">
        <Card as="section">
          <CardHeader>
            <CardTitle as="h2">Notification routing</CardTitle>
            <CardDescription>
              Choose where operational updates are delivered.
            </CardDescription>
            <CardAction>
              <Button size="sm" variant="outline">
                Test route
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Grid columns="auto-fit-xs" gap="3">
              {["Email", "Slack", "Pager"].map((label) => (
                <div
                  key={label}
                  className="border-border rounded-md border p-3"
                >
                  <Text size="sm" weight="medium">
                    {label}
                  </Text>
                  <Text size="sm" tone="muted">
                    Enabled
                  </Text>
                </div>
              ))}
            </Grid>
          </CardContent>
          <CardFooter justify="end">
            <Button variant="outline">Cancel</Button>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </Container>
    </DethinkProvider>
  ),
};

export const ResourceCards: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Grid columns="auto-fit-sm" gap="3">
        {["North America workspace", "EU billing group", "AI review queue"].map(
          (name) => (
            <Card key={name} as="article">
              <CardHeader>
                <CardTitle as="h3">{name}</CardTitle>
                <CardDescription>Production resource summary.</CardDescription>
              </CardHeader>
              <CardContent>
                <Flex align="center" gap="2" wrap="wrap">
                  <span className="bg-muted rounded-md px-2 py-1 text-xs">
                    Active
                  </span>
                  <span className="bg-muted rounded-md px-2 py-1 text-xs">
                    Healthy
                  </span>
                </Flex>
              </CardContent>
            </Card>
          ),
        )}
      </Grid>
    </DethinkProvider>
  ),
};

export const PhotoCards: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Grid columns="auto-fit-sm" gap="4">
        {photoCards.map(
          ({ alt, description, icon, image, meta, status, title }) => (
            <Card key={title} as="article">
              <img
                src={image}
                alt={alt}
                width="1200"
                height="675"
                className="block aspect-[16/9] w-full rounded-t-[inherit] object-cover"
              />
              <CardHeader>
                <CardTitle as="h3" className="flex items-center gap-3">
                  <IconFrame icon={icon} />
                  <span>{title}</span>
                </CardTitle>
                <CardDescription>{description}</CardDescription>
                <CardAction>
                  <Button size="sm" variant="outline">
                    Open
                  </Button>
                </CardAction>
              </CardHeader>
              <CardFooter justify="between">
                <Text as="span" size="sm" tone="muted">
                  {meta}
                </Text>
                <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs">
                  {status}
                </span>
              </CardFooter>
            </Card>
          ),
        )}
      </Grid>
    </DethinkProvider>
  ),
};

export const IconHeaderCards: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Grid columns="auto-fit-xs" gap="3">
        {iconHeaderCards.map(({ description, icon, label, title }) => (
          <Card key={title} as="article">
            <CardHeader>
              <CardTitle as="h3" className="flex items-center gap-3">
                <IconFrame icon={icon} />
                <span>{title}</span>
              </CardTitle>
              <CardDescription>{description}</CardDescription>
              <CardAction>
                <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs">
                  {label}
                </span>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Stack gap="2">
                <div aria-hidden="true" className="bg-muted h-2 rounded-full">
                  <div className="bg-primary h-2 w-2/3 rounded-full" />
                </div>
                <Text size="sm" tone="muted">
                  Header icons are decorative and stay separate from action
                  controls.
                </Text>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </DethinkProvider>
  ),
};

export const CompositionAndAsChild: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Stack gap="4">
        <Card>
          <CardHeader>
            <CardTitle>Sectioned card</CardTitle>
            <CardDescription>
              Separator divides content without custom borders.
            </CardDescription>
          </CardHeader>
          <Separator decorative />
          <CardContent>
            <Text tone="muted">
              Card stays structural while Separator owns the static boundary.
            </Text>
          </CardContent>
        </Card>
        <Card asChild surface="muted">
          <RouterArticle to="#card-as-child">
            <CardHeader>
              <CardTitle as="h3">asChild article</CardTitle>
              <CardDescription>
                Compatible semantic wrappers receive Card styling.
              </CardDescription>
            </CardHeader>
          </RouterArticle>
        </Card>
      </Stack>
    </DethinkProvider>
  ),
};

export const ElementModes: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Stack gap="3">
        <Grid columns="auto-fit-xs" gap="3">
          {nonListElements.map((element) => (
            <Card key={element} as={element}>
              <CardHeader>
                <CardTitle as="h3">as {element}</CardTitle>
                <CardDescription>
                  Card preserves the selected static element.
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </Grid>
        <Grid
          as="ul"
          role="list"
          columns="auto-fit-xs"
          gap="3"
          className="list-none p-0"
        >
          <Card as="li">
            <CardHeader>
              <CardTitle as="h3">as li</CardTitle>
              <CardDescription>
                List-item cards stay inside a semantic list.
              </CardDescription>
            </CardHeader>
          </Card>
        </Grid>
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
        className="bg-background p-6"
      >
        <Card as="section" dir="rtl">
          <CardHeader>
            <CardTitle as="h2">RTL compact dark</CardTitle>
            <CardDescription>
              Header action uses logical inline spacing.
            </CardDescription>
            <CardAction>
              <Button size="sm" variant="outline">
                Export
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Text tone="muted">
              Content remains readable in dark mode and RTL.
            </Text>
          </CardContent>
        </Card>
      </DethinkProvider>
      <DethinkProvider theme="light" density="comfortable" className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Comfortable light</CardTitle>
            <CardDescription>
              Density changes flow through CSS variables.
            </CardDescription>
          </CardHeader>
          <CardFooter justify="between">
            <Text as="span" size="sm" tone="muted">
              Ready
            </Text>
            <Button size="sm">Continue</Button>
          </CardFooter>
        </Card>
      </DethinkProvider>
    </Grid>
  ),
};
