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
const activity = process.argv.includes("--activity");
const bottomBar = process.argv.includes("--bottom-bar");
const entry = bottomBar
  ? "bottom-bar"
  : activity
    ? "sidebar-activity"
    : "sidebar-shell";
const react18 = process.argv.includes("--react18");
const destination = await mkdtemp(
  join(tmpdir(), "dethink-sidebar-shell-consumer-"),
);
const selected = [
  ...new Map([...closure(entry), ...closure("sidebar-shell")]).values(),
];
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
      name: "dethink-sidebar-shell-consumer-smoke",
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
  '<html lang="en"><head><title>Sidebar shell consumer smoke</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
await writeFile(
  join(destination, "main.tsx"),
  `import { createRoot } from "react-dom/client";
import { Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuLink, SidebarMobile, SidebarMobileTrigger } from "./src/components/sidebar";
import { SidebarShell, SidebarShellHeader, SidebarShellMain, SidebarShellFooter } from "./src/components/sidebar-shell";
${bottomBar ? 'import { BottomBar, BottomBarHeader, BottomBarTrigger, BottomBarContent } from "./src/components/bottom-bar";' : ""}
${activity ? 'import { SidebarActivity } from "./src/components/sidebar-activity";' : ""}
import "./src/styles.css";
createRoot(document.getElementById("root")!).render(<SidebarShell side="right" dir="rtl"><Sidebar><SidebarHeader><SidebarTrigger /></SidebarHeader><SidebarContent><SidebarMenu><SidebarMenuItem><SidebarMenuLink href="/">Home</SidebarMenuLink></SidebarMenuItem></SidebarMenu>${activity ? '<SidebarActivity items={[{id:"job",title:"Import",status:"running",progress:62}]} />' : ""}</SidebarContent></Sidebar><SidebarShellHeader><SidebarMobileTrigger /></SidebarShellHeader><SidebarShellMain>Workspace<SidebarMobile label="Navigation">Mobile navigation</SidebarMobile></SidebarShellMain>${bottomBar ? '<BottomBar span="shell" size="sm" height={180}><BottomBarHeader>Workbench<BottomBarTrigger /></BottomBarHeader><BottomBarContent aria-label="Work">Custom markup</BottomBarContent></BottomBar>' : '<SidebarShellFooter span="shell"><button>Save draft</button></SidebarShellFooter>'}</SidebarShell>);
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
console.log(
  `${entry}: ${sourceFiles.size} copied files; clean install, typecheck, and Vite build passed.`,
);
