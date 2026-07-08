import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";

const currentDir = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    config.build = {
      ...config.build,
      chunkSizeWarningLimit: 1200,
    };
    config.resolve = config.resolve ?? {};
    config.resolve.alias = [
      {
        find: "@dethink/components",
        replacement: resolve(
          currentDir,
          "../../../packages/components/src/index.ts",
        ),
      },
      ...(Array.isArray(config.resolve.alias) ? config.resolve.alias : []),
    ];
    return config;
  },
};

export default config;
