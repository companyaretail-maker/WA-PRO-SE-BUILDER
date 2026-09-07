import React from 'react';
import { getCountyInfo, WA_COUNTIES } from '../data/waCounties';
import { ExternalLink, Building2, ShieldAlert, KeyRound, Globe, HardDrive } from 'lucide-react';

export const EfilingChecklist: React.FC<{ selectedCounty?: string }> = ({ selectedCounty = 'King' }) => {
  const countyInfo = getCountyInfo(selectedCounty);

  const getPortalLink = (system: string) => {
    if (system.includes('King')) return 'https://dja-prd-ecexap1.kingcounty.gov/';
    if (system.includes('LINX')) return 'https://linxonline.co.pierce.wa.us/linxweb/Main.cfm';
    if (system.includes('Odyssey')) return 'https://washington.tylerhost.net/ofsweb';
    return '#';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#111] border border-ink-faint p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Globe className="w-48 h-48" />
        </div>
        <h2 className="font-oswald text-2xl uppercase tracking-wide text-accent mb-2">E-Filing Portal Integration</h2>
        <p className="text-sm text-ink-muted max-w-2xl">
          Washington State courts operate on disjointed filing systems depending on the county and court level. 
          Use this module to access the correct portal for <strong className="text-white">{countyInfo.name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Superior Court */}
        <div className="bg-[#111] border border-ink-faint p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Superior Court</h3>
              <p className="text-xs text-ink-muted mt-1 font-mono">{countyInfo.superiorCourtName}</p>
            </div>
          </div>
          
          <div className="mt-2 space-y-3">
            <div className="bg-black border border-ink-faint p-3 flex justify-between items-center">
              <div>
                <div className="text-[10px] font-mono text-ink-muted uppercase">E-Filing System</div>
                <div className="text-sm font-semibold text-white mt-0.5">{countyInfo.eFilingSystem}</div>
              </div>
              <a 
                href={getPortalLink(countyInfo.eFilingSystem)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-3 py-1.5 text-xs font-mono transition-colors"
              >
                Launch Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-black border border-ink-faint p-3">
              <div className="text-[10px] font-mono text-ink-muted uppercase mb-1">Bench Copies Rule</div>
              <div className="text-xs text-white leading-relaxed">{countyInfo.benchCopiesRule}</div>
            </div>
          </div>
        </div>

        {/* District Court */}
        <div className="bg-[#111] border border-ink-faint p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-ink-faint border border-ink-muted/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-ink-muted" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">District Court</h3>
              <p className="text-xs text-ink-muted mt-1 font-mono">{countyInfo.districtCourtName}</p>
            </div>
          </div>
          
          <div className="mt-2 space-y-3">
            <div className="bg-black border border-ink-faint p-3">
              <div className="text-[10px] font-mono text-ink-muted uppercase mb-1">E-Filing Status</div>
              <div className="text-xs text-white leading-relaxed">
                Most WA District Courts do not use Odyssey File & Serve. Depending on the county, District Court filings are often handled via TrueFiling, JIS/JABS portals, or require physical/email filing.
              </div>
            </div>
            <div className="bg-black border border-ink-faint p-3 text-xs text-ink-muted">
              Check the <a href="#" className="text-accent hover:underline">District Court Local Rules</a> for {countyInfo.name} to confirm specific intake instructions.
            </div>
          </div>
        </div>
      </div>

      {/* API Keys Explanation Section */}
      <div className="bg-[#09090b] border border-accent/20 p-6 mt-4 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-oswald text-xl uppercase tracking-wide text-white mb-2">Do you need API Keys or Client Secrets?</h3>
            <p className="text-sm text-ink-muted mb-4 leading-relaxed">
              <strong>Short Answer: No.</strong> You do not need developer API keys or OAuth client secrets to use this system.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <HardDrive className="w-4 h-4 text-accent shrink-0 mt-1" />
                <p className="text-xs text-ink-muted">
                  <strong className="text-white block mb-1">Self-Represented (Pro Se) Filer Status</strong>
                  This application generates highly formatted, exact PDF and Word documents (GR 14 compliant) on your local machine. You will take the generated packet and upload it manually to the respective portal (eFileWA, LINX, or KC Script) using your standard litigant login credentials. No API integration is required.
                </p>
              </div>
              <div className="flex gap-3">
                <ShieldAlert className="w-4 h-4 text-accent shrink-0 mt-1" />
                <p className="text-xs text-ink-muted">
                  <strong className="text-white block mb-1">Why no direct API integration?</strong>
                  The Administrative Office of the Courts (AOC) and vendor Tyler Technologies do not provide public API endpoints for individual litigants. Direct integration requires a vendor contract, CJIS compliance, and Tyler Tech CMS credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};
