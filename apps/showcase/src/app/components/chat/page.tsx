import type { Metadata } from "next";
import Link from "next/link";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { ChatBasic } from "@/examples/chat/basic";
import { ChatWorkspace, EmbeddedCopilot } from "@/examples/chat/workspace";
import { ChatSdkExample } from "@/examples/chat/sdk-example";
import { PropsTable } from "@/components/props-table";
import { chatProps } from "@/lib/props/chat";
import { ChatComposerTools } from "@/examples/chat/composer-tools";

export const metadata: Metadata = {
  title: "Chat",
  description:
    "Compose polished AI conversations with streaming, thinking, tool activity, approvals, and a capable prompt input.",
};
export default function ChatPage() {
  return (
    <DocsPage
      name="Chat"
      description="A complete conversation surface, built from independently useful components. Give every stage of an AI response a clear, calm presence."
    >
      <DocsSection
        id="workspace"
        title="A complete conversation"
        description="Try a prompt, switch conversations, or ask for approval before reading documents. Everything runs locally with sample responses."
      >
        <ExampleBlock file="chat/workspace.tsx" title="AI chat workspace">
          <ChatWorkspace embedded />
        </ExampleBlock>
        <Link
          href="/recipes/ai-chat-studio?view=preview"
          className="text-primary mt-4 inline-flex text-sm underline underline-offset-4"
        >
          Open the full AI Chat Studio recipe
        </Link>
      </DocsSection>
      <DocsSection
        id="examples"
        title="Examples"
        description="A controlled transcript and accessible composer, ready for your application's data."
      >
        <ExampleBlock file="chat/basic.tsx" title="A simple conversation">
          <ChatBasic />
        </ExampleBlock>
      </DocsSection>
      <InstallationSection
        registryName="chat"
        importCode={
          'import { Chat, PromptInput, ChatMessage } from "@dethink/components";'
        }
      />
      <DocsSection id="composer" title="A composer that fits your product">
        <ExampleBlock
          file="chat/composer-tools.tsx"
          title="Custom composer actions"
        >
          <ChatComposerTools />
        </ExampleBlock>
      </DocsSection>
      <DocsSection id="copilot" title="An embedded copilot">
        <ExampleBlock file="chat/workspace.tsx" title="A little room to think">
          <EmbeddedCopilot />
        </ExampleBlock>
      </DocsSection>
      <DocsSection
        id="sdk"
        title="Optional AI SDK integration"
        description="The same public components, connected to AI SDK 6. This local endpoint exercises text, tools, approval, sources, files, errors, and cancellation without credentials."
      >
        <ExampleBlock
          file="chat/sdk-example.tsx"
          title="A real stream, with sample data"
        >
          <ChatSdkExample />
        </ExampleBlock>
      </DocsSection>
      <DocsSection
        id="props"
        title="API"
        description="Controlled data, small composable parts, and explicit callbacks. Returning false or rejecting keeps the draft or reports the action error."
      >
        <PropsTable caption="Chat props" rows={chatProps} />
      </DocsSection>
      <DocsSection
        id="performance"
        title="Long conversations"
        description="Follow the latest response until you scroll away. Older history, media resizing, and new chunks preserve the reader's position."
      >
        <Link
          className="text-primary text-sm underline underline-offset-4"
          href="/components/chat/performance"
        >
          Open the 500 and 5,000-message performance fixtures
        </Link>
        <p className="text-muted-foreground mt-3 text-sm leading-7">
          Windowing is opt-in. Keep it off for browser find, full transcript
          copy, and complete screen-reader traversal. Keep completed message
          references stable while streaming updates to the active message.
        </p>
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground text-sm leading-7">
          Messages use a named, semantic transcript. Enter sends, Shift + Enter
          adds a line, and IME composition never submits. The transcript keeps
          focus where you left it, with a separate status channel for meaningful
          activity updates.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
