import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useState, type ReactNode } from "react";
import {
  Button,
  DethinkProvider,
  Steps,
  type StepItemData,
  type StepsMotionPreset,
} from "@dethink/components";

const onboardingItems = [
  {
    id: "account",
    label: "Account",
    description: "Create your workspace account.",
  },
  {
    id: "profile",
    label: "Profile",
    description: "Add your team profile.",
  },
  {
    id: "permissions",
    label: "Permissions",
    description: "Choose access rules.",
  },
  { id: "review", label: "Review", optional: true },
];

const longWorkflowItems = [
  ...onboardingItems,
  { id: "billing", label: "Billing", description: "Choose a plan." },
  { id: "launch", label: "Launch", description: "Open the workspace." },
];

const motionPresets: StepsMotionPreset[] = [
  "none",
  "subtle",
  "standard",
  "expressive",
];

const meta = {
  title: "Components/Steps",
  component: Steps,
  args: {
    items: onboardingItems,
    motionPreset: "standard",
    orientation: "horizontal",
    showProgress: true,
    size: "md",
  },
  argTypes: {
    motionPreset: {
      control: "inline-radio",
      options: ["none", "subtle", "standard", "expressive"],
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => (
    <StoryFrame>
      <Steps
        {...args}
        aria-label="Workspace onboarding"
        value="profile"
        items={onboardingItems}
      />
    </StoryFrame>
  ),
};

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
      density={density}
      dir={dir}
      theme={theme}
      className="border-border max-w-4xl rounded-xl border p-6"
    >
      {children}
    </DethinkProvider>
  );
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    size: "lg",
  },
  render: (args) => (
    <StoryFrame>
      <Steps
        {...args}
        aria-label="Vertical onboarding"
        value="permissions"
        items={onboardingItems}
        className="max-w-md"
      />
    </StoryFrame>
  ),
};

export const ProgressOverride: Story = {
  render: (args) => (
    <StoryFrame>
      <Steps
        {...args}
        aria-label="Migration progress"
        value="profile"
        items={onboardingItems}
        progressValue={82}
        formatProgress={(percentage) => `${percentage}% migrated`}
      />
    </StoryFrame>
  ),
};

type ReviewStepData = { owner: string; due: string };
const reviewItems: StepItemData<ReviewStepData>[] = [
  {
    id: "brief",
    label: "Brief",
    data: { owner: "Mina", due: "Mon" },
  },
  {
    id: "design",
    label: "Design",
    data: { owner: "Arun", due: "Wed" },
  },
  {
    id: "approval",
    label: "Approval",
    data: { owner: "Leah", due: "Fri" },
  },
];

export const CustomRendering: Story = {
  render: () => (
    <StoryFrame>
      <Steps<ReviewStepData>
        showProgress
        aria-label="Campaign review"
        value="design"
        items={reviewItems}
        renderItem={(item, state) => (
          <span className="grid gap-0.5">
            <span className="text-foreground text-sm font-semibold">
              {item.label}
            </span>
            <span className="text-muted-foreground text-xs">
              {item.data?.owner} · due {item.data?.due} · {state.status}
            </span>
          </span>
        )}
      />
    </StoryFrame>
  ),
};

function ConditionalBranchDemo() {
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [value, setValue] = useState("details");
  const branch = requiresApproval
    ? [
        { id: "approval", label: "Approval", description: "Manager review." },
        { id: "launch", label: "Launch", description: "Activate access." },
      ]
    : [
        {
          id: "confirmation",
          label: "Confirmation",
          description: "Confirm the self-service path.",
        },
      ];

  return (
    <DethinkProvider
      theme="light"
      className="border-border grid max-w-4xl gap-6 rounded-xl border p-6"
    >
      {value === "details" ? (
        <div className="grid gap-2">
          <p className="text-foreground text-sm font-semibold">
            Does this workspace require manager approval?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              aria-pressed={requiresApproval}
              variant={requiresApproval ? "solid" : "outline"}
              size="sm"
              onClick={() => setRequiresApproval(true)}
            >
              Manager approval
            </Button>
            <Button
              aria-pressed={!requiresApproval}
              variant={!requiresApproval ? "solid" : "outline"}
              size="sm"
              onClick={() => setRequiresApproval(false)}
            >
              Self service
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Return to Details before changing the branch answer.
        </p>
      )}
      <Steps
        interactive
        showProgress
        aria-label="Conditional onboarding"
        motionPreset="expressive"
        value={value}
        onValueChange={setValue}
        items={[
          { id: "account", label: "Account" },
          { id: "details", label: "Details" },
          ...branch,
        ]}
      />
      <section
        aria-live="polite"
        className="border-border bg-muted/40 grid gap-1 rounded-lg border p-4"
      >
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Consumer-owned panel
        </p>
        <p className="text-foreground text-sm font-semibold">
          {value === "details"
            ? "Workspace details"
            : `Current destination: ${value}`}
        </p>
        <p className="text-muted-foreground text-sm">
          Changing the answer replaces only the future branch; the current
          details step remains selected.
        </p>
      </section>
    </DethinkProvider>
  );
}

