import {
  addFilterNode,
  findFilterParent,
  moveFilterNode,
  updateFilterCondition,
  updateFilterGroup,
} from "./filter-commands";
import { diffFilter } from "./filter-describe";
import { findFilterNode, getFilterConditions } from "./filter-model";
import { reconcileFilterIds } from "./filter-reconcile";
import type { Filter, FilterGroup, FilterNode } from "./filter-types";

/**
 * A proposed filter as a list of reviewable changes against the current
 * one: conditions and groups added, removed or changed. Changes inside an
 * added or removed group belong to that group's change.
 */

export type FilterProposalChangeKind = "added" | "removed" | "changed";

export interface FilterProposalChange {
  /** The node's id: unique within one proposal. */
  id: string;
  kind: FilterProposalChangeKind;
  /** The node after the change, or the removed node. */
  node: FilterNode;
  /** The node before a change. */
  before?: FilterNode;
  /** Whether a condition (or one inside an added group) needs a value. */
  needsInput: boolean;
  /** A change to the root group's combinator or negation. */
  root?: boolean;
}

function parents(root: Filter) {
  const map = new Map<string, { parent: FilterGroup; index: number }>();

  const visit = (group: FilterGroup) => {
    group.children.forEach((child, index) => {
      map.set(child.id, { parent: group, index });

      if (child.type === "group") {
        visit(child);
      }
    });
  };

  visit(root);

  return map;
}

/** Removes a node without removing the groups it leaves empty. */
function detach(filter: Filter, id: string): Filter {
  const strip = (group: FilterGroup): FilterGroup => {
    let changed = false;
    const children = group.children.flatMap((child): FilterNode[] => {
      if (child.id === id) {
        changed = true;
        return [];
      }

      if (child.type === "group") {
        const next = strip(child);

        changed ||= next !== child;

        return [next];
      }

      return [child];
    });

    return changed ? { ...group, children } : group;
  };

  return strip(filter) as Filter;
}

/** Removes empty groups, except the root and groups in `keep`. */
function pruneEmpty(filter: Filter, keep: ReadonlySet<string>): Filter {
  const prune = (group: FilterGroup): FilterGroup => {
    let changed = false;
    const children = group.children.flatMap((child): FilterNode[] => {
      if (child.type !== "group") {
        return [child];
      }

      const next = prune(child);

      if (next.children.length === 0 && !keep.has(next.id)) {
        changed = true;
        return [];
      }

      changed ||= next !== child;

      return [next];
    });

    return changed ? { ...group, children } : group;
  };

  return prune(filter) as Filter;
}

function ids(node: FilterNode): string[] {
  return node.type === "group"
    ? [node.id, ...node.children.flatMap(ids)]
    : [node.id];
}

function contentChanged(before: FilterNode, after: FilterNode) {
  if (before.type !== after.type) {
    return true;
  }

  if (before.type === "group" && after.type === "group") {
    return (
      before.combinator !== after.combinator ||
      Boolean(before.not) !== Boolean(after.not)
    );
  }

  return (
    JSON.stringify([
      (before as { field: string }).field,
      (before as { operator: string }).operator,
      (before as { value?: unknown }).value ?? null,
      Boolean(before.not),
    ]) !==
    JSON.stringify([
      (after as { field: string }).field,
      (after as { operator: string }).operator,
      (after as { value?: unknown }).value ?? null,
      Boolean(after.not),
    ])
  );
}

/**
 * Gives a proposed filter the ids of `base` so changes read naturally:
 * identical nodes keep their ids (`reconcileFilterIds`), then each leftover
 * condition takes the id of an unmatched base condition on the same field,
 * so "Status is Open" → "Status is any of Open, Blocked" is one change, not
 * a removal and an addition.
 */
export function matchFilterProposalIds(proposed: Filter, base: Filter): Filter {
  const reconciled = reconcileFilterIds(proposed, base);
  const proposedIds = new Set(
    getFilterConditions(reconciled).map((condition) => condition.id),
  );
  const baseIds = new Set(getFilterConditions(base).map((node) => node.id));
  const spare = getFilterConditions(base).filter(
    (condition) => !proposedIds.has(condition.id),
  );
  const renames = new Map<string, string>();

  for (const condition of getFilterConditions(reconciled)) {
    if (baseIds.has(condition.id)) {
      continue;
    }

    const index = spare.findIndex(
      (candidate) => candidate.field === condition.field,
    );
    const match = spare[index];

    if (match) {
      renames.set(condition.id, match.id);
      spare.splice(index, 1);
    }
  }

  if (renames.size === 0) {
    return reconciled;
  }

  const rename = (node: FilterNode): FilterNode =>
    node.type === "group"
      ? { ...node, children: node.children.map(rename) }
      : { ...node, id: renames.get(node.id) ?? node.id };

  return rename(reconciled) as Filter;
}

/**
 * Reviewable changes from `base` to `proposed`, matched by node id (give
 * the proposal the base's ids first with `reconcileFilterIds`). Added and
 * changed nodes come in proposal order, then removed ones in base order.
 * A node that only moved to another group counts as changed.
 */
