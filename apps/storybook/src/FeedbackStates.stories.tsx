import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertTriangle,
  CheckCircle2,
  Inbox,
  ListChecks,
  UploadCloud,
} from "lucide-react";
import {
  Alert,
  Button,
  Callout,
  DethinkProvider,
  EmptyState,
  Progress,
  ProgressCircle,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
  Spinner,
  ToastProvider,
  ToastViewport,
  useToast,
} from "@dethink/components";

type StoryArgs = {
  density: "compact" | "default" | "comfortable";
  theme: "light" | "dark";
};

const meta = {
  title: "Components/Feedback States",
  args: {
    density: "default",
    theme: "light",
  },
  argTypes: {
    density: {
      control: "inline-radio",
      options: ["compact", "default", "comfortable"],
    },
    theme: {
      control: "inline-radio",
      options: ["light", "dark"],
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;

type Story = StoryObj<StoryArgs>;

function ToastDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        leftIcon={<CheckCircle2 />}
        onClick={() =>
          toast({
            action: {
              label: "Undo",
              onClick: () => undefined,
            },
            description: "Workspace settings were saved.",
            title: "Saved",
            tone: "success",
          })
        }
      >
        Save
      </Button>
      <Button
        variant="outline"
        leftIcon={<AlertTriangle />}
        onClick={() =>
          toast({
            description: "The import worker stopped before finishing.",
            persistent: true,
            title: "Import failed",
            tone: "destructive",
          })
        }
      >
        Fail import
      </Button>
      <Button
        variant="outline"
        leftIcon={<ListChecks />}
        onClick={() =>
          toast({
            announcement: "CSV import is ready for review.",
            render: ({ dismiss }) => (
              <div className="grid gap-3">
                <div className="grid gap-1">
                  <div className="text-foreground font-medium">
                    CSV import ready
                  </div>
                  <div className="text-muted-foreground">
                    42 rows matched. 3 rows need review before publishing.
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={dismiss}>
                  Review later
                </Button>
              </div>
            ),
            tone: "info",
          })
        }
      >
        Custom toast
      </Button>
    </div>
  );
}

export const LoadingAndProgress: Story = {
  render: (args) => (
    <DethinkProvider
      density={args.density}
      theme={args.theme}
      className="border-border grid max-w-2xl gap-6 rounded-lg border p-6"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Spinner label="Loading" tone="primary" />
        <Spinner variant="dots" tone="muted" />
        <Progress label="CSV import" value={64} showValue />
      </div>
      <div className="flex items-center gap-5">
        <ProgressCircle label="Upload" value={72} showValue tone="success" />
        <div className="grid flex-1 gap-3">
          <SkeletonText lines={3} animation="shimmer" />
          <div className="flex gap-3">
            <SkeletonAvatar />
            <SkeletonButton />
          </div>
        </div>
      </div>
    </DethinkProvider>
  ),
};

export const LoaderVariants: Story = {
  render: (args) => (
    <DethinkProvider
      density={args.density}
      theme={args.theme}
      className="border-border grid gap-6 rounded-lg border p-6"
    >
      {(["ring", "dots", "bouncing-dot", "moving-rings"] as const).map(
        (variant) => (
          <div key={variant} className="grid gap-3">
            <h3 className="text-sm font-medium">{variant}</h3>
            <div className="flex flex-wrap items-center gap-6">
              {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
                <Spinner
                  key={size}
                  variant={variant}
                  size={size}
                  tone="primary"
                  label={`${variant} ${size}: Loading`}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {(
                [
                  "current",
                  "muted",
                  "primary",
                  "success",
                  "warning",
                  "destructive",
                  "info",
                ] as const
              ).map((tone) => (
                <Spinner
                  key={tone}
                  variant={variant}
                  tone={tone}
                  label={`${variant} ${tone}: Loading`}
                />
              ))}
            </div>
          </div>
        ),
      )}
    </DethinkProvider>
  ),
};

export const LoaderVariantsDark: Story = {
  ...LoaderVariants,
  args: { theme: "dark" },
};
export const LoaderVariantsCompact: Story = {
  ...LoaderVariants,
  args: { density: "compact" },
};

export const MessagingAndEmptyState: Story = {
  render: (args) => (
    <DethinkProvider
      density={args.density}
      theme={args.theme}
      className="border-border grid max-w-3xl gap-5 rounded-lg border p-6"
    >
      <Alert
        icon={<CheckCircle2 />}
        title="Deployment queued"
        description="The release will continue in the background."
        tone="success"
      />
      <Callout
        icon={<UploadCloud />}
        title="Large imports"
        description="Files over 100 MB continue processing after the dialog closes."
      />
      <EmptyState
        visual={<Inbox />}
        title="No failed jobs"
        description="Background jobs that need attention will appear here."
        primaryAction={<Button variant="outline">Refresh</Button>}
        variant="table"
      />
    </DethinkProvider>
  ),
};

export const ToastWorkflow: Story = {
  render: (args) => (
    <DethinkProvider
      density={args.density}
      theme={args.theme}
      className="border-border min-h-80 rounded-lg border p-6"
    >
      <ToastProvider motion="standard">
        <ToastDemo />
        <ToastViewport />
      </ToastProvider>
    </DethinkProvider>
  ),
};
