import { useState } from 'react';
import './BroadcastPanel.css';

interface BroadcastPanelProps {
  onBroadcast: () => void;
}

export function BroadcastPanel({ onBroadcast }: BroadcastPanelProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; recipients: number } | null>(null);

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      });
      
      const data = await response.json();
      
      if (data.recipients) {
        const successful = data.recipients.filter((r: any) => r.status === 'sent').length;
        setResult({ success: true, recipients: successful });
        setMessage('');
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
    <div className="broadcast-panel">
      <h3>📢 Broadcast Message</h3>
      <p className="broadcast-description">
        Send a message to all running molts simultaneously via isolated sessions.
      </p>
      
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message to broadcast to all active molts..."
        rows={4}
        disabled={sending}
      />
      
      <button 
        type="button"
        className="btn btn-broadcast"
        onClick={handleBroadcast}
        disabled={sending || !message.trim()}
      >
        {sending ? 'Sending...' : 'Broadcast'}
      </button>
      
      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success 
            ? `✅ Message sent to ${result.recipients} molts`
            : '❌ Failed to broadcast message'
          }
        </div>
      )}
    </div>
  );
}
