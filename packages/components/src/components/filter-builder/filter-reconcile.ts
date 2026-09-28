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
 */
export function reconcileFilterIds(next: Filter, previous: Filter): Filter {
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

  const used = new Set<string>([previous.id]);

  const assign = <TNode extends FilterNode>(node: TNode): TNode => {
    const ids = pool.get(getFilterSignature(node)) ?? [];
    const id = ids.find((candidate) => !used.has(candidate));

    if (id) {
      used.add(id);
    }

    const withId = id ? { ...node, id } : node;

    return (
      withId.type === "group"
        ? { ...withId, children: withId.children.map(assign) }
        : withId
    ) as TNode;
  };

  return { ...next, id: previous.id, children: next.children.map(assign) };
}
