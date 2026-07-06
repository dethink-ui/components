"use client";

import { Breadcrumb } from "@dethink/components";

export function BreadcrumbOverflowExample() {
  return (
    <Breadcrumb
      maxItems={4}
      overflowLabel="Show hidden breadcrumb items"
      items={[
        { key: "home", label: "Home", href: "/" },
        { key: "platform", label: "Platform", href: "/platform" },
        { key: "workspaces", label: "Workspaces", href: "/platform/workspaces" },
        {
          key: "operations",
          label: "Operations",
          href: "/platform/workspaces/operations",
        },
        {
          key: "reports",
          label: "Reports",
          href: "/platform/workspaces/operations/reports",
        },
        { key: "current", label: "Revenue pipeline detail" },
      ]}
    />
  );
}
