# File Upload

Compact single and multiple file selection with shared validation and per-file
rejection feedback. Filenames stay prominent; restrictions are visible before
selection. Install the `file-upload` registry item after the documented base setup,
or import `FileUpload` from `@dethink/components`.

```tsx
<FileUpload
  label="Supporting documents"
  multiple
  accept=".pdf,.docx,.png,.jpg"
  maxFiles={10}
  maxFileSize={20 * 1024 * 1024}
  onFilesChange={(entries) => console.log(entries.map((entry) => entry.file))}
/>
```

Single selection is the default. `multiple` enables accumulated batches.
`accept` supports extensions, MIME types and wildcards. `maxFileSize` is inclusive
and expressed in bytes; labels use binary KiB/MiB. No size/type limits are imposed
unless configured. `maxFiles` limits multiple selection; single mode allows one.
`onFilesChange` reports stable IDs and File objects. This is a locally managed
queue, not a controlled native form field. Files are not submitted automatically.

Invalid replacements preserve the original. Mixed batches keep valid files.
Duplicate matching uses name, size, type and modification time, not content hashes.
Errors are associated with individual filenames. Labels, keyboard focus and
announcements support selecting, replacing, removing and dismissing errors.

Client-side metadata restrictions improve usability; validate content, authorization,
storage keys and limits on the server. Native accept only filters the picker.
Render filenames as text; never use them directly as trusted storage paths.

The component uses semantic tokens, logical layout and shared button styling.
Test selection with keyboard, narrow viewports and assistive technology in the host
form. Automated tests cover validation, rendered selection and SSR. This additive
component does not change existing Chat attachment APIs.

## Uploads and recovery

Pass `onUpload(file, { id, signal, onProgress })` returning `Promise<void>` to
enable uploads. The component stages files until Upload is pressed. `autoUpload`
opts into immediate uploads of accepted files. Up to three attempts run at once.
Report real transfer percent through `onProgress`; omit it for indeterminate
progress. Only promise resolution marks success, including after 100% transfer.
Reject with a user-safe Error message to show failure. Retry starts a fresh
attempt for that file, preserving completed files. Cancel aborts its signal;
the host must pass it to its transport. Cancellation is also supported while queued.

```tsx
<FileUpload multiple onUpload={async (file, { signal }) => {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/files", { method: "POST", body, signal });
  if (!response.ok) throw new Error("Upload failed. Please try again.");
}} />
```

The thin progress track sits under the filename and is capped at 12rem.
Metadata uses small text; Cancel/Retry remain inline. `onFilesChange` receives
selected, queued, uploading, uploaded, error or cancelled entries, including
progress and error where applicable. This callback is a notification, not a
controlled value setter. Treat entries as immutable. No endpoint, credentials,
remote deletion or storage are built in. Removing an uploaded entry removes it
locally only. File replacement and unmount abort active attempts; late responses
cannot overwrite a newer attempt. Callbacks must honor signals to stop actual
network work. Disabling the field blocks selection/start/removal, while Cancel
remains available for active work. Queued transfers wait while disabled and
resume when the field is re-enabled; transfers already running may finish.

## Anatomy and types

The root contains a labelled heading, optional description, persistent drop strip,
selected file list, separate rejection list, batch summary and manual upload action.
There are no hidden global component styles beyond the documented Tailwind/token
setup. Customize the root with `className`; use `data-slot="file-upload"`,
`file-upload-drop-zone`, `file-upload-item` and `file-upload-progress` for scoped
styling. Rows expose `data-state`; the drop strip exposes `data-drop-target`.

Exports include `FileUploadProps`, `FileUploadEntry`, `FileUploadStatus`,
`FileUploadContext`, `FileUploadHandler`, `FileUploadRules`,
`FileUploadRejection`, `FileUploadRejectionCode`, `validateUploadFiles` and
`formatFileSize`. Entry objects contain `id`, `file`, `status`, optional `progress`
and optional `error`. The pure validator returns accepted Files and rejected
`{name, code, message}` records; the component displays those messages.

## Dragging and previews

Drag files onto the strip or use Choose files. A highlight indicates the target;
full validation happens after the drop. Nested enter/leave events do not flicker.
The uploader does not take over document-wide drag events. In single mode a new
drop cannot silently replace the current file: use Replace file instead. Folders
are rejected where the browser exposes directory metadata; traversal is unsupported.

PNG, JPEG, WebP, GIF and AVIF files receive small local previews. Failed decoding
falls back to the generic file icon; SVG and HTML are never embedded. Object URLs
are created after hydration and released after removal, replacement or unmount.
No file content is read during SSR. Filenames are rendered as text; long basenames
truncate while the extension stays visible and the full name remains in the title
and action accessible names.

## Themes, recipes and limitations

The showcase demonstrates a staged project batch, a single agreement, selection-only
forms and automatic image attachments with unknown progress. All upload examples
are explicitly local simulations. Configure limits for your product; there is no
transport endpoint or automatic server integration.

Semantic tokens support light/dark/high-contrast themes and density. Inline actions
have larger coarse-pointer hit targets. Use the provider's density/theme and a
`dir="rtl"` ancestor. The uploader introduces no decorative movement; its unknown
progress indicator is static and labelled rather than a fabricated percentage.
The interface ships English strings; fully customizable localization and a
controlled queue API are not provided in this version. There is no folder traversal,
clipboard workflow, durable queue, resumable transfer, file editing or remote deletion.

## Verification and manual acceptance

Unit tests cover validation boundaries, selection/replacement, resource cleanup,
concurrency, cancellation, stale results, errors and retry. Automated accessibility
and browser tests cover keyboard selection, drag batches, narrow layouts and themes.
SSR and clean registry-consumer checks verify portability. Run `pnpm test:file-upload`
and `pnpm registry:smoke:file-upload`; package tests run in `pnpm check`.

Manual keyboard/screen-reader acceptance: locate the labelled Choose files button;
cancel and reopen the picker; select a mixed batch; hear the batch announcement;
find the individual errors; remove a file and confirm focus returns to the picker;
start uploads, inspect named progress, cancel and retry one file; confirm completion
is announced without reading every percentage change. Test this with the host form
and target assistive technologies; axe does not replace that check.

## Migration

Additive component. Existing Chat attachments and Progress APIs are unchanged.
Local queue state is not persisted; keep file objects in the host if your flow
needs to survive unmounting, and use server-side storage for durable uploads.
