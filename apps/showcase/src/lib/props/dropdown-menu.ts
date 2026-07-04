import type { PropRow } from "@/components/props-table";

export const dropdownMenuProps: PropRow[] = [
  {
    prop: "open / defaultOpen / onOpenChange",
    type: "boolean / boolean / (open) => void",
    defaultValue: "—",
    description: "Controlled or uncontrolled menu visibility.",
  },
  {
    prop: "DropdownMenuTrigger",
    type: "variant + size (Button API)",
    defaultValue: "—",
    description:
      "The menu button; give icon-only triggers an aria-label naming their target.",
  },
  {
    prop: "DropdownMenuContent — placement",
    type: '"bottom" | "top" | … (+ " start"/" end")',
    defaultValue: '"bottom"',
    description: "Preferred side and alignment relative to the trigger.",
  },
  {
    prop: "DropdownMenuItem — onAction",
    type: "() => void",
    defaultValue: "—",
    description: "Runs when the item is selected by click or keyboard.",
  },
  {
    prop: "DropdownMenuItem — destructive / disabled",
    type: "boolean",
    defaultValue: "false",
    description:
      "Destructive styling with data-destructive, or a disabled non-interactive item.",
  },
  {
    prop: "Item anatomy",
    type: "Icon | Label | Description | Shortcut",
    defaultValue: "—",
    description:
      "DropdownMenuItemIcon/Label/Description/Shortcut compose rich rows inside an item.",
  },
  {
    prop: "Structure",
    type: "Section | Label | Separator | Submenu",
    defaultValue: "—",
    description:
      "DropdownMenuSection groups, DropdownMenuLabel titles a group, DropdownMenuSeparator divides, and DropdownMenuSubmenu + SubmenuContent nest a flyout.",
  },
];
