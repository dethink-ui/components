import { Children, isValidElement, type ReactNode } from "react";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { ComponentDependencies } from "@/components/component-dependencies";
import { getComponentMetaByName } from "@/lib/components-meta";

interface DocsPageProps {
  name: string;
  description: string;
  children: ReactNode;
  category?: string;
}

interface DocsSectionProps {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  id: string;
  title: string;
}

function getSections(children: ReactNode): { id: string; title: string }[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<DocsSectionProps>(child)) return [];
    if (child.type === InstallationSection) {
      return [
        { id: "installation", title: "Installation" },
        { id: "built-with", title: "Built with" },
        { id: "usage", title: "Usage" },
      ];
    }
    if (child.type === DocsSection) {
      return [{ id: child.props.id, title: child.props.title }];
    }
    return [];
  });
}

export function DocsPage({
  name,
  description,
  children,
  category,
}: DocsPageProps) {
  const component = getComponentMetaByName(name);
  const sections = getSections(children);

  return (
    <div className="min-w-0 xl:grid xl:grid-cols-[minmax(0,1fr)_10rem] xl:gap-12">
      <article className="min-w-0 space-y-10 pb-8">
        <header className="space-y-4">
          <p className="text-muted-foreground text-sm">
            <Link
              href={component ? "/components" : "/docs"}
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              {category ?? (component ? "Components" : "Getting started")}
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span className="text-foreground">{name}</span>
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            {name}
          </h1>
          <p className="text-muted-foreground max-w-prose text-base leading-7">
            {description}
          </p>
        </header>
        {sections.length ? (
          <details className="border-border rounded-lg border px-4 py-3 xl:hidden">
            <summary className="cursor-pointer text-sm font-medium">
              On this page
            </summary>
            <nav aria-label="On this page" className="pt-3">
              <SectionLinks sections={sections} />
            </nav>
          </details>
        ) : null}
        {children}
        {component ? (
          <footer className="border-border border-t pt-6">
            <Link
              href="/components"
              className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4"
            >
              Browse all components
            </Link>
          </footer>
        ) : null}
      </article>
      {sections.length ? (
        <aside
          aria-label="Page contents"
          className="sticky top-24 hidden max-h-[calc(100svh-7rem)] self-start overflow-y-auto xl:block"
        >
          <nav aria-label="On this page">
            <p className="mb-3 text-sm font-medium">On this page</p>
            <SectionLinks sections={sections} />
          </nav>
        </aside>
      ) : null}
    </div>
  );
}

function SectionLinks({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  return (
    <ul className="border-border space-y-1 border-l">
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}-heading`}
            className="text-muted-foreground hover:text-foreground block rounded-r px-3 py-1.5 text-sm leading-5"
          >
            {section.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function DocsSection({
  actions,
  id,
  title,
  description,
  children,
}: DocsSectionProps) {
  return (
    <section className="space-y-5">
      <div className="border-border space-y-1.5 border-b pb-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          <h2
            id={`${id}-heading`}
            className="font-heading min-w-0 flex-1 scroll-mt-20 text-2xl font-semibold tracking-tight"
          >
            <a href={`#${id}-heading`} className="hover:text-primary">
              {title}
            </a>
          </h2>
          {actions ? <div className="ms-auto min-w-0">{actions}</div> : null}
        </div>
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
    <>
      <DocsSection id="installation" title="Installation">
        <p className="text-muted-foreground text-sm leading-6">
          Install component source from the public registry, or use the local
          workspace package. Follow the{" "}
          <Link
            href="/docs/installation"
            className="text-foreground underline underline-offset-4"
          >
            setup guide
          </Link>{" "}
          first. The npm package is not published yet.
        </p>
        <a
          href={`https://components.dethink.co.uk/r/${registryName}.json`}
          className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4"
        >
          View registry files
        </a>
      </DocsSection>
      <DocsSection id="built-with" title="Built with">
        <ComponentDependencies registryName={registryName} />
      </DocsSection>
      <DocsSection
        id="usage"
        title="Usage"
        description="Import the component into your page or component file."
      >
        <CodeBlock lang="tsx" filename="Usage" code={importCode} />
      </DocsSection>
    </>
  );
}
