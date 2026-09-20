import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Container,
  DethinkProvider,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Form,
  Input,
  Stack,
  defineDethinkTheme,
} from "@dethink/components";

const operationsTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.98 0.012 225)",
      foreground: "oklch(0.18 0.05 252)",
      muted: "oklch(0.93 0.03 225)",
      mutedForeground: "oklch(0.42 0.07 245)",
      border: "oklch(0.82 0.04 225)",
      input: "oklch(0.88 0.035 225)",
      ring: "oklch(0.56 0.18 188)",
      primary: "oklch(0.48 0.16 188)",
      primaryForeground: "oklch(0.98 0.012 225)",
      success: "oklch(0.54 0.14 150)",
      successForeground: "oklch(0.98 0.012 150)",
      warning: "oklch(0.7 0.16 78)",
      warningForeground: "oklch(0.2 0.04 78)",
      info: "oklch(0.55 0.16 245)",
      infoForeground: "oklch(0.98 0.012 245)",
    },
    dark: {
      background: "oklch(0.16 0.04 252)",
      foreground: "oklch(0.96 0.02 230)",
      muted: "oklch(0.24 0.05 252)",
      mutedForeground: "oklch(0.76 0.05 230)",
      border: "oklch(0.34 0.05 252)",
      input: "oklch(0.31 0.05 252)",
      ring: "oklch(0.72 0.15 188)",
      primary: "oklch(0.7 0.15 188)",
      primaryForeground: "oklch(0.15 0.04 252)",
    },
  },
  density: {
    comfortable: {
      control: "3rem",
      gap: "0.875rem",
    },
  },
  fonts: {
    body: "Avenir Next, Inter, ui-sans-serif, system-ui, sans-serif",
    heading: "Charter, Georgia, ui-serif, serif",
    mono: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace",
  },
  radii: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
  },
  spacing: {
    "2": "0.625rem",
    "4": "1.125rem",
    "6": "1.75rem",
    "8": "2.25rem",
  },
});

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  argTypes: {
    defaultOpen: {
      control: "boolean",
    },
    open: {
      control: false,
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Dialog {...args}>
          <DialogTrigger>Open dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Workspace settings</DialogTitle>
              <DialogDescription>
                Update how dashboards choose their default workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="text-foreground px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm">
              Production is used for live dashboards, billing reports, and
              alerts.
            </div>
            <DialogFooter>
              <DialogClose variant="outline">Cancel</DialogClose>
              <DialogClose>Save changes</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open dialog" });

    await userEvent.click(trigger);
    await expect(
      await page.findByRole("dialog", { name: "Workspace settings" }),
    ).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Save changes" }));
    await waitFor(() => {
      expect(page.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
  },
};

export const Controlled: Story = {
  render: function ControlledDialogStory() {
    const [open, setOpen] = useState(false);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger>Open controlled dialog</DialogTrigger>
              <DialogContent>
                {({ close }) => (
                  <>
                    <DialogHeader>
                      <DialogTitle>Controlled dialog</DialogTitle>
                      <DialogDescription>
                        The open state is owned by the consuming app.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <button
                        className="text-muted-foreground text-sm"
                        type="button"
                        onClick={close}
                      >
                        Close from render prop
                      </button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
            <FieldDescription>
              Dialog state: {open ? "open" : "closed"}
            </FieldDescription>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const FormDialog: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Dialog>
          <DialogTrigger>Invite teammate</DialogTrigger>
          <DialogContent showCloseButton closeButtonLabel="Close invite dialog">
            <DialogHeader>
              <DialogTitle>Invite teammate</DialogTitle>
              <DialogDescription>
                Send an invitation to a teammate who needs dashboard access.
              </DialogDescription>
            </DialogHeader>
            <Form className="px-[var(--dt-space-6)] py-[var(--dt-space-3)]">
              <Field id="invite-email" required>
                <FieldLabel>Email address</FieldLabel>
                <FieldControl asChild>
                  <Input
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                  />
                </FieldControl>
              </Field>
              <Field id="invite-role">
                <FieldLabel>Role</FieldLabel>
                <FieldControl asChild>
                  <Input name="role" placeholder="Viewer" />
                </FieldControl>
              </Field>
            </Form>
            <DialogFooter>
              <DialogClose variant="outline">Cancel</DialogClose>
              <DialogClose>Send invite</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </DethinkProvider>
  ),
};

export const Informational: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Dialog>
          <DialogTrigger>View service notice</DialogTrigger>
          <DialogContent
            showCloseButton
            closeButtonLabel="Close service notice"
          >
            <DialogHeader>
              <DialogTitle>Service window scheduled</DialogTitle>
              <DialogDescription>
                This informational dialog has no footer actions and closes
                through the top-right icon button.
              </DialogDescription>
            </DialogHeader>
            <div className="text-foreground px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm">
              Workspace analytics may be read-only for a short maintenance
              window while reports are reindexed.
            </div>
          </DialogContent>
        </Dialog>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "View service notice" });

    await userEvent.click(trigger);
    await expect(
      await page.findByRole("dialog", { name: "Service window scheduled" }),
    ).toBeVisible();
    await userEvent.click(
      page.getByRole("button", { name: "Close service notice" }),
    );
    await waitFor(() => {
      expect(page.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
  },
};

export const ScrollableContent: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Dialog>
          <DialogTrigger>Review release notes</DialogTrigger>
          <DialogContent size="lg" scrollBehavior="inside">
            <DialogHeader>
              <DialogTitle>Release readiness</DialogTitle>
              <DialogDescription>
                Long dialog content stays reachable without losing modal
                behavior.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-[var(--dt-space-3)] px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm leading-6">
              {Array.from({ length: 12 }, (_, index) => (
                <p key={index}>
                  Checklist item {index + 1}: verify deployment notes, owners,
                  escalation paths, and customer-facing messaging before
                  release.
                </p>
              ))}
            </div>
            <DialogFooter>
              <DialogClose>Done</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </DethinkProvider>
  ),
};

export const NonDismissable: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Dialog>
          <DialogTrigger>Open locked dialog</DialogTrigger>
          <DialogContent keyboardDismissDisabled>
            <DialogHeader>
              <DialogTitle>Explicit close required</DialogTitle>
              <DialogDescription>
                Keyboard dismissal is disabled, so a visible close action
                remains.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose>Close dialog</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </DethinkProvider>
  ),
};

