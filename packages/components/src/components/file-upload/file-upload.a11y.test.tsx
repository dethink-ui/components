import { render, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { expect, it } from "vitest";
import { FileUpload } from ".";
it("has no automated accessibility violations in empty and mixed selection states", async () => {
  const { container } = render(
    <FileUpload label="Documents" multiple accept=".pdf" />,
  );
  expect((await axe(container)).violations).toEqual([]);
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: { files: [new File(["a"], "a.pdf"), new File(["b"], "b.exe")] },
  });
  expect((await axe(container)).violations).toEqual([]);
});
