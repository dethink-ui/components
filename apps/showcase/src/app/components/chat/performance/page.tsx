import { ChatPerformance } from "@/examples/chat/performance";
export default function ChatPerformancePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-3 text-2xl font-semibold">Chat performance fixtures</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Measure streaming and long-history behavior in your browser. These are
        local measurements, not a guaranteed frame rate.
      </p>
      <ChatPerformance />
    </main>
  );
}