export const OutsideDismissable: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Dialog>
          <DialogTrigger>Open dismissable dialog</DialogTrigger>
          <DialogContent dismissible>
            <DialogHeader>
              <DialogTitle>Light dismiss enabled</DialogTitle>
              <DialogDescription>
                This low-risk dialog can close from outside interaction.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="compact" dir="rtl" className="p-6">
      <Container size="sm">
        <Dialog defaultOpen>
          <DialogTrigger>Open themed dialog</DialogTrigger>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Workspace direction</DialogTitle>
              <DialogDescription>
                Provider theme, density, and direction cross the portal.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose>Close</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole("dialog", {
      name: "Workspace direction",
    });
    const portalHost = dialog.closest<HTMLElement>(
      '[data-slot="dialog-portal-container"]',
    );

    if (!portalHost) {
      throw new Error("Dialog story expected a provider-aware portal host.");
    }

    await expect(portalHost).toHaveAttribute("data-theme", "dark");
    await expect(portalHost).toHaveAttribute("data-density", "compact");
    await expect(portalHost).toHaveAttribute("dir", "rtl");
  },
};

export const ThemeOverrides: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      density="comfortable"
      themeConfig={operationsTheme}
      className="min-h-[30rem] p-6"
    >
      <Container size="sm">
        <Dialog defaultOpen>
          <DialogTrigger>Open themed override dialog</DialogTrigger>
          <DialogContent showCloseButton closeButtonLabel="Close themed dialog">
            <DialogHeader>
              <DialogTitle className="font-heading">
                Operations review
              </DialogTitle>
              <DialogDescription>
                Provider-level colors, typography, radius, spacing, and density
                flow through the modal portal.
              </DialogDescription>
            </DialogHeader>
            <div className="text-foreground grid gap-[var(--dt-space-4)] px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm">
              <div className="border-border bg-muted rounded-md border p-[var(--dt-space-4)]">
                <div className="font-heading text-foreground text-base font-semibold">
                  Theme tokens active
                </div>
                <p className="text-muted-foreground mt-[var(--dt-space-1)]">
                  The dialog uses the custom provider font stack and tokenized
                  surfaces instead of local hard-coded styles.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-[var(--dt-space-2)]">
                <span className="bg-primary text-primary-foreground rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-center text-xs font-medium">
                  Primary
                </span>
                <span className="bg-success text-success-foreground rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-center text-xs font-medium">
                  Success
                </span>
                <span className="bg-warning text-warning-foreground rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-center text-xs font-medium">
                  Warning
                </span>
              </div>
            </div>
            <DialogFooter>
              <DialogClose variant="outline">Cancel</DialogClose>
              <DialogClose>Approve</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole("dialog", {
      name: "Operations review",
    });
    const portalHost = dialog.closest<HTMLElement>(
      '[data-slot="dialog-portal-container"]',
    );

    if (!portalHost) {
      throw new Error("Dialog story expected a provider-aware portal host.");
    }

    await expect(portalHost).toHaveAttribute("data-theme", "light");
    await expect(portalHost).toHaveAttribute("data-density", "comfortable");
    await expect(portalHost).toHaveStyle({
      "--dt-color-background-light": "oklch(0.98 0.012 225)",
      "--dt-font-heading": "Charter, Georgia, ui-serif, serif",
      "--dt-radius-lg": "1rem",
    });
  },
};

