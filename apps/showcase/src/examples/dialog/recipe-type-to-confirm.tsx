"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Field,
  FieldControl,
  FieldLabel,
  Input,
} from "@dethink/components";

const PROJECT = "apollo-prod";

/**
 * Destructive confirmation that cannot be clicked through on autopilot:
 * the action stays disabled until the typed name matches exactly, and
 * closing resets the input.
 */
export function DialogRecipeTypeToConfirm() {
  const [typed, setTyped] = useState("");
  const confirmed = typed === PROJECT;

  return (
    <div className="flex justify-center">
      <AlertDialog onOpenChange={(open) => !open && setTyped("")}>
        <AlertDialogTrigger variant="destructive">
          Delete project…
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {PROJECT}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the project, its deployments, and all
              request logs. Type the project name to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-[var(--dt-space-6)] py-[var(--dt-space-2)]">
            <Field id="del-confirm">
              <FieldLabel>
                Type <span className="font-mono">{PROJECT}</span> to continue
              </FieldLabel>
              <FieldControl asChild>
                <Input
                  autoComplete="off"
                  value={typed}
                  onChange={(event) => setTyped(event.target.value)}
                />
              </FieldControl>
            </Field>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" isDisabled={!confirmed}>
              Delete forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
