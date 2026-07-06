"use client";

import { useEffect, useState } from "react";
import {
  CommandPalette,
  type CommandPaletteCommand,
} from "@dethink/components";
import { FileText, MessageSquareText, Sparkles, WandSparkles } from "lucide-react";

const baseCommands: CommandPaletteCommand[] = [
  {
    description: "Use the current incident notes as context",
    group: "AI actions",
    icon: <Sparkles aria-hidden="true" className="size-4" />,
    key: "summarize-incident",
    label: "Summarize incident",
    shortcut: "S",
  },
  {
    description: "Turn selected bullets into a customer update",
    group: "AI actions",
    icon: <MessageSquareText aria-hidden="true" className="size-4" />,
    key: "draft-update",
    label: "Draft customer update",
  },
];

const remoteCommands: CommandPaletteCommand[] = [
  {
    description: "Find similar incidents and mitigation steps",
    icon: <WandSparkles aria-hidden="true" className="size-4" />,
    key: "retrieve-runbooks",
    keywords: ["runbook", "incident", "knowledge"],
    label: "Retrieve matching runbooks",
  },
  {
    description: "Generate a release note from merged pull requests",
    icon: <FileText aria-hidden="true" className="size-4" />,
    key: "release-note",
    keywords: ["release", "changelog"],
    label: "Draft release note",
  },
  {
    description: "Compare recent evaluations for the selected model",
    icon: <Sparkles aria-hidden="true" className="size-4" />,
    key: "compare-evals",
    keywords: ["eval", "model", "quality"],
    label: "Compare model evaluations",
  },
];

export function CommandPaletteAiCommandMenu() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandPaletteCommand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRun, setLastRun] = useState("Ready for an AI command.");

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const timeout = window.setTimeout(() => {
      if (normalizedQuery.includes("fail")) {
        setResults([]);
        setError("Could not reach the command index.");
        setLoading(false);
        return;
      }

      setResults(
        remoteCommands
          .filter((command) =>
            [
              command.key,
              typeof command.label === "string" ? command.label : command.key,
              command.description,
              ...(command.keywords ?? []),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery),
          )
          .map((command) => ({
            ...command,
            action: () => setLastRun(`Queued ${String(command.label)}.`),
          })),
      );
      setLoading(false);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query, retryCount]);

  return (
    <div className="grid gap-4">
      <CommandPalette
        label="AI command menu"
        description={lastRun}
        commands={baseCommands}
        asyncCommands={results}
        query={query}
        onQueryChange={setQuery}
        loading={loading}
        error={error}
        onRetry={() => setRetryCount((count) => count + 1)}
        retryLabel="Retry search"
        minimumQueryLength={2}
        minimumQueryMessage="Type 2 or more characters to search AI commands."
        shouldFilter={false}
        staleMessage="Updating command suggestions."
      />
      <p className="text-sm leading-6 text-muted-foreground">
        Try <code className="font-mono text-foreground">runbook</code>,{" "}
        <code className="font-mono text-foreground">release</code>, or{" "}
        <code className="font-mono text-foreground">fail</code>.
      </p>
    </div>
  );
}
