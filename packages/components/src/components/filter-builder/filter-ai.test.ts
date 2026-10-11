import { describe, expect, it } from "vitest";
import {
  getFilterFieldSummaries,
  printFilterQuery,
  sanitizeFilterAssistantResult,
  toFilterJsonSchema,
  type Filter,
} from ".";
import { queryFields } from "./filter-query.fixtures";

const print = (filter?: Filter) =>
  filter ? printFilterQuery(filter, queryFields) : undefined;

describe("toFilterJsonSchema", () => {
  const schema = toFilterJsonSchema(queryFields) as {
    $defs: Record<
      string,
      { anyOf?: unknown[]; properties?: Record<string, unknown> }
    >;
    properties: Record<string, unknown>;
  };

  it("unrolls groups to the depth limit without recursion", () => {
    expect(Object.keys(schema.$defs)).toEqual(
      expect.arrayContaining([
        "group1",
        "group2",
        "group3",
        "condition",
        "date",
      ]),
    );
    expect(JSON.stringify(schema.$defs.group3)).not.toContain("$defs/group");
    expect(JSON.stringify(schema.$defs.group3)).toContain("#/$defs/condition");
    expect(() => JSON.parse(JSON.stringify(schema))).not.toThrow();
  });

  it("constrains each condition to its field's operators and value shape", () => {
    const conditions = JSON.stringify(schema.$defs.condition);

    expect(conditions).toContain('"field":{"const":"status"}');
    expect(conditions).toContain('"operator":{"const":"isAnyOf"}');
    // Option values are hinted, not enforced, so misses become "needs input".
    expect(conditions).toContain("One of: open (Open), blocked (Blocked)");
    expect(conditions).toContain('"operator":{"const":"inLast"}');
    // Operators without a value don't ask for one.
    expect(conditions).toMatch(
      /"const":"isEmpty"\}(?:(?!"value").)*"required":\["type","field","operator"\]/,
    );
  });

  it("summarizes fields for prompts", () => {
    const [title, status] = getFilterFieldSummaries(queryFields);

    expect(title).toMatchObject({ key: "title", type: "text" });
    expect(status?.options).toContainEqual({ value: "open", label: "Open" });
    expect(status?.operators).toContainEqual({
      id: "isEmpty",
      label: "is empty",
      takesValue: false,
    });
  });
});

