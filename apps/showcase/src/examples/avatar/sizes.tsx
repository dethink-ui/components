"use client";

import {
  Avatar,
  type AvatarRing,
  type AvatarShape,
  type AvatarSize,
} from "@dethink/components";
import { avatarImagePaths } from "@/examples/_shared/avatar-members";

const sizes: AvatarSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
const shapes: AvatarShape[] = ["circle", "rounded", "square"];
const rings: AvatarRing[] = ["none", "border", "ring"];

export function AvatarSizes() {
  return (
    <div className="grid w-full gap-8">
      <div className="flex flex-wrap items-end gap-[var(--dt-space-4)]">
        {sizes.map((size) => (
          <div key={size} className="grid justify-items-center gap-2">
            <Avatar
              name={`Avatar size ${size}`}
              src={avatarImagePaths.eli}
              size={size}
              ring="border"
              decoding="async"
              loading="lazy"
              sizes="72px"
            />
            <span className="text-muted-foreground text-xs">{size}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {shapes.map((shape) => (
          <div
            key={shape}
            className="flex min-w-0 items-center gap-[var(--dt-space-3)]"
          >
            <Avatar
              name={`${shape} avatar`}
              src={avatarImagePaths.mira}
              shape={shape}
              size="lg"
              ring="border"
              decoding="async"
              loading="lazy"
              sizes="48px"
            />
            <span className="truncate text-sm font-medium capitalize">
              {shape}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-[var(--dt-space-4)]">
        {rings.map((ring) => (
          <div key={ring} className="grid justify-items-center gap-2">
            <Avatar
              name={`${ring} ring avatar`}
              src={avatarImagePaths.leo}
              ring={ring}
              size="xl"
              decoding="async"
              loading="lazy"
              sizes="64px"
            />
            <span className="text-muted-foreground text-xs">{ring}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
