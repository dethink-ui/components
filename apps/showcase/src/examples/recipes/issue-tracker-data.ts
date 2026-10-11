import {
  createFilter,
  createFilterCondition,
  defineFilterFields,
  type FilterAssistantRequest,
  type FilterAssistantResult,
  type SavedView,
} from "@dethink/components";

export type IssueStatus =
  "backlog" | "todo" | "in-progress" | "in-review" | "done";
export type IssuePriority = "urgent" | "high" | "medium" | "low";

export type Issue = {
  key: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: string;
  labels: string[];
  estimate: number;
  updated: string;
  customer: boolean;
};

/** A fixed "today" keeps relative dates identical on server and client. */
export const ISSUES_NOW = Date.UTC(2026, 8, 30, 12);
export const issueEvaluateOptions = { now: ISSUES_NOW, timeZone: "UTC" };

export const people = ["Ada", "Lin", "Sam", "Noor", "Kai"];

const titles = [
  "Checkout fails for saved cards",
  "Search results miss archived projects",
  "Invite email lands in spam",
  "Dark mode contrast on charts",
  "Rate limit headers for public API",
  "SSO loop on Safari",
  "Export to CSV drops unicode",
  "Slow dashboard on large workspaces",
  "Billing page shows wrong currency",
  "Keyboard trap in date picker",
  "Webhook retries flood the queue",
  "Onboarding checklist resets",
];
const labelSets = [
  ["bug"],
  ["bug", "billing"],
  ["feature"],
  ["bug", "a11y"],
  ["api"],
  ["bug", "auth"],
  ["feature", "api"],
  ["performance"],
];
const statuses: IssueStatus[] = [
  "backlog",
  "todo",
  "in-progress",
  "in-review",
  "done",
];
const priorities: IssuePriority[] = ["urgent", "high", "medium", "low"];

export const issues: Issue[] = Array.from({ length: 64 }, (_, index) => {
  const day = new Date(ISSUES_NOW - ((index * 37) % 40) * 86_400_000);

  return {
    key: `DT-${400 + index}`,
    title: `${titles[index % titles.length]}${index >= titles.length ? ` (${Math.floor(index / titles.length) + 1})` : ""}`,
    status: statuses[(index * 3) % statuses.length] ?? "todo",
    priority: priorities[(index * 7) % priorities.length] ?? "medium",
    assignee: people[(index * 3) % people.length] ?? "Ada",
    labels: labelSets[index % labelSets.length] ?? [],
    estimate: [1, 2, 3, 5, 8, 13][(index * 11) % 6] ?? 3,
    updated: day.toISOString().slice(0, 10),
    customer: index % 3 === 0,
  };
});

export const issueFields = defineFilterFields<Issue>([
  { key: "title", label: "Title", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "option",
    options: [
      { value: "backlog", label: "Backlog" },
      { value: "todo", label: "Todo" },
      { value: "in-progress", label: "In progress" },
      { value: "in-review", label: "In review" },
      { value: "done", label: "Done" },
    ],
  },
  {
    key: "priority",
    label: "Priority",
    type: "option",
    options: priorities.map((value) => ({
      value,
      label: value[0]?.toUpperCase() + value.slice(1),
    })),
  },
  {
    key: "assignee",
    label: "Assignee",
    type: "option",
    options: people.map((name) => ({ value: name.toLowerCase(), label: name })),
    accessor: (issue) => issue.assignee.toLowerCase(),
  },
  {
    key: "labels",
    label: "Labels",
    type: "multiOption",
    options: [
      "bug",
      "feature",
      "api",
      "billing",
      "auth",
      "a11y",
      "performance",
    ].map((value) => ({ value, label: value })),
  },
  { key: "estimate", label: "Estimate", type: "number" },
  { key: "updated", label: "Updated", type: "date" },
  { key: "customer", label: "Customer reported", type: "boolean" },
]);

const open = createFilterCondition({
  field: "status",
  operator: "isNoneOf",
  value: ["done"],
});

