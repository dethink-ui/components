import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { FileUploadBasic } from "@/examples/file-upload/basic";
import {
  FileUploadWorkspace,
  FileUploadSingle,
  FileUploadAutomatic,
} from "@/examples/file-upload/workspace";
import { PropsTable } from "@/components/props-table";
import { fileUploadProps } from "@/lib/props/file-upload";
export const metadata: Metadata = {
  title: "File Upload",
  description:
    "Compact file staging with clear restrictions and recoverable batches.",
};
export default function FileUploadPage() {
  return (
    <DocsPage
      name="File Upload"
      description="Keep filenames in focus. Add files, review the batch, and recover without starting over."
    >
      <InstallationSection
        registryName="file-upload"
        importCode={'import { FileUpload } from "@dethink/components";'}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="A compact intake strip, readable file rows, and progress right beneath the filename."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="file-upload/workspace.tsx"
            title="Project documents"
            description="Drop a mixed batch, review accepted files, and upload. Simulate a failure to try recovery without restarting the batch."
          >
            <FileUploadWorkspace />
          </ExampleBlock>
          <ExampleBlock
            file="file-upload/workspace.tsx"
            title="Single file"
            description="Replace a document without losing it when the new selection is invalid."
          >
            <FileUploadSingle />
          </ExampleBlock>
          <ExampleBlock
            file="file-upload/basic.tsx"
            title="Selection only"
            description="Use the queue as a staging field when the host owns submission."
          >
            <FileUploadBasic />
          </ExampleBlock>
          <ExampleBlock
            file="file-upload/workspace.tsx"
            title="Automatic attachments"
            description="Opt into immediate uploads and show honest indeterminate feedback when percent is unavailable."
          >
            <FileUploadAutomatic />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <PropsTable caption="FileUpload props" rows={fileUploadProps} />
      </DocsSection>
      <DocsSection id="behavior" title="Selection, progress and recovery">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Picker and drop share extension, MIME, size, count and duplicate
          checks. Valid files stay in the queue; rejected files receive
          individual explanations. Uploads run three at a time. Report real
          percentages through onProgress; resolving the callback marks success.
          Cancellation aborts its signal, and late results cannot overwrite a
          newer attempt. Removing an uploaded file only removes the local entry.
        </p>
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Choose files is always available as an alternative to dragging.
          Controls include the filename in their accessible name. Batch changes
          and terminal results are announced without reading every progress
          tick. Test your complete form with a keyboard and screen reader. Error
          text wraps, and actions remain reachable on small screens.
        </p>
      </DocsSection>
      <DocsSection id="security" title="Transport and validation">
        <p className="text-muted-foreground text-sm leading-relaxed">
          FileUpload does not provide a storage service. The application owns
          authentication, server-side content validation, upload requests and
          remote deletion. Client metadata and the accept attribute are
          usability aids. Only local raster images receive previews; object URLs
          are released when no longer needed. The examples simulate uploads
          entirely in your browser.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
