import type { Meta, StoryObj } from "@storybook/react-vite";
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
