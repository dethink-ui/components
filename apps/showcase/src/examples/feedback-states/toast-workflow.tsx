"use client";

import { AlertTriangle, CheckCircle2, ListChecks } from "lucide-react";
import {
  Button,
  ToastProvider,
  ToastViewport,
  useToast,
} from "@dethink/components";

function ToastControls() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        leftIcon={<CheckCircle2 />}
        onClick={() =>
          toast({
            action: {
              label: "Undo",
              onClick: () => undefined,
            },
            description: "Workspace settings were saved.",
            title: "Saved",
            tone: "success",
          })
        }
      >
        Save
      </Button>
      <Button
        leftIcon={<AlertTriangle />}
        variant="outline"
        onClick={() =>
          toast({
            description: "The import worker stopped before finishing.",
            persistent: true,
            title: "Import failed",
            tone: "destructive",
          })
        }
      >
        Fail import
      </Button>
      <Button
        leftIcon={<ListChecks />}
        variant="outline"
        onClick={() =>
          toast({
            announcement: "CSV import is ready for review.",
            render: ({ dismiss }) => (
              <div className="grid gap-3">
                <div className="grid gap-1">
                  <div className="font-medium text-foreground">CSV import ready</div>
                  <div className="text-muted-foreground">
                    42 rows matched. 3 rows need review before publishing.
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={dismiss}>
                  Review later
                </Button>
              </div>
            ),
            tone: "info",
          })
        }
      >
        Custom toast
      </Button>
    </div>
  );
}

export function FeedbackToastWorkflow() {
  return (
    <div className="min-h-72">
      <ToastProvider motion="standard">
        <ToastControls />
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}
