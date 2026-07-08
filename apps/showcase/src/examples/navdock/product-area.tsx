"use client";

import { NavDock, type NavDockItemData } from "@dethink/components";
import {
  BarChart3,
  Boxes,
  FlaskConical,
  Megaphone,
  RadioTower,
  ShieldCheck,
} from "lucide-react";

const iconProps = {
  "aria-hidden": true,
  absoluteStrokeWidth: true,
  strokeWidth: 2.1,
};

const items: NavDockItemData[] = [
  {
    href: "/product/analytics",
    icon: <BarChart3 {...iconProps} />,
    title: "Analytics",
    value: "analytics",
  },
  {
    href: "/product/workflows",
    icon: <Boxes {...iconProps} />,
    title: "Workflows",
    value: "workflows",
  },
  {
    href: "/product/labs",
    icon: <FlaskConical {...iconProps} />,
    title: "Labs",
    value: "labs",
  },
  {
    icon: <Megaphone {...iconProps} />,
    submenu: [
      {
        description: "Release notes and roadmap.",
        href: "/product/updates",
        title: "Product updates",
        value: "updates",
      },
      {
        badge: "live",
        description: "Service and incident history.",
        href: "https://status.example.com",
        title: "Status page",
        value: "status",
        external: true,
      },
    ],
    title: "Updates",
    value: "updates",
  },
  {
    href: "/product/security",
    icon: <ShieldCheck {...iconProps} />,
    title: "Security",
    value: "security",
  },
  {
    external: true,
    href: "https://status.example.com",
    icon: <RadioTower {...iconProps} />,
    title: "Status",
    value: "status",
  },
];

export function NavDockProductArea() {
  return (
    <div className="grid gap-6">
      <div className="border-border bg-muted/30 rounded-md border p-4">
        <div className="text-foreground text-sm font-semibold">
          Product operations
        </div>
        <p className="text-muted-foreground mt-1 max-w-lg text-sm leading-6">
          Route-derived current state can match exact pages or child routes
          without changing the dock interaction state.
        </p>
      </div>

      <div className="flex justify-center">
        <NavDock
          aria-label="Product area navigation"
          currentValue="/product/analytics/retention"
          isItemCurrent={(item, { currentValue }) => {
            if (!("href" in item) || !currentValue) {
              return undefined;
            }

            return currentValue === item.href ||
              currentValue.startsWith(`${item.href}/`)
              ? "location"
              : undefined;
          }}
          items={items}
          showTitle="always"
          variant="glass"
        />
      </div>
    </div>
  );
}
