import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState, emptyStateClassNames } from ".";

describe("EmptyState", () => {
  it("renders visual, copy, actions, and footer slots", () => {
    render(
      <EmptyState
        visual={<span>Icon</span>}
        title="No invoices"
        description="Create the first invoice to start tracking revenue."
        primaryAction={<button type="button">Create invoice</button>}
        secondaryAction={<a href="/docs">Read docs</a>}
        footer="Updated just now"
      />,
    );

    expect(screen.getByText("No invoices")).toHaveAttribute(
      "data-slot",
      "empty-state-title",
    );
    expect(screen.getByRole("button", { name: "Create invoice" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read docs" })).toHaveAttribute(
      "href",
      "/docs",
    );
    expect(screen.getByText("Updated just now")).toHaveAttribute(
      "data-slot",
      "empty-state-footer",
    );
    expect(emptyStateClassNames({ className: "custom", variant: "table" })).toContain(
      "custom",
    );
  });
});
