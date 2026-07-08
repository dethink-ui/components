import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Container,
  DethinkProvider,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  DropdownMenuItemShortcut,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuContent,
  DropdownMenuTrigger,
  Flex,
  Stack,
  Text,
  defineDethinkTheme,
} from "@dethink/components";

const operationsTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.99 0.01 175)",
      foreground: "oklch(0.17 0.04 215)",
      muted: "oklch(0.94 0.025 175)",
      mutedForeground: "oklch(0.42 0.06 205)",
      border: "oklch(0.84 0.035 180)",
      ring: "oklch(0.58 0.17 165)",
      primary: "oklch(0.48 0.16 165)",
      primaryForeground: "oklch(0.99 0.01 175)",
      destructive: "oklch(0.55 0.21 28)",
      destructiveForeground: "oklch(0.99 0.01 175)",
    },
    dark: {
      background: "oklch(0.16 0.035 215)",
      foreground: "oklch(0.96 0.018 180)",
      muted: "oklch(0.25 0.045 210)",
      mutedForeground: "oklch(0.74 0.045 185)",
      border: "oklch(0.34 0.045 210)",
      ring: "oklch(0.72 0.15 165)",
      primary: "oklch(0.72 0.15 165)",
      primaryForeground: "oklch(0.15 0.035 215)",
      destructive: "oklch(0.68 0.19 28)",
      destructiveForeground: "oklch(0.15 0.035 215)",
    },
  },
  density: {
    compact: {
      control: "2.125rem",
      gap: "0.375rem",
    },
  },
  fonts: {
    body: "Inter, ui-sans-serif, system-ui, sans-serif",
    heading: "Charter, Georgia, ui-serif, serif",
  },
  radii: {
    sm: "0.375rem",
    md: "0.5rem",
  },
});

