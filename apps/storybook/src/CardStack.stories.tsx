import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState, type ReactNode, type SVGProps } from "react";
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardStack,
  CardTitle,
  Container,
  DethinkProvider,
  Flex,
  Grid,
  Stack,
  Text,
  type CardStackMode,
} from "@dethink/components";

const meta = {
  title: "Components/CardStack",
  component: CardStack,
  args: {
    angle: 15,
    loop: true,
    mode: "stack",
    stackOffset: 8,
  },
  argTypes: {
    angle: {
      control: { max: 30, min: 0, step: 1, type: "range" },
    },
    loop: {
      control: "boolean",
    },
    mode: {
      control: "inline-radio",
      options: ["stack", "open"],
    },
    stackOffset: {
      control: { max: 32, min: 0, step: 1, type: "range" },
    },
  },
} satisfies Meta<typeof CardStack>;

export default meta;

type Story = StoryObj<typeof meta>;

const deckItems = [
  {
    description:
      "Review product, design, and engineering readiness for launch.",
    meta: "Today",
    title: "Launch review",
  },
  {
    description:
      "Confirm regions, capacity headroom, and incident owner routing.",
    meta: "Operations",
    title: "Production readiness",
  },
  {
    description:
      "Summarize adoption, retention, and account expansion signals.",
    meta: "Analytics",
    title: "Growth signals",
  },
  {
    description: "Collect unanswered questions before the next planning cycle.",
    meta: "Planning",
    title: "Open decisions",
  },
] as const;

function ChartIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M8 15v-4" />
      <path d="M12 15V8" />
      <path d="M16 15v-6" />
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
      <path d="M7 7h10" />
      <path d="M7 12h10" />
      <path d="M7 17h6" />
      <path d="M4 7h.01" />
      <path d="M4 12h.01" />
      <path d="M4 17h.01" />
    </svg>
  );
}

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="border-border bg-muted text-muted-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-md border"
    >
      {children}
    </span>
  );
}

function MetricsMedia() {
  return (
    <div
      aria-hidden="true"
      className="border-border bg-muted/40 aspect-[16/9] overflow-hidden border-b p-5"
    >
      <div className="border-border bg-background/90 grid h-full grid-cols-[1fr_auto] items-end gap-4 rounded-md border p-4 shadow-sm">
        <div className="flex h-full items-end gap-2">
          <span className="bg-info/70 h-1/3 w-5 rounded-t-sm" />
          <span className="bg-success/70 h-1/2 w-5 rounded-t-sm" />
          <span className="bg-warning/80 h-2/3 w-5 rounded-t-sm" />
          <span className="bg-primary/70 h-4/5 w-5 rounded-t-sm" />
          <span className="bg-info/80 h-3/5 w-5 rounded-t-sm" />
        </div>
        <div className="flex h-full w-24 flex-col justify-between py-1">
          <span className="bg-muted h-2 rounded-full" />
          <span className="bg-muted h-2 w-5/6 rounded-full" />
          <span className="bg-muted h-2 w-2/3 rounded-full" />
          <span className="bg-primary/20 h-2 w-3/4 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function LaunchTasksMedia() {
  return (
    <div
      aria-hidden="true"
      className="border-border bg-muted/40 aspect-[16/9] overflow-hidden border-b p-5"
    >
      <div className="border-border bg-background/90 grid h-full grid-cols-[0.9fr_1.1fr] gap-4 rounded-md border p-4 shadow-sm">
        <div className="flex flex-col justify-between">
          <div className="border-success/30 bg-success/10 flex items-center gap-2 rounded-md border px-3 py-2">
            <span className="bg-success size-2.5 rounded-full" />
            <span className="bg-success/30 h-2 flex-1 rounded-full" />
          </div>
          <div className="border-info/30 bg-info/10 flex items-center gap-2 rounded-md border px-3 py-2">
            <span className="bg-info size-2.5 rounded-full" />
            <span className="bg-info/30 h-2 w-2/3 rounded-full" />
          </div>
          <div className="border-warning/40 bg-warning/10 flex items-center gap-2 rounded-md border px-3 py-2">
            <span className="bg-warning size-2.5 rounded-full" />
            <span className="bg-warning/40 h-2 w-3/4 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/70 flex flex-col gap-2 rounded-md p-2">
            <span className="bg-primary/20 h-2 rounded-full" />
            <span className="border-border bg-background h-10 rounded-md border" />
            <span className="border-border bg-background h-8 rounded-md border" />
          </div>
          <div className="bg-muted/70 flex flex-col gap-2 rounded-md p-2">
            <span className="bg-primary/30 h-2 rounded-full" />
            <span className="border-info/30 bg-info/10 h-8 rounded-md border" />
            <span className="border-border bg-background h-10 rounded-md border" />
          </div>
          <div className="bg-muted/70 flex flex-col gap-2 rounded-md p-2">
            <span className="bg-primary/40 h-2 rounded-full" />
            <span className="border-success/30 bg-success/10 h-12 rounded-md border" />
            <span className="border-border bg-background h-6 rounded-md border" />
          </div>
        </div>
      </div>
    </div>
  );
}

function createDeckCard({
  description,
  meta,
  title,
}: {
  description: string;
  meta: string;
  title: string;
}) {
  return (
    <Card key={title} as="article">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs">
            {meta}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Stack gap="2">
          <div aria-hidden="true" className="bg-muted h-2 rounded-full">
            <div className="bg-primary h-2 w-2/3 rounded-full" />
          </div>
          <Text size="sm" tone="muted">
            Active cards keep nested controls available while inactive cards
            remain inert.
          </Text>
        </Stack>
      </CardContent>
      <CardFooter justify="end">
        <Button size="sm" variant="outline">
          Open
        </Button>
      </CardFooter>
    </Card>
  );
}

function CardStackExample({
  angle,
  loop,
  mode,
  stackOffset,
}: {
  angle?: number;
  loop?: boolean;
  mode?: CardStackMode;
  stackOffset?: number;
}) {
  return (
    <CardStack angle={angle} loop={loop} mode={mode} stackOffset={stackOffset}>
      {deckItems.map((item) => createDeckCard(item))}
    </CardStack>
  );
}

export const BaseStack: Story = {
  render: ({ angle, loop, mode, stackOffset }) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <CardStackExample
          angle={angle}
          loop={loop}
          mode={mode}
          stackOffset={stackOffset}
        />
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stack = canvas.getByRole("group", { name: "Card stack" });

    await expect(stack).toHaveAttribute("data-active-index", "0");

    await userEvent.click(
      canvas.getByRole("button", { name: "Show next card" }),
    );
    await expect(stack).toHaveAttribute("data-active-index", "1");

    stack.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(stack).toHaveAttribute("data-active-index", "2");

    await userEvent.click(
      canvas.getByRole("button", { name: "Show previous card" }),
    );
    await expect(stack).toHaveAttribute("data-active-index", "1");
  },
};