export function getFilterProposalChanges(
  base: Filter,
  proposed: Filter,
  needsInput: Iterable<string> = [],
): FilterProposalChange[] {
  const missing = new Set(needsInput);
  const diff = diffFilter(base, proposed);
  const added = new Set(diff.added.map((node) => node.id));
  const removed = new Set(diff.removed.map((node) => node.id));
  const baseParents = parents(base);
  const proposedParents = parents(proposed);
  const changes: FilterProposalChange[] = [];

  const visit = (group: FilterGroup) => {
    for (const node of group.children) {
      if (added.has(node.id)) {
        changes.push({
          id: node.id,
          kind: "added",
          node,
          needsInput: ids(node).some((id) => missing.has(id)),
        });
        continue;
      }

      const before = findFilterNode(base, node.id);
      const moved =
        baseParents.get(node.id)?.parent.id !==
        proposedParents.get(node.id)?.parent.id;

      if (before && (moved || contentChanged(before, node))) {
        changes.push({
          id: node.id,
          kind: "changed",
          node,
          before,
          needsInput: node.type === "condition" && missing.has(node.id),
        });
      }

      if (node.type === "group") {
        visit(node);
      }
    }
  };

  visit(proposed);

  const visitRemoved = (group: FilterGroup) => {
    for (const node of group.children) {
      if (removed.has(node.id)) {
        changes.push({ id: node.id, kind: "removed", node, needsInput: false });

        if (node.type === "group") {
          visitSurvivors(node);
        }
      } else if (node.type === "group") {
        visitRemoved(node);
      }
    }
  };

  // Groups that outlive a removed ancestor (they move out) may still lose
  // children of their own: list those removals too.
  const visitSurvivors = (group: FilterGroup) => {
    for (const node of group.children) {
      if (node.type !== "group") {
        continue;
      }

      if (removed.has(node.id)) {
        visitSurvivors(node);
      } else {
        visitRemoved(node);
      }
    }
  };

  visitRemoved(base);

  // Root combinator or negation changes.
  if (contentChanged(base, proposed)) {
    changes.unshift({
      id: proposed.id,
      kind: "changed",
      node: { ...proposed, id: base.id },
      before: base,
      needsInput: false,
      root: true,
    });
  }

  return changes;
}

/**
 * Applies accepted changes from a proposal onto `current` (which may have
 * moved on since the proposal was made): changes and moves, then removals,
 * then additions in proposal order. Additions go under their proposed parent
 * when it exists, else under the root.
 */
export function applyFilterProposalChanges(
  current: Filter,
  proposed: Filter,
  changes: readonly FilterProposalChange[],
): Filter {
  if (changes.length === 0) {
    return current;
  }

  let next = current;
  const proposedParents = parents(proposed);

  const place = (node: FilterNode) => {
    const location = proposedParents.get(node.id);
    const parentId =
      location && findFilterNode(next, location.parent.id)?.type === "group"
        ? location.parent.id
        : next.id;

    return { parentId, index: location?.index };
  };

  for (const change of changes) {
    if (change.kind !== "changed") {
      continue;
    }

    const { node } = change;

    if (node.type === "group") {
      // Detected by flag: the live root may have another id by now.
      if (change.root) {
        const { not: _not, ...root } = next;

        next = node.not
          ? { ...root, combinator: node.combinator, not: true }
          : { ...root, combinator: node.combinator };
      } else {
        next = updateFilterGroup(next, change.id, {
          combinator: node.combinator,
          not: node.not || undefined,
        });

        const target = place(node);

        // Groups move too (moveFilterNode refuses a move into itself).
        if (findFilterParent(next, node.id)?.parent.id !== target.parentId) {
          next = moveFilterNode(next, node.id, target);
        }
      }

      continue;
    }

    next = updateFilterCondition(next, node.id, {
      field: node.field,
      operator: node.operator,
      value: node.value,
      not: node.not,
    });

    const target = place(node);

    if (findFilterParent(next, node.id)?.parent.id !== target.parentId) {
      next = moveFilterNode(next, node.id, target);
    }
  }

  // After changes and moves, so a condition moved out of a removed group
  // isn't deleted with it.
  const proposedIds = new Set(ids(proposed));

  for (const change of changes) {
    if (change.kind !== "removed") {
      continue;
    }

    // Keep what the proposal keeps from inside a removed group, even when
    // its own change was rejected: move it out first, unchanged.
    const removedNode = findFilterNode(next, change.id);
    const survivors =
      removedNode?.type === "group"
        ? removedNode.children.flatMap(function keep(child): FilterNode[] {
            if (proposedIds.has(child.id)) {
              return [child];
            }

            return child.type === "group" ? child.children.flatMap(keep) : [];
          })
        : [];

    for (const survivor of survivors) {
      const target = place(survivor);

      next = moveFilterNode(next, survivor.id, {
        ...target,
        parentId: target.parentId === change.id ? next.id : target.parentId,
      });
    }

    next = detach(next, change.id);
  }

  for (const change of changes) {
    if (change.kind !== "added") {
      continue;
    }

    // Nodes the added group takes over leave their old places. Whatever
    // they held that the addition doesn't include stays where it was.
    const addedIds = new Set(ids(change.node));

    for (const id of addedIds) {
      const existing = findFilterNode(next, id);
      const location = findFilterParent(next, id);

      if (!existing || !location) {
        continue;
      }

      if (existing.type === "group") {
        const orphans: FilterNode[] = [];
        const walk = (group: FilterGroup) => {
          for (const child of group.children) {
            if (!addedIds.has(child.id)) {
              orphans.push(child);
            } else if (child.type === "group") {
              walk(child);
            }
          }
        };

        walk(existing);
        orphans.forEach((orphan, offset) => {
          next = moveFilterNode(next, orphan.id, {
            parentId: location.parent.id,
            index: location.index + 1 + offset,
          });
        });
      }

      next = detach(next, id);
    }

    next = addFilterNode(next, change.node, place(change.node));
  }

  // Groups left empty go, unless the proposal keeps them.
  return pruneEmpty(next, new Set(ids(proposed)));
}