export const initialIssueViews: SavedView[] = [
  {
    id: "my-work",
    name: "Ada's open work",
    version: 1,
    scope: "personal",
    filter: createFilter({
      children: [
        open,
        createFilterCondition({
          field: "assignee",
          operator: "isAnyOf",
          value: ["ada"],
        }),
      ],
    }),
  },
  {
    id: "bug-triage",
    name: "Bug triage",
    version: 1,
    scope: "team",
    filter: createFilter({
      children: [
        createFilterCondition({
          field: "labels",
          operator: "includesAny",
          value: ["bug"],
        }),
        createFilterCondition({
          field: "status",
          operator: "isAnyOf",
          value: ["backlog", "todo"],
        }),
      ],
    }),
  },
  {
    id: "customer-urgent",
    name: "Customer or urgent",
    version: 1,
    scope: "team",
    filter: createFilter({
      children: [
        open,
        createFilter({
          combinator: "or",
          children: [
            createFilterCondition({
              field: "customer",
              operator: "is",
              value: true,
            }),
            createFilterCondition({
              field: "priority",
              operator: "isAnyOf",
              value: ["urgent"],
            }),
          ],
        }),
      ],
    }),
  },
];

/**
 * A stand-in for a model, so the recipe works offline. "mine" asks who you
 * are instead of guessing.
 */
export async function issueAssistant({
  answers,
  current,
  prompt,
  signal,
}: FilterAssistantRequest): Promise<FilterAssistantResult | false> {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 600);

    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  const text =
    `${prompt} ${answers.map((item) => item.answer).join(" ")}`.toLowerCase();
  const has = (...words: string[]) => words.some((word) => text.includes(word));

  if (has("mine", "my ") && answers.length === 0) {
    return {
      clarifications: [
        {
          id: "who",
          question: "Whose issues?",
          choices: people
            .slice(0, 4)
            .map((name) => ({ id: name, label: name })),
        },
      ],
    };
  }

  const children: Record<string, unknown>[] = [];
  const statusWords: [string, string][] = [
    ["backlog", "backlog"],
    ["todo", "todo"],
    ["in progress", "in-progress"],
    ["review", "in-review"],
    ["done", "done"],
  ];
  const wanted = statusWords.flatMap(([word, value]) =>
    has(word) ? [value] : [],
  );

  if (has("open", "unfinished")) {
    children.push({
      type: "condition",
      field: "status",
      operator: "isNoneOf",
      value: ["done"],
    });
  } else if (wanted.length > 0) {
    children.push({
      type: "condition",
      field: "status",
      operator: "isAnyOf",
      value: wanted,
    });
  }

  const urgency = priorities.filter((value) => has(value));

  if (urgency.length > 0) {
    children.push({
      type: "condition",
      field: "priority",
      operator: "isAnyOf",
      value: urgency,
    });
  }

  const names = people.filter((name) => has(name.toLowerCase()));

  if (names.length > 0) {
    children.push({
      type: "condition",
      field: "assignee",
      operator: "isAnyOf",
      value: names.map((name) => name.toLowerCase()),
    });
  }

  const labels = [
    "bug",
    "feature",
    "api",
    "billing",
    "auth",
    "a11y",
    "performance",
    "mobile",
  ].filter((label) => has(label));

  if (labels.length > 0) {
    children.push({
      type: "condition",
      field: "labels",
      operator: "includesAny",
      value: labels,
    });
  }

  if (has("big", "large")) {
    children.push({
      type: "condition",
      field: "estimate",
      operator: "gte",
      value: 5,
    });
  }

  if (has("this week", "recent")) {
    children.push({
      type: "condition",
      field: "updated",
      operator: "inLast",
      value: { amount: 7, unit: "day" },
    });
  }

  if (has("customer")) {
    children.push({
      type: "condition",
      field: "customer",
      operator: "is",
      value: true,
    });
  }

  if (children.length === 0) {
    return false;
  }

  const touched = new Set(children.map((child) => String(child.field)));
  const kept = current.children.filter(
    (node) => node.type !== "condition" || !touched.has(node.field),
  );

  return {
    filter: {
      type: "group",
      combinator: "and",
      children: [...kept, ...children],
    },
  };
}
