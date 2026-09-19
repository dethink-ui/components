"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@dethink/components";

export function DialogBasic() {
  return (
    <div className="flex justify-center">
      <Dialog>
        <DialogTrigger>Workspace settings</DialogTrigger>
        <DialogContent dismissible size="sm">
          <DialogHeader>
            <DialogTitle>Workspace settings</DialogTitle>
            <DialogDescription>
              Changes apply to every dashboard in this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)] text-sm">
            Focus is trapped inside; Escape or the backdrop dismisses, and focus
            returns to the trigger.
          </div>
          <DialogFooter>
            <DialogClose variant="outline">Cancel</DialogClose>
            <DialogClose variant="solid">Save changes</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
