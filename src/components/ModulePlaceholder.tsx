import React from 'react';
import { Construction } from 'lucide-react';

export const ModulePlaceholder = ({ title, description }: { title: string, description: string }) => {
  return (
    <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
      <div className="border border-ink-faint/30 bg-[#0d0d0e] p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-4 rounded-lg">
          <Construction className="w-6 h-6 text-accent" />
        </div>
        <h2 className="font-oswald text-xl uppercase tracking-wide text-white mb-2">{title}</h2>
        <p className="text-sm text-ink-muted">{description}</p>
        
        <div className="mt-6 font-mono text-[10px] text-accent/50 uppercase tracking-widest border-t border-ink-faint/30 pt-4">
          Module pending deployment in next patch cycle.
        </div>
      </div>
    </div>
  );
};
