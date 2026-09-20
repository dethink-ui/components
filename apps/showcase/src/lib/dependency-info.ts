export const dependencyInfo: Record<
  string,
  { name: string; href: string; purpose: string }
> = {
  "@tanstack/react-table": {
    name: "TanStack Table",
    href: "https://tanstack.com/table/latest/docs/introduction",
    purpose:
      "Headless table state and row models for sorting, filtering, pagination, selection, and column visibility. Dethink supplies the table markup and styling.",
  },
  "@internationalized/date": {
    name: "Internationalized Date",
    href: "https://react-spectrum.adobe.com/internationalized/date/index.html",
    purpose:
      "Date values, calendar arithmetic, and time-zone-aware date handling.",
  },
  "react-aria-components": {
    name: "React Aria Components",
    href: "https://react-spectrum.adobe.com/react-aria/components.html",
    purpose:
      "Accessible interaction primitives, including keyboard behavior, focus handling, and ARIA semantics.",
  },
  "react-aria": {
    name: "React Aria",
    href: "https://react-spectrum.adobe.com/react-aria/index.html",
    purpose:
      "Accessibility hooks and overlay utilities used by the implementation.",
  },
  motion: {
    name: "Motion for React",
    href: "https://motion.dev/docs/react",
    purpose: "Animations, transitions, and reduced-motion handling.",
  },
  "lucide-react": {
    name: "Lucide",
    href: "https://lucide.dev/guide/packages/lucide-react",
    purpose:
      "React SVG icons used in component controls and status indicators.",
  },
  "react-dom": {
    name: "React DOM",
    href: "https://react.dev/reference/react-dom/createPortal",
    purpose:
      "Portals for rendering overlay content outside the normal component tree.",
  },
  "react-markdown": {
    name: "React Markdown",
    href: "https://github.com/remarkjs/react-markdown",
    purpose: "Renders Markdown messages as React elements.",
  },
  "remark-gfm": {
    name: "remark-gfm",
    href: "https://github.com/remarkjs/remark-gfm",
    purpose:
      "Adds GitHub-flavored Markdown features such as tables, task lists, and strikethrough.",
  },
  react: {
    name: "React",
    href: "https://react.dev/",
    purpose: "Component rendering and state.",
  },
  clsx: {
    name: "clsx",
    href: "https://github.com/lukeed/clsx",
    purpose: "Conditional class names.",
  },
  "tailwind-merge": {
    name: "tailwind-merge",
    href: "https://github.com/dcastil/tailwind-merge",
    purpose: "Resolves conflicting Tailwind utility classes.",
  },
};
