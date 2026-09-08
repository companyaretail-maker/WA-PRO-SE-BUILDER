import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../context/AuthContext';

interface Props {
  sku: 'SINGLE_FORM' | 'FULL_PACKET';
  onComplete: (token: string) => void;
}

interface PayPalConfig {
  paypalClientId: string | null;
  paymentsEnabled: boolean;
}

/**
 * The client ID comes from the server rather than a build-time VITE_ variable so
 * that a server without PayPal credentials cannot render a checkout that leads
 * nowhere.
 */
export const PayPalCheckout: React.FC<Props> = ({ sku, onComplete }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<PayPalConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setError('Could not reach the payment service.'));
  }, []);

  if (error) return <p className="text-xs text-red-400">{error}</p>;
  if (!config) return <p className="text-xs text-ink-muted font-mono">Loading checkout…</p>;
  if (!config.paymentsEnabled || !config.paypalClientId) {
    return (
      <p className="text-xs text-yellow-400 leading-relaxed">
        Payments are not configured on this server, so documents cannot be unlocked here.
      </p>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId: config.paypalClientId, currency: 'USD' }}>
      <div className="w-full">
        <PayPalButtons
          style={{ layout: 'horizontal', height: 45, color: 'gold', tagline: false }}
          createOrder={async () => {
            const res = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              // Price is set server-side from the SKU; the browser does not name an amount.
              body: JSON.stringify({ sku, custom_id: user?.uid }),
            });
            const order = await res.json();
            if (!res.ok || !order.id) throw new Error(order.error || 'Could not start checkout.');
            return order.id;
          }}
          onApprove={async (data) => {
            const res = await fetch('/api/checkout/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderID, sku }),
            });
            const confirm = await res.json();
            if (!res.ok || !confirm.token) {
              setError(confirm.error || 'Payment could not be confirmed.');
              return;
            }
            onComplete(confirm.token);
          }}
          onError={() => setError('PayPal reported an error. Your card was not charged.')}
        />
      </div>
    </PayPalScriptProvider>
  );
};
