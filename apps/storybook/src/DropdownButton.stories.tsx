import { type CSSProperties, type ReactNode, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Button,
  ButtonGroup,
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
  type DropdownButtonMenuProps,
  type DropdownButtonMotionPreset,
  type ButtonSize,
  type ButtonVariant,
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
      description:
        "Menu mode is the default; split fixes a primary action; selectable promotes a chosen action without invoking it.",
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
      options: ["solid", "soft", "outline", "ghost", "link", "destructive"],
    },
  },
} satisfies Meta<DropdownButtonMenuProps>;

export default meta;

type Story = StoryObj<DropdownButtonMenuProps>;

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

type ResponsiveActionId = "preview" | "share" | "export" | "archive";

const responsiveActions: Array<{
  destructive?: boolean;
  disabled?: boolean;
  id: ResponsiveActionId;
  label: string;
}> = [
  { id: "preview", label: "Preview" },
  { id: "share", label: "Share" },
  { disabled: true, id: "export", label: "Export pending approval" },
  { destructive: true, id: "archive", label: "Archive" },
];

const responsivePrimaryIds = new Set<ResponsiveActionId>(["preview", "share"]);

const highContrastStyle = {
  "--dt-color-background-light": "oklch(1 0 0)",
  "--dt-color-foreground-light": "oklch(0 0 0)",
  "--dt-color-muted-light": "oklch(0.94 0 0)",
  "--dt-color-muted-foreground-light": "oklch(0.16 0 0)",
  "--dt-color-border-light": "oklch(0 0 0)",
  "--dt-color-ring-light": "oklch(0 0 0)",
  "--dt-color-primary-light": "oklch(0.2 0.18 260)",
  "--dt-color-primary-foreground-light": "oklch(1 0 0)",
  "--dt-color-destructive-light": "oklch(0.4 0.22 28)",
  "--dt-color-destructive-foreground-light": "oklch(1 0 0)",
} as CSSProperties;

