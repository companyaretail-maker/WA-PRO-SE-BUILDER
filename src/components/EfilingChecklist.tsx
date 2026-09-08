import React from 'react';
import { getCountyInfo, getCountyName } from '../data/waCounties';
import { ExternalLink, Building2, ShieldAlert, KeyRound, Globe, HardDrive, AlertTriangle } from 'lucide-react';

export const EfilingChecklist: React.FC<{ selectedCounty?: string }> = ({ selectedCounty = 'king' }) => {
  const countyInfo = getCountyInfo(selectedCounty);
  const countyName = getCountyName(selectedCounty);

  if (!countyInfo) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-[#111] border border-yellow-500/40 p-6">
          <h2 className="font-oswald text-2xl uppercase tracking-wide text-yellow-500 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> No local data for {countyName}
          </h2>
          <p className="text-sm text-ink-muted max-w-2xl leading-relaxed">
            This build carries verified-format local rule profiles for King, Pierce and Snohomish counties
            only. Rather than show you another county&apos;s deadlines, portal and facilitator line as if
            they were {countyName}&apos;s, this module shows nothing.
          </p>
          <p className="text-sm text-ink-muted max-w-2xl leading-relaxed mt-3">
            Get {countyName}&apos;s filing instructions from the county clerk and its current local rules,
            which are published on the county superior court&apos;s own site and collected by the
            Administrative Office of the Courts at{' '}
            <a
              className="text-accent hover:underline"
              href="https://www.courts.wa.gov/court_rules/?fa=court_rules.list&group=cnty"
              target="_blank"
              rel="noreferrer"
            >
              courts.wa.gov local court rules
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

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

      {countyInfo.verification.status === 'unverified' && (
        <div className="bg-[#111] border border-yellow-500/40 p-4 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-xs text-ink-muted leading-relaxed">
            <strong className="text-white">Unverified local rule data.</strong> The deadlines, times and
            contact details below were transcribed into this app and have not been re-checked against
            {' '}{countyInfo.name}&apos;s current local rules. Confirm every deadline with the clerk or the
            published rule before you rely on it. Local rules change, and a missed working-copies or
            confirmation cutoff can strike your motion.
          </p>
        </div>
      )}

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
              {countyInfo.eFilingPortalUrl && (
                <a
                  href={countyInfo.eFilingPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-3 py-1.5 text-xs font-mono transition-colors"
                >
                  Launch Portal <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="bg-black border border-ink-faint p-3">
              <div className="text-[10px] font-mono text-ink-muted uppercase mb-1">Working Copies Deadline</div>
              <div className="text-xs text-white leading-relaxed">{countyInfo.workingPapersDeadline}</div>
            </div>

            <div className="bg-black border border-ink-faint p-3">
              <div className="text-[10px] font-mono text-ink-muted uppercase mb-1">Confirmation Deadline</div>
              <div className="text-xs text-white leading-relaxed">{countyInfo.confirmationDeadline}</div>
            </div>

            <div className="bg-black border border-ink-faint p-3">
              <div className="text-[10px] font-mono text-ink-muted uppercase mb-1">Bench Copies Rule</div>
              <div className="text-xs text-white leading-relaxed">{countyInfo.benchCopiesRule}</div>
            </div>

            <div className="bg-black border border-ink-faint p-3">
              <div className="text-[10px] font-mono text-ink-muted uppercase mb-1">Local Rule Citation</div>
              <div className="text-xs text-white leading-relaxed">{countyInfo.localRuleCitation}</div>
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
                District court filing varies by county and is generally handled separately from superior
                court e-filing. Confirm intake instructions with the district court clerk directly.
              </div>
            </div>
            <div className="bg-black border border-ink-faint p-3 text-xs text-ink-muted">
              Family law modification actions are filed in <strong className="text-white">superior court</strong>,
              not district court. District court has no jurisdiction over parenting plan modifications.
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
                  This application generates a formatted PDF. You take the generated packet and upload it
                  manually to your county&apos;s portal using your own litigant login. No API integration is required.
                </p>
              </div>
              <div className="flex gap-3">
                <ShieldAlert className="w-4 h-4 text-accent shrink-0 mt-1" />
                <p className="text-xs text-ink-muted">
                  <strong className="text-white block mb-1">Why no direct API integration?</strong>
                  E-filing vendors do not offer public filing APIs to individual litigants; integration
                  requires a vendor agreement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
