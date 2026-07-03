import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  expect,
  userEvent,
  waitFor,
  within,
} from "storybook/test";
import {
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
} from "@dethink/components";

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
            <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm text-foreground">
              Production is used for live dashboards, billing reports, and alerts.
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
                        className="text-sm text-muted-foreground"
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
            <FieldDescription>Dialog state: {open ? "open" : "closed"}</FieldDescription>
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
                  <Input name="email" placeholder="name@example.com" type="email" />
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
          <DialogContent showCloseButton closeButtonLabel="Close service notice">
            <DialogHeader>
              <DialogTitle>Service window scheduled</DialogTitle>
              <DialogDescription>
                This informational dialog has no footer actions and closes through
                the top-right icon button.
              </DialogDescription>
            </DialogHeader>
            <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm text-foreground">
              Workspace analytics may be read-only for a short maintenance window
              while reports are reindexed.
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
    await userEvent.click(page.getByRole("button", { name: "Close service notice" }));
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
                Long dialog content stays reachable without losing modal behavior.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-[var(--dt-space-3)] px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm leading-6">
              {Array.from({ length: 12 }, (_, index) => (
                <p key={index}>
                  Checklist item {index + 1}: verify deployment notes, owners,
                  escalation paths, and customer-facing messaging before release.
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
                Keyboard dismissal is disabled, so a visible close action remains.
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
    const dialog = await page.findByRole("dialog", { name: "Workspace direction" });
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

export const VisuallyHiddenTitle: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Dialog>
          <DialogTrigger>Open compact dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle visuallyHidden>Compact workspace details</DialogTitle>
              <DialogDescription>
                The title is visually hidden while remaining the accessible name.
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
