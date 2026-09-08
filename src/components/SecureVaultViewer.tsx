import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Bundle the worker instead of pulling it from a third-party CDN at runtime:
// an outage or a version skew there takes the document viewer down with it.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface SecureVaultViewerProps {
  pdfBytes: Uint8Array | null;
}

export const SecureVaultViewer: React.FC<SecureVaultViewerProps> = ({ pdfBytes }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  // A fixed 600px page overflows the preview column on narrower layouts and
  // clips the left edge of the pleading, caption included. Track the container.
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width;
      if (available > 0) setPageWidth(Math.min(600, Math.floor(available)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [pdfDataUrl]);

  useEffect(() => {
    if (pdfBytes) {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfDataUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      }
    }
  }, [pdfBytes]);

  if (!pdfDataUrl) {
    return (
      <div ref={containerRef} className="w-full text-white p-4 font-mono text-xs animate-pulse">
        Initializing Document Generation Engine...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="vault-viewer w-full max-w-full select-none pointer-events-none relative flex flex-col items-center" 
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Document
        file={pdfDataUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<div className="text-white p-4 font-mono text-xs animate-pulse">Loading Secure Vault...</div>}
      >
        {Array.from(new Array(numPages), (_el, index) => (
          <div key={`page_${index + 1}`}>
            <Page
              pageNumber={index + 1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="mb-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-ink-faint rounded"
              width={pageWidth}
            />
          </div>
        ))}
      </Document>
      
      {/* CSS Lockdown for print bypassing */}
      <style>{`
        @media print {
          .vault-viewer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
