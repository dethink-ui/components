import type { PropRow } from "@/components/props-table";

export const sidebarShellProps: PropRow[] = [
  {
    prop: "SidebarShell",
    type: "{ chrome, side, variant, motion, animate, collapsed, defaultCollapsed, onCollapsedChange, mobileOpen, defaultMobileOpen, onMobileOpenChange, mainId }",
    defaultValue: 'chrome: "workbench", motion: "standard"',
    description:
      "The shell root. Wraps SidebarProvider, owns collapsed and mobile drawer state (controlled or uncontrolled), renders an automatic skip link, and frames header, main, and footer beside a direct Sidebar child. chrome switches between the bounded workbench treatment and plain edge-to-edge geometry.",
  },
  {
    prop: "SidebarShellHeader",
    type: 'header attributes + { as: "header" | "div" }',
    defaultValue: 'as: "header"',
    description:
      'The command deck above the work stage. Renders a banner landmark by default; use as="div" when the page already owns a banner. Compose breadcrumbs, page titles, and actions into it — the shell does not own them.',
  },
  {
    prop: "SidebarShellMain",
    type: 'main attributes + { as: "main" | "div" | "section", id, tabIndex }',
    defaultValue: 'as: "main", tabIndex: 0',
    description:
      "The single main landmark and skip-link target. The main content scroll container: header and footer stay pinned while this canvas scrolls with overscroll containment.",
  },
  {
    prop: "SidebarShellFooter",
    type: 'footer attributes + { as: "footer" | "div", span: "content" | "shell" }',
    defaultValue: 'as: "footer", span: "content"',
    description:
      'Optional bottom bar. span="content" stays below the work stage; span="shell" stretches below both navigation and content. Omit to remove it without reserved space. Content can wrap; renders a contentinfo landmark by default.',
  },
  {
    prop: "SidebarShellNavigation",
    type: "div attributes",
    defaultValue: "—",
    description:
      "Optional wrapper for custom navigation surfaces. Passing a Sidebar directly as a shell child is the common path; this region exists for non-Sidebar navigation that should still receive shell chrome and state attributes.",
  },
  {
    prop: "SidebarShellSkipLink",
    type: "anchor attributes + { targetId }",
    defaultValue: "targets the shell main region",
    description:
      "Focus-visible skip link rendered first in the shell. One is provided automatically; supply your own to change the label or target.",
  },
  {
    prop: "getSidebarShellMotionConfig / *ClassNames helpers",
    type: "(motion, reducedMotion) => SidebarShellMotionConfig, ({ className }) => string",
    defaultValue: "—",
    description:
      "Open-code escape hatches: read the resolved motion preset (spring transition, lift, hover and tap scales) or reuse the shell region class recipes on custom elements.",
  },
];
