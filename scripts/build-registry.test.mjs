import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, posix } from "node:path";
import test from "node:test";
import { buildRegistry, createRegistry } from "./build-registry.mjs";

test("hosted payloads include source and resolvable copied dependency trees", async () => {
  const origin = "http://127.0.0.1:3099";
  const { payloads, catalog } = await createRegistry({ origin });
  const items = new Map(payloads.map((item) => [item.name, item]));
  assert.equal(
    catalog.items.length,
    (await readdir(new URL("../registry/items/", import.meta.url))).filter(
      (name) => name.endsWith(".json"),
    ).length,
  );
  assert(items.has("button"));
  assert(items.has("dethink-base"));
  const license = await readFile(
    new URL("../LICENSE", import.meta.url),
    "utf8",
  );
  const manifest = JSON.parse(
    await readFile(
      new URL("../packages/components/package.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(manifest.license, "MIT");
  assert.deepEqual(items.get("data-table").dependencies, [
    "@tanstack/react-table@8.21.3",
  ]);

  for (const item of payloads) {
    const files = new Map();
    const visited = new Set();
    function include(entry) {
      if (visited.has(entry.name)) return;
      visited.add(entry.name);
      for (const file of entry.files) {
        assert(file.content.length > 0, `${entry.name}: empty source`);
        assert(file.target.startsWith("~/components/dethink/"));
        assert.equal(file.type, "registry:file");
        files.set(file.target, file);
      }
      for (const dependency of entry.registryDependencies) {
        const url = new URL(dependency);
        assert.equal(url.origin, origin);
        const dependencyItem = items.get(posix.basename(url.pathname, ".json"));
        assert(dependencyItem, `${entry.name}: missing dependency`);
        include(dependencyItem);
      }
    }
    include(item);
    assert.equal(
      files.get("~/components/dethink/LICENSE")?.content,
      license,
      `${item.name}: installed dependency tree must include the full MIT notice`,
    );
    for (const file of files.values()) {
      if (!/\.tsx?$/.test(file.target)) continue;
      for (const match of file.content.matchAll(
        /(?:from\s*|import\s*\()["'](\.{1,2}\/[^"']+)["']/g,
      )) {
        const imported = posix.join(posix.dirname(file.target), match[1]);
        assert(
          [
            imported,
            `${imported}.ts`,
            `${imported}.tsx`,
            `${imported}/index.ts`,
            `${imported}/index.tsx`,
          ].some((path) => files.has(path)),
          `${item.name}: ${file.target} imports missing ${match[1]}`,
        );
      }
    }
  }
});

test("build writes a deterministic catalog and fetchable per-item JSON files", async () => {
  const outputDirectory = await mkdtemp(
    join(tmpdir(), "dethink-registry-test-"),
  );
  try {
    const { payloads, catalog } = await buildRegistry({ outputDirectory });
    assert.deepEqual(
      JSON.parse(
        await readFile(join(outputDirectory, "registry.json"), "utf8"),
      ),
      catalog,
    );
    assert.equal((await readdir(outputDirectory)).length, payloads.length + 1);
    const buttonFile = join(outputDirectory, "button.json");
    const first = await readFile(buttonFile, "utf8");
    await buildRegistry({ outputDirectory });
    assert.equal(await readFile(buttonFile, "utf8"), first);
    const button = JSON.parse(first);
    assert.deepEqual(button.registryDependencies, [
      "https://components.dethink.co.uk/r/dethink-base.json",
    ]);
    assert.equal(
      button.files[0].content,
      await readFile(
        new URL(`../${button.files[0].path}`, import.meta.url),
        "utf8",
      ),
    );
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
});
