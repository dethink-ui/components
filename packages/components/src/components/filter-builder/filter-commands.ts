import { createFilter, findFilterNode } from "./filter-model";
import type {
  Filter,
  FilterCombinator,
  FilterCondition,
  FilterGroup,
  FilterNode,
} from "./filter-types";

function mapGroups(
  group: FilterGroup,
  visit: (group: FilterGroup) => FilterGroup,
): FilterGroup {
  return visit({
    ...group,
    children: group.children.map((child) =>
      child.type === "group" ? mapGroups(child, visit) : child,
    ),
  });
}

export function addFilterNode(
  filter: Filter,
  node: FilterNode,
  { index, parentId = filter.id }: { index?: number; parentId?: string } = {},
): Filter {
  return mapGroups(filter, (group) => {
    if (group.id !== parentId) {
      return group;
    }

    const children = [...group.children];

    children.splice(index ?? children.length, 0, node);

    return { ...group, children };
  });
}

export function updateFilterCondition(
  filter: Filter,
  id: string,
  patch: Partial<Omit<FilterCondition, "id" | "type">>,
): Filter {
  return mapGroups(filter, (group) => ({
    ...group,
    children: group.children.map((child) => {
      if (child.type !== "condition" || child.id !== id) {
        return child;
      }

      const next: FilterCondition = { ...child, ...patch };

      if (patch.value === undefined && "value" in patch) {
        delete next.value;
      }

      if ("not" in patch && !patch.not) {
        delete next.not;
      }

      return next;
    }),
  }));
}

export function updateFilterGroup(
  filter: Filter,
  id: string,
  patch: Partial<Pick<FilterGroup, "combinator" | "not">>,
): Filter {
  return mapGroups(filter, (group) => {
    if (group.id !== id) {
      return group;
    }

    const next: FilterGroup = { ...group, ...patch };

    if ("not" in patch && !patch.not) {
      delete next.not;
    }

    return next;
  });
}

/**
 * Removes a node. Groups emptied by this removal are removed too, but groups
 * that were already empty (for example one just added in the editor) stay.
 */
export function removeFilterNode(filter: Filter, id: string): Filter {
  const prune = (group: FilterGroup): [FilterGroup, boolean] => {
    let removed = false;
    const children = group.children.flatMap((child): FilterNode[] => {
      if (child.id === id) {
        removed = true;
        return [];
      }

      if (child.type === "group") {
        const [next, removedInside] = prune(child);

        if (removedInside) {
          removed = true;

          return next.children.length === 0 ? [] : [next];
        }

        return [next];
      }

      return [child];
    });

    return [removed ? { ...group, children } : group, removed];
  };

  return prune(filter)[0];
}

/** Default number of group levels, counting the root group as level 1. */
export const DEFAULT_FILTER_MAX_DEPTH = 3;

