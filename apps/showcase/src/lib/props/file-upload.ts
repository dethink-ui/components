import type { PropRow } from "@/components/props-table";
export const fileUploadProps: PropRow[] = [
  {
    prop: "label / description",
    type: "string",
    defaultValue: '"Attachments" / —',
    description: "Visible heading and optional purpose/instructions.",
  },
  {
    prop: "multiple",
    type: "boolean",
    defaultValue: "false",
    description:
      "Accumulate multiple files; single mode supports explicit replacement.",
  },
  {
    prop: "accept",
    type: "string",
    defaultValue: "Unrestricted",
    description:
      "Comma-separated extensions, MIME types, or wildcards; checked for picker and drop.",
  },
  {
    prop: "maxFileSize / maxFiles",
    type: "number",
    defaultValue: "Unrestricted",
    description:
      "Inclusive per-file byte limit and multiple-mode count limit. Labels use KiB/MiB.",
  },
  {
    prop: "onUpload",
    type: "(file, { id, signal, onProgress }) => Promise<void>",
    defaultValue: "—",
    description:
      "Your upload transport. Resolution marks success; rejection enables retry. Honor the AbortSignal.",
  },
  {
    prop: "autoUpload",
    type: "boolean",
    defaultValue: "false",
    description:
      "Start accepted files immediately when onUpload is present. Otherwise review first.",
  },
  {
    prop: "onFilesChange",
    type: "(entries: readonly FileUploadEntry[]) => void",
    defaultValue: "—",
    description:
      "Notification of local selection and transfer states. Not a controlled value setter.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description:
      "Blocks new selection, removal and starting uploads. Active uploads can still be cancelled.",
  },
  {
    prop: "className",
    type: "string",
    defaultValue: "—",
    description:
      "Customize the root. Layout and states use semantic tokens and data-slot hooks.",
  },
];
