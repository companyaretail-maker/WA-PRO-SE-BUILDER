import React, { useState, useEffect } from 'react';
import { Lock, Download, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getCountyName } from '../data/waCounties';
import { SecureVaultViewer } from './SecureVaultViewer';
import { PayPalCheckout } from './PayPalCheckout';
import { generateDraftPleading, fetchPaidPacket } from '../utils/pdfGenerator';
import { captionErrors, type CaseCaption, type FactEntry } from '../utils/pleading';

interface Props {
  selectedCounty: string;
  caption: CaseCaption;
  facts: FactEntry[];
  entitlementToken: string | null;
  onPurchaseComplete: (token: string) => void;
}

export const PacketViewer: React.FC<Props> = ({
  selectedCounty,
  caption,
  facts,
  entitlementToken,
  onPurchaseComplete,
}) => {
  const countyName = getCountyName(selectedCounty);
  const effectiveCaption: CaseCaption = { ...caption, countyName: caption.countyName || countyName };
  const missing = captionErrors(effectiveCaption);
  const isPaid = Boolean(entitlementToken);

  const captionKey = JSON.stringify(effectiveCaption);
  const factsKey = JSON.stringify(facts);

  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    generateDraftPleading(effectiveCaption, facts).then((bytes) => {
      if (!cancelled) setPdfBytes(bytes);
    });
    return () => {
      cancelled = true;
    };
    // Serialized deps: the caption object and facts array are rebuilt each
    // render, so identity comparison would re-render the PDF on every keystroke.
  }, [captionKey, factsKey]);

  const handleDownload = async () => {
    if (!entitlementToken) return;
    setDownloadError(null);
    setDownloading(true);
    try {
      const blob = await fetchPaidPacket(entitlementToken, effectiveCaption, facts);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WA_ProSe_${countyName.replace(/\s+/g, '_')}_Packet.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoking synchronously can cancel the download in some browsers.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err: any) {
      setDownloadError(err?.message || 'Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 h-full">
      <div className="flex-1 bg-[#0d0d0e] border border-ink-faint p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-ink-faint">
          <h2 className="font-oswald text-lg uppercase text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" /> Secure Document Vault
          </h2>
          <span className="font-mono text-[10px] uppercase border px-2 py-1 border-ink-faint text-ink-muted">
            Watermarked Draft
          </span>
        </div>
        {missing.length > 0 && (
          <div className="mb-4 border border-yellow-500/40 bg-[#111] p-3 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-ink-muted leading-relaxed">
              Caption incomplete ({missing.join(', ')}). Fill these in on the Fact Engine tab — the packet
              renders placeholders until you do, and a pleading filed with placeholder parties will be
              rejected.
            </p>
          </div>
        )}
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
              The preview carries a draft watermark. Purchase the clean packet to download and file it in{' '}
              {countyName}.
            </p>

            <div className="space-y-4">
              <div className="border border-ink-faint p-4 bg-black">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-white">Single Form Unlock</span>
                  <span className="text-accent font-mono">$35.00</span>
                </div>
                <PayPalCheckout sku="SINGLE_FORM" onComplete={onPurchaseComplete} />
              </div>

              <div className="border border-accent p-4 bg-accent/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-accent text-black font-mono text-[9px] px-2 py-0.5 font-bold uppercase">
                  Popular
                </div>
                <div className="flex justify-between items-center mb-4 mt-2">
                  <span className="text-sm font-bold text-white">Full County Package</span>
                  <span className="text-accent font-mono">$99.00</span>
                </div>
                <PayPalCheckout sku="FULL_PACKET" onComplete={onPurchaseComplete} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#111] border border-accent p-6 shadow-[0_0_30px_rgba(0,255,65,0.1)]">
            <h3 className="font-oswald text-xl text-accent uppercase tracking-wide flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5" /> Payload Ready
            </h3>
            <p className="text-xs text-white mb-6 leading-relaxed">
              Payment confirmed. The clean PDF is rendered by the server against your purchase token.
            </p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-accent hover:bg-[#00e53a] disabled:opacity-60 text-black font-bold uppercase tracking-widest text-xs py-3 px-4 flex justify-center items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> {downloading ? 'Rendering…' : 'Download PDF Packet'}
            </button>
            {downloadError && <p className="text-xs text-red-400 mt-3">{downloadError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
