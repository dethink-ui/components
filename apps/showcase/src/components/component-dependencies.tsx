import manifest from "@/lib/component-dependencies.json";
import { dependencyInfo } from "@/lib/dependency-info";

const foundations = new Set(["react", "clsx", "tailwind-merge"]);
const linkClass =
  "text-foreground decoration-border hover:decoration-current underline underline-offset-4";

function DependencyList({
  packages,
  shared = false,
}: {
  packages: string[];
  shared?: boolean;
}) {
  return (
    <ul className="space-y-4">
      {packages.map((pkg) => {
        const info = dependencyInfo[pkg];
        if (!info)
          throw new Error(`Missing dependency documentation for ${pkg}`);
        return (
          <li key={pkg} className="text-sm leading-6">
            <a href={info.href} className={linkClass}>
              {info.name}
            </a>{" "}
            <code className="text-muted-foreground text-xs break-words">
              ({pkg})
            </code>
            {shared ? (
              <span className="text-muted-foreground">
                {" "}
                · via shared Dethink components
              </span>
            ) : null}
            <p className="text-muted-foreground">{info.purpose}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function ComponentDependencies({
  registryName,
}: {
  registryName: string;
}) {
  const entry = manifest[registryName as keyof typeof manifest];
  if (!entry) throw new Error(`Missing dependency audit for ${registryName}`);
  const direct = entry.direct.filter((pkg) => !foundations.has(pkg));
  const shared = entry.shared.filter((pkg) => !foundations.has(pkg));
  const common = [...new Set([...entry.direct, ...entry.shared])].filter(
    (pkg) => foundations.has(pkg),
  );
  return (
    <div className="space-y-5">
      {direct.length ? <DependencyList packages={direct} /> : null}
      {shared.length ? <DependencyList packages={shared} shared /> : null}
      {!direct.length && !shared.length ? (
        <p className="text-muted-foreground text-sm leading-6">
          Implemented with React and browser APIs, without an additional
          behavior or rendering library.
        </p>
      ) : null}
      {registryName === "chat" ? (
        <div className="border-border space-y-3 border-l-2 pl-4">
          <p className="text-sm font-medium">Optional Markdown rendering</p>
          <p className="text-muted-foreground text-sm leading-6">
            Only needed when you use MarkdownMessage from{" "}
            <code>@dethink/components/chat-markdown</code>. These are optional
            peer dependencies; plain-text Chat does not require them.
          </p>
          <DependencyList packages={["react-markdown", "remark-gfm"]} />
        </div>
      ) : null}
      <div className="text-muted-foreground space-y-2 text-sm leading-6">
        <p>
          Shared foundation:{" "}
          {common.map((pkg, index) => (
            <span key={pkg}>
              {index ? ", " : ""}
              <a href={dependencyInfo[pkg].href} className={linkClass}>
                {dependencyInfo[pkg].name}
              </a>
              {pkg === "clsx"
                ? " for conditional classes"
                : pkg === "tailwind-merge"
                  ? " for resolving utility-class conflicts"
                  : ""}
            </span>
          ))}
          . Styles use{" "}
          <a href="https://tailwindcss.com/docs" className={linkClass}>
            Tailwind CSS
          </a>{" "}
          and Dethink CSS variables.
        </p>
        <p>
          Based on this component’s source and registry composition. Libraries
          used only in showcase examples are excluded.
        </p>
      </div>
    </div>
  );
}
