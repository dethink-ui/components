import { describe, expect, it } from "vitest";
import { validateUploadFiles, formatFileSize } from "./file-upload-validation";
const file = (name: string, size = 10, type = "") =>
  new File([new Uint8Array(size)], name, { type, lastModified: 1 });
describe("file validation", () => {
  it("matches extensions without MIME and MIME wildcards, case-insensitively", () => {
    expect(
      validateUploadFiles(
        [file("PLAN.PDF"), file("photo", 2, "image/png"), file("notes.zip")],
        [],
        { multiple: true, accept: ".pdf, image/*" },
      ),
    ).toMatchObject({
      accepted: [
        expect.objectContaining({ name: "PLAN.PDF" }),
        expect.objectContaining({ name: "photo" }),
      ],
      rejected: [expect.objectContaining({ code: "type" })],
    });
  });
  it("accepts the size boundary and valid files after invalid ones without consuming capacity", () => {
    const result = validateUploadFiles(
      [file("large.pdf", 11), file("a.pdf", 10), file("b.pdf"), file("c.pdf")],
      [],
      { multiple: true, maxFileSize: 10, maxFiles: 2 },
    );
    expect(result.accepted.map((f) => f.name)).toEqual(["a.pdf", "b.pdf"]);
    expect(result.rejected.map((f) => f.code)).toEqual(["size", "count"]);
  });
  it("rejects duplicates within and across batches without blocking different files sharing a name", () => {
    expect(
      validateUploadFiles(
        [file("a"), file("a", 20), file("a", 20)],
        [file("a")],
        { multiple: true },
      ).rejected.map((r) => r.code),
    ).toEqual(["duplicate", "duplicate"]);
  });
  it("rejects a multi-file batch in single mode and respects existing capacity", () => {
    expect(validateUploadFiles([file("a"), file("b")]).accepted).toHaveLength(
      0,
    );
    expect(
      validateUploadFiles([file("b")], [file("a")]).rejected[0]?.code,
    ).toBe("count");
  });
  it("allows empty files and unrestricted sizes by default", () => {
    expect(validateUploadFiles([file("empty", 0)]).accepted).toHaveLength(1);
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1024 * 1024)).toBe("1 MiB");
  });
});
