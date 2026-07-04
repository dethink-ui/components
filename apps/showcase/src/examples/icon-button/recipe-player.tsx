"use client";

import { useState } from "react";
import { IconButton } from "@dethink/components";
import {
  Heart,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
} from "lucide-react";

/**
 * A player bar built entirely from icon buttons: the accessible name flips
 * with the toggle state (Play/Pause), aria-pressed carries the toggles, and
 * a live region narrates state for screen-reader users.
 */
export function IconButtonRecipePlayer() {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [repeat, setRepeat] = useState(false);

  return (
    <div className="mx-auto max-w-xs space-y-3">
      <div className="flex items-center justify-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-2">
        <IconButton aria-label="Previous track" variant="ghost" shape="circle">
          <SkipBack />
        </IconButton>
        <IconButton
          aria-label={playing ? "Pause" : "Play"}
          shape="circle"
          size="lg"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause /> : <Play />}
        </IconButton>
        <IconButton aria-label="Next track" variant="ghost" shape="circle">
          <SkipForward />
        </IconButton>
        <IconButton
          aria-label="Like"
          aria-pressed={liked}
          variant={liked ? "soft" : "ghost"}
          shape="circle"
          onClick={() => setLiked(!liked)}
        >
          <Heart />
        </IconButton>
        <IconButton
          aria-label="Repeat"
          aria-pressed={repeat}
          variant={repeat ? "soft" : "ghost"}
          shape="circle"
          onClick={() => setRepeat(!repeat)}
        >
          <Repeat />
        </IconButton>
      </div>
      <p aria-live="polite" className="text-center text-sm text-muted-foreground">
        {playing ? "Playing" : "Paused"}
        {liked ? " · liked" : ""}
        {repeat ? " · repeat on" : ""}
      </p>
    </div>
  );
}
