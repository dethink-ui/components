import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Container,
  DethinkProvider,
  Flex,
  Stack,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dethink/components";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  argTypes: {
    defaultOpen: {
      control: "boolean",
    },
    delay: {
      control: "number",
    },
    closeDelay: {
      control: "number",
    },
    open: {
      control: false,
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

function RefreshIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M12.75 8A4.75 4.75 0 1 1 11.36 4.64M12.75 3.5v3.25H9.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path
        d="M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM8 7.25v3.25M8 5.25h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export const IconButton: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Tooltip {...args} delay={0} closeDelay={0}>
          <TooltipTrigger aria-label="Refresh dashboard" size="icon">
            <RefreshIcon />
          </TooltipTrigger>
          <TooltipContent>Refresh dashboard data</TooltipContent>
        </Tooltip>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Refresh dashboard" });
    const body = canvasElement.ownerDocument.body;

    body.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        pointerType: "mouse",
      }),
    );
    body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await userEvent.hover(trigger);
    await expect(await page.findByRole("tooltip")).toHaveTextContent(
      "Refresh dashboard data",
    );
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(page.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  },
};

export const Delayed: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Tooltip delay={700} closeDelay={300}>
          <TooltipTrigger variant="outline">Export report</TooltipTrigger>
          <TooltipContent>Exports the current filtered report.</TooltipContent>
        </Tooltip>
      </Container>
    </DethinkProvider>
  ),
};

export const FocusTriggered: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Tooltip trigger="focus" delay={0} closeDelay={0}>
          <TooltipTrigger variant="outline">API key</TooltipTrigger>
          <TooltipContent>Used by server-side automation jobs.</TooltipContent>
        </Tooltip>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.tab();

    await expect(canvas.getByRole("button", { name: "API key" })).toHaveFocus();
    await expect(await page.findByRole("tooltip")).toHaveTextContent(
      "Used by server-side automation jobs.",
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Tooltip disabled delay={0} closeDelay={0}>
          <TooltipTrigger variant="outline">Locked workspace</TooltipTrigger>
          <TooltipContent>Workspace changes are locked.</TooltipContent>
        </Tooltip>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Locked workspace" });

    await userEvent.hover(trigger);
    await expect(page.queryByRole("tooltip")).not.toBeInTheDocument();
  },
};

export const ArrowPlacement: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Flex gap="3" wrap="wrap">
          <Tooltip defaultOpen>
            <TooltipTrigger size="icon" aria-label="Billing status">
              <InfoIcon />
            </TooltipTrigger>
            <TooltipContent placement="top" offset={8} showArrow>
              Billing is current.
            </TooltipContent>
          </Tooltip>
          <Tooltip defaultOpen>
            <TooltipTrigger size="icon" aria-label="Deployment status">
              <InfoIcon />
            </TooltipTrigger>
            <TooltipContent placement="right" offset={8} showArrow>
              Deployment is healthy.
            </TooltipContent>
          </Tooltip>
        </Flex>
      </Container>
    </DethinkProvider>
  ),
};

export const LongTextWrapping: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Tooltip defaultOpen>
          <TooltipTrigger variant="outline">Workspace quota</TooltipTrigger>
          <TooltipContent
            className="[--dt-tooltip-max-width:14rem]"
            placement="bottom"
            offset={8}
          >
            Workspace quota includes scheduled imports, retained exports, and
            cached dashboard snapshots.
          </TooltipContent>
        </Tooltip>
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="compact" dir="rtl" className="p-6">
      <Container size="sm">
        <Stack gap="3">
          <Tooltip defaultOpen>
            <TooltipTrigger variant="outline">مزامنة التقرير</TooltipTrigger>
            <TooltipContent placement="bottom" offset={8} showArrow>
              تتم مزامنة البيانات كل خمس دقائق.
            </TooltipContent>
          </Tooltip>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
};

export const MotionPreview: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Tooltip defaultOpen>
          <TooltipTrigger aria-label="Rebuild index" size="icon">
            <RefreshIcon />
          </TooltipTrigger>
          <TooltipContent placement="top" offset={8} showArrow>
            Rebuild search index
          </TooltipContent>
        </Tooltip>
      </Container>
    </DethinkProvider>
  ),
};
