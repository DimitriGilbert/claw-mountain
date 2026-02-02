import { useState } from "react";
import { Button } from "./ui/Button";
import type { BroadcastRecipient } from "../types";

interface BroadcastPanelProps {
  onBroadcast: () => void;
}

export function BroadcastPanel({ onBroadcast }: BroadcastPanelProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    recipients: number;
  } | null>(null);

  const handleBroadcast = async () => {
    if (!message.trim()) return;

    setSending(true);
    setResult(null);

    try {
      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data: { recipients?: BroadcastRecipient[] } = await response.json();

      if (data.recipients) {
        const successful = data.recipients.filter(
          (r) => r.status === "sent",
        ).length;
        setResult({ success: true, recipients: successful });
        setMessage("");
        onBroadcast();
      } else {
        setResult({ success: false, recipients: 0 });
      }
    } catch (err) {
      setResult({ success: false, recipients: 0 });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-bg-secondary p-6 rounded-lg border border-border-primary">
      <h3 className="text-lg font-semibold text-text-primary mb-3 font-display">
        📢 Broadcast Message
      </h3>
      <p className="text-text-secondary text-sm mb-4 leading-relaxed">
        Send a message to all running molts simultaneously via isolated
        sessions.
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message to broadcast to all active molts..."
        rows={4}
        disabled={sending}
        className="w-full px-4 py-3 bg-bg-input border border-border-secondary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-bg-secondary mb-4 resize-y disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-(--transition-base) font-terminal text-sm"
      />

      <Button
        variant="secondary"
        onClick={handleBroadcast}
        disabled={sending || !message.trim()}
        loading={sending}
        className="w-full"
      >
        {sending ? "Sending..." : "Broadcast"}
      </Button>

      {result && (
        <div
          className={`mt-4 px-4 py-3 rounded-lg text-sm border ${
            result.success
              ? "bg-status-success-bg text-status-success-text border-status-success/30"
              : "bg-status-error-bg text-status-error-text border-status-error/30"
          }`}
        >
          {result.success
            ? `✓ Message sent to ${result.recipients} molts`
            : "✗ Failed to broadcast message"}
        </div>
      )}
    </div>
  );
}
