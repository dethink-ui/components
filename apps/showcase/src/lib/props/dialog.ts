import type { PropRow } from "@/components/props-table";

export const dialogProps: PropRow[] = [
  {
    prop: "open / defaultOpen / onOpenChange",
    type: "boolean / boolean / (open) => void",
    defaultValue: "—",
    description: "Controlled or uncontrolled visibility of the dialog.",
  },
  {
    prop: "DialogTrigger / DialogClose",
    type: "variant + size (Button API)",
    defaultValue: "—",
    description:
      "Buttons that open and close the dialog; both accept the Button variant and size props.",
  },
  {
    prop: "DialogContent — size",
    type: '"sm" | "md" | "lg" | "xl" | "full"',
    defaultValue: '"md"',
    description: "Panel width scale.",
  },
  {
    prop: "DialogContent — dismissible",
    type: "boolean",
    defaultValue: "false",
    description: "Whether clicking the backdrop closes the dialog.",
  },
  {
    prop: "DialogContent — keyboardDismissDisabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables Escape dismissal when true.",
  },
  {
    prop: "DialogContent — scrollBehavior",
    type: '"inside" | "outside"',
    defaultValue: '"inside"',
    description: "Whether long content scrolls within the panel or the page.",
  },
  {
    prop: "DialogContent — showCloseButton",
    type: "boolean",
    defaultValue: "false",
    description: "Built-in labeled close button in the corner.",
  },
  {
    prop: "DialogHeader / DialogTitle / DialogDescription / DialogFooter",
    type: "section components",
    defaultValue: "—",
    description:
      "Anatomy pieces; the title and description label the dialog for assistive tech.",
  },
];

export const alertDialogProps: PropRow[] = [
  {
    prop: "AlertDialog",
    type: "same as Dialog",
    defaultValue: "—",
    description:
      "Role alertdialog, backdrop dismissal blocked — the user must choose.",
  },
  {
    prop: "AlertDialogAction / AlertDialogCancel",
    type: "variant + size (Button API)",
    defaultValue: "—",
    description:
      "Confirm and cancel buttons; Action supports isDisabled for gated confirmation.",
  },
];
