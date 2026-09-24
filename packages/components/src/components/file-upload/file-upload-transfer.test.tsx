import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { FileUpload, type FileUploadContext } from ".";

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function select(container: HTMLElement, names: string[]) {
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: {
      files: names.map(
        (name) => new File(["content"], name, { lastModified: 1 }),
      ),
    },
  });
}

it("requires confirmation and treats 100% as finishing until the callback resolves", async () => {
  const task = deferred();
  let context!: FileUploadContext;
  const upload = vi.fn((_file, ctx: FileUploadContext) => {
    context = ctx;
    return task.promise;
  });
  const { container } = render(<FileUpload onUpload={upload} />);
  select(container, ["brief.pdf"]);
  expect(upload).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Upload file" }));
  expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  act(() => context.onProgress(100));
  expect(screen.getByText(/Finishing/)).toBeVisible();
  await act(async () => {
    task.resolve();
    await task.promise;
  });
  expect(screen.getByText(/Uploaded/)).toBeVisible();
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
});

it("limits concurrency to three and starts the next queued file when a slot clears", async () => {
  const tasks = Array.from({ length: 4 }, deferred);
  let index = 0;
  const upload = vi.fn(() => tasks[index++]!.promise);
  const { container, unmount } = render(
    <FileUpload multiple onUpload={upload} />,
  );
  select(container, ["a", "b", "c", "d"]);
  await userEvent.click(screen.getByRole("button", { name: "Upload 4 files" }));
  expect(upload).toHaveBeenCalledTimes(3);
  expect(screen.getByText(/Queued/)).toBeVisible();
  await act(async () => {
    tasks[0]!.resolve();
    await tasks[0]!.promise;
  });
  expect(upload).toHaveBeenCalledTimes(4);
  unmount();
});

it("cancels, retries with a fresh signal, and ignores late results from the cancelled attempt", async () => {
  const old = deferred();
  const fresh = deferred();
  const contexts: FileUploadContext[] = [];
  const upload = vi.fn((_file, ctx: FileUploadContext) => {
    contexts.push(ctx);
    return contexts.length === 1 ? old.promise : fresh.promise;
  });
  const { container } = render(<FileUpload onUpload={upload} autoUpload />);
  select(container, ["brief.pdf"]);
  await userEvent.click(
    screen.getByRole("button", { name: "Cancel brief.pdf" }),
  );
  expect(contexts[0]!.signal.aborted).toBe(true);
  await userEvent.click(
    screen.getByRole("button", { name: "Retry brief.pdf" }),
  );
  expect(contexts[1]!.signal.aborted).toBe(false);
  await act(async () => {
    contexts[0]!.onProgress(90);
    old.resolve();
    await old.promise;
  });
  expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  await act(async () => {
    contexts[1]!.onProgress(42);
  });
  expect(screen.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "42",
  );
  await act(async () => {
    fresh.resolve();
    await fresh.promise;
  });
  expect(screen.getByText(/Uploaded/)).toBeVisible();
});

it("retries only failures and catches synchronous callback errors", async () => {
  let attempts = 0;
  const upload = vi.fn((file: File) => {
    if (file.name === "fail.pdf" && attempts++ === 0)
      throw new Error("Connection lost. Try again.");
    return Promise.resolve();
  });
  const { container } = render(
    <FileUpload multiple autoUpload onUpload={upload} />,
  );
  select(container, ["ok.pdf", "fail.pdf"]);
  await waitFor(() =>
    expect(screen.getByText("Connection lost. Try again.")).toBeVisible(),
  );
  await userEvent.click(screen.getByRole("button", { name: "Retry fail.pdf" }));
  await waitFor(() =>
    expect(screen.getAllByText(/ · Uploaded/)).toHaveLength(2),
  );
  expect(
    upload.mock.calls.filter(([file]) => file.name === "ok.pdf"),
  ).toHaveLength(1);
});

it("aborts active uploads on replacement and unmount and ignores progress afterwards", async () => {
  const task = deferred();
  const contexts: FileUploadContext[] = [];
  const change = vi.fn();
  const { container, unmount } = render(
    <FileUpload
      autoUpload
      onFilesChange={change}
      onUpload={(_file, ctx) => {
        contexts.push(ctx);
        return task.promise;
      }}
    />,
  );
  select(container, ["old.pdf"]);
  select(container, ["new.pdf"]);
  expect(contexts[0]!.signal.aborted).toBe(true);
  expect(screen.queryByTitle("old.pdf")).not.toBeInTheDocument();
  unmount();
  expect(contexts[1]!.signal.aborted).toBe(true);
  const count = change.mock.calls.length;
  await act(async () => {
    contexts[1]!.onProgress(80);
    task.resolve();
    await task.promise;
  });
  expect(change).toHaveBeenCalledTimes(count);
});

it("does not upload automatically without a callback", () => {
  const { container } = render(<FileUpload autoUpload />);
  select(container, ["a.pdf"]);
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  expect(screen.getByTitle("a.pdf")).toBeVisible();
});

it("holds queued transfers while disabled and resumes them when re-enabled", async () => {
  const tasks = Array.from({ length: 5 }, deferred);
  let index = 0;
  const upload = vi.fn(() => tasks[index++]!.promise);
  const { container, rerender } = render(
    <FileUpload multiple autoUpload onUpload={upload} />,
  );
  select(container, ["a", "b", "c", "d", "e"]);
  expect(upload).toHaveBeenCalledTimes(3);
  rerender(<FileUpload multiple autoUpload disabled onUpload={upload} />);
  await act(async () => {
    tasks[0]!.resolve();
  });
  await userEvent.click(screen.getByRole("button", { name: "Cancel b" }));
  expect(upload).toHaveBeenCalledTimes(3);
  expect(screen.getAllByText(/ · Queued/)).toHaveLength(2);
  rerender(<FileUpload multiple autoUpload onUpload={upload} />);
  expect(upload).toHaveBeenCalledTimes(5);
});

it.each(["success", "failure"])(
  "preserves focus on the row action after upload %s",
  async (outcome) => {
    const task = deferred();
    const { container } = render(
      <FileUpload autoUpload onUpload={() => task.promise} />,
    );
    select(container, ["a.pdf"]);
    const cancel = screen.getByRole("button", { name: "Cancel a.pdf" });
    cancel.focus();
    await act(async () => {
      if (outcome === "success") task.resolve();
      else task.reject(new Error("Try again"));
    });
    const action = screen.getByRole("button", {
      name: `${outcome === "success" ? "Remove" : "Retry"} a.pdf`,
    });
    expect(action).toBe(cancel);
    expect(action).toHaveFocus();
  },
);

it("does not move focus from another control when an upload completes", async () => {
  const task = deferred();
  const { container } = render(
    <FileUpload autoUpload onUpload={() => task.promise} />,
  );
  select(container, ["a.pdf"]);
  const picker = screen.getByRole("button", { name: "Replace file" });
  picker.focus();
  await act(async () => {
    task.resolve();
  });
  expect(picker).toHaveFocus();
});
