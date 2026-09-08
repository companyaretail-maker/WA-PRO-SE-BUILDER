import React from 'react';
import { ExternalLink, FileCheck2, AlertTriangle, FileText } from 'lucide-react';
import { getCountyName } from '../data/waCounties';

const AOC_FORMS_URL = 'https://www.courts.wa.gov/forms/';

/**
 * States plainly what this app produces and what it does not.
 *
 * Washington requires approved pattern forms for many family law filings. This
 * app generates a supporting declaration -- not the petition, not the orders,
 * not the confidential cover sheets. Saying so in the product is the difference
 * between a useful drafting tool and a filer who shows up at the clerk's counter
 * with the wrong document.
 */
export const FormsChecklist: React.FC<{ selectedCounty?: string }> = ({ selectedCounty = 'king' }) => {
  const countyName = getCountyName(selectedCounty);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="bg-[#111] border border-ink-faint p-6">
        <h2 className="font-oswald text-2xl uppercase tracking-wide text-accent mb-2 flex items-center gap-2">
          <FileCheck2 className="w-5 h-5" /> What this app generates
        </h2>
        <p className="text-sm text-ink-muted leading-relaxed max-w-2xl">
          Read this before you pay for anything, so there are no surprises at the filing counter.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-[#0d0d0e] border border-accent/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-accent" />
            <h3 className="font-bold text-white text-sm">This app produces</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc pl-4">
            <li>A declaration in support of adequate cause under RCW 26.09.270, with your caption and facts.</li>
            <li>
              The certification required by RCW 9A.72.085, including the date and place of signing and a
              signature line.
            </li>
            <li>A PDF formatted for filing, plus copyable plain text.</li>
          </ul>
        </div>

        <div className="bg-[#0d0d0e] border border-yellow-500/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h3 className="font-bold text-white text-sm">This app does not produce</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc pl-4">
            <li>
              The <strong className="text-white">petition or motion itself</strong>, which generally must be
              on the pattern form approved for your case type.
            </li>
            <li>Proposed orders, the summons, or the confidential cover sheets.</li>
            <li>The sealed Confidential Information Form that GR 22 identifiers belong on.</li>
            <li>Anything specific to {countyName}&apos;s local cover-sheet or working-copy requirements.</li>
          </ul>
        </div>
      </div>

      <div className="bg-[#09090b] border border-accent/20 p-6">
        <h3 className="font-oswald text-lg uppercase tracking-wide text-white mb-3">Where the pattern forms come from</h3>
        <p className="text-sm text-ink-muted leading-relaxed mb-4">
          Washington family law forms are published by the Administrative Office of the Courts and are free.
          A declaration drafted here is filed <em>alongside</em> them, not instead of them. Download the
          current version of each form you need — pattern forms are revised, and an outdated one gets
          rejected.
        </p>
        <a
          href={AOC_FORMS_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-4 py-2 text-xs font-mono transition-colors"
        >
          Washington Court Forms <ExternalLink className="w-3 h-3" />
        </a>
        <p className="text-[11px] text-ink-muted leading-relaxed mt-4">
          Your county&apos;s family law facilitator can tell you exactly which forms your filing requires,
          usually for a small fee or free. That is the fastest way to confirm your form list, and this app
          does not replace it.
        </p>
      </div>
    </div>
  );
};
