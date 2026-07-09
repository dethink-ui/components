import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState, type ReactNode } from "react";
import { DethinkProvider, Steps, type StepItemData } from "@dethink/components";

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
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="border-border rounded-md border px-3 py-2 text-sm"
          onClick={() => setRequiresApproval(true)}
        >
          Manager approval
        </button>
        <button
          type="button"
          className="border-border rounded-md border px-3 py-2 text-sm"
          onClick={() => setRequiresApproval(false)}
        >
          Self service
        </button>
      </div>
      <Steps
        interactive
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
    </DethinkProvider>
  );
}

export const ConditionalBranch: Story = {
  render: () => <ConditionalBranchDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Self service" }));

    await expect(canvas.getByText("Details")).toBeInTheDocument();
    await expect(canvas.getByText("Confirmation")).toBeInTheDocument();
    await expect(canvas.queryByText("Approval")).not.toBeInTheDocument();
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
