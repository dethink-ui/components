import {
  createFilter,
  createFilterCondition,
  type Filter,
  type FilterCondition,
  type FilterDateUnit,
  type FilterNode,
  type FilterValue,
} from ".";

/**
 * Seeded random filters over `queryFields` for property tests: awkward
 * strings, every built-in operator, custom operators, nesting and negation.
 */

/** Small seeded PRNG (mulberry32), so failures reproduce. */
export function random(seed: number) {
  let state = seed;

  const next = () => {
    state = (state + 0x6d2b79f5) | 0;

    let t = Math.imul(state ^ (state >>> 15), 1 | state);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) =>
    min + Math.floor(next() * (max - min + 1));
  const pick = <T>(items: readonly T[]): T => items[int(0, items.length - 1)]!;
  const some = <T>(items: readonly T[]) => {
    const chosen = items.filter(() => next() < 0.5);

    return chosen.length > 0 ? chosen : [pick(items)];
  };

  return { int, next, pick, some };
}

type Random = ReturnType<typeof random>;

// Awkward pieces: keywords, tokens, quotes, escapes, separators, unicode.
const PIECES = [
  "api",
  "OR",
  "AND",
  "empty",
  "!empty",
  "-",
  "--x",
  '"',
  "\\",
  "(",
  ")",
  ",",
  ":",
  "..",
  " ",
  "a b",
  "é",
  "日本",
  "@",
  "^",
  "$",
  "=",
  ">",
  "contains:",
  "is:",
  "today",
  "7d",
  "yes",
];

function text(rng: Random) {
  let value = "";

  for (let count = rng.int(1, 3); count > 0; count -= 1) {
    value += rng.pick(PIECES);
  }

  return value;
}

function number(rng: Random) {
  const value = rng.pick([
    () => rng.int(-1000, 1000),
    () => rng.int(-100000, 100000) / 100,
    () => rng.pick([1e21, 1.5e-7, -2.5e30, 0.1 + 0.2]),
  ])();

  return value === 0 ? 0 : value;
}

function date(
  rng: Random,
  units: readonly FilterDateUnit[] = ["day", "week", "month", "year"],
) {
  if (rng.next() < 0.5) {
    const day = new Date(
      Date.UTC(rng.int(1990, 2040), rng.int(0, 11), rng.int(1, 28)),
    );

    return { kind: "absolute" as const, date: day.toISOString().slice(0, 10) };
  }

  const amount = rng.int(-30, 30);

  return {
    kind: "relative" as const,
    amount: amount === 0 ? 0 : amount,
    unit: rng.pick(units),
  };
}

const STATUS = ["open", "blocked", "done", "in progress", "empty"];
const LABELS = ["bug", "ui", "api"];

export function randomCondition(rng: Random): FilterCondition {
  const [field, operator, value] = rng.pick<
    () => [string, string, FilterValue | undefined]
  >([
    () => [
      "title",
      rng.pick([
        "contains",
        "notContains",
        "is",
        "isNot",
        "startsWith",
        "endsWith",
      ]),
      text(rng),
    ],
    () => ["title", rng.pick(["isEmpty", "isNotEmpty"]), undefined],
    () => ["status", rng.pick(["isAnyOf", "isNoneOf"]), rng.some(STATUS)],
    () => [
      "labels",
      rng.pick(["includesAny", "includesAll", "excludesAll"]),
      rng.some(LABELS),
    ],
    () => [
      "amount",
      rng.pick(["eq", "neq", "gt", "gte", "lt", "lte"]),
      number(rng),
    ],
    () => ["amount", "between", [number(rng), number(rng)]],
    () => ["created", rng.pick(["is", "before", "after"]), date(rng)],
    () => ["created", "between", [date(rng), date(rng)]],
    () => [
      "created",
      rng.pick(["inLast", "inNext"]),
      {
        amount: rng.int(1, 90),
        unit: rng.pick(["day", "week", "month", "year"]),
      },
    ],
    () => ["created", "inPeriod", date(rng, ["week", "month", "year"])],
    () => ["created", rng.pick(["isEmpty", "isNotEmpty"]), undefined],
    () => ["urgent", "is", rng.next() < 0.5],
    // Custom operators: one with a token, one written by id.
    () => ["owner", "is", text(rng)],
    () => ["owner", "near", [text(rng), text(rng)]],
  ])();

  if (
    operator === "inPeriod" &&
    value &&
    typeof value === "object" &&
    "kind" in value &&
    value.kind === "absolute"
  ) {
    return randomCondition(rng);
  }

  return createFilterCondition({
    field,
    operator,
    value,
    not: rng.next() < 0.25,
  });
}

function node(rng: Random, depth: number): FilterNode {
  if (depth >= 3 || rng.next() < 0.65) {
    return randomCondition(rng);
  }

  return createFilter({
    combinator: rng.pick(["and", "or"] as const),
    not: rng.next() < 0.25,
    children: Array.from({ length: rng.int(0, 4) }, () => node(rng, depth + 1)),
  });
}

export function randomFilter(rng: Random): Filter {
  return createFilter({
    combinator: rng.pick(["and", "or"] as const),
    not: rng.next() < 0.15,
    children: Array.from({ length: rng.int(0, 5) }, () => node(rng, 1)),
  });
}
