"use client";

import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import { ChatWorkspace } from "../chat/workspace";

export function AiChatStudioRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  return (
    <div
      data-recipe-surface="ai-chat-studio"
      className={
        presentation === "full-page"
          ? "bg-muted/20 min-h-[calc(100dvh-7rem)] p-3 sm:p-6"
          : "min-w-0 p-2 sm:p-4"
      }
    >
      <div className="mx-auto max-w-[1440px]">
        <ChatWorkspace embedded={presentation === "embedded"} />
      </div>
    </div>
  );
}
