import React, { useState } from 'react';
import { PayPalCheckout } from './PayPalCheckout';

export const TermsModal: React.FC<any> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#18181b] p-8 rounded text-white max-w-xl w-full border border-slate-700">
        <h2 className="text-2xl font-bold mb-4">Unlock Full Filing Packet</h2>
        <p className="mb-6 text-slate-300">Access all templates for Washington State ($99).</p>
        <PayPalCheckout amount="99.00" description="Full Packet" onComplete={() => { onAccept(); onClose(); }} />
        <button onClick={onClose} className="mt-4 text-slate-400 underline cursor-pointer w-full text-center block">Cancel</button>
      </div>
    </div>
  );
};
