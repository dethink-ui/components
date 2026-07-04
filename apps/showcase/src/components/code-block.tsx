import { codeToHtml } from "shiki";
import { CopyButton } from "@/components/copy-button";

interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
}

export async function CodeBlock({ code, lang = "tsx", filename }: CodeBlockProps) {
  const trimmed = code.trimEnd();
  const html = await codeToHtml(trimmed, {
    lang,
    theme: "vitesse-dark",
  });

  return (
    <div className="sc-code-block overflow-hidden rounded-lg border border-[var(--sc-code-border)] bg-[var(--sc-code-bg)] text-[var(--sc-code-foreground)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-2">
        <span className="font-mono text-xs text-[oklch(0.72_0.03_200)]">
          {filename ?? lang}
        </span>
        <CopyButton text={trimmed} />
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
