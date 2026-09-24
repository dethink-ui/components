// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { FileUpload } from ".";
it("renders labels and restrictions without browser APIs", () => {
  const html = renderToString(
    <FileUpload label="Evidence" accept=".pdf" maxFileSize={1024} />,
  );
  expect(html).toContain("Evidence");
  expect(html).toContain(".pdf");
  expect(html).toContain("1 KiB");
});
