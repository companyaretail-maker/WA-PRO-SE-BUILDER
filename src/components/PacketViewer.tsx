import React, { useState, useEffect } from 'react';
import { Lock, Copy, Download, Printer, ShieldCheck } from 'lucide-react';
import { getCountyInfo } from '../data/waCounties';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { SecureVaultViewer } from './SecureVaultViewer';
import { generateWACourtPleading } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';

export const PacketViewer: React.FC<any> = ({
  selectedCounty = 'King',
  hasPurchased,
  onOpenTerms,
  onPurchaseComplete
}) => {
  const countyInfo = getCountyInfo(selectedCounty);
  const { user } = useAuth();
  const [isPaid, setIsPaid] = useState(hasPurchased);
  
  useEffect(() => {
    setIsPaid(hasPurchased);
  }, [hasPurchased]);
  
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  useEffect(() => {
    generateWACourtPleading(isPaid, countyInfo.name).then(setPdfBytes);
  }, [isPaid, countyInfo.name]);
  
  const handleDownload = () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WA_ProSe_${countyInfo.shortName}_Packet.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 h-full">
      <div className="flex-1 bg-[#0d0d0e] border border-ink-faint p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-ink-faint">
          <h2 className="font-oswald text-lg uppercase text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" /> Secure Document Vault
          </h2>
          <span className={`font-mono text-[10px] uppercase border px-2 py-1 ${isPaid ? 'border-accent text-accent' : 'border-ink-faint text-ink-muted'}`}>
            {isPaid ? 'Unlocked Payload' : 'Watermarked Draft'}
          </span>
        </div>
        <div className="flex justify-center bg-[#09090b] p-4 border border-ink-faint/30">
          <SecureVaultViewer pdfBytes={pdfBytes} />
        </div>
      </div>
      
      <div className="w-full xl:w-[360px] shrink-0 space-y-6">
        {!isPaid ? (
          <div className="bg-[#111] border border-accent/30 p-6 shadow-[0_0_30px_rgba(0,255,65,0.05)]">
            <h3 className="font-oswald text-xl text-white uppercase tracking-wide flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-accent" /> Unlock Documents
            </h3>
            <p className="text-xs text-ink-muted mb-6 leading-relaxed">
              Your generated documents currently feature a security watermark. Purchase the clean, GR 14 compliant packet to download, print, and e-file in {countyInfo.name}.
            </p>
            <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
              <div className="space-y-4">
                <div className="border border-ink-faint p-4 bg-black">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-white">Single Form Unlock</span>
                    <span className="text-accent font-mono">$35.00</span>
                  </div>
                  <PayPalButtons 
                    style={{ layout: "horizontal", height: 35, color: "gold", tagline: false }}
                    createOrder={async (data, actions) => {
                      const res = await fetch("/api/paypal/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          sku: "SINGLE_FORM",
                          amount: "35.00",
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
                          orderId: data.orderID,
                          sku: "SINGLE_FORM"
                        })
                      });
                      const confirmData = await res.json();
                      if (confirmData.status === 'COMPLETED' || confirmData.status === 'APPROVED') {
                        setIsPaid(true);
                        onPurchaseComplete?.();
                      }
                    }}
                  />
                </div>
                
                <div className="border border-accent p-4 bg-accent/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-accent text-black font-mono text-[9px] px-2 py-0.5 font-bold uppercase">Popular</div>
                  <div className="flex justify-between items-center mb-4 mt-2">
                    <span className="text-sm font-bold text-white">Full County Package</span>
                    <span className="text-accent font-mono">$99.00</span>
                  </div>
                  <PayPalButtons 
                    style={{ layout: "horizontal", height: 35, color: "blue", tagline: false }}
                    createOrder={async (data, actions) => {
                      const res = await fetch("/api/paypal/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          sku: "FULL_PACKET",
                          amount: "99.00",
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
                          orderId: data.orderID,
                          sku: "FULL_PACKET"
                        })
                      });
                      const confirmData = await res.json();
                      if (confirmData.status === 'COMPLETED' || confirmData.status === 'APPROVED') {
                        setIsPaid(true);
                        onPurchaseComplete?.();
                      }
                    }}
                  />
                </div>
              </div>
            </PayPalScriptProvider>
          </div>
        ) : (
          <div className="bg-[#111] border border-accent p-6 shadow-[0_0_30px_rgba(0,255,65,0.1)]">
            <h3 className="font-oswald text-xl text-accent uppercase tracking-wide flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5" /> Payload Ready
            </h3>
            <p className="text-xs text-white mb-6 leading-relaxed">
              Payment received. The watermark has been stripped from the active session. You may now download the GR 14 compliant PDF payload.
            </p>
            <button 
              onClick={handleDownload}
              className="w-full bg-accent hover:bg-[#00e53a] text-black font-bold uppercase tracking-widest text-xs py-3 px-4 flex justify-center items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download PDF Payload
            </button>
            <div className="mt-4 text-[10px] font-mono text-ink-muted text-center border-t border-ink-faint pt-4">
              A copy of this file has also been securely emailed to your account.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
