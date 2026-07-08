import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import prettierConfig from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

const sourceFiles = ["**/*.{js,mjs,cjs,ts,tsx}"];
const typeScriptFiles = ["**/*.{ts,tsx}"];
const reactFiles = ["**/*.{jsx,tsx}"];
const testFiles = [
  "**/*.{test,spec}.{ts,tsx}",
  "**/*.a11y.test.tsx",
  "**/*.ssr.test.tsx",
];
const nodeFiles = [
  "*.config.{js,mjs,cjs,ts}",
  "eslint.config.js",
  "prettier.config.js",
  "scripts/**/*.{js,mjs,cjs,ts}",
  "apps/*/*.config.{js,mjs,cjs,ts}",
  "apps/*/postcss.config.mjs",
  "apps/storybook/.storybook/**/*.{js,mjs,cjs,ts,tsx}",
  "packages/*/*.config.{js,mjs,cjs,ts}",
];

const warnOnly = (rules) =>
  Object.fromEntries(
    Object.entries(rules).map(([name, rule]) => {
      if (Array.isArray(rule)) {
        const [severity, ...options] = rule;

        if (severity === "off" || severity === 0) {
          return [name, rule];
        }

        return [name, ["warn", ...options]];
      }

      if (rule === "off" || rule === 0) {
        return [name, rule];
      }

      return [name, "warn"];
    }),
  );

export default tseslint.config(
  {
    ignores: [
      "**/.agents/**",
      "**/.claude/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/storybook-static/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/*.tsbuildinfo",
      "apps/showcase/next-env.d.ts",
    ],
  },
  {
    files: sourceFiles,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.es2022,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: typeScriptFiles,
    rules: {
      "no-constant-binary-expression": "warn",
      "no-undef": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          fixStyle: "inline-type-imports",
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: reactFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      "jsx-a11y": {
        polymorphicPropName: "as",
      },
    },
    plugins: {
      "jsx-a11y": jsxA11y,
      "react-hooks": reactHooks,
    },
    rules: {
      ...warnOnly(jsxA11y.flatConfigs.recommended.rules),
      ...warnOnly(reactHooks.configs.flat.recommended.rules),
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: testFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.vitest,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: nodeFiles,
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: [
      "apps/playground-vite/src/**/*.{ts,tsx}",
      "apps/storybook/src/**/*.{ts,tsx}",
    ],
    ...reactRefresh.configs.vite,
  },
  {
    files: ["apps/showcase/**/*.{js,jsx,ts,tsx}"],
    settings: {
      next: {
        rootDir: "apps/showcase/",
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    files: ["apps/showcase/**/*.{ts,tsx}"],
    ...reactRefresh.configs.next,
  },
  ...storybook.configs["flat/recommended"],
  {
    files: ["apps/storybook/.storybook/main.{js,mjs,cjs,ts}"],
    rules: {
      "storybook/no-uninstalled-addons": "off",
    },
  },
  prettierConfig,
);
