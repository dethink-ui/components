import assert from "node:assert/strict";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
export const defaultRegistryOrigin = "https://components.dethink.co.uk";

export async function createRegistry({
  sourceRoot = root,
  origin = defaultRegistryOrigin,
} = {}) {
  const baseUrl = new URL(origin);
  assert(
    ["https:", "http:"].includes(baseUrl.protocol),
    "Invalid registry origin",
  );
  assert(
    !baseUrl.username && !baseUrl.password,
    "Registry origin cannot contain credentials",
  );
  const sourcePrefix = "packages/components/src/";
  const manifest = JSON.parse(
    await readFile(
      resolve(sourceRoot, "packages/components/package.json"),
      "utf8",
    ),
  );
  const versions = {
    ...manifest.peerDependencies,
    ...manifest.devDependencies,
    ...manifest.dependencies,
  };
  const versionDependencies = (dependencies = []) =>
    dependencies.map((name) => {
      const versionSeparator = name.lastIndexOf("@");
      if (versionSeparator > 0) {
        assert(
          versions[name.slice(0, versionSeparator)],
          `Unknown dependency ${name}`,
        );
        return name;
      }
      assert(versions[name], `No tested version declared for ${name}`);
      return `${name}@${versions[name]}`;
    });
  const itemsPath = resolve(sourceRoot, "registry/items");
  const items = await Promise.all(
    (await readdir(itemsPath))
      .filter((file) => file.endsWith(".json"))
      .sort()
      .map(async (file) =>
        JSON.parse(await readFile(resolve(itemsPath, file), "utf8")),
      ),
  );
  const byName = new Map(items.map((item) => [item.name, item]));
  assert.equal(byName.size, items.length, "Duplicate registry names");
  const targets = new Map();
  const payloads = await Promise.all(
    items.map(async (item) => {
      assert(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name),
        `Invalid item name: ${item.name}`,
      );
      const registryDependencies = (item.registryDependencies ?? []).map(
        (name) => {
          assert(byName.has(name), `${item.name}: unknown dependency ${name}`);
          return new URL(`/r/${name}.json`, baseUrl).href;
        },
      );
      const files = await Promise.all(
        (item.files ?? []).map(async (file) => {
          assert(
            file.path.startsWith(sourcePrefix) &&
              posix.normalize(file.path) === file.path,
            `${item.name}: source must be inside the component package`,
          );
          const relative = file.path.slice(sourcePrefix.length);
          assert(
            relative && !relative.startsWith("../"),
            "Invalid source path",
          );
          // Preserve the package hierarchy so relative imports remain valid, while
          // keeping copied components separate from existing shadcn/ui components.
          const target = `~/components/dethink/${relative}`;
          assert(
            !targets.has(target) || targets.get(target) === file.path,
            `Conflicting copy target: ${target}`,
          );
          targets.set(target, file.path);
          return {
            path: file.path,
            type: "registry:file",
            target,
            content: await readFile(resolve(sourceRoot, file.path), "utf8"),
          };
        }),
      );
      return {
        ...item,
        dependencies: versionDependencies(item.dependencies),
        devDependencies: versionDependencies(item.devDependencies),
        registryDependencies,
        files,
      };
    }),
  );
  return {
    catalog: {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "dethink",
      homepage: "https://components.dethink.co.uk",
      items: payloads.map(({ files, ...item }) => ({
        ...item,
        files: files.map(({ path, type, target }) => ({ path, type, target })),
      })),
    },
    payloads,
  };
}

export async function buildRegistry({
  outputDirectory = resolve(root, "apps/showcase/public/r"),
  ...options
} = {}) {
  const registry = await createRegistry(options);
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(
      resolve(outputDirectory, "registry.json"),
      `${JSON.stringify(registry.catalog, null, 2)}\n`,
    ),
    ...registry.payloads.map((item) =>
      writeFile(
        resolve(outputDirectory, `${item.name}.json`),
        `${JSON.stringify(item, null, 2)}\n`,
      ),
    ),
  ]);
  return registry;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const { payloads } = await buildRegistry({
    origin: process.env.DETHINK_REGISTRY_ORIGIN ?? defaultRegistryOrigin,
  });
  console.log(
    `Built ${payloads.length} registry items and catalog in apps/showcase/public/r.`,
  );
}
