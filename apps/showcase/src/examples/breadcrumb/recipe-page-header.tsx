"use client";

import { Breadcrumb, Button } from "@dethink/components";

export function BreadcrumbRecipePageHeader() {
  return (
    <div className="border-border bg-card grid gap-4 rounded-lg border p-4">
      <Breadcrumb
        size="sm"
        maxItems={4}
        items={[
          { key: "home", label: "Home", href: "/" },
          { key: "customers", label: "Customers", href: "/customers" },
          {
            key: "enterprise",
            label: "Enterprise",
            href: "/customers/enterprise",
          },
          {
            key: "accounts",
            label: "Accounts",
            href: "/customers/enterprise/accounts",
          },
          { key: "current", label: "Acme Operations" },
        ]}
      />
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h3 className="font-heading text-foreground truncate text-2xl font-semibold tracking-tight">
            Acme Operations
          </h3>
          <p className="text-muted-foreground max-w-2xl text-sm leading-6">
            Contract renewal, usage limits, support tier, and workspace access
            for the enterprise account.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline">Export</Button>
          <Button>Open record</Button>
        </div>
      </div>
    </div>
  );
}
