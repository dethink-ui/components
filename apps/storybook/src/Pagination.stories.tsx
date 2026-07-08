import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState, type ReactNode } from "react";
import {
  DethinkProvider,
  Pagination,
  Stack,
  Text,
  type DethinkDensity,
  type DethinkTheme,
  type PaginationSize,
} from "@dethink/components";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  args: {
    page: 4,
    pageCount: 12,
    showFirstLast: true,
    size: "md",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryShell({
  children,
  density = "default",
  dir = "ltr",
  theme = "light",
}: {
  children: ReactNode;
  density?: DethinkDensity;
  dir?: "ltr" | "rtl";
  theme?: DethinkTheme;
}) {
  return (
    <DethinkProvider
      className="bg-background text-foreground min-h-[18rem] p-6"
      density={density}
      dir={dir}
      theme={theme}
    >
      {children}
    </DethinkProvider>
  );
}

function StoryFrame({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Stack className="max-w-4xl" gap="4">
      <Stack gap="1">
        <Text weight="semibold">{title}</Text>
        <Text size="sm" tone="muted">
          {description}
        </Text>
      </Stack>
      {children}
    </Stack>
  );
}

function ControlledPagination({
  pageCount = 12,
  size = "md",
}: {
  pageCount?: number;
  size?: PaginationSize;
}) {
  const [page, setPage] = useState(4);

  return (
    <Pagination
      page={page}
      pageCount={pageCount}
      showFirstLast
      size={size}
      onPageChange={setPage}
    />
  );
}

export const Bounded: Story = {
  render: ({ pageCount = 12, size = "md" }) => (
    <StoryShell>
      <StoryFrame
        title="Bounded pages"
        description="Known totals expose first, previous, page number, next, and last controls."
      >
        <ControlledPagination pageCount={pageCount} size={size} />
      </StoryFrame>
    </StoryShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    await expect(
      canvas.getByRole("button", { name: "Page 5, current page" }),
    ).toHaveAttribute("aria-current", "page");
  },
};

export const LinkMode: Story = {
  render: () => (
    <StoryShell>
      <StoryFrame
        title="Route-backed links"
        description="When pages have stable URLs, Pagination renders native anchors."
      >
        <Pagination
          hrefForPage={(page) => `/storybook/results?page=${page}`}
          page={6}
          pageCount={18}
          showFirstLast
        />
      </StoryFrame>
    </StoryShell>
  ),
};

export const Unbounded: Story = {
  render: () => (
    <StoryShell>
      <StoryFrame
        title="Cursor-style results"
        description="Unbounded mode shows known pages and next availability without inventing a final page."
      >
        <Pagination hasNextPage page={8} onPageChange={() => undefined} />
      </StoryFrame>
    </StoryShell>
  ),
};

export const CompactCard: Story = {
  render: () => (
    <StoryShell>
      <section className="border-border bg-background max-w-xl rounded-lg border p-4 shadow-sm">
        <Stack gap="4">
          <Stack gap="1">
            <Text weight="semibold">Search results</Text>
            <Text size="sm" tone="muted">
              Compact pagination keeps card footers stable on narrow surfaces.
            </Text>
          </Stack>
          <Pagination
            compact
            page={9}
            pageCount={24}
            size="sm"
            onPageChange={() => undefined}
          />
        </Stack>
      </section>
    </StoryShell>
  ),
};

export const DataTableFooter: Story = {
  render: () => (
    <StoryShell>
      <StoryFrame
        title="DataTable footer composition"
        description="Pagination can sit beside row-count and page-size controls without owning either concern."
      >
        <div className="border-border rounded-lg border">
          <div className="grid gap-2 p-4 text-sm">
            <div className="font-medium">Audit log</div>
            <div className="text-muted-foreground">
              84 filtered records across 9 pages
            </div>
          </div>
          <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t p-3">
            <Text size="sm" tone="muted">
              Rows 31-40 of 84
            </Text>
            <Pagination
              aria-label="Audit log pages"
              page={4}
              pageCount={9}
              status={false}
              onPageChange={() => undefined}
            />
          </div>
        </div>
      </StoryFrame>
    </StoryShell>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <StoryShell density="compact" theme="dark">
        <Pagination
          compact
          page={5}
          pageCount={12}
          size="sm"
          onPageChange={() => undefined}
        />
      </StoryShell>
      <StoryShell density="comfortable" dir="rtl" theme="light">
        <Pagination
          page={5}
          pageCount={12}
          showFirstLast
          onPageChange={() => undefined}
        />
      </StoryShell>
    </div>
  ),
};
