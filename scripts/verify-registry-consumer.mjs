import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verifyRegistryRuntime } from "./verify-registry-runtime.mjs";

// A real installer/build/browser check with no workspace aliases or linked packages.
// Requires the workspace Playwright Chromium installation.
// Usage: node scripts/verify-registry-consumer.mjs vite|next [origin] [react-version]
const [
  framework = "vite",
  origin = "https://components.dethink.co.uk",
  react = "19.3.0",
] = process.argv.slice(2);
assert(["vite", "next"].includes(framework), "Choose vite or next");
assert(
  ["18.3.1", "19.3.0"].includes(react),
  "Choose a supported test React version",
);
const root = await mkdtemp(join(tmpdir(), `dethink-${framework}-${react}-`));
const next = framework === "next";
const types = react.startsWith("18.") ? "^18.3.0" : "19.3.0";
async function write(path, content) {
  const target = join(root, path);
  await mkdir(join(target, ".."), { recursive: true });
  await writeFile(
    target,
    typeof content === "string" ? content : JSON.stringify(content, null, 2),
  );
}
async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} exited with ${code}`)),
    );
  });
}
await write("package.json", {
  name: "dethink-clean-consumer",
  private: true,
  type: "module",
  scripts: { build: next ? "next build" : "tsc --noEmit && vite build" },
  dependencies: {
    react,
    "react-dom": react,
    ...(next ? { next: "16.3.5" } : {}),
  },
  devDependencies: {
    typescript: "6.0.3",
    "@types/react": types,
    "@types/react-dom": types,
    "@types/node": "^22.0.0",
    tailwindcss: "4.3.3",
    ...(next
      ? { "@tailwindcss/postcss": "4.3.3" }
      : { vite: "7.3.6", "@tailwindcss/vite": "4.3.3" }),
  },
});
await write("components.json", {
  $schema: "https://ui.shadcn.com/schema.json",
  style: "new-york",
  rsc: next,
  tsx: true,
  tailwind: {
    config: "",
    css: next ? "app/globals.css" : "src/index.css",
    baseColor: "neutral",
    cssVariables: true,
    prefix: "",
  },
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
    ui: "@/components/ui",
    lib: "@/lib",
    hooks: "@/hooks",
  },
});
await write("tsconfig.json", {
  compilerOptions: {
    target: "ES2022",
    lib: ["DOM", "DOM.Iterable", "ES2022"],
    strict: true,
    skipLibCheck: true,
    module: "ESNext",
    moduleResolution: "Bundler",
    jsx: "react-jsx",
    esModuleInterop: true,
    resolveJsonModule: true,
    noEmit: true,
    paths: { "@/*": ["./*"] },
    ...(next ? { plugins: [{ name: "next" }] } : { types: ["vite/client"] }),
  },
  include: ["**/*.ts", "**/*.tsx", ...(next ? [".next/types/**/*.ts"] : [])],
  exclude: ["node_modules"],
});
const fixture = `"use client";
import { useState } from "react";
import { DethinkProvider } from "../components/dethink/foundation/dethink-provider";
import { Button } from "../components/dethink/components/button";
import { DataTable } from "../components/dethink/components/data-table";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "../components/dethink/components/sidebar";
import { NavDock } from "../components/dethink/components/navdock";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "../components/dethink/components/dialog";
import { ShaderHeroText } from "../components/dethink/components/shader-hero-text";
import { Timeline } from "../components/dethink/components/timeline";
import { TimelineFeed } from "../components/dethink/components/timeline/timeline-feed";
import { Spinner } from "../components/dethink/components/spinner";
export default function App() {
  const [count, setCount] = useState(0);
  return <DethinkProvider theme="light"><SidebarProvider>
    <Sidebar aria-label="Example navigation"><SidebarContent><SidebarTrigger /></SidebarContent></Sidebar>
    <main><h1>Clean registry consumer</h1>
      <Timeline items={[{id:"a",title:"Release",details:"Verified"}]} getGroup={() => ({id:"today",label:"Today"})} />
      <TimelineFeed items={[{id:"a",title:"Release"}]} />
      <Spinner variant="bouncing-dot" label="Preparing workspace" />
      <Spinner variant="moving-rings" label="Syncing records" />
      <ShaderHeroText as="h2" text="Registry works" />
      <Button onClick={() => setCount(count + 1)}>Count {count}</Button>
      <DataTable data={[{id: "1", name: "Ready"}]} columns={[{accessorKey: "name", header: "Status"}]} getRowId={row => row.id} />
      <NavDock aria-label="Quick actions" items={[{value: "home", title: "Home", icon: <span aria-hidden="true">H</span>, href: "#home"}]} />
      <Dialog><DialogTrigger>Open dialog</DialogTrigger><DialogContent><DialogTitle>Registry dialog</DialogTitle><DialogDescription>Copied overlay with focus management.</DialogDescription></DialogContent></Dialog>
    </main></SidebarProvider></DethinkProvider>;
}
`;
if (next) {
  await write("app/page.tsx", fixture);
  await write(
    "app/layout.tsx",
    'import "../components/dethink/styles.css";\nimport "./globals.css";\nexport default function Layout({children}: {children: React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }\n',
  );
  await write("app/globals.css", '@import "tailwindcss";\n');
  await write(
    "postcss.config.mjs",
    'export default { plugins: { "@tailwindcss/postcss": {} } };\n',
  );
} else {
  await write("src/App.tsx", fixture);
  await write(
    "src/main.tsx",
    'import { createRoot } from "react-dom/client";\nimport "../components/dethink/styles.css";\nimport "./index.css";\nimport App from "./App";\ncreateRoot(document.getElementById("root")!).render(<App />);\n',
  );
  await write("src/index.css", '@import "tailwindcss";\n');
  await write(
    "index.html",
    '<html lang="en"><head><title>Registry consumer</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
  );
  await write(
    "vite.config.ts",
    'import { defineConfig } from "vite";\nimport tailwindcss from "@tailwindcss/vite";\nexport default defineConfig({ plugins: [tailwindcss()] });\n',
  );
}
console.log(`CONSUMER_PATH=${root}`);
await run("npm", ["install", "--no-audit", "--no-fund"]);
const components = [
  "button",
  "data-table",
  "sidebar",
  "navdock",
  "dialog",
  "shader-hero-text",
  "spinner",
  "timeline-feed",
];
await run("npx", [
  "--yes",
  "shadcn@4.21.0",
  "add",
  "--yes",
  ...components.map((name) => new URL(`/r/${name}.json`, origin).href),
]);
assert.equal(
  await readFile(join(root, "components/dethink/LICENSE"), "utf8"),
  await readFile(new URL("../LICENSE", import.meta.url), "utf8"),
  "The actual registry installation must preserve the complete MIT notice",
);
await run("npm", ["run", "build"]);
await verifyRegistryRuntime(root, framework);
console.log(
  `PASS ${framework} React ${react} using ${origin}; fixture retained at ${root}`,
);
