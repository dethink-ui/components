import type {
  FilterAssistantRequest,
  FilterAssistantResult,
} from "@dethink/components";

/**
 * A stand-in for a model, so the example works offline: keyword rules that
 * answer in the same shape a real model would (see the docs for an AI SDK
 * version). It also shows a clarification, a field that doesn't exist and a
 * value it can't match.
 */
export async function demoResolve({
  answers,
  current,
  prompt,
  signal,
}: FilterAssistantRequest): Promise<FilterAssistantResult | false> {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 700);

    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  const text =
    `${prompt} ${answers.map((item) => item.answer).join(" ")}`.toLowerCase();
  const has = (...words: string[]) => words.some((word) => text.includes(word));
  const children: unknown[] = [];
  const unresolved: { text: string }[] = [];

  if (has("customer") && answers.length === 0) {
    return {
      clarifications: [
        {
          id: "who",
          question: "Which issues do you mean?",
          choices: [
            { id: "reported", label: "Reported by customers" },
            { id: "internal", label: "Found internally" },
          ],
        },
      ],
    };
  }

  const statuses = ["open", "blocked", "done"].filter((status) => has(status));

  if (statuses.length > 0) {
    children.push({
      type: "condition",
      field: "status",
      operator: "isAnyOf",
      value: statuses,
    });
  }

  const labels = [
    ["bug", "bug"],
    ["api", "api"],
    ["billing", "billing"],
    ["auth", "auth"],
    // Not a label in this data set: becomes "needs input".
    ["mobile", "mobile"],
  ].flatMap(([word, value]) => (has(word ?? "") ? [value] : []));

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

  if (has("last week", "this week", "recent")) {
    children.push({
      type: "condition",
      field: "created",
      operator: "inLast",
      value: { amount: 7, unit: "day" },
    });
  }

  if (has("reported by customers")) {
    children.push({
      type: "condition",
      field: "customer",
      operator: "is",
      value: true,
    });
  } else if (has("found internally")) {
    children.push({
      type: "condition",
      field: "customer",
      operator: "is",
      value: false,
    });
  }

  if (has("ada", "lin", "sam")) {
    const people = ["ada", "lin", "sam"].filter((name) => has(name));

    children.push({
      type: "group",
      combinator: "or",
      children: people.map((name) => ({
        type: "condition",
        field: "assignee",
        operator: "is",
        value: name[0]?.toUpperCase() + name.slice(1),
      })),
    });
  }

  if (has("priority", "p1")) {
    // A field that doesn't exist, as a model might invent.
    children.push({
      type: "condition",
      field: "priority",
      operator: "is",
      value: "p1",
    });
  }

  if (has("sentiment", "angry")) {
    unresolved.push({ text: "customer sentiment" });
  }

  if (children.length === 0 && unresolved.length === 0) {
    return false;
  }

  // The answer is the complete filter, so keep what the request didn't
  // mention, as a real model would from `current`.
  const mentioned = new Set(
    children.flatMap((child) =>
      typeof child === "object" && child !== null && "field" in child
        ? [String(child.field)]
        : [],
    ),
  );
  const kept = current.children.filter(
    (node) => node.type !== "condition" || !mentioned.has(node.field),
  );

  return {
    filter: {
      type: "group",
      combinator: "and",
      children: [...kept, ...children],
    },
    unresolved,
  };
}
