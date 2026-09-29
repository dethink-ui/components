import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FilterAssistant,
  FilterBar,
  createFilter,
  createFilterCondition,
  defineFilterFields,
  useFilterAssistant,
  useFilterState,
  type FilterAssistantResolve,
  type FilterAssistantResult,
} from "@dethink/components";
import { expect, userEvent, within } from "storybook/test";

const fields = defineFilterFields([
  {
    key: "status",
    label: "Status",
    type: "option",
    options: [
      { value: "open", label: "Open" },
      { value: "blocked", label: "Blocked" },
    ],
  },
  {
    key: "labels",
    label: "Labels",
    type: "multiOption",
    options: [
      { value: "bug", label: "Bug" },
      { value: "api", label: "API" },
    ],
  },
  { key: "urgent", label: "Urgent", type: "boolean" },
]);

const proposal: FilterAssistantResult = {
  message: "Open or blocked bugs; I couldn't match “mobile”.",
  filter: {
    type: "group",
    combinator: "and",
    children: [
      {
        type: "condition",
        field: "status",
        operator: "isAnyOf",
        value: ["open", "blocked"],
      },
      {
        type: "condition",
        field: "labels",
        operator: "includesAny",
        value: ["bug", "mobile"],
      },
      { type: "condition", field: "priority", operator: "is", value: "p1" },
    ],
  },
};

const clarify: FilterAssistantResult = {
  clarifications: [
    {
      id: "which",
      question: "Which labels do you mean?",
      choices: [
        { id: "bug", label: "Bugs" },
        { id: "api", label: "API work" },
      ],
    },
  ],
};

const wait = (signal: AbortSignal, ms = 400) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

function Demo({ resolve }: { resolve: FilterAssistantResolve }) {
  const state = useFilterState({
    defaultValue: createFilter({
      children: [
        createFilterCondition({
          field: "status",
          operator: "isAnyOf",
          value: ["open"],
        }),
        createFilterCondition({ field: "urgent", operator: "is", value: true }),
      ],
    }),
  });
  const assistant = useFilterAssistant({ fields, state, resolve });

  return (
    <div className="grid max-w-2xl gap-4">
      <FilterAssistant assistant={assistant} />
      <FilterBar fields={fields} state={state} />
    </div>
  );
}

const meta = {
  title: "Components/FilterAssistant",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Proposal: Story = {
  render: () => (
    <Demo
      resolve={async ({ signal }) => {
        await wait(signal);

        return proposal;
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole("textbox", { name: "Describe the filter you want" }),
      "open or blocked mobile bugs",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Propose" }));

    const region = await canvas.findByRole(
      "region",
      { name: "Proposed changes" },
      { timeout: 3000 },
    );

    await expect(region).toHaveTextContent("Couldn't use");
    await userEvent.click(
      within(region).getAllByRole("button", { name: "Reject" })[0]!,
    );
    await userEvent.click(
      within(region).getByRole("button", { name: /^Apply \d/ }),
    );
    await expect(
      canvas.getByRole("group", { name: "Labels includes Bug" }),
    ).toBeInTheDocument();
  },
};

export const Clarification: Story = {
  render: () => (
    <Demo
      resolve={async ({ answers, signal }) => {
        await wait(signal);

        return answers.length === 0 ? clarify : proposal;
      }}
    />
  ),
};

export const Declined: Story = {
  render: () => (
    <Demo
      resolve={async ({ signal }) => {
        await wait(signal);

        return false;
      }}
    />
  ),
};

export const Slow: Story = {
  name: "Slow (try Stop)",
  render: () => (
    <Demo
      resolve={async ({ signal }) => {
        await wait(signal, 5000);

        return proposal;
      }}
    />
  ),
};
