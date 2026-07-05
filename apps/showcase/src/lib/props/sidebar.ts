import type { PropRow } from "@/components/props-table";

export const sidebarProps: PropRow[] = [
  {
    prop: "SidebarProvider",
    type: "{ animate, collapsed, defaultCollapsed, onCollapsedChange, mobileOpen, defaultMobileOpen, onMobileOpenChange, side, variant, motion }",
    defaultValue: "—",
    description:
      "Owns desktop collapsed state, mobile drawer state, side placement, visual variant, animation opt-out, and motion preset.",
  },
  {
    prop: "Sidebar",
    type: "nav attributes + { side, variant }",
    defaultValue: 'aria-label="Sidebar"',
    description:
      "The labelled navigation landmark. Side and variant default from the provider but can be overridden.",
  },
  {
    prop: "SidebarMenuLink",
    type: "{ href, current, active, disabled, external, asChild, icon, description, badge, shortcut, tooltip }",
    defaultValue: "—",
    description:
      "Navigation item rendered as a real link by default, with aria-current and data-state hooks for current route styling. Current items render an animated selection indicator; collapsed items expose a CSS-only tooltip (string labels are used automatically, or pass tooltip), a badge dot, and an initial fallback when no icon is given.",
  },
  {
    prop: "SidebarMenuAction",
    type: "{ label, showOnHover }",
    defaultValue: "showOnHover: false",
    description:
      "Icon-sized secondary action. With showOnHover it positions itself at the end of the parent SidebarMenuItem row and reveals on row hover, focus-within, or its own focus.",
  },
  {
    prop: "SidebarSeparator",
    type: "div attributes",
    defaultValue: "—",
    description: "Decorative token-backed rule for dividing sidebar sections.",
  },
  {
    prop: "SidebarGroup",
    type: "{ collapsible, open, defaultOpen, onOpenChange }",
    defaultValue: "defaultOpen: true",
    description:
      "Groups dense navigation sections; collapsible groups pair with SidebarGroupTrigger and hide content when closed.",
  },
  {
    prop: "SidebarTrigger / SidebarRail",
    type: "button props",
    defaultValue: "toggle collapse",
    description:
      "Desktop collapse controls with distinct accessible names and aria-expanded state.",
  },
  {
    prop: "SidebarMobile / SidebarMobileTrigger",
    type: "{ label, closeButtonLabel, showCloseButton } / button props",
    defaultValue: 'label: "Sidebar navigation"',
    description:
      "Mobile drawer surface and trigger. The drawer handles Escape, outside click, link activation close, and focus restore.",
  },
  {
    prop: "SidebarInset",
    type: '{ as?: "main" | "div" | "section" }',
    defaultValue: '"main"',
    description:
      "Lightweight content companion for app shells that need Sidebar and main content to share a flex row.",
  },
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description:
      "Enables CSS-only spring-like transitions. Set false to resolve every sidebar surface to motion none.",
  },
  {
    prop: "motion",
    type: '"none" | "subtle" | "standard" | "expressive"',
    defaultValue: '"standard"',
    description:
      "CSS-only transition preset for width, disclosure, drawer, and menu-open animations. v1 does not add a Motion runtime dependency.",
  },
];
