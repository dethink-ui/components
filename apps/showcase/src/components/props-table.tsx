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
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-border bg-muted/60 text-muted-foreground border-b text-xs tracking-wide uppercase">
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
            <tr
              key={row.prop}
              className="border-border/60 border-b last:border-b-0"
            >
              <td className="px-4 py-3 align-top">
                <code className="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-[13px] font-medium">
                  {row.prop}
                </code>
              </td>
              <td className="px-4 py-3 align-top">
                <code className="text-muted-foreground font-mono text-[13px]">
                  {row.type}
                </code>
              </td>
              <td className="px-4 py-3 align-top">
                {row.defaultValue ? (
                  <code className="text-muted-foreground font-mono text-[13px]">
                    {row.defaultValue}
                  </code>
                ) : (
                  <span aria-hidden="true" className="text-muted-foreground/60">
                    —
                  </span>
                )}
              </td>
              <td className="text-foreground/90 min-w-56 px-4 py-3 align-top leading-6">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
