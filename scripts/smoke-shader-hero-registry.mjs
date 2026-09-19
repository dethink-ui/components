import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(
  await readFile(join(root, "packages/components/package.json"), "utf8"),
);
const items = new Map();
for (const file of await readdir(join(root, "registry/items"), {
  recursive: true,
})) {
  if (!file.endsWith(".json")) continue;
  const item = JSON.parse(
    await readFile(join(root, "registry/items", file), "utf8"),
  );
  items.set(item.name, item);
}
const selected = new Map();
function include(name) {
  if (selected.has(name)) return;
  const item = items.get(name);
  assert(item, `Missing registry item: ${name}`);
  selected.set(name, item);
  for (const dependency of item.registryDependencies ?? []) include(dependency);
}
include("shader-hero-text");
const destination = await mkdtemp(join(tmpdir(), "dethink-shader-consumer-"));
const deps = {
  react: manifest.devDependencies.react,
  "react-dom": manifest.devDependencies["react-dom"],
};
const files = new Set();
for (const item of selected.values()) {
  for (const dependency of item.dependencies ?? []) {
    assert(
      !/^(three|motion|@react-three|@paper-design)/.test(dependency),
      "Shader registry must not add a graphics/animation runtime",
    );
    deps[dependency] =
      manifest.dependencies[dependency] ??
      manifest.devDependencies[dependency] ??
      "*";
  }
  for (const file of item.files ?? []) {
    const relative = file.path.replace("packages/components/src/", "src/");
    files.add(relative);
    const target = join(destination, relative);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(root, file.path), target);
  }
}
for (const file of files) {
  if (!/\.tsx?$/.test(file)) continue;
  const content = await readFile(join(destination, file), "utf8");
  for (const match of content.matchAll(
    /(?:from\s*|import\s*)["'](\.{1,2}\/[^"']+)["']/g,
  )) {
    const base = resolve(dirname(join(destination, file)), match[1]);
    assert(
      [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`].some(
        (candidate) => files.has(candidate.slice(destination.length + 1)),
      ),
      `${file}: missing copied import ${match[1]}`,
    );
  }
}
await writeFile(
  join(destination, "package.json"),
  JSON.stringify({
    name: "dethink-shader-consumer-smoke",
    private: true,
    type: "module",
    dependencies: deps,
    devDependencies: Object.fromEntries(
      [
        "vite",
        "typescript",
        "@vitejs/plugin-react",
        "@tailwindcss/vite",
        "tailwindcss",
        "@types/react",
        "@types/react-dom",
      ].map((name) => [name, manifest.devDependencies[name]]),
    ),
  }),
);
await writeFile(
  join(destination, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      strict: true,
      jsx: "react-jsx",
      module: "ESNext",
      moduleResolution: "Bundler",
      target: "ES2022",
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      types: ["vite/client"],
      skipLibCheck: true,
      noEmit: true,
    },
    include: ["src", "main.tsx"],
  }),
);
await writeFile(
  join(destination, "index.html"),
  '<html lang="en"><head><title>Shader registry smoke</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
await writeFile(
  join(destination, "main.tsx"),
  `import { createRoot } from "react-dom/client";
import { ShaderHeroText, shaderHeroTextAnimations } from "./src/components/shader-hero-text";
import "./src/styles.css";
createRoot(document.getElementById("root")!).render(<main>{shaderHeroTextAnimations.map(animation => <ShaderHeroText key={animation} as="h2" text="Registry installed." animation={animation} className="text-6xl" />)}</main>);
`,
);
await writeFile(
  join(destination, "vite.config.mjs"),
  'import react from "@vitejs/plugin-react"; import tailwind from "@tailwindcss/vite"; export default {plugins:[react(),tailwind()]};',
);
console.log(`Clean registry consumer: ${destination}`);
execFileSync(
  "pnpm",
  [
    "install",
    "--ignore-scripts",
    "--config.manage-package-manager-versions=false",
  ],
  { cwd: destination, stdio: "inherit" },
);
for (const [command, args] of [
  ["tsc", ["--noEmit"]],
  ["vite", ["build"]],
]) {
  execFileSync(join(destination, "node_modules/.bin", command), args, {
    cwd: destination,
    stdio: "inherit",
  });
}
console.log(
  `ShaderHeroText: ${files.size} copied files; clean installation, typecheck and Vite build passed.`,
);
