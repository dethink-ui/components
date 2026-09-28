import { createFilterId } from "./filter-model";
import type { Filter, FilterNode } from "./filter-types";

function stable(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stable);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key, item]) => key !== "id" && item !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => [key, stable(item)]),
    );
  }

  return value;
}

/**
 * Content of a node without ids, as a string: equal signatures mean equal
 * filters. Key order and `undefined` properties do not matter.
 */
export function getFilterSignature(node: FilterNode) {
  return JSON.stringify(stable({ ...node, not: node.not || undefined }));
}

/**
 * Gives nodes of `next` the ids of matching nodes in `previous`, so a filter
 * rebuilt from text or an AI proposal keeps chip identity (React keys,
 * focus) for everything that did not change. The root keeps its id.
 * Unmatched nodes keep their own ids unless another node was given that id
 * (or it repeats), in which case they get fresh ids, so the result never
 * holds duplicates.
 */
export function reconcileFilterIds(
  next: Filter,
  previous: Filter,
  {
    createId = (node) =>
      createFilterId(node.type === "group" ? "group" : "condition"),
  }: {
    /**
     * Id for a node whose own id is taken. Defaults to a random id; pass a
     * deterministic one when the result is only compared, not stored.
     */
    createId?: (node: FilterNode) => string;
  } = {},
): Filter {
  const pool = new Map<string, string[]>();

  const collect = (node: FilterNode) => {
    if (node !== previous) {
      const signature = getFilterSignature(node);

      pool.set(signature, [...(pool.get(signature) ?? []), node.id]);
    }

    if (node.type === "group") {
      node.children.forEach(collect);
    }
  };

  collect(previous);

  // Pass 1: matches by content, in document order. A matched group's
  // children take its old children's ids by position (they are identical),
  // so identical siblings elsewhere never swap ids.
  const matched = new Map<FilterNode, string>();
  const taken = new Set<string>([previous.id]);
  const previousNodes = new Map<string, FilterNode>();

  const index = (node: FilterNode) => {
    previousNodes.set(node.id, node);

    if (node.type === "group") {
      node.children.forEach(index);
    }
  };

  index(previous);

  const pair = (node: FilterNode, id: string) => {
    matched.set(node, id);
    taken.add(id);

    const old = previousNodes.get(id);

    if (node.type === "group" && old?.type === "group") {
      node.children.forEach((child, position) => {
        const counterpart = old.children[position];

        if (counterpart && !taken.has(counterpart.id)) {
          pair(child, counterpart.id);
        }
      });
    }
  };

  // Groups first: their content is the most specific, and matching one
  // settles its whole subtree before loose conditions claim ids.
  const match = (node: FilterNode, groupsOnly: boolean) => {
    if (matched.has(node)) {
      return;
    }

    if (node.type === "condition" && groupsOnly) {
      return;
    }

    const id = (pool.get(getFilterSignature(node)) ?? []).find(
      (candidate) => !taken.has(candidate),
    );

    if (id) {
      pair(node, id);
      return;
    }

    if (node.type === "group") {
      node.children.forEach((child) => {
        match(child, groupsOnly);
      });
    }
  };

  next.children.forEach((child) => {
    match(child, true);
  });
  next.children.forEach((child) => {
    match(child, false);
  });

  // Pass 2: unmatched nodes keep their ids when those are still free.
  const used = new Set<string>(taken);

  const assign = <TNode extends FilterNode>(node: TNode): TNode => {
    let id = matched.get(node);

    if (id === undefined) {
      id = node.id;

      if (used.has(id)) {
        const base = createId(node);

        id = base;

        for (let suffix = 2; used.has(id); suffix += 1) {
          id = `${base}-${suffix}`;
        }
      }

      used.add(id);
    }

    const withId = id === node.id ? node : { ...node, id };

    return (
      withId.type === "group"
        ? { ...withId, children: withId.children.map(assign) }
        : withId
    ) as TNode;
  };

  return { ...next, id: previous.id, children: next.children.map(assign) };
}
