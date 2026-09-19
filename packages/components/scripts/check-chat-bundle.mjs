import assert from "node:assert/strict";
import { fileURLToPath, URL } from "node:url";
import { log } from "node:console";
import { gzipSync } from "node:zlib";
import { build } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
for (const name of ["ChatMessage", "PromptInput", "Chat", "MarkdownMessage"]) {
  const entry = fileURLToPath(
    new URL(
      name === "MarkdownMessage"
        ? "../dist/chat-markdown.js"
        : "../dist/index.js",
      import.meta.url,
    ),
  );
  const result = await build({
    root,
    configFile: false,
    logLevel: "error",
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [
      {
        name: "chat-consumer",
        resolveId(id) {
          if (id.endsWith("virtual:chat-consumer"))
            return "\0virtual:chat-consumer";
        },
        load(id) {
          if (id === "\0virtual:chat-consumer")
            return `export { ${name} } from ${JSON.stringify(entry)};`;
        },
      },
    ],
    build: {
      write: false,
      rollupOptions: {
        input: "virtual:chat-consumer",
        preserveEntrySignatures: "strict",
        external: (id) => /^(react|react-dom)(\/|$)/.test(id),
        output: { format: "es" },
      },
    },
  });
  const chunks = (Array.isArray(result) ? result : [result]).flatMap((item) =>
    item.output.filter((part) => part.type === "chunk"),
  );
  const modules = chunks.flatMap((chunk) => Object.keys(chunk.modules));
  assert(
    !modules.some((id) => /@ai-sdk|\/ai\/dist/.test(id)),
    "SDK must not enter package consumers",
  );
  if (name !== "MarkdownMessage")
    assert(
      !modules.some((id) =>
        /react-markdown|remark-gfm|micromark|\/unified\//.test(id),
      ),
      `${name} must not pull optional Markdown`,
    );
  if (name === "ChatMessage")
    assert(
      !modules.some((id) => /framer-motion|motion-dom|react-aria/.test(id)),
      "Plain messages must not pull animation or selection runtimes",
    );
  log(
    `${name}: ${chunks.reduce((sum, chunk) => sum + gzipSync(chunk.code).length, 0)} gzip bytes (host React and CSS excluded); dependency isolation passed`,
  );
}
