import type { ReactNode } from "react";
import { ChevronDown, Code2 } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { getExampleSource } from "@/lib/example-source";

interface ExampleBlockProps {
  /** Path below src/examples, e.g. "button/variants.tsx". */
  file: string;
  title: string;
  description?: string;
  /** Let the preview span the full column for wide compositions like navbars. */
  wide?: boolean;
  /** Collapse source for long recipes where preview scanning is the primary task. */
  codeCollapsible?: boolean;
  codeDefaultOpen?: boolean;
  children: ReactNode;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function ExampleBlock({
  file,
  title,
  description,
  wide = false,
  codeCollapsible = false,
  codeDefaultOpen = true,
  children,
}: ExampleBlockProps) {
  const source = await getExampleSource(file);
  const filename = `examples/${file}`;
  const id = slugify(title);

  return (
    <section aria-labelledby={id} className="space-y-3">
      <div className="space-y-1">
        <h3 id={id} className="font-heading scroll-mt-20 text-lg font-semibold">
          <a href={`#${id}`} className="hover:text-primary">
            {title}
          </a>
        </h3>
        {description ? (
          <p className="text-muted-foreground max-w-prose text-sm leading-6">
            {description}
          </p>
        ) : null}
      </div>
      <div className="border-border overflow-hidden rounded-lg border">
        <div className="sc-preview-surface bg-background flex min-h-44 items-center justify-center p-6 sm:p-10">
          <div className={wide ? "w-full" : "w-full max-w-xl"}>{children}</div>
        </div>
        {codeCollapsible ? (
          <details
            className="group border-border bg-background border-t"
            open={codeDefaultOpen}
          >
            <summary className="focus-visible:ring-ring focus-visible:ring-offset-background hover:bg-muted/60 flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              <Code2
                aria-hidden="true"
                className="text-muted-foreground size-4 shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block">Example source</span>
                <span className="text-muted-foreground block truncate font-mono text-xs font-normal">
                  {filename}
                </span>
              </span>
              <ChevronDown
                aria-hidden="true"
                className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="border-border bg-muted/20 border-t p-3">
              <CodeBlock code={source} filename={filename} />
            </div>
          </details>
        ) : (
          <CodeBlock code={source} filename={filename} />
        )}
      </div>
    </section>
  );
}
