import React, { useState, useEffect } from 'react';
import { DocumentRouter } from './components/DocumentRouter';
import { ReadinessCheck } from './components/ReadinessCheck';
import { DeclarationEngine } from './components/DeclarationEngine';
import { PacketViewer } from './components/PacketViewer';
import { TermsModal } from './components/TermsModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EMPTY_CAPTION, type CaseCaption, type FactEntry } from './utils/pleading';
import { getCountyName } from './data/waCounties';
import { readEntitlement, storeEntitlement, clearEntitlement, verifyEntitlement } from './lib/entitlement';
import { 
  EfilingChecklist, EvidenceEngine, KingCountyDeadlines, 
  ServiceEngine, SettlementEngine, WordEngine, AppellateEngine, 
  FacilitatorDirectory, SummonsEngine, HearingEngine,
  CountySelectionModal, LegalAssistantChat, BannerLogo, LegalPoliciesModal
} from './components/index';
import { DayCountCalculator } from './components/DayCountCalculator';
import { RestorePurchaseModal } from './components/RestorePurchaseModal';
import { FormsChecklist } from './components/FormsChecklist';

function AppContent() {
  const [activeModule, setActiveModule] = useState('screener');
  const [selectedCounty, setSelectedCounty] = useState('king');
  const [isCountyModalOpen, setIsCountyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [legalModalState, setLegalModalState] = useState<{isOpen: boolean, tab: 'gr24' | 'terms' | 'privacy'}>({ isOpen: false, tab: 'gr24' });
  const { user, login, logout, role } = useAuth();

  const [entitlementToken, setEntitlementToken] = useState<string | null>(null);
  const [caption, setCaption] = useState<CaseCaption>(EMPTY_CAPTION);
  const [facts, setFacts] = useState<FactEntry[]>([]);

  // A purchase has to survive a page reload, and the server is the one that
  // decides whether the stored token is still good.
  useEffect(() => {
    const stored = readEntitlement();
    if (!stored) return;
    verifyEntitlement(stored).then((valid) => {
      if (valid) setEntitlementToken(stored);
      else clearEntitlement();
    });
  }, []);

  const handlePurchaseComplete = (token: string) => {
    storeEntitlement(token);
    setEntitlementToken(token);
    setIsTermsModalOpen(false);
  };

  return (
    <div className="h-screen bg-bg text-ink flex flex-col lg:grid lg:grid-cols-[280px_1fr_300px] lg:grid-rows-[auto_1fr_auto] font-sans overflow-hidden">
      <header className="col-span-full px-6 py-4 flex items-center justify-between bg-[#111] border-b border-ink-faint shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
            <span className="text-accent font-bold">WA</span>
          </div>
          <div>
            <h1 className="font-oswald text-xl uppercase tracking-wide text-white">WA Pro Se Builder</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-accent border border-accent/50 bg-accent/5 px-2 py-1 uppercase hidden sm:block">{role}</span>
              <span className="text-sm font-semibold">{user.name}</span>
              <button onClick={logout} className="font-mono text-[10px] text-accent border border-accent px-3 py-1.5 uppercase cursor-pointer hover:bg-accent/10 transition-colors">Logout</button>
            </div>
          ) : (
            <button onClick={login} className="font-mono text-[10px] text-accent border border-accent px-3 py-1.5 uppercase cursor-pointer hover:bg-accent/10 transition-colors">System_Login</button>
          )}
        </div>
      </header>

      {/* Sidebar Nav (Left) */}
      <aside className="hidden lg:block border-r border-ink-faint overflow-y-auto p-4 bg-bg">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted mb-4 px-3">Terminal / Tools</div>
        <DocumentRouter
          activeModule={activeModule}
          onSelectModule={setActiveModule}
        />
      </aside>

      {/* Mobile Nav (Horizontal scroll, shown on small screens) */}
      <div className="lg:hidden shrink-0 border-b border-ink-faint bg-bg z-30">
        <div className="flex items-center justify-between gap-2 px-3 pt-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted">Jurisdiction</span>
          <button
            onClick={() => setIsCountyModalOpen(true)}
            className="font-mono text-[10px] uppercase text-accent border border-accent/50 px-2 py-1 cursor-pointer truncate max-w-[60%]"
          >
            {getCountyName(selectedCounty)} — Change
          </button>
        </div>
        <DocumentRouter
          activeModule={activeModule}
          onSelectModule={setActiveModule}
        />
      </div>

      <main className="flex-1 w-full p-4 md:p-8 lg:p-12 flex flex-col gap-6 lg:gap-8 overflow-y-auto relative bg-bg">
        {/* Banner Image */}
        <div className="w-full pb-4 border-b border-ink-faint/30 mb-2">
          <BannerLogo opacity={0.9} />
        </div>

        {activeModule === 'screener' && (
          <ReadinessCheck 
            onProceedToDeclaration={() => setActiveModule('declaration')}
            selectedCounty={selectedCounty}
          />
        )}
        {activeModule === 'declaration' && (
          <DeclarationEngine
            selectedCounty={selectedCounty}
            caption={caption}
            onCaptionChange={setCaption}
            facts={facts}
            onFactsChange={setFacts}
          />
        )}
        {activeModule === 'packet' && (
          <PacketViewer
            selectedCounty={selectedCounty}
            caption={caption}
            facts={facts}
            entitlementToken={entitlementToken}
            onPurchaseComplete={handlePurchaseComplete}
          />
        )}
        {activeModule === 'forms' && <FormsChecklist selectedCounty={selectedCounty} />}
        {activeModule === 'summons' && <SummonsEngine />}
        {activeModule === 'service' && <ServiceEngine />}
        {activeModule === 'hearing' && <HearingEngine />}
        {activeModule === 'evidence' && <EvidenceEngine />}
        {activeModule === 'settlement' && <SettlementEngine />}
        {activeModule === 'appellate' && <AppellateEngine />}
        {activeModule === 'word' && <WordEngine />}
        {activeModule === 'efiling' && <EfilingChecklist selectedCounty={selectedCounty} />}
        {activeModule === 'deadlines' && <KingCountyDeadlines />}
        {activeModule === 'daycount' && <DayCountCalculator />}
        {activeModule === 'facilitators' && <FacilitatorDirectory />}
      </main>

      {/* Context Pane (Right) */}
      <aside className="hidden lg:flex flex-col border-l border-ink-faint p-6 bg-[#09090b] overflow-y-auto">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted mb-4">Jurisdiction Overview</div>
        
        <div className="bg-[#111] p-4 border border-ink-faint mb-4">
          <h4 className="font-mono text-[11px] text-accent mb-3">COUNTY SELECTION</h4>
          <div className="flex items-center justify-between border border-ink-faint bg-black p-1 pl-3">
            <span className="text-[11px] font-mono text-white truncate max-w-[140px]">{getCountyName(selectedCounty).toUpperCase()}</span>
            <button
              onClick={() => setIsCountyModalOpen(true)}
              className="font-mono text-[10px] bg-ink-faint hover:bg-white/10 text-ink-muted px-2 py-1 transition-colors cursor-pointer shrink-0"
            >
              CHANGE
            </button>
          </div>
        </div>

        <div className="bg-[#111] p-4 border border-ink-faint mb-4">
          <h4 className="font-mono text-[11px] text-accent mb-2">GR 14 COMPLIANCE</h4>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Documents are rendered on 8.5 x 11 pages in 12 pt Times with a 3-inch first-page top margin and 1-inch side and bottom margins. Confirm the current formatting requirements in GR 14 and your county's local rules before filing.
          </p>
        </div>
        
        <div className="bg-accent/5 p-4 border border-accent/20 mt-auto">
          <h4 className="font-mono text-[11px] text-accent mb-3 text-center">
            {entitlementToken ? 'PACKET UNLOCKED' : 'UNLOCK FULL PACKET'}
          </h4>
          <button
            onClick={() => setActiveModule('packet')}
            className="w-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/50 py-2.5 px-4 font-mono font-bold uppercase text-[10px] tracking-wider cursor-pointer transition-colors"
          >
            {entitlementToken ? 'Download Documents' : 'Access Documents'}
          </button>
          {!entitlementToken && (
            <button
              onClick={() => setIsRestoreOpen(true)}
              className="w-full mt-2 text-ink-muted hover:text-accent font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
            >
              Already paid? Restore
            </button>
          )}
        </div>
      </aside>

      {/* Footer */}
      <footer className="col-span-full hidden lg:flex p-2 px-6 bg-black justify-between items-center border-t border-ink-faint z-40">
        <div className="font-mono text-[10px] text-ink-muted flex items-center gap-2 uppercase tracking-wide">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_var(--color-accent)]"></span> System Live // Port 3000
        </div>
        
        <div className="flex gap-4">
          <button onClick={() => setLegalModalState({ isOpen: true, tab: 'gr24' })} className="font-mono text-[10px] text-ink-muted hover:text-accent uppercase transition-colors">GR 24 Statement</button>
          <button onClick={() => setLegalModalState({ isOpen: true, tab: 'terms' })} className="font-mono text-[10px] text-ink-muted hover:text-accent uppercase transition-colors">Terms</button>
          <button onClick={() => setLegalModalState({ isOpen: true, tab: 'privacy' })} className="font-mono text-[10px] text-ink-muted hover:text-accent uppercase transition-colors">Privacy</button>
        </div>

        <div className="font-mono text-[10px] text-ink-muted opacity-50 uppercase tracking-widest">
          Procedural Guidance Engine v2.4.0
        </div>
      </footer>

      <CountySelectionModal 
        isOpen={isCountyModalOpen}
        onClose={() => setIsCountyModalOpen(false)}
        selectedCounty={selectedCounty}
        onSelectCounty={setSelectedCounty}
      />
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onUnlocked={handlePurchaseComplete}
      />
      <RestorePurchaseModal
        isOpen={isRestoreOpen}
        onClose={() => setIsRestoreOpen(false)}
        onRestored={handlePurchaseComplete}
      />
      <LegalPoliciesModal 
        isOpen={legalModalState.isOpen}
        initialTab={legalModalState.tab}
        onClose={() => setLegalModalState(prev => ({ ...prev, isOpen: false }))}
      />
      <LegalAssistantChat />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
