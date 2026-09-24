import type { Meta, StoryObj } from "@storybook/react-vite";
import { DethinkProvider, FileUpload } from "@dethink/components";
import { expect, userEvent, within } from "storybook/test";
const meta = {
  title: "Components/FileUpload",
  component: FileUpload,
  decorators: [
    (Story) => (
      <DethinkProvider className="max-w-xl p-6">
        <Story />
      </DethinkProvider>
    ),
  ],
  args: {
    label: "Attachments",
    multiple: true,
    accept: ".pdf,.docx,.png,.jpg",
    maxFiles: 10,
    maxFileSize: 20 * 1024 * 1024,
  },
} satisfies Meta<typeof FileUpload>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Staged: Story = {
  play: async ({ canvasElement }) => {
    const input =
      canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(
      input,
      new File(["Evidence"], "Research brief.pdf", { type: "application/pdf" }),
    );
    await expect(
      within(canvasElement).getByTitle("Research brief.pdf"),
    ).toBeVisible();
  },
};
export const Single: Story = { args: { multiple: false } };
export const Disabled: Story = { args: { disabled: true } };
export const Dark: Story = {
  decorators: [
    (Story) => (
      <DethinkProvider theme="dark" className="bg-background p-5">
        <Story />
      </DethinkProvider>
    ),
  ],
  play: Staged.play,
};
export const CompactRtl: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl" data-density="compact">
        <Story />
      </div>
    ),
  ],
  play: Staged.play,
};
export const Uploading: Story = {
  args: {
    autoUpload: true,
    onUpload: (_file, { signal, onProgress }) => {
      onProgress(62);
      return new Promise<void>((resolve) => {
        signal.addEventListener("abort", () => resolve(), { once: true });
      });
    },
  },
  play: Staged.play,
};
export const Failed: Story = {
  args: {
    autoUpload: true,
    onUpload: () =>
      Promise.reject(new Error("Connection interrupted. Retry this file.")),
  },
  play: Staged.play,
};
