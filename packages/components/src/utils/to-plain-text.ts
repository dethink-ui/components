// Converts React content into a stable string for accessible option typeahead.

import { Children, isValidElement, type ReactNode } from "react";

export function toPlainText(value: ReactNode): string {
  return Children.toArray(value)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return toPlainText(child.props.children);
      }

      return "";
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}
