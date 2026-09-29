import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import {
  createFilter,
  createFilterCondition,
  useFilterState,
  type FilterAssistantResult,
} from ".";
import { FilterAssistant } from "./filter-assistant";
import { queryFields } from "./filter-query.fixtures";
import {
  useFilterAssistant,
  type FilterAssistantResolve,
} from "./use-filter-assistant";

expect.extend(toHaveNoViolations);

const everything: FilterAssistantResult = {
  message: "Here is what I found.",
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
        value: ["nope"],
      },
      { type: "condition", field: "priority", operator: "is", value: "p1" },
    ],
  },
  clarifications: [
    {
      id: "when",
      question: "Which week?",
      choices: [
        { id: "this", label: "This week" },
        { id: "last", label: "Last week" },
      ],
    },
  ],
};

function Assistant({ resolve }: { resolve: FilterAssistantResolve }) {
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
  const assistant = useFilterAssistant({ fields: queryFields, state, resolve });

  return <FilterAssistant assistant={assistant} />;
}

async function setup(resolve: FilterAssistantResolve) {
  const user = userEvent.setup();
  const { container } = render(
    <DethinkProvider>
      <Assistant resolve={resolve} />
    </DethinkProvider>,
  );

  return { container, user };
}

async function ask(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByRole("textbox", { name: "Describe the filter you want" }),
    "open bugs",
  );
  await user.click(screen.getByRole("button", { name: "Propose" }));
}

describe("FilterAssistant accessibility", () => {
  it("has no axe violations at rest and while loading", async () => {
    const { container, user } = await setup(() => new Promise(() => undefined));

    expect(await axe(container)).toHaveNoViolations();
    await ask(user);
    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with every kind of proposal content", async () => {
    const { container, user } = await setup(async () => everything);

    await ask(user);
    await screen.findByRole("region", { name: "Proposed changes" });
    expect(container.querySelectorAll("[data-proposal]").length).toBe(3);
    expect(await axe(container)).toHaveNoViolations();

    // A rejected change is marked with pressed state and text, not colour.
    await user.click(screen.getAllByRole("button", { name: "Reject" })[0]!);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations when a request fails", async () => {
    const { container, user } = await setup(async () => false);

    await ask(user);
    await screen.findAllByText(
      "The assistant couldn't turn that into a filter. Try rephrasing.",
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