const meta = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  argTypes: {
    defaultOpen: {
      control: "boolean",
    },
    open: {
      control: false,
    },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

function IconPath({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path
        d={d}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function MoreIcon() {
  return <IconPath d="M3.25 8h.01M8 8h.01M12.75 8h.01" />;
}

function OpenIcon() {
  return (
    <IconPath d="M5 4.25h6.75V11A1.75 1.75 0 0 1 10 12.75H5A1.75 1.75 0 0 1 3.25 11V6A1.75 1.75 0 0 1 5 4.25Zm3.25-2h5.5v5.5M9 7l4.5-4.5" />
  );
}

function RefreshIcon() {
  return <IconPath d="M12.75 8A4.75 4.75 0 1 1 11.4 4.7M12.75 3.5v3.25H9.5" />;
}

function CopyIcon() {
  return (
    <IconPath d="M6.25 5.25H11A1.75 1.75 0 0 1 12.75 7v4A1.75 1.75 0 0 1 11 12.75H7A1.75 1.75 0 0 1 5.25 11V6.25A1 1 0 0 1 6.25 5.25Zm-3-1A1.75 1.75 0 0 1 5 2.5h4A1.75 1.75 0 0 1 10.75 4" />
  );
}

function ArchiveIcon() {
  return (
    <IconPath d="M3 5.25h10M4.25 5.25v6A1.75 1.75 0 0 0 6 13h4a1.75 1.75 0 0 0 1.75-1.75v-6M3.75 3h8.5l.75 2.25H3L3.75 3Zm2.75 5h3" />
  );
}

function TrashIcon() {
  return (
    <IconPath d="M3.5 4.5h9M6.25 4.5V3.25A1.25 1.25 0 0 1 7.5 2h1A1.25 1.25 0 0 1 9.75 3.25V4.5m1.5 0-.45 7.25A1.75 1.75 0 0 1 9.06 13.5H6.94a1.75 1.75 0 0 1-1.74-1.75L4.75 4.5" />
  );
}

function SettingsIcon() {
  return (
    <IconPath d="M8 5.5A2.5 2.5 0 1 1 8 10.5 2.5 2.5 0 0 1 8 5.5Zm5.25 2.5-.9-.55.15-1.05-1.15-2-.98.4-.85-.5L9.35 3H6.65l-.17 1.3-.85.5-.98-.4-1.15 2 .15 1.05-.9.55.9.55-.15 1.05 1.15 2 .98-.4.85.5.17 1.3h2.7l.17-1.3.85-.5.98.4 1.15-2-.15-1.05.9-.55Z" />
  );
}

function DownloadIcon() {
  return (
    <IconPath d="M8 2.75v6.5m0 0 2.75-2.75M8 9.25 5.25 6.5M3.5 11.5v.75A1.75 1.75 0 0 0 5.25 14h5.5a1.75 1.75 0 0 0 1.75-1.75v-.75" />
  );
}

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <DropdownMenu {...args}>
          <DropdownMenuTrigger>Report actions</DropdownMenuTrigger>
          <DropdownMenuContent showArrow>
            <DropdownMenuSection>
              <DropdownMenuLabel>Report</DropdownMenuLabel>
              <DropdownMenuItem>
                <DropdownMenuItemIcon>
                  <OpenIcon />
                </DropdownMenuItemIcon>
                <DropdownMenuItemLabel>Open report</DropdownMenuItemLabel>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DropdownMenuItemIcon>
                  <RefreshIcon />
                </DropdownMenuItemIcon>
                <DropdownMenuItemLabel>Refresh report</DropdownMenuItemLabel>
                <DropdownMenuItemShortcut>R</DropdownMenuItemShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>
                <DropdownMenuItemIcon>
                  <TrashIcon />
                </DropdownMenuItemIcon>
                <DropdownMenuItemLabel>Delete report</DropdownMenuItemLabel>
              </DropdownMenuItem>
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Report actions" });

    await userEvent.click(trigger);
    await expect(await page.findByRole("menu")).toBeVisible();
    await userEvent.click(page.getByRole("menuitem", { name: "Open report" }));
    await waitFor(() => {
      expect(page.queryByRole("menu")).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
  },
};

export const RowActionMenu: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Flex
          align="center"
          justify="between"
          className="border-border rounded-md border p-3"
        >
          <Stack gap="1">
            <Text size="sm" weight="medium">
              Invoice batch
            </Text>
            <Text size="sm" tone="muted">
              42 invoices ready for export
            </Text>
          </Stack>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Open invoice batch actions"
              size="icon"
              variant="outline"
            >
              <MoreIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent placement="bottom end">
              <DropdownMenuSection>
                <DropdownMenuLabel>Batch</DropdownMenuLabel>
                <DropdownMenuItem>
                  <DropdownMenuItemIcon>
                    <CopyIcon />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemLabel>Duplicate batch</DropdownMenuItemLabel>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DropdownMenuItemIcon>
                    <DownloadIcon />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemLabel>Export CSV</DropdownMenuItemLabel>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive>
                  <DropdownMenuItemIcon>
                    <TrashIcon />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemLabel>Delete batch</DropdownMenuItemLabel>
                </DropdownMenuItem>
              </DropdownMenuSection>
            </DropdownMenuContent>
          </DropdownMenu>
        </Flex>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole("button", { name: "Open invoice batch actions" }),
    );
    await expect(
      await page.findByRole("menuitem", { name: "Delete batch" }),
    ).toHaveAttribute("data-destructive", "true");
  },
};

export const ToolbarMenu: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Flex gap="2" align="center" wrap="wrap">
          <DropdownMenu>
            <DropdownMenuTrigger variant="outline">View</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Show columns</DropdownMenuItem>
              <DropdownMenuItem>Compact rows</DropdownMenuItem>
              <DropdownMenuItem>Reset layout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger variant="outline">Export</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
              <DropdownMenuItem>Export XLSX</DropdownMenuItem>
              <DropdownMenuItem>Copy API payload</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Flex>
      </Container>
    </DethinkProvider>
  ),
};

export const DestructiveAndDisabled: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Moderation actions</DropdownMenuTrigger>
          <DropdownMenuContent disabledKeys={["locked"]}>
            <DropdownMenuSection>
              <DropdownMenuLabel>Moderation</DropdownMenuLabel>
              <DropdownMenuItem id="locked">
                Resolve locked item
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Escalation disabled</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>
                <DropdownMenuItemIcon>
                  <TrashIcon />
                </DropdownMenuItemIcon>
                <DropdownMenuItemLabel>Delete comment</DropdownMenuItemLabel>
              </DropdownMenuItem>
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
      </Container>
    </DethinkProvider>
  ),
};

