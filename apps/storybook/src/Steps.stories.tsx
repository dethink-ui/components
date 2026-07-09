import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState } from "react";
import { DethinkProvider, Steps } from "@dethink/components";

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
  },
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-4xl rounded-xl border p-6"
    >
      <Steps
        aria-label="Workspace onboarding"
        value="profile"
        items={onboardingItems}
      />
    </DethinkProvider>
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
