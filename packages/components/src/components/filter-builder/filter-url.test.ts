import { describe, expect, it } from "vitest";
import {
  createFilter,
  createFilterCondition,
  decodeFilterParam,
  encodeFilterParam,
  formatFilterSearch,
  normalizeFilter,
  readFilterParam,
  renameFilterField,
  type Filter,
} from ".";
import { queryFields, stripIds } from "./filter-query.fixtures";
import { random, randomFilter } from "./filter-query.generators";

const statusFilter = () =>
  createFilter({
    children: [
      createFilterCondition({
        field: "status",
        operator: "isAnyOf",
        value: ["open", "in progress"],
      }),
      createFilterCondition({
        field: "created",
        operator: "after",
        value: { kind: "relative", amount: -7, unit: "day" },
      }),
    ],
  });

function decoded(search: string, options = {}) {
  const result = decodeFilterParam(search, queryFields, options);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return result;
}

describe("encodeFilterParam / decodeFilterParam", () => {
  it("writes readable text and a version, keeping other params", () => {
    const params = encodeFilterParam(
      statusFilter(),
      queryFields,
      { version: 2 },
      "?page=3&q=old",
    );

    expect(params.get("page")).toBe("3");
    expect(params.get("q")).toBe('status:open,"in progress" created:>-7d');
    expect(params.get("v")).toBe("2");
    expect(formatFilterSearch(params)).toBe(
      "?page=3&q=status:open,%22in+progress%22+created:%3E-7d&v=2",
    );
  });

  it("removes both params for an empty filter", () => {
    const params = encodeFilterParam(
      createFilter(),
      queryFields,
      {},
      "?q=a&v=1&x=1",
    );

    expect(formatFilterSearch(params)).toBe("?x=1");
    expect(formatFilterSearch(new URLSearchParams())).toBe("");
  });

  it("uses custom param names", () => {
    const params = encodeFilterParam(statusFilter(), queryFields, {
      param: "filter",
      versionParam: "fv",
    });

    expect([...params.keys()]).toEqual(["filter", "fv"]);
    expect(
      stripIds(
        decoded(params.toString(), { param: "filter", versionParam: "fv" })
          .filter,
      ),
    ).toEqual(stripIds(normalizeFilter(statusFilter())));
  });

  it("round-trips generated filters through a real URL", () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      const filter = randomFilter(random(seed));
      const search = formatFilterSearch(
        encodeFilterParam(filter, queryFields, { version: 3 }, "?tab=a"),
      );
      // Through the URL parser, as a browser would read it back.
      const url = new URL(`https://example.com/issues${search}#section`);
      const result = decodeFilterParam(url.search, queryFields, {
        version: 3,
      });

      expect(result.ok, `seed ${seed}: ${search}`).toBe(true);
      expect(result.ok && stripIds(result.filter), `seed ${seed}`).toEqual(
        stripIds(normalizeFilter(filter)),
      );
      expect(url.searchParams.get("tab")).toBe("a");
    }
  });

  it("reads a missing query as empty and a missing version as current", () => {
    expect(decoded("").filter.children).toEqual([]);
    expect(decoded("?q=status:open", { version: 4 })).toMatchObject({
      version: 4,
      migrated: false,
    });
  });

  it("rejects bad versions, bad text and filters the schema can't hold", () => {
    const code = (search: string, options = {}) => {
      const result = decodeFilterParam(search, queryFields, options);

      return result.ok ? "ok" : result.error.code;
    };

    expect(code("?q=a&v=x")).toBe("invalid-version");
    expect(code("?q=a&v=0")).toBe("invalid-version");
    expect(code("?q=a&v=3", { version: 2 })).toBe("future-version");
    expect(code("?q=nope:1")).toBe("invalid-query");
    expect(code(`?q=${encodeURIComponent("a (b OR (c (d OR e)))")}`)).toBe(
      "invalid-query",
    );

    const result = decodeFilterParam("?q=(a", queryFields);

    expect(!result.ok && result.error.query).toMatchObject({
      code: "unclosed-group",
      start: 0,
    });
    const fallback = statusFilter();

    expect(readFilterParam("?q=(a", queryFields, {}, fallback)).toBe(fallback);
  });
});

describe("migrations", () => {
  // Version 1 called the owner field "assignee" and its operator "eq".
  const v1Fields = queryFields.map((field) =>
    field.key === "owner" ? { ...field, key: "assignee" } : field,
  );
  const options = {
    version: 2,
    fieldsAt: (version: number) => (version === 1 ? v1Fields : queryFields),
    migrate: (filter: Filter, from: number) =>
      from < 2 ? renameFilterField(filter, "assignee", "owner") : filter,
  };

  it("migrates a renamed field from an older link", () => {
    const result = decoded("?q=assignee:@ada+status:open&v=1", options);

    expect(result).toMatchObject({ version: 1, migrated: true });
    expect(stripIds(result.filter)).toMatchObject({
      children: [
        { field: "owner", operator: "is", value: "ada" },
        { field: "status", operator: "isAnyOf", value: ["open"] },
      ],
    });
    // Current links use the new key.
    expect(decoded("?q=owner:@ada&v=2", options).migrated).toBe(false);
  });

  it("rejects an old link when migration leaves an unknown field", () => {
    const result = decodeFilterParam("?q=assignee:@ada&v=1", queryFields, {
      ...options,
      migrate: (filter: Filter) => filter,
    });

    expect(!result.ok && result.error.code).toBe("invalid-filter");
  });

  it("renames operators with the field", () => {
    const renamed = renameFilterField(
      createFilter({
        children: [
          createFilterCondition({
            field: "assignee",
            operator: "eq",
            value: "ada",
          }),
          createFilterCondition({ field: "title", operator: "eq", value: "x" }),
        ],
      }),
      "assignee",
      "owner",
      { eq: "is" },
    );

    expect(renamed.children).toMatchObject([
      { field: "owner", operator: "is" },
      { field: "title", operator: "eq" },
    ]);
  });
});
