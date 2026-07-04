"use client";

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
} from "@dethink/components";

export function DialogAlert() {
  return (
    <div className="flex justify-center">
      <AlertDialog>
        <AlertDialogTrigger variant="destructive">
          Revoke all sessions
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke all sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              Every device is signed out immediately, including this one.
              AlertDialog blocks backdrop dismissal so the choice is explicit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep sessions</AlertDialogCancel>
            <AlertDialogAction variant="destructive">
              Revoke everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
