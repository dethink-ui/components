"use client";

import { Breadcrumb } from "@dethink/components";

export function BreadcrumbBasic() {
  return (
    <div className="grid gap-5">
      <Breadcrumb
        items={[
          { key: "home", label: "Home", href: "/" },
          { key: "workspaces", label: "Workspaces", href: "/workspaces" },
          { key: "operations", label: "Operations" },
        ]}
      />
      <Breadcrumb
        separator="slash"
        size="sm"
        items={[
          { key: "settings", label: "Settings", href: "/settings" },
          { key: "access", label: "Access", href: "/settings/access" },
          { key: "sso", label: "SSO policy" },
        ]}
      />
      <Breadcrumb
        separator="dot"
        size="lg"
        items={[
          { key: "reports", label: "Reports", href: "/reports" },
          { key: "pipeline", label: "Pipeline", href: "/reports/pipeline" },
          { key: "detail", label: "Revenue detail" },
        ]}
      />
      <Breadcrumb
        separator={
          <span className="font-mono text-[0.7em] font-semibold text-info">
            {"<>"}
          </span>
        }
        items={[
          { key: "teams", label: "Teams", href: "/teams" },
          { key: "permissions", label: "Permissions", href: "/teams/permissions" },
          { key: "audit", label: "Audit trail" },
        ]}
      />
    </div>
  );
}
