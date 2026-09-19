import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageManifest = JSON.parse(
  readFileSync(resolve(currentDir, "package.json"), "utf8"),
) as {
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};
const externalPackages = Object.keys({
  ...packageManifest.dependencies,
  ...packageManifest.peerDependencies,
});

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      entryRoot: "src",
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(currentDir, "src/index.ts"),
        "chat-markdown": resolve(currentDir, "src/chat-markdown.tsx"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: "styles",
    },
    rollupOptions: {
      external: (id) =>
        externalPackages.some(
          (name) => id === name || id.startsWith(`${name}/`),
        ),
      output: {
        // Keep the public index entry, while allowing a consumer to discard
        // complete unused component modules and their animation dependencies.
        preserveModules: true,
        preserveModulesRoot: resolve(currentDir, "src"),
      },
    },
  },
});
