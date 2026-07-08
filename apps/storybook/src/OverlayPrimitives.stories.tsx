import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Container,
  DethinkProvider,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuItemShortcut,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuContent,
  DropdownMenuTrigger,
  Flex,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Stack,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  defineDethinkTheme,
} from "@dethink/components";

const overlayTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.99 0.01 245)",
      foreground: "oklch(0.17 0.045 260)",
      muted: "oklch(0.94 0.025 250)",
      mutedForeground: "oklch(0.43 0.06 255)",
      border: "oklch(0.84 0.035 250)",
      ring: "oklch(0.57 0.18 300)",
      primary: "oklch(0.5 0.18 300)",
      primaryForeground: "oklch(0.99 0.01 245)",
      destructive: "oklch(0.56 0.2 28)",
      destructiveForeground: "oklch(0.99 0.01 245)",
    },
    dark: {
      background: "oklch(0.15 0.035 260)",
      foreground: "oklch(0.96 0.018 250)",
      muted: "oklch(0.25 0.045 260)",
      mutedForeground: "oklch(0.75 0.045 250)",
      border: "oklch(0.34 0.045 260)",
      ring: "oklch(0.73 0.16 300)",
      primary: "oklch(0.73 0.16 300)",
      primaryForeground: "oklch(0.15 0.035 260)",
      destructive: "oklch(0.68 0.18 28)",
      destructiveForeground: "oklch(0.15 0.035 260)",
    },
  },
  density: {
    compact: {
      control: "2rem",
      gap: "0.375rem",
    },
    comfortable: {
      control: "2.875rem",
      gap: "0.625rem",
    },
  },
  fonts: {
    body: "Inter, ui-sans-serif, system-ui, sans-serif",
    heading: "Charter, Georgia, ui-serif, serif",
  },
  radii: {
    sm: "0.375rem",
    md: "0.625rem",
    lg: "0.875rem",
  },
});

const meta = {
  title: "Components/Overlay Primitives",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap="2" className="border-border rounded-md border p-3">
      <Text size="sm" weight="medium">
        {title}
      </Text>
      {children}
    </Stack>
  );
}

function OverlaySet({ label }: { label: string }) {
  return (
    <Flex gap="2" align="center" wrap="wrap">
      <Popover>
        <PopoverTrigger variant="outline">{label} popover</PopoverTrigger>
        <PopoverContent showArrow>
          <PopoverHeader>
            <PopoverTitle>{label} filters</PopoverTitle>
            <PopoverDescription>
              Provider tokens style the portal surface and focus ring.
            </PopoverDescription>
          </PopoverHeader>
          <PopoverFooter>
            <PopoverClose>Done</PopoverClose>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      <Tooltip delay={0} closeDelay={0}>
        <TooltipTrigger
          aria-label={`${label} help`}
          size="icon"
          variant="outline"
        >
          ?
        </TooltipTrigger>
        <TooltipContent showArrow>{label} tooltip help</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger variant="outline">
          {label} menu
        </DropdownMenuTrigger>
        <DropdownMenuContent showArrow>
          <DropdownMenuSection>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuItem>
              <DropdownMenuItemLabel>Open workspace</DropdownMenuItemLabel>
              <DropdownMenuItemShortcut>O</DropdownMenuItemShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>Sync workspace</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive>Delete workspace</DropdownMenuItem>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  );
}

