export interface PropRow {
  prop: string;
  type: string;
  defaultValue?: string;
  description: string;
}

interface PropsTableProps {
  caption: string;
  rows: PropRow[];
}

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- This named horizontal scroll region needs a keyboard tab stop. */
export function PropsTable({ caption, rows }: PropsTableProps) {
  return (
    <div
      aria-label={caption}
      role="region"
      tabIndex={0}
      className="border-border focus-visible:ring-ring relative overflow-x-auto rounded-lg border focus-visible:ring-2 focus-visible:outline-none"
    >
      <table className="w-full min-w-[32rem] table-fixed border-collapse text-left text-sm">
        <caption className="text-foreground px-4 py-3 text-left text-sm font-medium">
          {caption}
        </caption>
        <thead>
          <tr className="border-border bg-muted/60 text-muted-foreground border-b text-xs tracking-wide uppercase">
            <th scope="col" className="w-[38%] px-4 py-2.5 font-medium">
              Prop
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              What it does
            </th>
            <th scope="col" className="w-[20%] px-4 py-2.5 font-medium">
              Default
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.prop}
              className="border-border/60 border-b last:border-b-0"
            >
              <th
                scope="row"
                className="space-y-2 px-4 py-3 align-top font-normal wrap-anywhere"
              >
                <code className="text-primary font-mono text-[13px] font-medium">
                  {row.prop}
                </code>
                <code className="text-muted-foreground block font-mono text-xs leading-5">
                  {row.type}
                </code>
              </th>
              <td className="text-foreground/90 px-4 py-3 align-top leading-6 wrap-anywhere">
                {row.description}
              </td>
              <td className="px-4 py-3 align-top wrap-anywhere">
                {row.defaultValue && row.defaultValue !== "—" ? (
                  <code className="text-muted-foreground font-mono text-[13px]">
                    {row.defaultValue}
                  </code>
                ) : (
                  <span className="text-muted-foreground">
                    <span className="sr-only">Not set</span>
                    <span aria-hidden="true">—</span>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
/* eslint-enable jsx-a11y/no-noninteractive-tabindex */
