import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { format, resolveConfig } from "prettier";

const require = createRequire(
  new URL("../packages/components/package.json", import.meta.url),
);
const ts = require("typescript");

// Audit shipped source, not showcase examples or libraries' own dependencies.
const root = fileURLToPath(new URL("../", import.meta.url));
const registryDir = join(root, "registry/items");
const items = new Map(
  readdirSync(registryDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const item = JSON.parse(readFileSync(join(registryDir, file), "utf8"));
      return [item.name, item];
    }),
);
const packageName = (specifier) =>
  specifier.match(/^(@[^/]+\/[^/@]+|[^/@]+)/)[0];
const cache = new Map();

function imports(file) {
  if (cache.has(file)) return cache.get(file);
  const result = { external: new Set(), local: [] };
  cache.set(file, result);
  if (!/\.[cm]?[jt]sx?$/.test(file)) return result;
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  function visit(node) {
    const specifier =
      ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
        ? node.moduleSpecifier
        : ts.isCallExpression(node) &&
            node.expression.kind === ts.SyntaxKind.ImportKeyword
          ? node.arguments[0]
          : undefined;
    if (specifier && ts.isStringLiteral(specifier)) {
      const name = specifier.text;
      if (name.startsWith(".")) {
        const base = resolve(dirname(file), name);
        const target = [
          base,
          `${base}.ts`,
          `${base}.tsx`,
          join(base, "index.ts"),
          join(base, "index.tsx"),
        ].find(
          (candidate) =>
            /\.[cm]?[jt]sx?$/.test(candidate) && existsSync(candidate),
        );
        if (!target && !name.endsWith(".css"))
          throw new Error(`Unresolved import ${name} in ${file}`);
        if (target) result.local.push(target);
      } else {
        result.external.add(packageName(name));
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return result;
}

function sourceDependencies(files) {
  const result = new Set();
  const visited = new Set();
  function walk(file) {
    if (visited.has(file)) return;
    visited.add(file);
    const entry = imports(file);
    entry.external.forEach((name) => result.add(name));
    entry.local.forEach(walk);
  }
  files.forEach(walk);
  return result;
}

const manifest = {};
for (const [name, item] of [...items].sort(([a], [b]) => a.localeCompare(b))) {
  const files = (item.files ?? []).map((file) => resolve(root, file.path));
  const direct = new Set((item.dependencies ?? []).map(packageName));
  for (const file of files) {
    if (
      item.files.find((entry) => resolve(root, entry.path) === file)?.type ===
      "registry:component"
    ) {
      imports(file).external.forEach((dependency) => direct.add(dependency));
    }
  }
  const all = sourceDependencies(files);
  const visited = new Set();
  function includeRegistry(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const dependency = items.get(key);
    if (!dependency) throw new Error(`Unknown registry dependency: ${key}`);
    (dependency.dependencies ?? [])
      .map(packageName)
      .forEach((pkg) => all.add(pkg));
    sourceDependencies(
      (dependency.files ?? []).map((file) => resolve(root, file.path)),
    ).forEach((pkg) => all.add(pkg));
    (dependency.registryDependencies ?? []).forEach(includeRegistry);
  }
  includeRegistry(name);
  manifest[name] = {
    direct: [...direct].sort(),
    shared: [...all].filter((pkg) => !direct.has(pkg)).sort(),
  };
}

const output = join(root, "apps/showcase/src/lib/component-dependencies.json");
const content = await format(JSON.stringify(manifest), {
  ...(await resolveConfig(output)),
  filepath: output,
});
if (process.argv.includes("--check")) {
  if (!existsSync(output) || readFileSync(output, "utf8") !== content) {
    throw new Error(
      "Component dependency docs are stale. Run pnpm docs:dependencies.",
    );
  }
} else {
  writeFileSync(output, content);
}
console.log(`Audited dependencies for ${items.size} registry items.`);
