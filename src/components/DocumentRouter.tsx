import React from 'react';
import { 
  FileText, ShieldCheck, Clock, Calendar, Scale, FolderCheck, Handshake,
  Download, CheckCircle2, Building2, BookOpen
} from 'lucide-react';

export const MODULES = [
  { id: 'screener', title: 'Statutory Gate', icon: ShieldCheck, badge: 'Step 1' },
  { id: 'declaration', title: 'Fact Engine', icon: FileText, badge: 'Core' },
  { id: 'packet', title: 'Court Packet', icon: BookOpen, badge: 'Packet' },
  { id: 'forms', title: 'Required Forms', icon: FileText, badge: 'Scope' },
  { id: 'summons', title: 'Summons Engine', icon: Clock, badge: 'CR 4' },
  { id: 'service', title: 'Proof of Service', icon: CheckCircle2, badge: 'CR 4(c)' },
  { id: 'hearing', title: 'Note Docket', icon: Calendar, badge: 'Docket' },
  { id: 'evidence', title: 'Sealed Exhibits', icon: FolderCheck, badge: 'Evidence' },
  { id: 'settlement', title: 'CR 2A Settlement', icon: Handshake, badge: 'CR 2A' },
  { id: 'appellate', title: 'Motion for Revision', icon: Scale, badge: 'Revision' },
  { id: 'word', title: 'GR 14 Generator', icon: Download, badge: '.DOCX' },
  { id: 'efiling', title: 'E-Filing Readiness', icon: Building2, badge: 'Portals' },
  { id: 'deadlines', title: 'Deadlines & Rules', icon: Clock, badge: 'Calendar' },
  { id: 'daycount', title: 'CR 6 Calculator', icon: Calendar, badge: 'CR 6(a)' },
  { id: 'facilitators', title: 'Facilitators', icon: Building2, badge: 'Directory' }
];

interface DocumentRouterProps {
  activeModule: string;
  onSelectModule: (id: string) => void;
}

export const DocumentRouter: React.FC<DocumentRouterProps> = ({ activeModule, onSelectModule }) => {
  return (
    <div className="flex lg:flex-col items-center lg:items-stretch gap-1.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 scrollbar-thin p-2 lg:p-0">
      {MODULES.map(mod => {
        const isActive = activeModule === mod.id;
        const Icon = mod.icon;
        return (
          <button
            key={mod.id}
            onClick={() => onSelectModule(mod.id)}
            className={`px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-3 cursor-pointer ${
              isActive
                ? 'bg-accent/10 text-accent border border-accent/30 shadow-xs'
                : 'bg-transparent hover:bg-ink-faint text-ink-muted border border-transparent hover:border-ink-faint'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : 'opacity-70'}`} />
            <span className="truncate">{mod.title}</span>
          </button>
        );
      })}
    </div>
  );
};

