"use client";

import {
  Progress,
  ProgressCircle,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
  Spinner,
} from "@dethink/components";

export function FeedbackLoading() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Spinner label="Loading reports" tone="primary" />
        <Spinner aria-label="Refreshing" variant="dots" tone="muted" />
        <Progress label="Import progress" value={68} showValue tone="info" />
      </div>
      <div className="border-border grid gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-4">
          <ProgressCircle label="Upload" value={72} showValue tone="success" />
          <div className="grid flex-1 gap-2">
            <SkeletonText lines={3} animation="shimmer" />
            <div className="flex items-center gap-3">
              <SkeletonAvatar />
              <SkeletonButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
