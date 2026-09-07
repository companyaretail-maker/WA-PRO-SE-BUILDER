import React, { useState } from 'react';
import { Copy, Plus, Trash2, Check } from 'lucide-react';
import { getCountyInfo } from '../data/waCounties';

export const DeclarationEngine: React.FC<any> = ({
  selectedCounty = 'King',
  hasPurchased,
  onOpenTerms
}) => {
  const [copied, setCopied] = useState(false);
  const countyInfo = getCountyInfo(selectedCounty);

  const [facts, setFacts] = useState([{ id: '1', desc: 'The other parent missed 3 consecutive visits.', date: '2024-01-10' }]);

  const generateGR14Pleading = () => {
    return `SUPERIOR COURT OF WASHINGTON, COUNTY OF ${countyInfo.name.toUpperCase()}

1. PRIMA FACIE SHOWING OF ADEQUATE CAUSE (RCW 26.09.270)
Facts:
${facts.map(f => `- ${f.date}: ${f.desc}`).join('\\n')}

I certify under penalty of perjury under the laws of the State of Washington that the foregoing is true and correct.`;
  };

  const handleCopy = () => {
    if (!hasPurchased && onOpenTerms) {
      onOpenTerms();
      return;
    }
    navigator.clipboard.writeText(generateGR14Pleading());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-white p-6">
      <h1 className="text-2xl font-bold">Adequate Cause Declaration & Factual Engine</h1>
      <p className="text-slate-400">Enter facts to support your petition.</p>
      
      <div className="space-y-4">
        {facts.map((fact, idx) => (
          <div key={fact.id} className="bg-slate-900 p-4 border border-slate-700 rounded-lg space-y-2">
            <input 
              type="date" 
              value={fact.date}
              onChange={e => setFacts(facts.map(f => f.id === fact.id ? { ...f, date: e.target.value } : f))}
              className="bg-black border border-slate-600 rounded p-2 text-white w-full"
            />
            <textarea
              value={fact.desc}
              onChange={e => setFacts(facts.map(f => f.id === fact.id ? { ...f, desc: e.target.value } : f))}
              className="bg-black border border-slate-600 rounded p-2 text-white w-full"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-800">
        <button onClick={handleCopy} className="bg-accent px-4 py-2 rounded font-bold flex items-center gap-2">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy GR 14 Pleading'}
        </button>
      </div>

      <pre className="bg-black p-4 rounded border border-slate-700 font-mono text-sm whitespace-pre-wrap">
        {generateGR14Pleading()}
      </pre>
    </div>
  );
};
