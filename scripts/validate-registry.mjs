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

for (const file of files) {
  const absolutePath = join(registryRoot, file);
  const item = JSON.parse(await readFile(absolutePath, "utf8"));

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
}

console.log(`Validated ${files.length} registry item(s).`);