export const VisuallyHiddenTitle: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Dialog>
          <DialogTrigger>Open compact dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle visuallyHidden>
                Compact workspace details
              </DialogTitle>
              <DialogDescription>
                The title is visually hidden while remaining the accessible
                name.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose>Done</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </DethinkProvider>
  ),
};

export const AlertConfirmation: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <AlertDialog>
          <AlertDialogTrigger>Archive workspace</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive workspace</AlertDialogTitle>
              <AlertDialogDescription>
                Archived workspaces leave active dashboards and report filters.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Archive</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Container>
    </DethinkProvider>
  ),
};

export const AlertConfirmationInteraction: Story = {
  tags: ["!dev", "!autodocs"],
  render: AlertConfirmation.render!,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Archive workspace" });

    await userEvent.click(trigger);
    await expect(
      await page.findByRole("alertdialog", { name: "Archive workspace" }),
    ).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(page.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
  },
};

export const DestructiveAlert: Story = {
  render: function DestructiveAlertStory() {
    const [status, setStatus] = useState("No deletion requested");

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <AlertDialog>
              <AlertDialogTrigger variant="destructive">
                Delete report
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete scheduled report</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the report from scheduled exports and cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  {/* eslint-disable jsx-a11y/no-autofocus -- Initial focus belongs in this newly opened modal. */}
                  <AlertDialogCancel autoFocus={true}>
                    {/* eslint-enable jsx-a11y/no-autofocus */}
                    Keep report
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onPress={() => setStatus("Report deleted")}
                  >
                    Delete report
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <FieldDescription>{status}</FieldDescription>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const DestructiveAlertInteraction: Story = {
  tags: ["!dev", "!autodocs"],
  render: DestructiveAlert.render!,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Delete report" });

    await userEvent.click(trigger);

    const alertDialog = await page.findByRole("alertdialog", {
      name: "Delete scheduled report",
    });
    const cancel = page.getByRole("button", { name: "Keep report" });

    await waitFor(() => {
      expect(cancel).toHaveFocus();
    });
    await userEvent.click(
      within(alertDialog).getByRole("button", { name: "Delete report" }),
    );
    await waitFor(() => {
      expect(page.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    await expect(canvas.getByText("Report deleted")).toBeVisible();
  },
};

export const ControlledAlertDialog: Story = {
  render: function ControlledAlertDialogStory() {
    const [open, setOpen] = useState(false);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger>Open controlled alert</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Controlled confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    The consuming application owns the open state.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <FieldDescription>
              Alert state: {open ? "open" : "closed"}
            </FieldDescription>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const LongAlertDescription: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <AlertDialog>
          <AlertDialogTrigger>Reset integration token</AlertDialogTrigger>
          <AlertDialogContent size="lg" scrollBehavior="inside">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset integration token</AlertDialogTitle>
              <AlertDialogDescription>
                Resetting the token immediately invalidates API clients,
                scheduled sync jobs, and webhook retries that still use the
                current secret.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="text-foreground grid gap-[var(--dt-space-3)] px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm leading-6">
              {Array.from({ length: 8 }, (_, index) => (
                <p key={index}>
                  Dependent service {index + 1} must be rotated after this
                  confirmation before the integration resumes normal traffic.
                </p>
              ))}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive">
                Reset token
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Container>
    </DethinkProvider>
  ),
};

export const AlertThemeDensityAndRTL: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="compact" dir="rtl" className="p-6">
      <Container size="sm">
        <AlertDialog defaultOpen>
          <AlertDialogTrigger>Open themed alert</AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm workspace change</AlertDialogTitle>
              <AlertDialogDescription>
                This change updates the workspace direction used for localized
                review queues.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const alertDialog = await page.findByRole("alertdialog", {
      name: "Confirm workspace change",
    });
    const portalHost = alertDialog.closest<HTMLElement>(
      '[data-slot="alert-dialog-portal-container"]',
    );

    if (!portalHost) {
      throw new Error(
        "AlertDialog story expected a provider-aware portal host.",
      );
    }

    await expect(portalHost).toHaveAttribute("data-theme", "dark");
    await expect(portalHost).toHaveAttribute("data-density", "compact");
    await expect(portalHost).toHaveAttribute("dir", "rtl");
  },
};

export const AlertThemeOverrides: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      density="comfortable"
      themeConfig={operationsTheme}
      className="min-h-[30rem] p-6"
    >
      <Container size="sm">
        <AlertDialog defaultOpen>
          <AlertDialogTrigger>Open override alert</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading">
                Approve operations change
              </AlertDialogTitle>
              <AlertDialogDescription>
                Custom provider colors, typography, radius, and density cross
                the alert dialog portal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)]">
              <div className="border-border bg-muted text-muted-foreground rounded-md border p-[var(--dt-space-4)] text-sm">
                Operations policy updates will apply to live dashboard alerts.
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Approve</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const alertDialog = await page.findByRole("alertdialog", {
      name: "Approve operations change",
    });
    const portalHost = alertDialog.closest<HTMLElement>(
      '[data-slot="alert-dialog-portal-container"]',
    );

    if (!portalHost) {
      throw new Error(
        "AlertDialog story expected a provider-aware portal host.",
      );
    }

    await expect(portalHost).toHaveStyle({
      "--dt-font-heading": "Charter, Georgia, ui-serif, serif",
      "--dt-radius-lg": "1rem",
    });
  },
};