export const GroupedShortcuts: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Workspace menu</DropdownMenuTrigger>
          <DropdownMenuContent className="[--dt-dropdown-menu-min-width:16rem]">
            <DropdownMenuSection>
              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
              <DropdownMenuItem>
                <DropdownMenuItemIcon>
                  <SettingsIcon />
                </DropdownMenuItemIcon>
                <DropdownMenuItemLabel>Settings</DropdownMenuItemLabel>
                <DropdownMenuItemDescription>
                  Configure dashboard defaults.
                </DropdownMenuItemDescription>
                <DropdownMenuItemShortcut>S</DropdownMenuItemShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DropdownMenuItemIcon>
                  <RefreshIcon />
                </DropdownMenuItemIcon>
                <DropdownMenuItemLabel>Sync now</DropdownMenuItemLabel>
                <DropdownMenuItemDescription>
                  Pull the latest workspace data.
                </DropdownMenuItemDescription>
                <DropdownMenuItemShortcut>R</DropdownMenuItemShortcut>
              </DropdownMenuItem>
            </DropdownMenuSection>
            <DropdownMenuSeparator />
            <DropdownMenuSection>
              <DropdownMenuLabel>Export</DropdownMenuLabel>
              <DropdownMenuItem>
                <DropdownMenuItemIcon>
                  <DownloadIcon />
                </DropdownMenuItemIcon>
                <DropdownMenuItemLabel>Download report</DropdownMenuItemLabel>
                <DropdownMenuItemShortcut>D</DropdownMenuItemShortcut>
              </DropdownMenuItem>
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
      </Container>
    </DethinkProvider>
  ),
};

export const Submenu: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <DropdownMenu>
          <DropdownMenuTrigger>Move report</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSubmenu>
              <DropdownMenuItem textValue="Move to">Move to</DropdownMenuItem>
              <DropdownMenuSubmenuContent>
                <DropdownMenuItem>Inbox</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
                <DropdownMenuItem>Finance queue</DropdownMenuItem>
              </DropdownMenuSubmenuContent>
            </DropdownMenuSubmenu>
          </DropdownMenuContent>
        </DropdownMenu>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Move report" }));
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    await expect(await page.findByText("Inbox")).toBeVisible();
  },
};

export const Controlled: Story = {
  render: function ControlledDropdownMenuStory() {
    const [open, setOpen] = useState(false);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger>Open controlled menu</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Archive report</DropdownMenuItem>
                <DropdownMenuItem>Duplicate report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Text size="sm" tone="muted">
              Menu state: {open ? "open" : "closed"}
            </Text>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole("button", { name: "Open controlled menu" }),
    );
    await expect(await page.findByRole("menu")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(await canvas.findByText("Menu state: closed")).toBeVisible();
  },
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="compact" dir="rtl" className="p-6">
      <Container size="sm">
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger variant="outline">
            Workspace actions
          </DropdownMenuTrigger>
          <DropdownMenuContent placement="bottom start" showArrow>
            <DropdownMenuSection>
              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
              <DropdownMenuItem>Open workspace</DropdownMenuItem>
              <DropdownMenuItem>Sync workspace</DropdownMenuItem>
              <DropdownMenuSubmenu>
                <DropdownMenuItem textValue="Move to">Move to</DropdownMenuItem>
                <DropdownMenuSubmenuContent>
                  <DropdownMenuItem>Production</DropdownMenuItem>
                  <DropdownMenuItem>Sandbox</DropdownMenuItem>
                </DropdownMenuSubmenuContent>
              </DropdownMenuSubmenu>
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeOverrides: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      density="compact"
      themeConfig={operationsTheme}
      className="p-6"
    >
      <Container size="sm">
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger variant="outline">
            Operations menu
          </DropdownMenuTrigger>
          <DropdownMenuContent showArrow>
            <DropdownMenuSection>
              <DropdownMenuLabel>Operations</DropdownMenuLabel>
              <DropdownMenuItem>
                <DropdownMenuItemIcon>
                  <SettingsIcon />
                </DropdownMenuItemIcon>
                <DropdownMenuItemLabel>Routing rules</DropdownMenuItemLabel>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DropdownMenuItemIcon>
                  <RefreshIcon />
                </DropdownMenuItemIcon>
                <DropdownMenuItemLabel>Run sync</DropdownMenuItemLabel>
              </DropdownMenuItem>
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
      </Container>
    </DethinkProvider>
  ),
};
