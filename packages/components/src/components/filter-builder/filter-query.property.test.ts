import { describe, expect, it } from "vitest";
import {
  createFilter,
  normalizeFilter,
  parseFilterQuery,
  printFilterQuery,
} from ".";
import { queryFields, stripIds } from "./filter-query.fixtures";
import {
  random,
  randomCondition,
  randomFilter,
} from "./filter-query.generators";

describe("text query round trip", () => {
  it("parse(print(filter)) equals normalize(filter) for generated filters", () => {
    for (let seed = 1; seed <= 2000; seed += 1) {
      const ast = randomFilter(random(seed));
      const text = printFilterQuery(ast, queryFields);
      const parsed = parseFilterQuery(text, queryFields);

      if (!parsed.ok) {
        throw new Error(
          `seed ${seed}: ${parsed.error.message} in ${JSON.stringify(text)}`,
        );
      }

      expect(
        stripIds(parsed.filter),
        `seed ${seed}: ${JSON.stringify(text)}`,
      ).toEqual(stripIds(normalizeFilter(ast)));
      // Printing is stable once normalized.
      expect(printFilterQuery(parsed.filter, queryFields)).toBe(
        printFilterQuery(normalizeFilter(ast), queryFields),
      );
    }
  });

  it("keeps printed text within one term per condition", () => {
    const rng = random(7);

    for (let count = 0; count < 200; count += 1) {
      const single = createFilter({ children: [randomCondition(rng)] });
      const text = printFilterQuery(single, queryFields);
      const parsed = parseFilterQuery(text, queryFields);

      expect(parsed.ok && parsed.filter.children).toHaveLength(1);
    }
  });
});
