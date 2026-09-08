import React from 'react';
import { PayPalCheckout } from './PayPalCheckout';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: (token: string) => void;
}

export const TermsModal: React.FC<Props> = ({ isOpen, onClose, onUnlocked }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#18181b] p-8 rounded text-white max-w-xl w-full border border-slate-700">
        <h2 className="text-2xl font-bold mb-4">Unlock Full Filing Packet</h2>
        <p className="mb-2 text-slate-300">Full County Package — $99.00.</p>
        <p className="mb-6 text-xs text-slate-400 leading-relaxed">
          This purchase unlocks document generation. It does not create an attorney-client relationship and
          is not legal advice.
        </p>
        <PayPalCheckout sku="FULL_PACKET" onComplete={onUnlocked} />
        <button
          onClick={onClose}
          className="mt-4 text-slate-400 underline cursor-pointer w-full text-center block"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