export const ProviderThemeMatrix: Story = {
  render: () => (
    <DethinkProvider theme="system" className="p-6">
      <Container size="md">
        <Stack gap="3">
          <Section title="Light theme, default density">
            <DethinkProvider theme="light" density="default">
              <OverlaySet label="Light" />
            </DethinkProvider>
          </Section>
          <Section title="Dark theme, compact density, RTL">
            <DethinkProvider theme="dark" density="compact" dir="rtl">
              <OverlaySet label="Dark" />
            </DethinkProvider>
          </Section>
          <Section title="System theme, comfortable density">
            <DethinkProvider theme="system" density="comfortable">
              <OverlaySet label="System" />
            </DethinkProvider>
          </Section>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
};

export const NestedProviderPortalScope: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="3">
          <Text size="sm" tone="muted">
            The nested provider owns portal theme, density, direction, and
            custom token scope for all three overlay primitives.
          </Text>
          <DethinkProvider
            theme="dark"
            density="compact"
            dir="rtl"
            themeConfig={overlayTheme}
            className="border-border rounded-md border p-3"
          >
            <OverlaySet label="Nested" />
          </DethinkProvider>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const body = canvasElement.ownerDocument.body;

    await userEvent.click(
      canvas.getByRole("button", { name: "Nested popover" }),
    );
    const dialog = await page.findByRole("dialog", { name: "Nested filters" });
    const popoverPortal = dialog.closest<HTMLElement>(
      '[data-slot="popover-portal-container"]',
    );
    expect(popoverPortal).toHaveAttribute("data-theme", "dark");
    expect(popoverPortal).toHaveAttribute("data-density", "compact");
    expect(popoverPortal).toHaveAttribute("dir", "rtl");
    await userEvent.click(page.getByRole("button", { name: "Done" }));

    body.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        pointerType: "mouse",
      }),
    );
    body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    const tooltipTrigger = canvas.getByRole("button", { name: "Nested help" });
    await userEvent.hover(tooltipTrigger);
    const tooltip = await page.findByRole("tooltip");
    const tooltipPortal = tooltip.closest<HTMLElement>(
      '[data-slot="tooltip-portal-container"]',
    );
    expect(tooltipPortal).toHaveAttribute("data-theme", "dark");
    expect(tooltipPortal).toHaveAttribute("data-density", "compact");
    expect(tooltipPortal).toHaveAttribute("dir", "rtl");
    await userEvent.unhover(tooltipTrigger);
    await waitFor(() => {
      expect(page.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    await userEvent.click(canvas.getByRole("button", { name: "Nested menu" }));
    const menu = await page.findByRole("menu");
    const menuPortal = menu.closest<HTMLElement>(
      '[data-slot="dropdown-menu-portal-container"]',
    );
    expect(menuPortal).toHaveAttribute("data-theme", "dark");
    expect(menuPortal).toHaveAttribute("data-density", "compact");
    expect(menuPortal).toHaveAttribute("dir", "rtl");
  },
};

export const KeyboardFocusAndResponsiveSmoke: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="3" className="max-w-xs">
          <Popover>
            <PopoverTrigger variant="outline">Keyboard popover</PopoverTrigger>
            <PopoverContent placement="bottom start" showArrow>
              <PopoverHeader>
                <PopoverTitle>Keyboard popover</PopoverTitle>
                <PopoverDescription>
                  Escape closes and returns focus to the trigger.
                </PopoverDescription>
              </PopoverHeader>
              <PopoverFooter>
                <PopoverClose>Close</PopoverClose>
              </PopoverFooter>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger variant="outline">
              Keyboard menu
            </DropdownMenuTrigger>
            <DropdownMenuContent placement="bottom start">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSubmenu>
                <DropdownMenuItem textValue="Move to">Move to</DropdownMenuItem>
                <DropdownMenuSubmenuContent>
                  <DropdownMenuItem>Inbox</DropdownMenuItem>
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                </DropdownMenuSubmenuContent>
              </DropdownMenuSubmenu>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip delay={0} closeDelay={0} trigger="focus">
            <TooltipTrigger variant="outline">Keyboard tooltip</TooltipTrigger>
            <TooltipContent placement="bottom" showArrow>
              Focus opens the tooltip in narrow layouts.
            </TooltipContent>
          </Tooltip>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const popoverTrigger = canvas.getByRole("button", {
      name: "Keyboard popover",
    });

    popoverTrigger.focus();
    await userEvent.keyboard("{Enter}");
    await expect(
      await page.findByRole("dialog", { name: "Keyboard popover" }),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(page.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await expect(popoverTrigger).toHaveFocus();

    const menuTrigger = canvas.getByRole("button", { name: "Keyboard menu" });
    menuTrigger.focus();
    await userEvent.keyboard("{Enter}{ArrowDown}{ArrowRight}");
    await expect(await page.findByText("Inbox")).toBeVisible();
    await userEvent.keyboard("{Escape}{Escape}");
    await waitFor(() => {
      expect(page.queryByRole("menu")).not.toBeInTheDocument();
    });

    await userEvent.tab();
    await expect(await page.findByRole("tooltip")).toHaveTextContent(
      "Focus opens the tooltip in narrow layouts.",
    );
  },
};

export const ReducedMotionClassCoverage: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Flex gap="2" align="center" wrap="wrap">
          <Popover defaultOpen>
            <PopoverTrigger variant="outline">Motion popover</PopoverTrigger>
            <PopoverContent showArrow>
              <PopoverTitle>Motion popover</PopoverTitle>
            </PopoverContent>
          </Popover>
          <Tooltip defaultOpen delay={0} closeDelay={0}>
            <TooltipTrigger variant="outline">Motion tooltip</TooltipTrigger>
            <TooltipContent showArrow>
              Reduced motion class coverage
            </TooltipContent>
          </Tooltip>
          <DropdownMenu defaultOpen>
            <DropdownMenuTrigger variant="outline">
              Motion menu
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Motion menu item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Flex>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole("dialog", { name: "Motion popover" });
    const tooltip = await page.findByRole("tooltip");
    const menu = await page.findByRole("menu");
    const menuContent = menu.closest<HTMLElement>(
      '[data-slot="dropdown-menu-content"]',
    );

    expect(dialog.closest('[data-slot="popover-content"]')).toHaveClass(
      "motion-reduce:animate-none",
    );
    expect(tooltip).toHaveClass("motion-reduce:animate-none");
    expect(menuContent).toHaveClass("motion-reduce:animate-none");
  },
};