export const OpenFan: Story = {
  args: {
    angle: 15,
    mode: "open",
  },

  render: ({ angle, loop, mode, stackOffset }) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="md">
        <CardStack
          angle={angle}
          loop={loop}
          mode={mode}
          stackOffset={stackOffset}
        >
          {deckItems.map((item) => createDeckCard(item))}
        </CardStack>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stack = canvas.getByRole("group", { name: "Card stack" });
    const secondCardItem = canvas
      .getByText("Production readiness")
      .closest('[data-slot="card-stack-item"]');

    await expect(stack).toHaveAttribute("data-active-index", "0");
    await expect(secondCardItem).not.toBeNull();

    await userEvent.click(secondCardItem as HTMLElement);

    await expect(stack).toHaveAttribute("data-active-index", "1");
  },
};

export const AngleTuning: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Grid columns="auto-fit-sm" gap="5">
        {[10, 20, 30].map((angle) => (
          <Stack key={angle} gap="3">
            <Text size="sm" weight="medium">
              {angle} degrees
            </Text>
            <CardStack mode="open" angle={angle}>
              {deckItems.slice(0, 3).map((item) => createDeckCard(item))}
            </CardStack>
          </Stack>
        ))}
      </Grid>
    </DethinkProvider>
  ),
};

export const ControlledActiveIndex: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(1);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="4">
            <Flex align="center" gap="2" wrap="wrap">
              {deckItems.map((item, index) => (
                <Button
                  key={item.title}
                  size="sm"
                  variant={index === activeIndex ? "solid" : "outline"}
                  onClick={() => setActiveIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </Flex>
            <CardStack
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
            >
              {deckItems.map((item) => createDeckCard(item))}
            </CardStack>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const HiddenControls: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="4">
            <Flex align="center" gap="2" wrap="wrap" justify="center">
              {deckItems.map((item, index) => (
                <Button
                  key={item.title}
                  size="sm"
                  variant={index === activeIndex ? "solid" : "outline"}
                  onClick={() => setActiveIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </Flex>
            <CardStack
              activeIndex={activeIndex}
              showControls={false}
              onActiveIndexChange={setActiveIndex}
            >
              {deckItems.map((item) => createDeckCard(item))}
            </CardStack>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole("button", { name: "Show next card" }),
    ).toBeNull();
    await expect(
      canvas.queryByRole("button", { name: "Show previous card" }),
    ).toBeNull();
  },
};

export const NextControlOnly: Story = {
  render: ({ angle, loop, mode, stackOffset }) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <CardStack
          angle={angle}
          loop={loop}
          mode={mode}
          showPreviousControl={false}
          stackOffset={stackOffset}
        >
          {deckItems.map((item) => createDeckCard(item))}
        </CardStack>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("button", { name: "Show next card" }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Show previous card" }),
    ).toBeNull();
  },
};

export const MediaAndIconCards: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="md">
        <CardStack mode="open" angle={15}>
          <Card as="article">
            <LaunchTasksMedia />
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <IconFrame>
                  <WorkflowIcon className="size-4" />
                </IconFrame>
                Launch tasks
              </CardTitle>
              <CardDescription>
                Media stays regular Card content inside the deck.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card as="article">
            <MetricsMedia />
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <IconFrame>
                  <ChartIcon className="size-4" />
                </IconFrame>
                Metrics review
              </CardTitle>
              <CardDescription>
                Header icons remain decorative and inert when behind.
              </CardDescription>
            </CardHeader>
          </Card>
          {createDeckCard({
            description: "Confirm handoff notes and incident-response owners.",
            meta: "Owners",
            title: "Team handoff",
          })}
        </CardStack>
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
          <CardStack dir="rtl" loop={false}>
            {deckItems.slice(0, 3).map((item) => createDeckCard(item))}
          </CardStack>
        </Container>
      </DethinkProvider>
      <DethinkProvider theme="light" density="comfortable" className="p-6">
        <Container size="sm">
          <CardStack mode="open" angle={20}>
            {deckItems.slice(0, 3).map((item) => createDeckCard(item))}
          </CardStack>
        </Container>
      </DethinkProvider>
    </Grid>
  ),
};