export const AlertVisuallyHiddenTitle: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <AlertDialog>
          <AlertDialogTrigger>Open compact alert</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle visuallyHidden>
                Compact alert confirmation
              </AlertDialogTitle>
              <AlertDialogDescription>
                The confirmation title is visually hidden but remains the
                accessible name.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Container>
    </DethinkProvider>
  ),
};

export const AlertReducedMotion: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <AlertDialog defaultOpen>
          <AlertDialogTrigger>Open reduced motion alert</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm quiet transition</AlertDialogTitle>
              <AlertDialogDescription>
                This confirmation appears before advancing the rollout to the
                next operations group.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const alertDialog = await page.findByRole("alertdialog", {
      name: "Confirm quiet transition",
    });
    const content = alertDialog.closest<HTMLElement>(
      '[data-slot="alert-dialog-content"]',
    );
    const overlay = alertDialog.closest<HTMLElement>(
      '[data-slot="alert-dialog-overlay"]',
    );

    if (!content || !overlay) {
      throw new Error(
        "AlertDialog reduced-motion story expected overlay and content.",
      );
    }

    await expect(overlay).toHaveClass("motion-safe:transition-opacity");
    await expect(content).toHaveClass(
      "motion-safe:transition-[opacity,transform]",
    );
  },
};

export const AdminRowAlert: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="md">
        <div className="border-border bg-background grid gap-[var(--dt-space-3)] rounded-lg border p-[var(--dt-space-4)]">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--dt-space-4)]">
            <div className="min-w-0">
              <div className="text-foreground text-sm font-medium">
                Production billing export
              </div>
              <div className="text-muted-foreground text-sm">
                Runs every weekday at 08:00 UTC.
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger size="sm" variant="outline">
                Disable
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disable billing export</AlertDialogTitle>
                  <AlertDialogDescription>
                    Finance users will stop receiving the weekday billing
                    export.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  {/* eslint-disable jsx-a11y/no-autofocus -- Initial focus belongs in this newly opened modal. */}
                  <AlertDialogCancel autoFocus={true}>
                    {/* eslint-enable jsx-a11y/no-autofocus */}
                    Keep enabled
                  </AlertDialogCancel>
                  <AlertDialogAction variant="destructive">
                    Disable export
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Container>
    </DethinkProvider>
  ),
};
