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
const workspace = JSON.parse(
  await readFile(join(root, "package.json"), "utf8"),
);
const items = new Map();
for (const file of await readdir(join(root, "registry/items"))) {
  if (!file.endsWith(".json")) continue;
  const item = JSON.parse(
    await readFile(join(root, "registry/items", file), "utf8"),
  );
  items.set(item.name, item);
}
function closure(name, found = new Map()) {
  if (found.has(name)) return found;
  const item = items.get(name);
  assert(item, `Missing registry item: ${name}`);
  found.set(name, item);
  for (const dependency of item.registryDependencies ?? [])
    closure(dependency, found);
  return found;
}
// Every chart and KPI item from PRD #119, installed together as a consumer would.
const entries = [
  "sparkline",
  "delta-badge",
  "stat-tile",
  "bar-list",
  "line-chart",
  "area-chart",
  "bar-chart",
];
const react18 = process.argv.includes("--react18");
const destination = await mkdtemp(join(tmpdir(), "dethink-charts-consumer-"));
const found = new Map();
for (const entry of entries) closure(entry, found);
const selected = [...found.values()];
const deps = {
  react: react18 ? "^18.3.1" : manifest.devDependencies.react,
  "react-dom": react18 ? "^18.3.1" : manifest.devDependencies["react-dom"],
};
const sourceFiles = new Set();
for (const item of selected) {
  for (const dependency of item.dependencies ?? []) {
    const at = dependency.lastIndexOf("@");
    const name = at > 0 ? dependency.slice(0, at) : dependency;
    deps[name] =
      at > 0
        ? dependency.slice(at + 1)
        : (manifest.dependencies[name] ??
          manifest.devDependencies[name] ??
          "*");
  }
  for (const file of item.files ?? []) {
    const relative = file.path.replace("packages/components/src/", "src/");
    sourceFiles.add(relative);
    const target = join(destination, relative);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(root, file.path), target);
  }
}
// Check every copied relative import against the recursive registry closure before installing.
for (const file of sourceFiles) {
  if (!/\.tsx?$/.test(file)) continue;
  const text = await readFile(join(destination, file), "utf8");
  for (const match of text.matchAll(
    /(?:from\s*|import\s*)["'](\.{1,2}\/[^"']+)["']/g,
  )) {
    const base = resolve(dirname(join(destination, file)), match[1]);
    const candidates = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}/index.ts`,
      `${base}/index.tsx`,
    ];
    assert(
      candidates.some((candidate) =>
        sourceFiles.has(candidate.slice(destination.length + 1)),
      ),
      `${file}: undeclared registry import ${match[1]}`,
    );
  }
}
await writeFile(
  join(destination, "package.json"),
  JSON.stringify(
    {
      name: "dethink-charts-consumer-smoke",
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
        ].map((name) => [
          name,
          react18 && ["@types/react", "@types/react-dom"].includes(name)
            ? "^18.3.0"
            : (manifest.devDependencies[name] ??
              workspace.devDependencies[name]),
        ]),
      ),
    },
    null,
    2,
  ),
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
  '<html lang="en"><head><title>Charts consumer smoke</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
await writeFile(
  join(destination, "main.tsx"),
  `import { createRoot } from "react-dom/client";
import { AreaChart } from "./src/components/area-chart";
import { BarChart } from "./src/components/bar-chart";
import { BarList } from "./src/components/bar-list";
import { DeltaBadge } from "./src/components/delta-badge";
import { LineChart } from "./src/components/line-chart";
import { Sparkline } from "./src/components/sparkline";
import { KpiGroup, StatTile } from "./src/components/stat-tile";
import { ChartContainer, ChartGrid } from "./src/components/chart/chart";
import { scaleLinear } from "./src/components/chart/chart-core";
import "./src/styles.css";
const data = [
  { month: "Jan", a: 4000, b: 2400 },
  { month: "Feb", a: 3000, b: -1398 },
  { month: "Mar", a: 5000, b: null },
];
const series = [
  { key: "a", label: "A" },
  { key: "b", label: "B", color: "chart-4" as const },
];
function App() {
  return (
    <main>
      <KpiGroup>
        <StatTile label="Revenue" value={128430} delta={8.2} trend={[3, 5, 4, 7]} />
      </KpiGroup>
      <DeltaBadge value={-2.1} positiveDirection="down" />
      <Sparkline aria-label="Trend" data={[1, 3, 2, 5]} />
      <BarList aria-label="Top" data={[{ label: "x", value: 3 }]} />
      <LineChart aria-label="Line" data={data} index="month" series={series} />
      <AreaChart aria-label="Area" data={data} index="month" series={series} stacked />
      <BarChart aria-label="Bars" data={data} index="month" series={series} maxBarWidth={16} />
      <ChartContainer style={{ height: 80 }}>
        {({ width, height }) => (
          <svg viewBox={\`0 0 \${width} \${height}\`}>
            <ChartGrid ticks={[0, 1]} y={scaleLinear([0, 1], [height, 0])} x0={0} x1={width} />
          </svg>
        )}
      </ChartContainer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
`,
);
await writeFile(
  join(destination, "vite.config.mjs"),
  'import { defineConfig } from "vite"; import react from "@vitejs/plugin-react"; import tailwind from "@tailwindcss/vite"; export default defineConfig({plugins:[react(),tailwind()]});',
);
console.log(`Clean registry consumer: ${destination}`);
execFileSync("pnpm", ["install", "--ignore-scripts"], {
  cwd: destination,
  stdio: "inherit",
});
execFileSync(join(destination, "node_modules/.bin/tsc"), ["--noEmit"], {
  cwd: destination,
  stdio: "inherit",
});
execFileSync(join(destination, "node_modules/.bin/vite"), ["build"], {
  cwd: destination,
  stdio: "inherit",
});
// No chart item may pull a runtime dependency beyond React.
assert.deepEqual(
  Object.keys(deps).sort(),
  ["clsx", "react", "react-dom", "tailwind-merge"],
  "chart items must not add npm dependencies",
);
console.log(
  `${entries.join(", ")}: ${sourceFiles.size} copied files; clean install, typecheck, and Vite build passed.`,
);
