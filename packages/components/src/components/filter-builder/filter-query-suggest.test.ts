import { describe, expect, it } from "vitest";
import {
  getFilterQuerySegments,
  getFilterQuerySuggestions,
  parseFilterQuery,
} from ".";
import { queryFields } from "./filter-query.fixtures";

/** Suggestions at the "|" in `text`. */
function suggest(text: string) {
  const caret = text.indexOf("|");

  return getFilterQuerySuggestions(text.replace("|", ""), caret, queryFields);
}

function apply(text: string, id: string) {
  const plain = text.replace("|", "");
  const suggestion = suggest(text).find((candidate) => candidate.id === id);

  if (!suggestion) {
    throw new Error(`No suggestion ${id}`);
  }

  return (
    plain.slice(0, suggestion.start) +
    suggestion.insert +
    plain.slice(suggestion.end)
  );
}

describe("getFilterQuerySuggestions", () => {
  it("suggests fields for a new or partial word", () => {
    expect(suggest("|").map((item) => item.id)).toHaveLength(
      queryFields.length,
    );
    expect(suggest("st|").map((item) => item.label)).toEqual(["Status"]);
    expect(apply("status:open cr|", "field:created")).toBe(
      "status:open created:",
    );
    // Editing the field of an existing term keeps its value.
    expect(apply("sta|:open", "field:status")).toBe("status:open");
  });

  it("suggests values and operators after field:", () => {
    const afterColon = suggest("status:|");

    expect(
      afterColon
        .filter((item) => item.kind === "value")
        .map((item) => item.label),
    ).toEqual(["Open", "Blocked", "Done", "In progress", "Empty"]);
    expect(
      afterColon
        .filter((item) => item.kind === "operator")
        .map((item) => item.detail),
    ).toEqual(["!", "empty", "!empty"]);
    expect(apply("status:|", "value:open")).toBe("status:open");
    expect(apply("status:open,in|", 'value:"in progress"')).toBe(
      'status:open,"in progress"',
    );
    // Values already listed are not offered again.
    expect(
      suggest("status:open,|").some((item) => item.id === "value:open"),
    ).toBe(false);
    expect(apply("status:!|", "value:done")).toBe("status:!done");
  });

  it("quotes values that would read as an operator token", () => {
    // Bare "empty" is the "is empty" operator, so the option is quoted.
    expect(apply("status:e|", 'value:"empty"')).toBe('status:"empty"');

    const parsed = parseFilterQuery('status:"empty"', queryFields);

    expect(parsed.ok && parsed.filter.children[0]).toMatchObject({
      operator: "isAnyOf",
      value: ["empty"],
    });
    // Later in a list it can't be read as a token, so it stays bare.
    expect(apply("status:open,e|", "value:empty")).toBe("status:open,empty");
  });

  it("completes operator tokens and typed presets", () => {
    expect(
      suggest("amount:>|").map((item) => `${item.kind}:${item.detail}`),
    ).toEqual(["operator:>="]);
    expect(apply("urgent:y|", "value:yes")).toBe("urgent:yes");
    expect(
      suggest("created:last:|")
        .filter((item) => item.kind === "value")
        .map((item) => item.detail),
    ).toEqual(["7d", "30d", "1w", "3m"]);
    expect(
      suggest("created:in:|")
        .filter((item) => item.kind === "value")
        .map((item) => item.label),
    ).toContain("this week");
    expect(suggest("owner:|").map((item) => item.detail)).toEqual([
      "@",
      "near:",
    ]);
  });

  it("offers nothing inside quotes or for unknown fields", () => {
    expect(suggest('"lo|')).toEqual([]);
    expect(suggest("nope:|")).toEqual([]);
  });
});

describe("getFilterQuerySegments", () => {
  it("marks fields, operators, values, keywords, negation and parens", () => {
    const text = '-(status:!done OR amount:>5) login "a b"';

    expect(
      getFilterQuerySegments(text, queryFields).map(
        (segment) =>
          `${segment.kind}:${text.slice(segment.start, segment.end)}`,
      ),
    ).toEqual([
      "negation:-",
      "paren:(",
      "field:status:",
      "operator:!",
      "value:done",
      "keyword:OR",
      "field:amount:",
      "operator:>",
      "value:5",
      "paren:)",
      "text:login",
      'text:"a b"',
    ]);
  });
});
