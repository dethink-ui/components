import assert from "node:assert/strict";
import { log } from "node:console";
import { access } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "vite";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const entry = fileURLToPath(new URL("../dist/index.js", import.meta.url));
await Promise.all(
  ["index.js", "index.d.ts", "styles.css"].map((file) =>
    access(new URL(`../dist/${file}`, import.meta.url)),
  ),
);

// Measure consumer code, with React provided by the host app. These budgets
// include runtime dependencies, but exclude the separately exported CSS.
for (const [name, budget] of [
  ["Button", 14_000],
  ["Switch", 65_000],
  ["Tabs", 65_000],
  ["NavDock", 80_000],
]) {
  const result = await build({
    configFile: false,
    root: packageRoot,
    logLevel: "error",
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [
      {
        name: "consumer-bundle-probe",
        resolveId(id) {
          if (id === "virtual:consumer" || id.endsWith("/virtual:consumer"))
            return "\0virtual:consumer";
        },
        load(id) {
          if (id === "\0virtual:consumer")
            return `export { ${name} } from ${JSON.stringify(entry)};`;
        },
      },
    ],
    build: {
      write: false,
      rollupOptions: {
        input: "virtual:consumer",
        preserveEntrySignatures: "strict",
        external: (id) => /^(react|react-dom)(\/|$)/.test(id),
        output: { format: "es", entryFileNames: "consumer.js" },
      },
    },
  });
  const chunks = (Array.isArray(result) ? result : [result]).flatMap((item) =>
    item.output.filter((output) => output.type === "chunk"),
  );
  const gzip = chunks.reduce(
    (bytes, chunk) => bytes + gzipSync(chunk.code).length,
    0,
  );
  const retainedModules = chunks.flatMap((chunk) => Object.keys(chunk.modules));
  if (name === "Switch") {
    const initialChunks = new Set();
    function visit(chunk) {
      if (!chunk || initialChunks.has(chunk)) return;
      initialChunks.add(chunk);
      for (const imported of chunk.imports) {
        visit(chunks.find((candidate) => candidate.fileName === imported));
      }
    }
    visit(chunks.find((chunk) => chunk.isEntry));
    assert(
      ![...initialChunks].some((chunk) =>
        Object.keys(chunk.modules).some((id) =>
          /framer-motion|motion-dom|motion-utils/.test(id),
        ),
      ),
      "Switch must load Motion only through the optional spring chunk",
    );
    assert(
      retainedModules.some((id) => /framer-motion/.test(id)),
      "The optional spring chunk must include Motion",
    );
  }
  if (name === "Button") {
    assert(
      !retainedModules.some((id) =>
        /framer-motion|motion-dom|motion-utils|react-aria|tanstack|\/components\/(?:shader-hero-text|shader-backgrounds)\//.test(
          id,
        ),
      ),
      "Button-only consumers must not include motion or complex-widget runtimes",
    );
  }
  assert(gzip < budget, `${name}: ${gzip} gzip bytes exceeds ${budget}`);
  log(`${name}: ${gzip} gzip bytes (budget ${budget})`);
}
