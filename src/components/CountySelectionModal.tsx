import React, { useState } from 'react';
import { WA_COUNTY_NAMES, getCountyInfo } from '../data/waCounties';
import { Search, MapPin, Building2, X, AlertTriangle } from 'lucide-react';

export const CountySelectionModal = ({ isOpen, onClose, selectedCounty, onSelectCounty }: any) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const term = search.toLowerCase();
  const filteredCounties = WA_COUNTY_NAMES.filter(
    (c) => c.name.toLowerCase().includes(term) || c.countySeat.toLowerCase().includes(term),
  );

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-bg border border-accent/30 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(0,255,65,0.1)]">

        <div className="p-4 border-b border-ink-faint flex items-center justify-between bg-[#111]">
          <h2 className="font-oswald text-xl uppercase tracking-wide text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" /> Explore Jurisdictions
          </h2>
          <button onClick={onClose} className="text-ink-muted hover:text-white transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-ink-faint bg-black space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by county name or seat (e.g., King, Seattle)..."
              className="w-full bg-[#111] border border-ink-faint text-white pl-9 pr-4 py-2 font-mono text-xs focus:outline-none focus:border-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-start text-[10px] font-mono text-ink-muted">
            <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
            <span>
              Local-rule detail exists for 3 counties so far. Counties marked NO LOCAL DATA can still be
              selected, but you must take deadlines from that county&apos;s own local rules.
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-[#09090b]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredCounties.map((county) => {
              const isSelected = selectedCounty === county.id;
              const profile = getCountyInfo(county.id);
              return (
                <button
                  key={county.id}
                  onClick={() => {
                    onSelectCounty(county.id);
                    onClose();
                  }}
                  className={`text-left p-3 border transition-colors flex flex-col gap-1 cursor-pointer ${
                    isSelected ? 'bg-accent/10 border-accent' : 'bg-[#111] border-ink-faint hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${isSelected ? 'text-accent' : 'text-white'}`}>
                      {county.name}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>}
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Seat: {county.countySeat}
                  </div>
                  <div
                    className={`text-[10px] font-mono mt-2 border-t border-ink-faint/30 pt-2 truncate ${
                      profile ? 'text-ink-muted' : 'text-yellow-500'
                    }`}
                  >
                    {profile ? `E-File: ${profile.eFilingSystem}` : 'NO LOCAL DATA'}
                  </div>
                </button>
              );
            })}
          </div>
          {filteredCounties.length === 0 && (
            <div className="text-center p-8 text-ink-muted font-mono text-xs">
              No jurisdictions found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
