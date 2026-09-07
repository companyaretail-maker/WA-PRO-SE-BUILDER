import React from 'react';
import { ModulePlaceholder } from './ModulePlaceholder';

export { EfilingChecklist } from './EfilingChecklist';
export { CountySelectionModal } from './CountySelectionModal';
export { BannerLogo } from './BannerLogo';
export { LegalPoliciesModal } from './LegalPoliciesModal';
export { LegalAssistantChat } from './LegalAssistantChat';

export const EvidenceEngine = () => <ModulePlaceholder title="Evidence Organization Engine" description="Tools for indexing, redacting, and preparing exhibits for court filing." />;
export const KingCountyDeadlines = () => <ModulePlaceholder title="King County Case Schedule" description="LCR deadline calculation and chronological tracking." />;
export const ServiceEngine = () => <ModulePlaceholder title="Proof of Service Module" description="Generate return of service and tracking affidavits." />;
export const SettlementEngine = () => <ModulePlaceholder title="Settlement / CR 2A Engine" description="Drafting tools for binding settlement agreements." />;
export const WordEngine = () => <ModulePlaceholder title="Word / Docx Export" description="Advanced formatting controls for MS Word." />;
export const AppellateEngine = () => <ModulePlaceholder title="Appellate Filing Engine" description="Formatting for Court of Appeals." />;
export const DayCountCalculator = () => <ModulePlaceholder title="Day Count Calculator" description="Procedural timeline calculation." />;
export const FacilitatorDirectory = () => <ModulePlaceholder title="Facilitator Directory" description="Contacts and links for county family law facilitators." />;
export const SummonsEngine = () => <ModulePlaceholder title="Summons Generator" description="Create mandatory summons documents for new actions." />;
export const HearingEngine = () => <ModulePlaceholder title="Hearing Preparation" description="Create notice of hearing and working copies instructions." />;
