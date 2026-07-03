import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Container,
  DethinkProvider,
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Form,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Stack,
  defineDethinkTheme,
} from "@dethink/components";

const insightTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.99 0.008 210)",
      foreground: "oklch(0.18 0.045 240)",
      muted: "oklch(0.94 0.02 220)",
      mutedForeground: "oklch(0.44 0.06 235)",
      border: "oklch(0.84 0.035 220)",
      input: "oklch(0.89 0.03 220)",
      ring: "oklch(0.58 0.17 185)",
      primary: "oklch(0.46 0.15 185)",
      primaryForeground: "oklch(0.99 0.008 210)",
    },
    dark: {
      background: "oklch(0.17 0.04 240)",
      foreground: "oklch(0.96 0.018 220)",
      muted: "oklch(0.25 0.045 240)",
      mutedForeground: "oklch(0.75 0.04 220)",
      border: "oklch(0.34 0.04 240)",
      input: "oklch(0.31 0.04 240)",
      ring: "oklch(0.72 0.15 185)",
      primary: "oklch(0.72 0.15 185)",
      primaryForeground: "oklch(0.16 0.04 240)",
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
    md: "0.75rem",
    lg: "1rem",
  },
});

const meta = {
  title: "Components/Popover",
  component: Popover,
  argTypes: {
    defaultOpen: {
      control: "boolean",
    },
    open: {
      control: false,
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Popover {...args}>
          <PopoverTrigger variant="outline">Workspace actions</PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Workspace actions</PopoverTitle>
              <PopoverDescription>
                Production dashboards refresh every five minutes.
              </PopoverDescription>
            </PopoverHeader>
            <div className="text-sm leading-6 text-foreground">
              Queue a refresh after changing the workspace filter set.
            </div>
            <PopoverFooter>
              <PopoverClose>Done</PopoverClose>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Workspace actions" });

    await userEvent.click(trigger);
    await expect(
      await page.findByRole("dialog", { name: "Workspace actions" }),
    ).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Done" }));
    await waitFor(() => {
      expect(page.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
  },
};

export const Controlled: Story = {
  render: function ControlledPopoverStory() {
    const [open, setOpen] = useState(false);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger>Open controlled popover</PopoverTrigger>
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle>Controlled popover</PopoverTitle>
                  <PopoverDescription>
                    The consuming screen owns this open state.
                  </PopoverDescription>
                </PopoverHeader>
                <PopoverFooter>
                  <PopoverClose>Close</PopoverClose>
                </PopoverFooter>
              </PopoverContent>
            </Popover>
            <FieldDescription>Popover state: {open ? "open" : "closed"}</FieldDescription>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const FilterPanel: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Popover>
          <PopoverTrigger variant="outline">Edit filters</PopoverTrigger>
          <PopoverContent className="[--dt-popover-width:24rem]">
            <PopoverHeader>
              <PopoverTitle>Report filters</PopoverTitle>
              <PopoverDescription>
                Narrow the invoice report before exporting it.
              </PopoverDescription>
            </PopoverHeader>
            <Form>
              <Field id="popover-region">
                <FieldLabel>Region</FieldLabel>
                <FieldControl asChild>
                  <Input placeholder="EMEA" />
                </FieldControl>
              </Field>
              <Field id="popover-owner">
                <FieldLabel>Owner</FieldLabel>
                <FieldControl asChild>
                  <Input placeholder="Finance operations" />
                </FieldControl>
              </Field>
            </Form>
            <PopoverFooter>
              <PopoverClose variant="outline">Cancel</PopoverClose>
              <PopoverClose>Apply</PopoverClose>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </Container>
    </DethinkProvider>
  ),
};

export const ArrowPlacement: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Popover>
          <PopoverTrigger variant="outline">Open arrow popover</PopoverTrigger>
          <PopoverContent placement="top start" showArrow>
            <PopoverHeader>
              <PopoverTitle>Queued refresh</PopoverTitle>
              <PopoverDescription>
                The next refresh includes the active workspace query.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </Container>
    </DethinkProvider>
  ),
};

export const DisabledTrigger: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Popover>
          <PopoverTrigger disabled>Workspace locked</PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Locked workspace</PopoverTitle>
          </PopoverContent>
        </Popover>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Workspace locked" });

    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await expect(page.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="compact" dir="rtl" className="p-6">
      <Container size="sm">
        <Popover defaultOpen>
          <PopoverTrigger variant="outline">إعدادات المساحة</PopoverTrigger>
          <PopoverContent placement="start" showArrow>
            <PopoverHeader>
              <PopoverTitle>إعدادات المساحة</PopoverTitle>
              <PopoverDescription>
                يتم توريث الاتجاه والكثافة من المزود.
              </PopoverDescription>
            </PopoverHeader>
            <PopoverFooter>
              <PopoverClose>تم</PopoverClose>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeOverrides: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      density="compact"
      themeConfig={insightTheme}
      className="p-6"
    >
      <Container size="sm">
        <Popover defaultOpen>
          <PopoverTrigger variant="outline">Review insight</PopoverTrigger>
          <PopoverContent showArrow>
            <PopoverHeader>
              <PopoverTitle>Revenue insight</PopoverTitle>
              <PopoverDescription>
                Custom provider tokens style the trigger, portal, surface, and
                focus ring together.
              </PopoverDescription>
            </PopoverHeader>
            <PopoverFooter>
              <PopoverClose>Acknowledge</PopoverClose>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </Container>
    </DethinkProvider>
  ),
};
