import { readFile } from "node:fs/promises";
import path from "node:path";

const examplesRoot = path.join(process.cwd(), "apps/showcase/src/examples");
const localExamplesRoot = path.join(process.cwd(), "src/examples");

/**
 * Reads the source of an example component so the displayed code is always
 * the exact file that renders the live preview. Resolves from either the
 * workspace root or the app directory, depending on where Next.js runs.
 */
export async function getExampleSource(relativePath: string): Promise<string> {
  try {
    return await readFile(path.join(localExamplesRoot, relativePath), "utf8");
  } catch {
    return await readFile(path.join(examplesRoot, relativePath), "utf8");
  }
}
