import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@dethink/components/styles.css",
        replacement: resolve(
          currentDir,
          "../../packages/components/src/styles.css",
        ),
      },
      {
        find: "@dethink/components",
        replacement: resolve(
          currentDir,
          "../../packages/components/src/index.ts",
        ),
      },
    ],
  },
});
