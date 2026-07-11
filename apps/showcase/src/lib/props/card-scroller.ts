import type { PropRow } from "@/components/props-table";

export const cardScrollerProps: PropRow[] = [
  {
    prop: "children",
    type: "CardScrollerItem | CardScrollerItem[]",
    defaultValue: "—",
    description:
      "Direct CardScrollerItem children. Each item must contain exactly one direct Card child.",
  },
  {
    prop: "value",
    type: "string",
    defaultValue: "—",
    description:
      "Controlled selected value. Pair with onValueChange to manage selection externally.",
  },
  {
    prop: "defaultValue",
    type: "string",
    defaultValue: "first enabled item",
    description: "Initial selected value for uncontrolled usage.",
  },
  {
    prop: "onValueChange",
    type: "(value: string) => void",
    defaultValue: "—",
    description: "Fires when a user selects a different enabled card.",
  },
  {
    prop: "maxVisibleCards",
    type: "1 | 2 | 3 | 4",
    defaultValue: "3",
    description:
      "Maximum cards visible in a wide container. Narrow containers still show one card per snap point.",
  },
  {
    prop: "showControls",
    type: "boolean",
    defaultValue: "true",
    description:
      "Shows previous and next buttons only while the card viewport has overflow.",
  },
  {
    prop: "overlap",
    type: "boolean",
    defaultValue: "false",
    description:
      "Closes the inter-card gap and enlarges the selected card above its immediate neighbors.",
  },
  {
    prop: "previousLabel / nextLabel",
    type: "string",
    defaultValue: '"Previous card" / "Next card"',
    description: "Accessible labels for the scroll controls.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables selection and the built-in scroll controls.",
  },
  {
    prop: "name",
    type: "string",
    defaultValue: "generated",
    description: "Name shared by the native radio inputs in the group.",
  },
  {
    prop: "aria-label / aria-labelledby",
    type: "string",
    defaultValue: "—",
    description: "Accessible name for the radiogroup.",
  },
];

export const cardScrollerItemProps: PropRow[] = [
  {
    prop: "children",
    type: "Card",
    defaultValue: "—",
    description:
      "Exactly one direct Card. Keep its contents presentational because the whole card is the radio label.",
  },
  {
    prop: "value",
    type: "string",
    defaultValue: "—",
    description: "Unique non-empty value submitted by the item radio.",
  },
  {
    prop: "label",
    type: "string",
    defaultValue: "—",
    description: "Accessible name announced for the item radio.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Prevents this card from being selected.",
  },
];
