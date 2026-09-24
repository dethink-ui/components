"use client";
import { FileUpload } from "@dethink/components";
export function FileUploadBasic() {
  return (
    <FileUpload
      label="Supporting documents"
      description="Add your files. Review and remove them before continuing."
      multiple
      accept=".pdf,.docx,.png,.jpg"
      maxFiles={10}
      maxFileSize={20 * 1024 * 1024}
      className="mx-auto w-full max-w-xl"
    />
  );
}
