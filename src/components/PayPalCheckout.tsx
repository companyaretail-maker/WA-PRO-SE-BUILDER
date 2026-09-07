import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../context/AuthContext';

export const PayPalCheckout = ({ amount, description, onComplete }: any) => {
  const { user } = useAuth();
  return (
    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
      <div className="w-full">
        <PayPalButtons 
          style={{ layout: "horizontal", height: 45, color: "gold", tagline: false }}
          createOrder={async (data, actions) => {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sku: description || "GENERIC_PURCHASE",
                amount: amount,
                custom_id: user?.uid
              })
            });
            const order = await res.json();
            return order.id;
          }}
          onApprove={async (data, actions) => {
            const res = await fetch("/api/checkout/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderID
              })
            });
            const confirmData = await res.json();
            if (confirmData.status === 'COMPLETED' || confirmData.status === 'APPROVED') {
              
              onComplete();
            }
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
};
