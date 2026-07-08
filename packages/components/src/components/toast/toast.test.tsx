import { act } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, ToastViewport, toastClassNames, useToast } from ".";

function ToastControls() {
  const { toast } = useToast();

  return (
    <button
      type="button"
      onClick={() =>
        toast({
          action: {
            label: "Undo",
            onClick: vi.fn(),
          },
          description: "Workspace settings were saved.",
          duration: 1000,
          title: "Saved",
          tone: "success",
        })
      }
    >
      Show toast
    </button>
  );
}

function BatchedToastControls() {
  const { toast } = useToast();

  return (
    <button
      type="button"
      onClick={() => {
        toast({
          duration: 1000,
          title: "First toast",
        });
        toast({
          duration: 1000,
          title: "Second toast",
        });
      }}
    >
      Show two toasts
    </button>
  );
}

function CustomToastControls() {
  const { toast } = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          toast({
            announcement: "Custom import finished",
            render: (
              <div>
                <strong>Custom import</strong>
                <p>12 rows matched with warnings.</p>
              </div>
            ),
          })
        }
      >
        Show custom node
      </button>
      <button
        type="button"
        onClick={() =>
          toast({
            announcement: "Custom action available",
            persistent: true,
            render: ({ dismiss }) => (
              <div>
                <strong>Custom action</strong>
                <button type="button" onClick={dismiss}>
                  Resolve custom toast
                </button>
              </div>
            ),
          })
        }
      >
        Show custom render
      </button>
    </>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Toast", () => {
  it("adds, announces, pauses, resumes, and dismisses toasts", async () => {
    vi.useFakeTimers();

    render(
      <ToastProvider defaultDuration={1000} motion="none">
        <ToastControls />
        <ToastViewport />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));

    const toast = screen.getByText("Saved").closest('[data-slot="toast"]');

    if (!toast) {
      throw new Error("Toast should render.");
    }

    expect(toast).toHaveAttribute("data-tone", "success");
    expect(
      document.querySelector('[data-slot="live-region-polite"]'),
    ).toHaveTextContent("Saved. Workspace settings were saved.");

    fireEvent.pointerEnter(toast);

    await act(async () => {
      vi.advanceTimersByTime(1200);
    });

    expect(screen.getByText("Saved")).toBeInTheDocument();

    fireEvent.pointerLeave(toast);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("keeps same-tick toast additions instead of replacing earlier updates", () => {
    render(
      <ToastProvider defaultDuration={1000} motion="none">
        <BatchedToastControls />
        <ToastViewport />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show two toasts" }));

    const viewport = screen.getByRole("list", { name: "Notifications" });

    expect(within(viewport).getByText("First toast")).toBeInTheDocument();
    expect(within(viewport).getByText("Second toast")).toBeInTheDocument();
  });

  it("supports custom render nodes and render functions", () => {
    render(
      <ToastProvider defaultDuration={1000} motion="none">
        <CustomToastControls />
        <ToastViewport />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show custom node" }));

    expect(screen.getByText("Custom import")).toBeInTheDocument();
    expect(
      screen.getByText("12 rows matched with warnings."),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="live-region-polite"]'),
    ).toHaveTextContent("Custom import finished");

    fireEvent.click(screen.getByRole("button", { name: "Show custom render" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Resolve custom toast" }),
    );

    expect(screen.queryByText("Custom action")).not.toBeInTheDocument();
  });

  it("resumes auto-dismiss after keyboard focus leaves the toast", async () => {
    vi.useFakeTimers();

    render(
      <ToastProvider defaultDuration={1000} motion="none">
        <ToastControls />
        <ToastViewport />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));

    const action = screen.getByRole("button", { name: "Undo" });

    fireEvent.focus(action);

    await act(async () => {
      vi.advanceTimersByTime(1200);
    });

    expect(screen.getByText("Saved")).toBeInTheDocument();

    fireEvent.blur(action, { relatedTarget: document.body });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("supports explicit dismiss and class helpers", () => {
    render(
      <ToastProvider
        defaultToasts={[
          {
            description: "Try the request again.",
            id: "retry",
            persistent: true,
            title: "Request failed",
            tone: "destructive",
          },
        ]}
        motion="none"
      >
        <ToastViewport />
      </ToastProvider>,
    );

    expect(screen.getByText("Request failed")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );

    expect(screen.queryByText("Request failed")).not.toBeInTheDocument();
    expect(toastClassNames({ className: "custom", tone: "info" })).toContain(
      "custom",
    );
  });
});
