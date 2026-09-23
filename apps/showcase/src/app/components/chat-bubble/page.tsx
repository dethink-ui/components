import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { ChatBubbleBasic } from "@/examples/chat-bubble/basic";
import { ChatBubbleCustom } from "@/examples/chat-bubble/custom";
import { chatBubbleProps } from "@/lib/props/chat-bubble";

export const metadata: Metadata = {
  title: "ChatBubble",
  description:
    "A customizable floating chat launcher that expands into a conversation.",
};

export default function ChatBubblePage() {
  return (
    <DocsPage
      name="ChatBubble"
      description="A quiet presence in the corner. A complete conversation, one click away."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="The launcher stays in the viewport as you scroll. Open it, send a message, then minimize and reopen without losing your place."
      >
        <ExampleBlock
          file="chat-bubble/basic.tsx"
          title="A conversation, within reach"
          description="A working local simulation with streaming, stop and retry, attachments, and preserved drafts. Nothing is uploaded."
          wide
        >
          <ChatBubbleBasic />
        </ExampleBlock>
      </DocsSection>
      <InstallationSection
        registryName="chat-bubble"
        importCode={`import { ChatBubble } from "@dethink/components";

// messages and sendMessage belong to your application's chat integration.
<ChatBubble
  contentProps={{ title: "Your team", subtitle: "Here to help" }}
  chat={{
    conversationId: "support",
    messages,
    prompt: { onSend: sendMessage },
  }}
/>`}
      />
      <DocsSection
        id="anatomy"
        title="Anatomy and composition"
        description="ChatBubble owns placement and open state. ChatBubbleTrigger opens it, ChatBubbleContent is a non-modal dialog, and ChatBubbleClose minimizes it."
      >
        <p className="text-muted-foreground text-sm leading-6">
          Pass chat for the ready-to-use composition, or supply children to
          replace the parts. Content stays mounted while closed, preserving
          composer and scroll state. Render one trigger and one content per
          root. Put application state above the widget if it must survive
          removing the entire widget or changing routes.
        </p>
        <ExampleBlock
          file="chat-bubble/custom.tsx"
          title="Make it your own"
          description="Custom support branding, a left-hand launcher, and independent open state."
          wide
        >
          <ChatBubbleCustom />
        </ExampleBlock>
      </DocsSection>
      <DocsSection id="api" title="API reference">
        <PropsTable rows={chatBubbleProps} caption="ChatBubble props" />
      </DocsSection>
      <DocsSection
        id="integration"
        title="Connect your conversation"
        description="ChatBubble reuses the existing Chat API and does not make network requests."
      >
        <div className="text-muted-foreground space-y-3 text-sm leading-6">
          <p>
            Supply messages and prompt.onSend. Returning false or rejecting a
            send preserves the draft; accepting clears it. Use run and activity
            for status, custom retry actions for recovery, and prompt.onStop for
            cancellation. Closing the panel does not stop streaming. Optional
            prompt attachments and messageActions use the same contracts as
            Chat.
          </p>
          <p>
            For a support recipe, supply your team name, avatar, and connection
            status through contentProps. For an AI assistant, pass streaming
            messages and a run. Markdown remains an optional separate
            installation. Treat file metadata as untrusted: the host owns upload
            validation, authorization, size limits, storage, and sanitization.
          </p>
          <p>
            Unread count is supplied by your app. Clear it when your app
            considers messages read; minimizing does not infer delivery or read
            receipts. All default widget labels can be replaced. Localize nested
            Chat labels through its existing props.
          </p>
        </div>
      </DocsSection>
      <DocsSection
        id="theming"
        title="Theming and layout"
        description="Inherits the nearest DethinkProvider theme, density, and direction through its portal."
      >
        <p className="text-muted-foreground text-sm leading-6">
          Use semantic background, foreground, primary, border, and ring tokens.
          Width, height, and offset props set --chat-bubble-width,
          --chat-bubble-height, and --chat-bubble-offset; style can override
          them. Use non-negative offsets that fit the viewport. Placement is
          physical: bottom-right stays right in RTL. Mobile bounds account for
          safe areas and, where available, the visual viewport above the
          keyboard. Choose zIndex to coexist with your application overlays.
        </p>
      </DocsSection>
      <DocsSection
        id="accessibility"
        title="Accessibility and testing"
        description="Keyboard and reduced-motion behavior are built in; the surrounding page stays interactive."
      >
        <div className="text-muted-foreground space-y-3 text-sm leading-6">
          <p>
            Tab to the launcher and press Enter or Space. Opening focuses the
            dialog; initialFocusRef can choose a child instead. Tab through the
            chat and back to the page without a focus trap. Escape or Minimize
            closes it and returns focus when focus was inside. Nested controls
            can prevent or stop Escape to consume it first. Closing from an
            external control does not steal focus from that control.
          </p>
          <p>
            Minimizing dismisses nested ModelPicker/Select, Popover, Dialog,
            AlertDialog, DropdownMenu, and Tooltip surfaces without resetting
            the conversation. For other portal-based controls, coordinate their
            open state with ChatBubble’s controlled open prop.
          </p>
          <p>
            Closed content is inert and hidden from assistive technology. A
            custom header must include a close control and label the dialog with
            aria-label or aria-labelledby. Reduced motion and
            motion=&quot;none&quot; remove spatial transitions. The component
            renders its portal after hydration.
          </p>
          <p>
            Acceptance checks: send with Enter, add a newline with Shift+Enter,
            test IME composition, reject a send and retry without losing text,
            stop streaming, minimize while a response arrives, and scroll older
            messages without being pulled to the end. Verify mobile keyboard
            clearance and screen-reader announcements on your supported devices.
            Automated coverage includes component behavior, axe, hydration,
            browser flows, theme/RTL/mobile screenshots, and a clean registry
            consumer build.
          </p>
        </div>
      </DocsSection>
      <DocsSection
        id="migration"
        title="Migration"
        description="This is an additive component. Existing Chat and ChatMessage consumers require no changes."
      >
        <p className="text-muted-foreground text-sm leading-6">
          To float an existing Chat, move its props into ChatBubble.chat or
          place it inside ChatBubbleContent. Preserve the same conversationId
          and app-owned message state. ChatBubble describes the widget;
          ChatMessage continues to describe an individual message.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
