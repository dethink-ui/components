import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  FilterBar,
  QueryInput,
  SavedViewsMenu,
  createFilter,
  createFilterCondition,
  createMemoryFilterStore,
  defineFilterFields,
  useFilterUrlState,
  useSavedViews,
  type SavedView,
} from "@dethink/components";
import { expect, userEvent, within } from "storybook/test";

const fields = defineFilterFields([
  {
    key: "status",
    label: "Status",
    type: "option",
    options: [
      { value: "open", label: "Open" },
      { value: "done", label: "Done" },
    ],
  },
  {
    key: "labels",
    label: "Labels",
    type: "multiOption",
    options: [
      { value: "bug", label: "Bug" },
      { value: "api", label: "API" },
    ],
  },
  { key: "estimate", label: "Estimate", type: "number" },
]);

const initialViews: SavedView[] = [
  {
    id: "open",
    name: "Open",
    version: 1,
    scope: "personal",
    filter: createFilter({
      children: [
        createFilterCondition({
          field: "status",
          operator: "isAnyOf",
          value: ["open"],
        }),
      ],
    }),
  },
  {
    id: "bugs",
    name: "Big bugs",
    version: 1,
    scope: "team",
    filter: createFilter({
      children: [
        createFilterCondition({
          field: "labels",
          operator: "includesAny",
          value: ["bug"],
        }),
        createFilterCondition({ field: "estimate", operator: "gte", value: 5 }),
      ],
    }),
  },
];

function Demo({ search = "", views: start = initialViews }) {
  // A memory store keeps Storybook's own URL untouched.
  const [store] = useState(() => createMemoryFilterStore(search));
  const [url, setUrl] = useState(store.read());
  const [views, setViews] = useState(start);
  const state = useFilterUrlState({
    fields,
    store,
    onValueChange: () => queueMicrotask(() => setUrl(store.read())),
  });
  const savedViews = useSavedViews({
    state,
    fields,
    views,
    onCreate: (view) => setViews((current) => [...current, view]),
    onUpdate: (view) =>
      setViews((current) =>
        current.map((item) => (item.id === view.id ? view : item)),
      ),
    onDelete: (view) =>
      setViews((current) => current.filter((item) => item.id !== view.id)),
  });

  return (
    <div className="grid max-w-3xl gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SavedViewsMenu savedViews={savedViews} scopes={["personal", "team"]} />
        <QueryInput fields={fields} state={state} className="min-w-72 flex-1" />
      </div>
      <FilterBar fields={fields} state={state} />
      <p className="text-muted-foreground font-mono text-xs" data-testid="url">
        {url || "(no filter)"}
      </p>
    </div>
  );
}

const meta = {
  title: "Components/SavedViews",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <Demo />,
};

export const FromLink: Story = {
  render: () => <Demo search="?q=status:done+estimate:<3&v=1" />,
};

export const NoViews: Story = {
  render: () => <Demo views={[]} />,
};

export const ApplyEditSave: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Views" }));
    await userEvent.click(
      await body.findByRole("button", { name: "Apply view Big bugs" }),
    );
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Remove filter, Estimate is at least 5",
      }),
    );
    await expect(
      canvas.getByRole("button", { name: "Big bugs, edited" }),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "Big bugs, edited" }),
    );
    await userEvent.click(
      await body.findByRole("button", { name: "Save changes" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Big bugs" }),
    ).toBeInTheDocument();
  },
};
