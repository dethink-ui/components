import { isValidElement, type ReactNode } from "react";

type SidebarShellPartName =
  "Navigation" | "Header" | "Main" | "Footer" | "SkipLink";
const SIDEBAR_SHELL_PART = Symbol.for("@dethink/sidebar-shell.part");

export function markSidebarShellPart(
  component: unknown,
  partName: SidebarShellPartName,
) {
  Object.defineProperty(component, SIDEBAR_SHELL_PART, {
    configurable: true,
    value: partName,
  });
}

export function getSidebarShellPart(child: ReactNode) {
  if (!isValidElement(child) || typeof child.type === "string")
    return undefined;
  return (child.type as { [SIDEBAR_SHELL_PART]?: SidebarShellPartName })[
    SIDEBAR_SHELL_PART
  ];
}
