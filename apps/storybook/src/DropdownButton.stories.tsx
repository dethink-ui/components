import { type ReactNode, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Button,
  Container,
  DethinkProvider,
  DropdownButton,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  DropdownMenuItemShortcut,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  Stack,
  Text,
  type DropdownButtonMotionPreset,
} from "@dethink/components";

const meta = {
  title: "Components/DropdownButton",
  component: DropdownButton,
  args: {
    label: "Report actions",
    motionPreset: "standard",
    placement: "bottom start",
    size: "md",
    variant: "outline",
  },
  argTypes: {
    mode: {
      control: false,
      description: "Menu mode is the only mode in this tracer slice.",
    },
    motionPreset: {
      control: "inline-radio",
      options: ["none", "subtle", "standard"],
    },
    open: {
      control: false,
    },
    reducedMotion: {
      control: "boolean",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    variant: {
      control: "select",
      options: ["solid", "soft", "outline", "ghost", "destructive"],
    },
  },
} satisfies Meta<typeof DropdownButton>;

export default meta;

type Story = StoryObj<typeof meta>;

function ItemIcon({ children }: { children: string }) {
  return (
    <DropdownMenuItemIcon aria-hidden="true">{children}</DropdownMenuItemIcon>
  );
}

function ReportMenuItems() {
  return (
    <DropdownMenuSection>
      <DropdownMenuLabel>Report</DropdownMenuLabel>
      <DropdownMenuItem>
        <ItemIcon>O</ItemIcon>
        <DropdownMenuItemLabel>Open report</DropdownMenuItemLabel>
        <DropdownMenuItemShortcut>↵</DropdownMenuItemShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <ItemIcon>D</ItemIcon>
        <DropdownMenuItemLabel>Duplicate report</DropdownMenuItemLabel>
        <DropdownMenuItemDescription>
          Create an editable copy.
        </DropdownMenuItemDescription>
      </DropdownMenuItem>
      <DropdownMenuItem disabled>
        <ItemIcon>S</ItemIcon>
        <DropdownMenuItemLabel>Share externally</DropdownMenuItemLabel>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem destructive>
        <ItemIcon>×</ItemIcon>
        <DropdownMenuItemLabel>Delete report</DropdownMenuItemLabel>
      </DropdownMenuItem>
    </DropdownMenuSection>
  );
}

function StoryFrame({
  children,
  density = "default",
  dir = "ltr",
  theme = "light",
}: {
  children: ReactNode;
  density?: "compact" | "default" | "comfortable";
  dir?: "ltr" | "rtl";
  theme?: "light" | "dark";
}) {
  return (
    <DethinkProvider
      className="border-border bg-background min-h-48 rounded-lg border p-6"
      density={density}
      dir={dir}
      theme={theme}
    >
      {children}
    </DethinkProvider>
  );
}

export const Base: Story = {
  render: (args) => (
    <StoryFrame>
      <DropdownButton {...args} showArrow>
        <ReportMenuItems />
      </DropdownButton>
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Report actions" });

    await userEvent.click(trigger);
    await expect(await page.findByRole("menu")).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "Share externally" }),
    ).toHaveAttribute("data-disabled");
    await userEvent.click(page.getByRole("menuitem", { name: "Open report" }));
    await waitFor(() =>
      expect(page.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};

export const ControlledOpen: Story = {
  render: function ControlledOpenStory(args) {
    const [open, setOpen] = useState(false);

    return (
      <StoryFrame>
        <Stack gap="3" align="start">
          <Button variant="soft" onClick={() => setOpen((value) => !value)}>
            {open ? "Close from app state" : "Open from app state"}
          </Button>
          <DropdownButton
            {...args}
            label="Controlled report actions"
            open={open}
            onOpenChange={setOpen}
          >
            <ReportMenuItems />
          </DropdownButton>
          <Text size="sm" tone="muted">
            Application state: {open ? "open" : "closed"}
          </Text>
        </Stack>
      </StoryFrame>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole("button", { name: "Open from app state" }),
    );
    await expect(await page.findByRole("menu")).toBeVisible();
    await expect(canvas.getByText("Application state: open")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByText("Application state: closed")).toBeVisible();
  },
};

export const GroupedDestructiveAndDisabled: Story = {
  render: (args) => (
    <StoryFrame>
      <DropdownButton
        {...args}
        defaultOpen
        label="Workspace actions"
        placement="bottom start"
      >
        <DropdownMenuSection>
          <DropdownMenuLabel>Workspace</DropdownMenuLabel>
          <DropdownMenuItem>Rename workspace</DropdownMenuItem>
          <DropdownMenuItem disabled>Transfer ownership</DropdownMenuItem>
        </DropdownMenuSection>
        <DropdownMenuSeparator />
        <DropdownMenuSection>
          <DropdownMenuLabel>Danger zone</DropdownMenuLabel>
          <DropdownMenuItem destructive>Delete workspace</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownButton>
    </StoryFrame>
  ),
};

export const Placement: Story = {
  render: (args) => (
    <StoryFrame>
      <div className="grid min-h-72 place-items-center">
        <DropdownButton
          {...args}
          defaultOpen
          label="Bottom-end actions"
          placement="bottom end"
          showArrow
        >
          <ReportMenuItems />
        </DropdownButton>
      </div>
    </StoryFrame>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: (args) => (
    <div className="grid gap-4 md:grid-cols-2">
      <StoryFrame density="compact">
        <DropdownButton {...args} label="Compact actions">
          <ReportMenuItems />
        </DropdownButton>
      </StoryFrame>
      <StoryFrame density="comfortable" theme="dark">
        <DropdownButton {...args} label="Dark comfortable actions">
          <ReportMenuItems />
        </DropdownButton>
      </StoryFrame>
      <div className="md:col-span-2">
        <StoryFrame dir="rtl">
          <Container size="sm">
            <DropdownButton
              {...args}
              defaultOpen
              label="إجراءات التقرير"
              placement="bottom start"
            >
              <DropdownMenuItem>فتح التقرير</DropdownMenuItem>
              <DropdownMenuItem>نسخ التقرير</DropdownMenuItem>
              <DropdownMenuItem destructive>حذف التقرير</DropdownMenuItem>
            </DropdownButton>
          </Container>
        </StoryFrame>
      </div>
    </div>
  ),
};

export const MotionPresets: Story = {
  render: () => {
    const presets: DropdownButtonMotionPreset[] = [
      "none",
      "subtle",
      "standard",
    ];

    return (
      <StoryFrame>
        <div className="flex flex-wrap gap-3">
          {presets.map((motionPreset) => (
            <DropdownButton
              key={motionPreset}
              label={`${motionPreset} motion`}
              motionPreset={motionPreset}
            >
              <DropdownMenuItem>{motionPreset} action</DropdownMenuItem>
            </DropdownButton>
          ))}
        </div>
      </StoryFrame>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    for (const motionPreset of ["none", "subtle", "standard"] as const) {
      await userEvent.click(
        canvas.getByRole("button", { name: `${motionPreset} motion` }),
      );
      const menu = await page.findByRole("menu");
      await expect(
        menu.closest('[data-slot="dropdown-button-content"]'),
      ).toHaveAttribute("data-motion", motionPreset);
      await userEvent.keyboard("{Escape}");
      await waitFor(() =>
        expect(page.queryByRole("menu")).not.toBeInTheDocument(),
      );
    }
  },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <StoryFrame>
      <DropdownButton
        {...args}
        defaultOpen
        label="Reduced motion actions"
        reducedMotion
      >
        <ReportMenuItems />
      </DropdownButton>
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const menu = await page.findByRole("menu");
    const content = menu.closest('[data-slot="dropdown-button-content"]');

    await expect(content).toHaveAttribute("data-reduced-motion");
    await expect(content).toHaveStyle({ transform: "" });
  },
};
