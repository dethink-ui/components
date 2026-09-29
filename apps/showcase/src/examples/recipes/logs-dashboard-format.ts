import type { BadgeTone } from "@dethink/components";
import type { LogLevel } from "./logs-dashboard-data";

export const levelTone: Record<LogLevel, BadgeTone> = {
  error: "destructive",
  warn: "warning",
  info: "info",
  debug: "neutral",
};

export function formatTime(time: number) {
  return new Date(time).toISOString().slice(11, 19);
}
