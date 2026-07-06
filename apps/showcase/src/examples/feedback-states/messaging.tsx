"use client";

import { AlertTriangle, CheckCircle2, Inbox, UploadCloud } from "lucide-react";
import { Alert, Button, Callout, EmptyState } from "@dethink/components";

export function FeedbackMessaging() {
  return (
    <div className="grid gap-4">
      <Alert
        icon={<CheckCircle2 />}
        title="Deployment queued"
        description="The release will continue in the background."
        tone="success"
      />
      <Alert
        icon={<AlertTriangle />}
        title="Payment retry failed"
        description="Update the payment method before retrying the invoice."
        tone="destructive"
        urgency="assertive"
      />
      <Callout
        icon={<UploadCloud />}
        title="Large imports"
        description="Files over 100 MB continue processing after this panel closes."
      />
      <EmptyState
        visual={<Inbox />}
        title="No failed jobs"
        description="Background jobs that need attention will appear here."
        primaryAction={<Button variant="outline">Refresh</Button>}
        variant="table"
      />
    </div>
  );
}
