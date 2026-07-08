import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code-block";

interface DocsPageProps {
  name: string;
  description: string;
  children: ReactNode;
}

export function DocsPage({ name, description, children }: DocsPageProps) {
  return (
    <article className="min-w-0 space-y-12 pb-8">
      <header className="space-y-3">
        <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
          Component
        </p>
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          {name}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7">
          {description}
        </p>
      </header>
      {children}
    </article>
  );
}

export function DocsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-6">
      <div className="border-border space-y-1.5 border-b pb-3">
        <h2
          id={`${id}-heading`}
          className="font-heading scroll-mt-20 text-2xl font-semibold tracking-tight"
        >
          <a href={`#${id}-heading`} className="hover:text-primary">
            {title}
          </a>
        </h2>
        {description ? (
          <p className="text-muted-foreground max-w-prose text-sm leading-6">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function InstallationSection({
  registryName,
  importCode,
}: {
  registryName: string;
  importCode: string;
}) {
  return (
    <DocsSection
      id="installation"
      title="Installation"
      description="Install through the Dethink shadcn-compatible registry to copy the open-code source into your project, or consume the packaged exports."
    >
      <div className="space-y-4">
        <CodeBlock
          lang="bash"
          filename="shadcn CLI"
          code={`npx shadcn@latest add @dethink/${registryName}`}
        />
        <CodeBlock lang="tsx" filename="Import" code={importCode} />
      </div>
    </DocsSection>
  );
}
