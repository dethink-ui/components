"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RevealButton } from "@dethink/components";
import { ArrowRight, BookOpen, Check, Copy } from "lucide-react";

const INSTALL_COMMAND = "npx shadcn@latest add @dethink/button";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}

export function WorkbenchHero({
  componentCount,
  recipeCount,
}: {
  componentCount: number;
  recipeCount: number;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can reject without user gesture / permissions; fail quietly.
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div>
        <p className="text-primary font-mono flex items-center gap-3 text-[11px] font-medium tracking-[0.14em] uppercase">
          <span aria-hidden="true" className="bg-primary h-px w-6" />
          Open code · {componentCount} components · {recipeCount} recipes
        </p>
        <h1 className="font-heading mt-4 max-w-2xl text-4xl leading-[1.08] font-bold tracking-tight text-pretty sm:text-5xl lg:text-[3.25rem]">
          A component workbench for{" "}
          <span className="sc-gradient-text">token-themed</span> product UI.
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-base leading-7">
          Every component, every state, every recipe — live on one surface. Copy
          the source; the <code className="font-mono text-[0.9em]">--dt-*</code>{" "}
          contract restyles everything, light or dark.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <RevealButton
            icon={<ArrowRight />}
            label="Open component matrix"
            variant="solid"
            size="lg"
            labelVisibility="always"
            onClick={() => scrollToSection("matrix")}
          />
          <RevealButton
            icon={<BookOpen />}
            label="Browse recipes"
            variant="outline"
            size="lg"
            labelVisibility="always"
            onClick={() => router.push("/recipes")}
          />
        </div>
      </div>

      {/* Inky terminal install card with a hover-reveal copy action. */}
      <div className="sc-terminal w-full overflow-hidden rounded-lg border shadow-lg lg:w-[30rem]">
        <div className="border-b border-[color:var(--sc-code-border)] flex items-center gap-2 px-3 py-2.5">
          <span className="size-2.5 rounded-full bg-current opacity-30" />
          <span className="size-2.5 rounded-full bg-current opacity-30" />
          <span className="size-2.5 rounded-full bg-current opacity-30" />
          <span className="ml-auto">
            <RevealButton
              icon={copied ? <Check /> : <Copy />}
              label={copied ? "Copied" : "Copy"}
              variant="ghost"
              size="xs"
              className="text-[color:var(--sc-code-foreground)]"
              onClick={copyInstall}
            />
          </span>
        </div>
        <div className="font-mono space-y-1.5 p-4 text-[12.5px] leading-relaxed">
          <div>
            <span className="text-primary">$</span> {INSTALL_COMMAND}
          </div>
          <div className="opacity-60">✓ installed src/components/button.tsx</div>
          <div className="opacity-60">
            ✓ tokens wired to --dt-* contract{" "}
            <span className="text-primary motion-safe:animate-pulse">▌</span>
          </div>
        </div>
      </div>
    </div>
  );
}
