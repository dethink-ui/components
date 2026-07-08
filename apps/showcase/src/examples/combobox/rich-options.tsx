"use client";

import { Combobox, ComboboxItem } from "@dethink/components";

const repositories = [
  { value: "dethink/components", stars: "2.4k", language: "TypeScript" },
  { value: "dethink/registry", stars: "830", language: "TypeScript" },
  { value: "dethink/docs", stars: "410", language: "MDX" },
  { value: "dethink/examples", stars: "220", language: "TypeScript" },
];

export function ComboboxRichOptions() {
  return (
    <div className="mx-auto max-w-sm">
      <Combobox
        label="Repository"
        placeholder="Search repositories"
        items={repositories}
        menuTrigger="focus"
      >
        {(repo) => (
          <ComboboxItem
            key={repo.value}
            value={repo.value}
            textValue={repo.value}
          >
            <span className="flex w-full items-baseline justify-between gap-3">
              <span className="font-mono text-sm">{repo.value}</span>
              <span className="text-muted-foreground text-xs">
                {repo.language} · ★ {repo.stars}
              </span>
            </span>
          </ComboboxItem>
        )}
      </Combobox>
    </div>
  );
}