function ResponsiveActionSurface({
  label,
  onAction,
  width,
}: {
  label: string;
  onAction: (source: "narrow" | "wide", id: ResponsiveActionId) => void;
  width: string;
}) {
  return (
    <section
      aria-label={label}
      data-testid={label}
      className="border-border @container rounded-lg border p-4"
      style={{ width }}
    >
      <div
        data-layout="wide"
        className="hidden @min-3xl:flex @min-3xl:items-center @min-3xl:justify-between @min-3xl:gap-4"
      >
        <Text size="sm" weight="medium">
          Quarterly report
        </Text>
        <ButtonGroup aria-label={`${label} report actions`}>
          {responsiveActions.map((action) => (
            <Button
              key={action.id}
              data-action-id={action.id}
              disabled={action.disabled}
              onClick={() => onAction("wide", action.id)}
              variant={action.destructive ? "destructive" : "outline"}
            >
              {action.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <div
        data-layout="narrow"
        className="flex items-center justify-between gap-3 @min-3xl:hidden"
      >
        <Text className="min-w-0 truncate" size="sm" weight="medium">
          Quarterly report
        </Text>
        <ButtonGroup aria-label={`${label} report actions`} mode="separated">
          {responsiveActions
            .filter((action) => responsivePrimaryIds.has(action.id))
            .map((action) => (
              <Button
                key={action.id}
                data-action-id={action.id}
                onClick={() => onAction("narrow", action.id)}
                size="sm"
                variant="outline"
              >
                {action.label}
              </Button>
            ))}
          <DropdownButton
            aria-label={`More ${label} report actions`}
            label="More"
            size="sm"
          >
            {responsiveActions
              .filter((action) => !responsivePrimaryIds.has(action.id))
              .map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  data-action-id={action.id}
                  destructive={action.destructive}
                  disabled={action.disabled}
                  onAction={() => onAction("narrow", action.id)}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
          </DropdownButton>
        </ButtonGroup>
      </div>
    </section>
  );
}

function StoryFrame({
  children,
  density = "default",
  dir = "ltr",
  style,
  theme = "light",
}: {
  children: ReactNode;
  density?: "compact" | "default" | "comfortable";
  dir?: "ltr" | "rtl";
  style?: CSSProperties;
  theme?: "light" | "dark";
}) {
  return (
    <DethinkProvider
      className="border-border bg-background min-h-48 rounded-lg border p-6"
      density={density}
      dir={dir}
      style={style}
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

export const SplitButton: Story = {
  render: function SplitButtonStory(args) {
    const [status, setStatus] = useState("No action yet");

    return (
      <StoryFrame>
        <Stack gap="3" align="start">
          <DropdownButton
            {...args}
            label="Save"
            menuLabel="More save options"
            mode="split"
            onPrimaryAction={() => setStatus("Saved directly")}
          >
            <DropdownMenuItem onAction={() => setStatus("Saved as template")}>
              Save as template
            </DropdownMenuItem>
            <DropdownMenuItem onAction={() => setStatus("Saved and closed")}>
              Save and close
            </DropdownMenuItem>
          </DropdownButton>
          <Text data-testid="split-status" size="sm" tone="muted">
            {status}
          </Text>
        </Stack>
      </StoryFrame>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const primary = canvas.getByRole("button", { name: "Save" });
    const menuTrigger = canvas.getByRole("button", {
      name: "More save options",
    });

    await userEvent.click(primary);
    await expect(canvas.getByTestId("split-status")).toHaveTextContent(
      "Saved directly",
    );
    await expect(page.queryByRole("menu")).not.toBeInTheDocument();

    primary.focus();
    await userEvent.tab();
    await expect(menuTrigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(await page.findByRole("menu")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(page.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await expect(menuTrigger).toHaveFocus();
  },
};

export const SelectablePrimaryAction: Story = {
  render: function SelectablePrimaryActionStory() {
    const [status, setStatus] = useState("No merge executed");

    return (
      <StoryFrame>
        <Stack gap="3" align="start">
          <DropdownButton
            actions={[
              {
                description:
                  "Add every commit from this branch through a merge commit.",
                id: "merge",
                label: "Create a merge commit",
                onAction: () => setStatus("Merge commit executed"),
              },
              {
                description: "Combine this branch into one commit.",
                id: "squash",
                label: "Squash and merge",
                onAction: () => setStatus("Squash executed"),
              },
              {
                description: "Replay every commit onto the base branch.",
                id: "rebase",
                label: "Rebase and merge",
                onAction: () => setStatus("Rebase executed"),
              },
            ]}
            defaultSelectedActionId="merge"
            menuLabel="Choose merge method"
            mode="selectable"
          />
          <Text data-testid="selectable-status" size="sm" tone="muted">
            {status}
          </Text>
        </Stack>
      </StoryFrame>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole("button", { name: "Choose merge method" }),
    );

    await expect(
      await page.findByRole("menuitemradio", {
        name: "Create a merge commit",
      }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByText("Combine this branch into one commit."),
    ).toBeVisible();

    await userEvent.click(
      page.getByRole("menuitemradio", { name: "Squash and merge" }),
    );

    await expect(canvas.getByTestId("selectable-status")).toHaveTextContent(
      "No merge executed",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Squash and merge" }),
    );
    await expect(canvas.getByTestId("selectable-status")).toHaveTextContent(
      "Squash executed",
    );
  },
};

export const SplitLongLabelAndRtl: Story = {
  render: (args) => (
    <StoryFrame dir="rtl">
      <div className="grid min-h-56 place-items-center px-4">
        <DropdownButton
          {...args}
          defaultOpen
          className="max-w-full"
          label="حفظ التقرير والتحليلات ذات التسمية الطويلة"
          menuLabel="المزيد من خيارات الحفظ"
          mode="split"
          onPrimaryAction={() => undefined}
          placement="bottom start"
          showArrow
        >
          <DropdownMenuItem>حفظ كقالب</DropdownMenuItem>
          <DropdownMenuItem>حفظ وإغلاق</DropdownMenuItem>
        </DropdownButton>
      </div>
    </StoryFrame>
  ),
};

export const AsyncPolicies: Story = {
  render: () => (
    <StoryFrame>
      <div className="grid gap-6 sm:grid-cols-2">
        <Stack gap="2" align="start">
          <Text size="sm" weight="medium">
            Whole composite loading
          </Text>
          <DropdownButton
            label="Publishing"
            loading
            menuLabel="More publish options"
            mode="split"
            onPrimaryAction={() => undefined}
          >
            <DropdownMenuItem>Schedule publish</DropdownMenuItem>
          </DropdownButton>
          <Text size="sm" tone="muted">
            Both controls are unavailable by default.
          </Text>
        </Stack>
        <Stack gap="2" align="start">
          <Text size="sm" weight="medium">
            Primary-only loading
          </Text>
          <DropdownButton
            label="Generating report"
            loading
            loadingBehavior="primary"
            menuLabel="More report options"
            mode="split"
            onPrimaryAction={() => undefined}
          >
            <DropdownMenuItem>Cancel generation</DropdownMenuItem>
            <DropdownMenuItem>Open previous report</DropdownMenuItem>
          </DropdownButton>
          <Text size="sm" tone="muted">
            The menu stays available for declared-safe alternatives.
          </Text>
        </Stack>
      </div>
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await expect(
      canvas.getByRole("button", { name: "Publishing" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "More publish options" }),
    ).toBeDisabled();

    const safeMenu = canvas.getByRole("button", {
      name: "More report options",
    });
    await expect(safeMenu).toBeEnabled();
    await userEvent.click(safeMenu);
    await expect(
      await page.findByRole("menuitem", { name: "Cancel generation" }),
    ).toBeVisible();
  },
};

export const IndependentDisabledStates: Story = {
  render: () => (
    <StoryFrame>
      <div className="flex flex-wrap gap-4">
        <DropdownButton
          label="Primary unavailable"
          menuLabel="Alternatives for unavailable primary"
          mode="split"
          onPrimaryAction={() => undefined}
          primaryDisabled
        >
          <DropdownMenuItem>Request approval</DropdownMenuItem>
        </DropdownButton>
        <DropdownButton
          label="Primary available"
          menuDisabled
          menuLabel="Unavailable alternatives"
          mode="split"
          onPrimaryAction={() => undefined}
        >
          <DropdownMenuItem>Hidden while unavailable</DropdownMenuItem>
        </DropdownButton>
      </div>
    </StoryFrame>
  ),
};

export const ControlledPrimaryAction: Story = {
  render: function ControlledPrimaryActionStory() {
    const [publish, setPublish] = useState(false);
    const [status, setStatus] = useState("No direct action yet");

    return (
      <StoryFrame>
        <Stack gap="3" align="start">
          <Button variant="soft" onClick={() => setPublish((value) => !value)}>
            Change controlled primary
          </Button>
          <DropdownButton
            label={publish ? "Publish" : "Save"}
            menuLabel={publish ? "More publish options" : "More save options"}
            mode="split"
            onPrimaryAction={() =>
              setStatus(publish ? "Published directly" : "Saved directly")
            }
            primaryIcon={
              <span key={publish ? "publish" : "save"} aria-hidden="true">
                {publish ? "P" : "S"}
              </span>
            }
          >
            <DropdownMenuItem>Export a copy</DropdownMenuItem>
          </DropdownButton>
          <Text data-testid="controlled-primary-status" size="sm" tone="muted">
            {status}
          </Text>
        </Stack>
      </StoryFrame>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(
      canvas.getByTestId("controlled-primary-status"),
    ).toHaveTextContent("Saved directly");

    await userEvent.click(
      canvas.getByRole("button", { name: "Change controlled primary" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Publish" }));
    await expect(
      canvas.getByTestId("controlled-primary-status"),
    ).toHaveTextContent("Published directly");
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
    <div className="grid gap-4 md:grid-cols-3">
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
      <StoryFrame style={highContrastStyle}>
        <DropdownButton
          {...args}
          label="Approve"
          menuLabel="More approval options"
          mode="split"
          onPrimaryAction={() => undefined}
          variant="outline"
        >
          <DropdownMenuItem>Request changes</DropdownMenuItem>
          <DropdownMenuItem destructive>Reject request</DropdownMenuItem>
        </DropdownButton>
      </StoryFrame>
      <div className="md:col-span-3">
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

export const VariantsAndSizes: Story = {
  render: () => {
    const variants: ButtonVariant[] = [
      "solid",
      "soft",
      "outline",
      "ghost",
      "link",
      "destructive",
    ];
    const sizes: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

    return (
      <StoryFrame>
        <Stack gap="5">
          <div className="flex flex-wrap items-center gap-3">
            {variants.map((variant) => (
              <DropdownButton key={variant} label={variant} variant={variant}>
                <DropdownMenuItem>{variant} action</DropdownMenuItem>
              </DropdownButton>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            {sizes.map((size) => (
              <DropdownButton
                key={size}
                label={size}
                menuLabel={`More ${size} options`}
                mode="split"
                onPrimaryAction={() => undefined}
                size={size}
              >
                <DropdownMenuItem>{size} alternative</DropdownMenuItem>
              </DropdownButton>
            ))}
          </div>
        </Stack>
      </StoryFrame>
    );
  },
};

export const ResponsiveActionHandoff: Story = {
  render: function ResponsiveActionHandoffStory() {
    const [status, setStatus] = useState("No responsive action yet");

    return (
      <StoryFrame>
        <Stack gap="4">
          <ResponsiveActionSurface
            label="Wide preview"
            width="52rem"
            onAction={(source, id) => setStatus(`${source}:${id}`)}
          />
          <ResponsiveActionSurface
            label="Narrow preview"
            width="28rem"
            onAction={(source, id) => setStatus(`${source}:${id}`)}
          />
          <Text data-testid="responsive-action-status" size="sm" tone="muted">
            {status}
          </Text>
        </Stack>
      </StoryFrame>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const wide = within(canvas.getByTestId("Wide preview"));
    const narrow = within(canvas.getByTestId("Narrow preview"));

    await userEvent.click(wide.getByRole("button", { name: "Archive" }));
    await expect(
      canvas.getByTestId("responsive-action-status"),
    ).toHaveTextContent("wide:archive");
    await expect(
      wide.getByRole("button", { name: "Export pending approval" }),
    ).toBeDisabled();

    await userEvent.click(
      narrow.getByRole("button", {
        name: "More Narrow preview report actions",
      }),
    );
    await expect(
      await page.findByRole("menuitem", { name: "Export pending approval" }),
    ).toHaveAttribute("data-disabled");
    await userEvent.click(page.getByRole("menuitem", { name: "Archive" }));
    await expect(
      canvas.getByTestId("responsive-action-status"),
    ).toHaveTextContent("narrow:archive");
  },
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
