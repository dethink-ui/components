import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const registryRoot = fileURLToPath(
  new URL("../registry/items", import.meta.url),
);

async function findJsonFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findJsonFiles(absolutePath, relativePath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(relativePath);
    }
  }

  return files;
}

const files = await findJsonFiles(registryRoot);

if (files.length === 0) {
  throw new Error("No registry item JSON files found in registry/items.");
}

const requiredStringFields = ["name", "type", "title", "description"];
const optionalArrayFields = [
  "dependencies",
  "devDependencies",
  "registryDependencies",
  "files",
];
const registryItems = new Map();

for (const file of files) {
  const absolutePath = join(registryRoot, file);
  const item = JSON.parse(await readFile(absolutePath, "utf8"));

  if (registryItems.has(item.name)) {
    throw new Error(`${file}: duplicate registry item name "${item.name}".`);
  }

  registryItems.set(item.name, { file, item });

  for (const field of requiredStringFields) {
    if (typeof item[field] !== "string" || item[field].length === 0) {
      throw new Error(`${file}: expected non-empty string field "${field}".`);
    }
  }

  if (!item.type.startsWith("registry:")) {
    throw new Error(`${file}: type must start with "registry:".`);
  }

  for (const field of optionalArrayFields) {
    if (item[field] !== undefined && !Array.isArray(item[field])) {
      throw new Error(`${file}: optional field "${field}" must be an array.`);
    }
  }

  if (Array.isArray(item.files)) {
    for (const [index, entry] of item.files.entries()) {
      if (typeof entry.path !== "string" || entry.path.length === 0) {
        throw new Error(
          `${file}: files[${index}].path must be a non-empty string.`,
        );
      }
      if (
        typeof entry.type !== "string" ||
        !entry.type.startsWith("registry:")
      ) {
        throw new Error(
          `${file}: files[${index}].type must start with "registry:".`,
        );
      }
    }
  }

  if (
    item.cssVars !== undefined &&
    (typeof item.cssVars !== "object" ||
      item.cssVars === null ||
      Array.isArray(item.cssVars))
  ) {
    throw new Error(`${file}: optional field "cssVars" must be an object.`);
  }
}

for (const { file, item } of registryItems.values()) {
  for (const dependencyName of item.registryDependencies ?? []) {
    if (!registryItems.has(dependencyName)) {
      throw new Error(
        `${file}: registry dependency "${dependencyName}" does not match any registry item name.`,
      );
    }
  }
}

const identityLabelingExpectations = {
  badge: {
    dependencies: [],
    devDependencies: [],
    files: [
      "packages/components/src/components/badge/badge.tsx",
      "packages/components/src/components/badge/index.ts",
      "packages/components/src/utils/cn.ts",
    ],
    registryDependencies: ["dethink-base"],
  },
  label: {
    dependencies: [],
    devDependencies: [],
    files: [
      "packages/components/src/components/label/label.tsx",
      "packages/components/src/components/label/index.ts",
      "packages/components/src/utils/cn.ts",
    ],
    registryDependencies: ["dethink-base"],
  },
  avatar: {
    dependencies: ["motion"],
    devDependencies: [],
    files: [
      "packages/components/src/components/avatar/avatar.tsx",
      "packages/components/src/components/avatar/index.ts",
      "packages/components/src/utils/cn.ts",
    ],
    registryDependencies: ["dethink-base"],
  },
  "avatar-group": {
    dependencies: ["motion"],
    devDependencies: [],
    files: [
      "packages/components/src/components/avatar-group/avatar-group.tsx",
      "packages/components/src/components/avatar-group/index.ts",
      "packages/components/src/utils/cn.ts",
    ],
    registryDependencies: ["dethink-base", "avatar"],
  },
};

function assertExactArray({ actual, expected, field, file }) {
  const normalizedActual = actual ?? [];

  if (
    normalizedActual.length !== expected.length ||
    normalizedActual.some((value, index) => value !== expected[index])
  ) {
    throw new Error(
      `${file}: expected ${field} to be ${JSON.stringify(expected)}, received ${JSON.stringify(normalizedActual)}.`,
    );
  }
}

for (const [name, expectation] of Object.entries(
  identityLabelingExpectations,
)) {
  const entry = registryItems.get(name);

  if (!entry) {
    throw new Error(`Missing identity-labeling registry item "${name}".`);
  }

  assertExactArray({
    actual: entry.item.dependencies,
    expected: expectation.dependencies,
    field: "dependencies",
    file: entry.file,
  });
  assertExactArray({
    actual: entry.item.devDependencies,
    expected: expectation.devDependencies,
    field: "devDependencies",
    file: entry.file,
  });
  assertExactArray({
    actual: entry.item.registryDependencies,
    expected: expectation.registryDependencies,
    field: "registryDependencies",
    file: entry.file,
  });
  assertExactArray({
    actual: entry.item.files?.map(({ path }) => path),
    expected: expectation.files,
    field: "files",
    file: entry.file,
  });

  if (entry.item.cssVars !== undefined) {
    throw new Error(
      `${entry.file}: identity-labeling items must inherit cssVars from dethink-base instead of declaring local cssVars.`,
    );
  }
}

const baseEntry = registryItems.get("dethink-base");

if (!baseEntry) {
  throw new Error("Missing dethink-base registry item.");
}

const requiredIdentityCssVars = [
  "color-background",
  "color-foreground",
  "color-muted",
  "color-muted-foreground",
  "color-border",
  "color-input",
  "color-ring",
  "color-primary",
  "color-destructive",
  "color-success",
  "color-warning",
  "color-info",
  "density-control",
  "density-gap",
];
const baseThemeVars = baseEntry.item.cssVars?.theme;

if (
  typeof baseThemeVars !== "object" ||
  baseThemeVars === null ||
  Array.isArray(baseThemeVars)
) {
  throw new Error(
    `${baseEntry.file}: expected cssVars.theme object for identity-labeling tokens.`,
  );
}

for (const token of requiredIdentityCssVars) {
  if (typeof baseThemeVars[token] !== "string") {
    throw new Error(
      `${baseEntry.file}: missing cssVars.theme["${token}"] required by identity-labeling items.`,
    );
  }
}

console.log(`Validated ${files.length} registry item(s).`);
console.log("Validated identity-labeling registry metadata.");
