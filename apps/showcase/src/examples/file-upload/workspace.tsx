"use client";

import { useRef, useState } from "react";
import {
  Button,
  FileUpload,
  type FileUploadHandler,
} from "@dethink/components";
import { FileUp, ShieldCheck } from "lucide-react";

function waitForTick(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer);
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", cancel);
      resolve();
    }, 200);
    if (signal.aborted) cancel();
    else signal.addEventListener("abort", cancel, { once: true });
  });
}

export function FileUploadWorkspace() {
  const failNext = useRef(false);
  const [armed, setArmed] = useState(false);
  const upload: FileUploadHandler = async (_file, { signal, onProgress }) => {
    const fail = failNext.current;
    if (fail) {
      failNext.current = false;
      setArmed(false);
    }
    for (let progress = 0; progress <= 100; progress += 5) {
      await waitForTick(signal);
      onProgress(progress);
      if (fail && progress >= 40)
        throw new Error("Connection interrupted. Retry this file.");
    }
  };
  return (
    <div className="bg-background text-foreground border-border mx-auto w-full max-w-3xl overflow-hidden rounded-xl border">
      <div className="border-border flex items-center justify-between gap-4 border-b px-5 py-3">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <FileUp className="size-3.5" aria-hidden="true" />
          <span>PROJECT / DOCUMENTS</span>
        </div>
        <span className="text-muted-foreground text-xs">Local demo</span>
      </div>
      <div className="p-5 sm:p-7">
        <FileUpload
          label="Project files"
          description="Bring the brief, notes, and references together. Review your files before uploading."
          multiple
          accept=".pdf,.docx,.png,.jpg"
          maxFiles={10}
          maxFileSize={20 * 1024 * 1024}
          onUpload={upload}
        />
      </div>
      <div className="border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
        <p className="text-muted-foreground flex items-center gap-2 text-xs">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          Simulated uploads. Files stay in your browser.
        </p>
        <Button
          variant="link"
          size="xs"
          disabled={armed}
          onClick={() => {
            failNext.current = true;
            setArmed(true);
          }}
        >
          {armed ? "Next upload will fail once" : "Make next upload fail"}
        </Button>
      </div>
    </div>
  );
}

export function FileUploadSingle() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <FileUpload
        label="Signed agreement"
        description="Choose one PDF. An invalid replacement keeps your current document."
        accept=".pdf"
        maxFileSize={5 * 1024 * 1024}
        onUpload={async (_file, { signal, onProgress }) => {
          for (let value = 0; value <= 100; value += 10) {
            await waitForTick(signal);
            onProgress(value);
          }
        }}
      />
      <p className="text-muted-foreground mt-4 text-xs">
        Local simulation · no files leave your browser.
      </p>
    </div>
  );
}

export function FileUploadAutomatic() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <FileUpload
        label="Image attachments"
        description="Accepted images start immediately. Cancel and retry each file independently."
        multiple
        accept="image/png,image/jpeg,image/webp"
        maxFiles={5}
        maxFileSize={8 * 1024 * 1024}
        autoUpload
        onUpload={async (_file, { signal }) => {
          for (let i = 0; i < 12; i++) await waitForTick(signal);
        }}
      />
      <p className="text-muted-foreground mt-4 text-xs">
        Local simulation with unknown progress · no files leave your browser.
      </p>
    </div>
  );
}
