import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { FileUpload } from ".";
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function choose(container: HTMLElement, files: File[]) {
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: { files },
  });
}
it("keeps valid files from a mixed batch, reports errors, removes and restores focus", async () => {
  const change = vi.fn();
  const { container } = render(
    <FileUpload multiple accept=".pdf" onFilesChange={change} />,
  );
  choose(container, [
    new File(["hi"], "note.pdf"),
    new File(["bad"], "photo.exe"),
  ]);
  expect(screen.getByTitle("note.pdf")).toBeVisible();
  expect(screen.getByText(/File type not supported/)).toBeVisible();
  expect(change.mock.calls[0]?.[0]).toHaveLength(1);
  await userEvent.click(
    screen.getByRole("button", { name: "Remove note.pdf" }),
  );
  expect(screen.queryByTitle("note.pdf")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Choose files" })).toHaveFocus();
});
it("preserves the current single file on invalid replacement and cancelled selection", () => {
  const { container } = render(<FileUpload accept=".pdf" />);
  choose(container, [new File(["hi"], "original.pdf")]);
  choose(container, [new File(["bad"], "wrong.txt")]);
  choose(container, []);
  expect(screen.getByTitle("original.pdf")).toBeVisible();
  choose(container, [new File(["ok"], "replacement.pdf")]);
  expect(screen.queryByTitle("original.pdf")).not.toBeInTheDocument();
  expect(screen.getByTitle("replacement.pdf")).toBeVisible();
});
it("blocks disabled selection", () => {
  const { container } = render(<FileUpload disabled />);
  choose(container, [new File(["hi"], "note.pdf")]);
  expect(screen.queryByTitle("note.pdf")).not.toBeInTheDocument();
});

it("cleans up raster previews on removal and falls back after decoding failure", async () => {
  const create = vi.fn(() => "blob:test-preview");
  const revoke = vi.fn();
  class PreviewURL extends URL {
    static createObjectURL = create;
    static revokeObjectURL = revoke;
  }
  vi.stubGlobal("URL", PreviewURL);
  const { container } = render(<FileUpload />);
  choose(container, [new File(["image"], "photo.png", { type: "image/png" })]);
  const image = container.querySelector("img")!;
  expect(image).toHaveAttribute("src", "blob:test-preview");
  fireEvent.error(image);
  expect(container.querySelector("img")).toBeNull();
  await userEvent.click(
    screen.getByRole("button", { name: "Remove photo.png" }),
  );
  expect(revoke).toHaveBeenCalledWith("blob:test-preview");
});

it("never renders SVG as an image preview", () => {
  const { container } = render(<FileUpload />);
  choose(container, [
    new File(["<svg/>"], "drawing.svg", { type: "image/svg+xml" }),
  ]);
  expect(container.querySelector("img")).toBeNull();
});
