"use client";

import { I18nProvider } from "react-aria-components";
import type { ReactNode } from "react";

export function ShowcaseProviders({ children }: { children: ReactNode }) {
  return <I18nProvider locale="en-GB">{children}</I18nProvider>;
}
