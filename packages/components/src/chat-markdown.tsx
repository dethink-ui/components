"use client";

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- Bounded code/table regions need keyboard focus for scrolling. */

import { Children, isValidElement, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { cn } from "./utils/cn";
import { IconButton } from "./components/icon-button";
import { safeChatUrl } from "./components/chat/chat-state";
import { useChatAction } from "./components/chat/use-chat-action";

function sourceText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? sourceText(child.props.children)
          : "",
    )
    .join("");
}
function CodeBlock({ children }: { children?: ReactNode }) {
  const { pending, error, notice, perform } = useChatAction();
  const code = sourceText(children);
  return (
    <div className="border-border bg-muted/40 my-4 min-w-0 overflow-hidden rounded-xl border">
      <div className="border-border text-muted-foreground flex items-center justify-between border-b px-3 py-1.5 text-xs">
        <span>Code</span>
        <IconButton
          size="sm"
          aria-label="Copy code"
          title="Copy code"
          disabled={pending}
          onClick={() =>
            void perform(() => {
              if (!navigator.clipboard)
                throw new Error(
                  "Clipboard unavailable. Select and copy the code below.",
                );
              return navigator.clipboard.writeText(code);
            }, "Code copied")
          }
        >
          {notice ? <Check /> : <Copy />}
        </IconButton>
      </div>
      <pre
        tabIndex={0}
        aria-label="Code block"
        className="focus-visible:ring-ring m-0 overflow-x-auto p-4 font-mono text-xs leading-6 outline-none focus-visible:ring-2 focus-visible:ring-inset"
      >
        {children}
      </pre>
      <span role="status" className="sr-only">
        {notice}
      </span>
      {error && (
        <p role="alert" className="text-destructive px-4 pb-3 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
const components: Components = {
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  a: ({ href, children }) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-4"
      >
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : (
      <span>{children}</span>
    ),
  img: ({ alt }) => (
    <span className="text-muted-foreground">
      [Image: {alt || "Image reference"}]
    </span>
  ),
  table: ({ children }) => (
    <div
      className="border-border my-4 overflow-x-auto rounded-lg border"
      role="region"
      tabIndex={0}
      aria-label="Response table"
    >
      <table className="w-full border-collapse text-start text-sm">
        {children}
      </table>
    </div>
  ),
};
const plugins = [remarkGfm];
/** Optional entry point. No raw HTML, remote image fetching, or arbitrary plugin execution. */
export function MarkdownMessage({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      data-slot="markdown-message"
      className={cn(
        "[&_blockquote]:border-border [&_blockquote]:text-muted-foreground [&_td]:border-border [&_th]:bg-muted/50 min-w-0 text-sm leading-7 [overflow-wrap:anywhere] [&_blockquote]:border-s-2 [&_blockquote]:ps-4 [&_code]:font-mono [&_code]:text-[0.875em] [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-semibold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_td]:border-t [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-start [&_ul]:list-disc [&_ul]:ps-5",
        className,
      )}
    >
      <Markdown
        skipHtml
        remarkPlugins={plugins}
        urlTransform={(url) => safeChatUrl(url) ?? ""}
        components={components}
      >
        {text}
      </Markdown>
    </div>
  );
}