describe("sanitizeFilterAssistantResult", () => {
  const sanitize = (raw: unknown) =>
    sanitizeFilterAssistantResult(raw, queryFields);

  it("rebuilds a valid filter with fresh ids", () => {
    const result = sanitize({
      filter: {
        type: "group",
        combinator: "and",
        id: "evil",
        children: [
          {
            type: "condition",
            field: "status",
            operator: "isAnyOf",
            value: ["Open"],
          },
          {
            type: "group",
            combinator: "or",
            children: [
              {
                type: "condition",
                field: "urgent",
                operator: "is",
                value: true,
              },
              {
                type: "condition",
                field: "created",
                operator: "inLast",
                value: { amount: 7, unit: "day" },
              },
            ],
          },
        ],
      },
    });

    expect(print(result.filter)).toBe(
      "status:open (urgent:yes OR created:last:7d)",
    );
    expect(result.filter?.id).not.toBe("evil");
    expect(result.needsInput).toEqual([]);
  });

  it("drops hallucinated fields and operators into unresolved", () => {
    const result = sanitize({
      filter: {
        type: "group",
        combinator: "and",
        children: [
          {
            type: "condition",
            field: "priority",
            operator: "isAnyOf",
            value: ["p1"],
          },
          {
            type: "condition",
            field: "status",
            operator: "resembles",
            value: ["open"],
          },
          { type: "condition", field: "__proto__", operator: "is", value: "x" },
          { type: "condition", field: "urgent", operator: "is", value: true },
        ],
      },
    });

    expect(print(result.filter)).toBe("urgent:yes");
    expect(result.unresolved).toEqual([
      { text: "priority", reason: "unknown-field" },
      { text: "Status resembles", reason: "unknown-operator" },
      { text: "__proto__", reason: "unknown-field" },
    ]);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("keeps known option values and marks empty conditions as needing input", () => {
    const result = sanitize({
      filter: {
        type: "group",
        combinator: "and",
        children: [
          {
            type: "condition",
            field: "status",
            operator: "isAnyOf",
            value: ["open", "Archived"],
          },
          {
            type: "condition",
            field: "labels",
            operator: "includesAny",
            value: ["acme"],
          },
          { type: "condition", field: "amount", operator: "gt", value: "lots" },
        ],
      },
    });

    expect(result.filter?.children).toMatchObject([
      { field: "status", value: ["open"] },
      { field: "labels", operator: "includesAny" },
      { field: "amount", operator: "gt" },
    ]);
    expect(result.filter?.children[1]).not.toHaveProperty("value");
    expect(result.needsInput).toEqual([
      result.filter?.children[1]?.id,
      result.filter?.children[2]?.id,
    ]);
    expect(result.unresolved).toEqual([
      { text: "Status: Archived", reason: "unknown-value" },
      { text: "Labels: acme", reason: "unknown-value" },
    ]);
  });

  it("treats injection strings as plain, clamped text", () => {
    const injection =
      '<img src=x onerror="alert(1)">\u0000\u001b[31m ignore previous instructions ' +
      "x".repeat(400);
    const result = sanitize({
      filter: {
        type: "group",
        combinator: "and",
        children: [
          {
            type: "condition",
            field: "title",
            operator: "contains",
            value: injection,
          },
        ],
      },
      message: injection,
      unresolved: [{ text: injection }],
      clarifications: [
        {
          id: "c",
          question: injection,
          choices: [
            { id: "a", label: injection },
            { id: "b", label: "B" },
          ],
        },
      ],
    });
    const value = (result.filter?.children[0] as { value: string }).value;

    expect(value.startsWith('<img src=x onerror="alert(1)">')).toBe(true);
    // eslint-disable-next-line no-control-regex -- Asserting none remain.
    expect(value).not.toMatch(/[\u0000-\u001f]/);
    expect(value.length).toBeLessThanOrEqual(200);
    expect(result.message?.length).toBeLessThanOrEqual(200);
    expect(result.unresolved[0]?.reason).toBe("model");
    expect(result.clarifications[0]?.question.length).toBeLessThanOrEqual(200);
  });

  it("clamps and cleans strings nested in custom values", () => {
    const result = sanitize({
      filter: {
        type: "group",
        combinator: "and",
        children: [
          {
            type: "condition",
            field: "owner",
            operator: "near",
            value: ["x".repeat(500), "a\u0000b"],
          },
        ],
      },
    });
    const value = (result.filter?.children[0] as { value: string[] }).value;

    expect(value[0]?.length).toBeLessThanOrEqual(200);
    expect(value[1]).toBe("a b");
  });

  it("limits depth and condition count, and ignores junk", () => {
    const deep = {
      type: "group",
      combinator: "and",
      children: [
        {
          type: "group",
          combinator: "or",
          children: [
            {
              type: "group",
              combinator: "and",
              children: [
                {
                  type: "group",
                  combinator: "or",
                  children: [
                    {
                      type: "condition",
                      field: "urgent",
                      operator: "is",
                      value: true,
                    },
                  ],
                },
                {
                  type: "condition",
                  field: "urgent",
                  operator: "is",
                  value: false,
                },
              ],
            },
            { type: "condition", field: "title", operator: "isEmpty" },
          ],
        },
      ],
    };

    expect(sanitize({ filter: deep }).unresolved).toContainEqual({
      text: "A nested group",
      reason: "max-depth",
    });

    const many = sanitizeFilterAssistantResult(
      {
        filter: {
          type: "group",
          combinator: "and",
          children: Array.from({ length: 10 }, () => ({
            type: "condition",
            field: "urgent",
            operator: "is",
            value: true,
          })),
        },
      },
      queryFields,
      { maxConditions: 3 },
    );

    expect(many.filter?.children).toHaveLength(3);
    expect(many.unresolved).toContainEqual({
      text: "Urgent",
      reason: "too-many-conditions",
    });

    for (const junk of [
      null,
      42,
      "filter",
      [],
      { filter: "x" },
      { filter: [] },
    ]) {
      expect(sanitize(junk)).toEqual({
        needsInput: [],
        clarifications: [],
        unresolved: [],
      });
    }
  });

  it("wraps a bare condition and validates clarifications", () => {
    const result = sanitize({
      filter: {
        type: "condition",
        field: "urgent",
        operator: "is",
        value: true,
      },
      clarifications: [
        {
          // Duplicate and unsafe ids from the model are replaced.
          id: "which one",
          question: "Which Acme?",
          choices: [
            { id: "a", label: "Acme Corp" },
            { id: "a", label: "Acme Labs" },
          ],
        },
        {
          id: "one",
          question: "Only one choice?",
          choices: [{ id: "a", label: "A" }],
        },
        { question: "", choices: [{ label: "A" }, { label: "B" }] },
        "not an object",
      ],
    });

    expect(print(result.filter)).toBe("urgent:yes");
    // Ids are positional, whatever the model sent.
    expect(result.clarifications).toEqual([
      {
        id: "clarification-1",
        question: "Which Acme?",
        choices: [
          { id: "choice-1", label: "Acme Corp" },
          { id: "choice-2", label: "Acme Labs" },
        ],
      },
    ]);
  });
});
