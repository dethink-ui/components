import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code-block";
import { getExampleSource } from "@/lib/example-source";

interface ExampleBlockProps {
  /** Path below src/examples, e.g. "button/variants.tsx". */
  file: string;
  title: string;
  description?: string;
  /** Let the preview span the full column for wide compositions like navbars. */
  wide?: boolean;
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
  children,
}: ExampleBlockProps) {
  const source = await getExampleSource(file);
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
        <CodeBlock code={source} filename={`examples/${file}`} />
      </div>
    </section>
  );
}
