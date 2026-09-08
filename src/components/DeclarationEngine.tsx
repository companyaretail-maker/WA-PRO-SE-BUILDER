import React, { useState } from 'react';
import { Copy, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { getCountyName } from '../data/waCounties';
import { buildDeclarationText, captionErrors, todayLongForm, type CaseCaption, type FactEntry } from '../utils/pleading';
import { findPersonalIdentifiers } from '../utils/redaction';
import { RedactionWarning } from './RedactionWarning';

interface Props {
  selectedCounty: string;
  caption: CaseCaption;
  onCaptionChange: (caption: CaseCaption) => void;
  facts: FactEntry[];
  onFactsChange: (facts: FactEntry[]) => void;
}

const field =
  'bg-black border border-slate-600 rounded p-2 text-white w-full text-sm focus:outline-none focus:border-accent';

export const DeclarationEngine: React.FC<Props> = ({
  selectedCounty,
  caption,
  onCaptionChange,
  facts,
  onFactsChange,
}) => {
  const [copied, setCopied] = useState(false);
  const countyName = getCountyName(selectedCounty);
  const missing = captionErrors({ ...caption, countyName: caption.countyName || countyName });
  const text = buildDeclarationText({ ...caption, countyName: caption.countyName || countyName }, facts, todayLongForm());

  const set = (patch: Partial<CaseCaption>) => onCaptionChange({ ...caption, ...patch });

  const addFact = () =>
    onFactsChange([...facts, { id: crypto.randomUUID(), date: '', desc: '' }]);

  const updateFact = (id: string, patch: Partial<FactEntry>) =>
    onFactsChange(facts.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const removeFact = (id: string) => onFactsChange(facts.filter((f) => f.id !== id));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold">Adequate Cause Declaration &amp; Factual Engine</h1>
        <p className="text-slate-400 text-sm mt-1">
          Enter your case caption and the facts you want the court to consider under RCW 26.09.270.
        </p>
      </div>

      <section className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 space-y-3">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-accent">Case Caption</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">County</span>
            <input
              className={field}
              value={caption.countyName || countyName}
              onChange={(e) => set({ countyName: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Case type</span>
            <select
              className={field}
              value={caption.actionType}
              onChange={(e) => set({ actionType: e.target.value as CaseCaption['actionType'] })}
            >
              <option value="marriage">In re the Marriage of</option>
              <option value="parentage">In re the Parentage of</option>
              <option value="other">In re</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Petitioner</span>
            <input className={field} value={caption.petitionerName} onChange={(e) => set({ petitionerName: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Respondent</span>
            <input className={field} value={caption.respondentName} onChange={(e) => set({ respondentName: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Cause number</span>
            <input className={field} value={caption.causeNumber} onChange={(e) => set({ causeNumber: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Document title</span>
            <input className={field} value={caption.documentTitle} onChange={(e) => set({ documentTitle: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Declarant (who signs)</span>
            <input className={field} value={caption.declarantName} onChange={(e) => set({ declarantName: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">City where signed</span>
            <input className={field} value={caption.signedAtCity} onChange={(e) => set({ signedAtCity: e.target.value })} />
          </label>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          The city and date of signing are not decoration: RCW 9A.72.085 requires an unsworn declaration to
          recite where and when it was signed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-accent">Facts</h2>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Everything you type here goes into the document verbatim. Under GR 22, personal identifiers —
          social security numbers, account numbers, full dates of birth — belong on the Confidential
          Information Form, not in a declaration in the public file. Refer to a child by initials where you
          can.
        </p>
        {facts.map((fact, idx) => (
          <div key={fact.id} className="bg-slate-900 p-4 border border-slate-700 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-slate-400">Fact {idx + 1}</span>
              <button
                onClick={() => removeFact(fact.id)}
                className="text-slate-500 hover:text-red-400 cursor-pointer"
                aria-label={`Remove fact ${idx + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="date"
              value={fact.date}
              onChange={(e) => updateFact(fact.id, { date: e.target.value })}
              className={field}
            />
            <textarea
              value={fact.desc}
              rows={3}
              placeholder="What happened, in your own words."
              onChange={(e) => updateFact(fact.id, { desc: e.target.value })}
              className={field}
            />
            <RedactionWarning findings={findPersonalIdentifiers(fact.desc)} compact />
          </div>
        ))}
        <button
          onClick={addFact}
          className="border border-slate-600 hover:border-accent text-slate-300 px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add fact
        </button>
      </section>

      {missing.length > 0 && (
        <div className="border border-yellow-500/40 bg-[#111] p-4 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-xs text-ink-muted leading-relaxed">
            Incomplete caption: <strong className="text-white">{missing.join(', ')}</strong>. The draft below
            shows placeholders in their place. Do not file it with placeholders in it.
          </p>
        </div>
      )}

      <div className="flex gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={handleCopy}
          className="bg-accent px-4 py-2 rounded text-black font-bold flex items-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy declaration text'}
        </button>
      </div>

      <pre className="bg-black p-4 rounded border border-slate-700 font-mono text-sm whitespace-pre-wrap">{text}</pre>

      <p className="text-[11px] text-ink-muted leading-relaxed border-t border-slate-800 pt-4">
        Washington requires approved pattern forms for many family law filings. A declaration drafted here is
        a supporting document — check whether the underlying petition or motion must be made on the
        Administrative Office of the Courts pattern form for your case type before you file.
      </p>
    </div>
  );
};
