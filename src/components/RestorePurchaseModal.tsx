import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRestored: (token: string) => void;
}

/**
 * Recovers access from a PayPal order ID.
 *
 * There is no user database, so PayPal itself is the record of purchase: the
 * server re-reads the order and re-issues a token if it is genuinely captured.
 * That means clearing browser storage, or buying on another device, is no longer
 * a dead end.
 */
export const RestorePurchaseModal: React.FC<Props> = ({ isOpen, onClose, onRestored }) => {
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const submit = async () => {
    const trimmed = orderId.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/entitlement/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setError(data.error || 'That order could not be verified.');
        return;
      }
      onRestored(data.token);
      onClose();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#18181b] p-8 rounded text-white max-w-md w-full border border-slate-700">
        <h2 className="text-xl font-bold mb-2">Restore a purchase</h2>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Enter the PayPal order ID from your receipt email. The server checks it against PayPal directly —
          if the payment went through, your access is restored.
        </p>
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="PayPal order ID"
          className="w-full bg-black border border-slate-600 rounded p-2 text-white text-sm font-mono focus:outline-none focus:border-accent"
        />
        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        <button
          onClick={submit}
          disabled={busy || !orderId.trim()}
          className="w-full mt-4 bg-accent disabled:opacity-60 text-black font-bold uppercase tracking-widest text-xs py-3 cursor-pointer"
        >
          {busy ? 'Checking…' : 'Restore access'}
        </button>
        <button onClick={onClose} className="mt-3 text-slate-400 underline cursor-pointer w-full text-center block text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
};
