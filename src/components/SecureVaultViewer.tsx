import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker to enable canvas rendering
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecureVaultViewerProps {
  pdfBytes: Uint8Array | null;
}

export const SecureVaultViewer: React.FC<SecureVaultViewerProps> = ({ pdfBytes }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

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

  if (!pdfDataUrl) return <div className="text-white p-4 font-mono text-xs animate-pulse">Initializing Document Generation Engine...</div>;

  return (
    <div 
      className="vault-viewer select-none pointer-events-none relative flex flex-col items-center" 
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Document
        file={pdfDataUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<div className="text-white p-4 font-mono text-xs animate-pulse">Loading Secure Vault...</div>}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page 
            key={`page_${index + 1}`} 
            pageNumber={index + 1} 
            renderTextLayer={false} 
            renderAnnotationLayer={false} 
            className="mb-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-ink-faint rounded"
            width={600}
          />
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