/** Parent group of a node and its index there, or undefined for the root. */
export function findFilterParent(
  root: FilterGroup,
  id: string,
): { parent: FilterGroup; index: number } | undefined {
  const index = root.children.findIndex((child) => child.id === id);

  if (index !== -1) {
    return { parent: root, index };
  }

  for (const child of root.children) {
    if (child.type === "group") {
      const found = findFilterParent(child, id);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

/**
 * Group level of a node: the root group is 1, a group inside it is 2, and a
 * condition has the level of the group that holds it. Undefined if missing.
 */
export function getFilterNodeDepth(
  root: FilterGroup,
  id: string,
): number | undefined {
  const visit = (group: FilterGroup, depth: number): number | undefined => {
    if (group.id === id) {
      return depth;
    }

    for (const child of group.children) {
      if (child.id === id) {
        return child.type === "group" ? depth + 1 : depth;
      }

      if (child.type === "group") {
        const found = visit(child, depth + 1);

        if (found !== undefined) {
          return found;
        }
      }
    }

    return undefined;
  };

  return visit(root, 1);
}

/** Number of group levels in a node, counting the node itself if a group. */
export function getFilterHeight(node: FilterNode): number {
  return node.type === "condition"
    ? 0
    : 1 + Math.max(0, ...node.children.map(getFilterHeight));
}

/** Whether a new group can be added inside `parentId` within `maxDepth`. */
export function canAddFilterGroup(
  root: FilterGroup,
  parentId: string,
  maxDepth = DEFAULT_FILTER_MAX_DEPTH,
) {
  const depth = getFilterNodeDepth(root, parentId);

  return depth !== undefined && depth < maxDepth;
}

/** Whether `id` can be wrapped in a new group within `maxDepth`. */
export function canWrapFilterNode(
  root: FilterGroup,
  id: string,
  maxDepth = DEFAULT_FILTER_MAX_DEPTH,
) {
  const location = findFilterParent(root, id);
  const node = findFilterNode(root, id);

  if (!location || !node) {
    return false;
  }

  const parentDepth = getFilterNodeDepth(root, location.parent.id) ?? 1;

  // The new group sits one level below the parent, and a wrapped group's own
  // levels move down with it.
  return parentDepth + 1 + getFilterHeight(node) <= maxDepth;
}

/** Wraps a node in a new group that takes its place. */
export function wrapFilterNode(
  filter: Filter,
  id: string,
  {
    combinator = "and",
    groupId,
  }: { combinator?: FilterCombinator; groupId?: string } = {},
): Filter {
  const group = (child: FilterNode): FilterGroup =>
    createFilter({ id: groupId, combinator, children: [child] });

  return mapGroups(filter, (parent) =>
    parent.children.some((child) => child.id === id)
      ? {
          ...parent,
          children: parent.children.map((child) =>
            child.id === id ? group(child) : child,
          ),
        }
      : parent,
  );
}

/** Replaces a non-root group with its children. */
export function unwrapFilterGroup(filter: Filter, id: string): Filter {
  return mapGroups(filter, (parent) =>
    parent.children.some((child) => child.id === id)
      ? {
          ...parent,
          children: parent.children.flatMap((child) =>
            child.id === id && child.type === "group"
              ? child.children
              : [child],
          ),
        }
      : parent,
  );
}

/**
 * Moves a node to `parentId` at `index` (defaults to the end). Moving a group
 * into itself or its descendants is ignored.
 */
export function moveFilterNode(
  filter: Filter,
  id: string,
  { index, parentId }: { index?: number; parentId: string },
): Filter {
  const node = findFilterNode(filter, id);
  const location = findFilterParent(filter, id);
  const destination = findFilterNode(filter, parentId);

  // Validate the destination before detaching, so a bad target never drops
  // the node.
  if (
    !node ||
    !location ||
    destination?.type !== "group" ||
    (node.type === "group" && findFilterNode(node, parentId))
  ) {
    return filter;
  }

  const detached = mapGroups(filter, (group) =>
    group.id === location.parent.id
      ? {
          ...group,
          children: group.children.filter((child) => child.id !== id),
        }
      : group,
  );

  return addFilterNode(detached, node, { index, parentId });
}

/** Moves a node one place up or down among its siblings. */
export function shiftFilterNode(
  filter: Filter,
  id: string,
  offset: -1 | 1,
): Filter {
  const location = findFilterParent(filter, id);

  if (!location) {
    return filter;
  }

  const index = location.index + offset;

  if (index < 0 || index >= location.parent.children.length) {
    return filter;
  }

  return moveFilterNode(filter, id, { parentId: location.parent.id, index });
}

export function clearFilter(filter: Filter): Filter {
  return { ...filter, children: [] };
}

function withNot<TNode extends FilterNode>(node: TNode, not: boolean): TNode {
  const { not: _previous, ...rest } = node;

  return (not ? { ...rest, not: true } : rest) as TNode;
}

/**
 * Canonical form, the shape the text query parses to:
 * - empty non-root groups are removed;
 * - single-child groups are unwrapped, moving a group's negation onto the
 *   child;
 * - nested groups that share their parent's combinator are merged;
 * - a root holding one group takes that group's combinator and children,
 *   and a negated root holding one condition negates the condition instead;
 * - a root with at most one child uses "and", and `not: false` is dropped.
 */
export function normalizeFilter(filter: Filter): Filter {
  const normalizeChildren = (group: FilterGroup): FilterNode[] =>
    group.children.flatMap((child): FilterNode[] => {
      if (child.type === "condition") {
        return [withNot(child, Boolean(child.not))];
      }

      const children = normalizeChildren(child);
      const [only] = children;

      if (!only) {
        return [];
      }

      if (children.length === 1) {
        const unwrapped = withNot(
          only,
          Boolean(only.not) !== Boolean(child.not),
        );

        // The surfaced group may now share the parent's combinator.
        return unwrapped.type === "group" &&
          !unwrapped.not &&
          unwrapped.combinator === group.combinator
          ? unwrapped.children
          : [unwrapped];
      }

      if (!child.not && child.combinator === group.combinator) {
        return children;
      }

      return [withNot({ ...child, children }, Boolean(child.not))];
    });

  let root: Filter = withNot(
    { ...filter, children: normalizeChildren(filter) },
    Boolean(filter.not),
  );

  for (;;) {
    const [only, ...rest] = root.children;

    if (!only || rest.length > 0) {
      break;
    }

    if (only.type === "group") {
      root = withNot(
        { ...root, combinator: only.combinator, children: only.children },
        Boolean(root.not) !== Boolean(only.not),
      );
      continue;
    }

    if (root.not) {
      root = withNot({ ...root, children: [withNot(only, !only.not)] }, false);
    }

    break;
  }

  if (root.children.length <= 1) {
    root = withNot({ ...root, combinator: "and" }, Boolean(root.not));
  }

  return root.children.length === 0 ? withNot(root, false) : root;
}
