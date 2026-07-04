import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code-block";
import { getExampleSource } from "@/lib/example-source";

interface ExampleBlockProps {
  /** Path below src/examples, e.g. "button/variants.tsx". */
  file: string;
  title: string;
  description?: string;
  children: ReactNode;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function ExampleBlock({
  file,
  title,
  description,
  children,
}: ExampleBlockProps) {
  const source = await getExampleSource(file);
  const id = slugify(title);

  return (
    <section aria-labelledby={id} className="space-y-3">
      <div className="space-y-1">
        <h3 id={id} className="scroll-mt-20 font-heading text-lg font-semibold">
          <a href={`#${id}`} className="hover:text-primary">
            {title}
          </a>
        </h3>
        {description ? (
          <p className="max-w-prose text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="sc-preview-surface flex min-h-44 items-center justify-center bg-background p-6 sm:p-10">
          <div className="w-full max-w-xl">{children}</div>
        </div>
        <CodeBlock code={source} filename={`examples/${file}`} />
      </div>
    </section>
  );
}
