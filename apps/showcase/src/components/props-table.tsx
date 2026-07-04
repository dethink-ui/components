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

export function PropsTable({ caption, rows }: PropsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-4 py-2.5 font-medium">
              Prop
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Type
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Default
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.prop} className="border-b border-border/60 last:border-b-0">
              <td className="px-4 py-3 align-top">
                <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[13px] font-medium text-primary">
                  {row.prop}
                </code>
              </td>
              <td className="px-4 py-3 align-top">
                <code className="font-mono text-[13px] text-muted-foreground">
                  {row.type}
                </code>
              </td>
              <td className="px-4 py-3 align-top">
                {row.defaultValue ? (
                  <code className="font-mono text-[13px] text-muted-foreground">
                    {row.defaultValue}
                  </code>
                ) : (
                  <span aria-hidden="true" className="text-muted-foreground/60">
                    —
                  </span>
                )}
              </td>
              <td className="min-w-56 px-4 py-3 align-top leading-6 text-foreground/90">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
