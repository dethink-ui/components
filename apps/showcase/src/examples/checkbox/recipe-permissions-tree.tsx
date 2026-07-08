"use client";

import { useState } from "react";
import {
  Checkbox,
  Field,
  FieldControl,
  FieldLabel,
  type CheckboxCheckedState,
} from "@dethink/components";

const permissions = [
  { id: "read", label: "Read repositories" },
  { id: "write", label: "Write and push" },
  { id: "admin", label: "Manage settings" },
  { id: "billing", label: "View billing" },
];

/**
 * Classic tri-state pattern: the parent reflects its children — checked when
 * all are, unchecked when none are, and "indeterminate" in between — and
 * clicking it snaps the whole group to the obvious next state.
 */
export function CheckboxRecipePermissionsTree() {
  const [granted, setGranted] = useState<Set<string>>(new Set(["read"]));

  const parentState: CheckboxCheckedState =
    granted.size === 0
      ? false
      : granted.size === permissions.length
        ? true
        : "indeterminate";

  return (
    <div className="mx-auto max-w-sm space-y-3">
      <Field id="perm-all" orientation="horizontal">
        <FieldControl asChild>
          <Checkbox
            checked={parentState}
            onCheckedChange={() =>
              setGranted(
                parentState === true
                  ? new Set()
                  : new Set(permissions.map((permission) => permission.id)),
              )
            }
          />
        </FieldControl>
        <FieldLabel className="font-medium">All permissions</FieldLabel>
      </Field>
      <div className="border-border space-y-3 border-l pl-6">
        {permissions.map((permission) => (
          <Field
            key={permission.id}
            id={`perm-${permission.id}`}
            orientation="horizontal"
          >
            <FieldControl asChild>
              <Checkbox
                checked={granted.has(permission.id)}
                onCheckedChange={(checked) =>
                  setGranted((current) => {
                    const next = new Set(current);
                    if (checked === true) {
                      next.add(permission.id);
                    } else {
                      next.delete(permission.id);
                    }
                    return next;
                  })
                }
              />
            </FieldControl>
            <FieldLabel>{permission.label}</FieldLabel>
          </Field>
        ))}
      </div>
      <p className="text-muted-foreground text-sm">
        {granted.size} of {permissions.length} permissions granted
      </p>
    </div>
  );
}
