"use client";

import { Form, MultiSelect, MultiSelectItem, Stack } from "@dethink/components";

const teamItems = [
  { label: "Operations", value: "operations" },
  { label: "Finance", value: "finance" },
  { label: "RevOps", value: "revops" },
  { label: "Customer success", value: "customer-success" },
];

export function MultiSelectRecipeFilterBar() {
  return (
    <Form action="/invoices" method="get" className="mx-auto max-w-xl">
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <Stack gap="4">
          <MultiSelect
            defaultValue={["finance"]}
            description="Each selected value serializes as a repeated teams field."
            items={teamItems}
            label="Teams"
            name="teams"
          >
            {(item) => (
              <MultiSelectItem key={item.value} value={item.value}>
                {item.label}
              </MultiSelectItem>
            )}
          </MultiSelect>
          <MultiSelect
            defaultValue={["open", "review"]}
            label="Status"
            name="status"
          >
            <MultiSelectItem value="open">Open</MultiSelectItem>
            <MultiSelectItem value="review">Review</MultiSelectItem>
            <MultiSelectItem value="paid">Paid</MultiSelectItem>
            <MultiSelectItem value="overdue">Overdue</MultiSelectItem>
          </MultiSelect>
        </Stack>
      </div>
    </Form>
  );
}