export const ConditionalBranchMockWizard: Story = {
  render: () => <ConditionalBranchDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Self service" }));

    await expect(canvas.getByText("Details")).toBeInTheDocument();
    await expect(canvas.getByText("Confirmation")).toBeInTheDocument();
    await waitFor(() => {
      expect(canvas.queryByText("Approval")).not.toBeInTheDocument();
    });
    await expect(
      canvas.getByRole("button", { name: /Details/ }),
    ).toHaveAttribute("aria-current", "step");
  },
};

export const ReducedMotion: Story = {
  args: {
    motionPreset: "none",
  },
  render: (args) => (
    <StoryFrame>
      <Steps
        {...args}
        interactive
        aria-label="Reduced-motion onboarding"
        value="permissions"
        items={onboardingItems}
      />
    </StoryFrame>
  ),
};

export const ExceptionalStates: Story = {
  render: (args) => (
    <StoryFrame>
      <Steps
        {...args}
        interactive
        aria-label="Release workflow"
        value="approval"
        items={[
          { id: "brief", label: "Brief", status: "complete" },
          {
            id: "approval",
            label: "Approval",
            description: "Legal review needs attention.",
            status: "error",
          },
          { id: "security", label: "Security", status: "skipped" },
          {
            id: "launch",
            label: "Launch",
            disabled: true,
            optional: true,
          },
        ]}
      />
    </StoryFrame>
  ),
};

export const DarkTheme: Story = {
  render: (args) => (
    <StoryFrame theme="dark">
      <Steps
        {...args}
        aria-label="Dark theme onboarding"
        value="permissions"
        items={onboardingItems}
      />
    </StoryFrame>
  ),
};

export const DensityComparison: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <StoryFrame density="compact">
        <Steps
          {...args}
          aria-label="Compact onboarding"
          value="profile"
          items={onboardingItems}
          size="sm"
        />
      </StoryFrame>
      <StoryFrame density="comfortable">
        <Steps
          {...args}
          aria-label="Comfortable onboarding"
          value="profile"
          items={onboardingItems}
          size="lg"
        />
      </StoryFrame>
    </div>
  ),
};

export const RightToLeft: Story = {
  render: (args) => (
    <StoryFrame dir="rtl">
      <Steps
        {...args}
        aria-label="RTL onboarding"
        value="profile"
        items={onboardingItems}
      />
    </StoryFrame>
  ),
};

export const ResponsiveOverflow: Story = {
  render: (args) => (
    <div className="max-w-sm">
      <StoryFrame>
        <Steps
          {...args}
          aria-label="Long onboarding"
          value="permissions"
          items={longWorkflowItems}
        />
      </StoryFrame>
    </div>
  ),
};

export const EmptyAndSingleStep: Story = {
  render: () => (
    <div className="grid gap-4">
      <StoryFrame>
        <p className="text-muted-foreground mb-3 text-xs font-medium">
          Empty workflow
        </p>
        <Steps aria-label="Empty workflow" items={[]} />
      </StoryFrame>
      <StoryFrame>
        <p className="text-muted-foreground mb-3 text-xs font-medium">
          Single-step workflow
        </p>
        <Steps
          showProgress
          aria-label="Single-step workflow"
          items={[{ id: "done", label: "Ready to launch" }]}
        />
      </StoryFrame>
    </div>
  ),
};

export const MotionPresets: Story = {
  render: () => (
    <div className="grid gap-4">
      {motionPresets.map((motionPreset) => (
        <StoryFrame key={motionPreset}>
          <p className="text-muted-foreground mb-3 text-xs font-medium capitalize">
            {motionPreset}
          </p>
          <Steps
            interactive
            aria-label={`${motionPreset} motion`}
            defaultValue="profile"
            items={onboardingItems}
            motionPreset={motionPreset}
          />
        </StoryFrame>
      ))}
    </div>
  ),
};
