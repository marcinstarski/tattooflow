import { MessagesBoard } from "@/components/app/messages-board";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Wiadomości</h1>
        <p className="text-sm text-ink-300">Inbox IG/FB/email/SMS w jednym miejscu.</p>
      </div>
      <MessagesBoard />
    </div>
  );
}
