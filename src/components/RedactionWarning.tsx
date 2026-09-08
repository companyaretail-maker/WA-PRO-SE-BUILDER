import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { isHighRisk, type RedactionFinding } from '../utils/redaction';

export const RedactionWarning: React.FC<{ findings: RedactionFinding[]; compact?: boolean }> = ({
  findings,
  compact = false,
}) => {
  if (findings.length === 0) return null;

  const high = findings.some((f) => isHighRisk(f.kind));
  const border = high ? 'border-red-500/50' : 'border-yellow-500/40';
  const tone = high ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className={`border ${border} bg-[#111] p-3 flex gap-3`}>
      <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${tone}`} />
      <div className="space-y-2 min-w-0">
        <div className={`text-xs font-bold ${tone}`}>
          {high ? 'Personal identifier in the public record' : 'Check before filing'}
        </div>
        {!compact && (
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Washington GR 22 restricts personal identifiers in family law filings. Identifiers like these
            belong on the sealed Confidential Information Form, not in a declaration that goes into the
            public file.
          </p>
        )}
        <ul className="space-y-1.5">
          {findings.map((f, i) => (
            <li key={`${f.kind}-${f.index}-${i}`} className="text-[11px] text-slate-300">
              <span className={`font-mono ${tone}`}>{f.label}</span>{' '}
              <span className="font-mono text-white break-all">“{f.match}”</span>
              <div className="text-ink-muted mt-0.5">{f.guidance}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
