"use client";

import { Badge, Button, ScanGridBackground } from "@dethink/components";

export function ScanGridBackgroundBasic() {
  return (
    <ScanGridBackground
      className="border-border h-[24rem] rounded-lg border"
      tone="primary"
    >
      <div className="flex h-[24rem] flex-col items-center justify-center gap-4 px-6 text-center">
        <Badge tone="primary" variant="soft">
          Live status
        </Badge>
        <h2 className="text-foreground max-w-xl text-3xl font-semibold tracking-tight">
          Watch every deploy as it happens
        </h2>
        <p className="text-muted-foreground max-w-md text-sm leading-6">
          Observability surfaces that read as continuously monitored — the scan
          band sweeps the grid on a calm, linear loop.
        </p>
        <div className="flex gap-3">
          <Button>Start monitoring</Button>
          <Button variant="outline">View docs</Button>
        </div>
      </div>
    </ScanGridBackground>
  );
}
