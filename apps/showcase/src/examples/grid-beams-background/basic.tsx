"use client";

import { Badge, Button, GridBeamsBackground } from "@dethink/components";

export function GridBeamsBackgroundBasic() {
  return (
    <GridBeamsBackground
      className="border-border h-[24rem] rounded-lg border"
      tone="primary"
    >
      <div className="flex h-[24rem] flex-col items-center justify-center gap-4 px-6 text-center">
        <Badge tone="primary" variant="soft">
          Now in beta
        </Badge>
        <h2 className="text-foreground max-w-xl text-3xl font-semibold tracking-tight">
          Ship dashboards your team actually trusts
        </h2>
        <p className="text-muted-foreground max-w-md text-sm leading-6">
          Production-grade components for SaaS, internal tools, and AI-native
          products — with the wiring already done.
        </p>
        <div className="flex gap-3">
          <Button>Get started</Button>
          <Button variant="outline">View docs</Button>
        </div>
      </div>
    </GridBeamsBackground>
  );
}
