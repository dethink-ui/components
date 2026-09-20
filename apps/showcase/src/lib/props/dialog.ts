import type { PropRow } from "@/components/props-table";

export const dialogProps: PropRow[] = [
  {
    prop: "open / defaultOpen / onOpenChange",
    type: "boolean / boolean / (open) => void",
    defaultValue: "—",
    description:
      "Use open with onOpenChange to manage the dialog, or defaultOpen to set its starting state.",
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
    description: "Sets the dialog width.",
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
    description: "Prevents the Escape key from closing the dialog.",
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
    description: "Shows a close button in the corner.",
  },
  {
    prop: "DialogHeader / DialogTitle / DialogDescription / DialogFooter",
    type: "section components",
    defaultValue: "—",
    description:
      "Build the dialog header and footer. The title and description tell screen readers what the dialog is for.",
  },
];

export const alertDialogProps: PropRow[] = [
  {
    prop: "AlertDialog",
    type: "same as Dialog",
    defaultValue: "—",
    description:
      "A confirmation dialog. Clicking outside it does not close it.",
  },
  {
    prop: "AlertDialogAction / AlertDialogCancel",
    type: "variant + size (Button API)",
    defaultValue: "—",
    description:
      "Confirm and cancel buttons; Action supports isDisabled for gated confirmation.",
  },
];
