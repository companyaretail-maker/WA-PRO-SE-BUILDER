export type TabType = 
  | 'landing' 
  | 'calculator' 
  | 'readiness' 
  | 'efiling'
  | 'declaration' 
  | 'deadlines' 
  | 'packet'
  | 'summons'
  | 'service'
  | 'hearing'
  | 'evidence'
  | 'settlement'
  | 'appellate'
  | 'word'
  | 'facilitators';

export interface EfilingPortalInfo {
  countyId: string;
  countyName: string;
  portalName: string;
  portalUrl: string;
  alternativeUrl?: string;
  workingCopiesUrl?: string;
  confirmationUrl?: string;
  mandatoryEfiling: boolean;
  proSeAllowedOnline: boolean;
  acceptedFormats: string[];
  maxFileSizeMB: number;
  filingFeeStandard: string;
  clerkPhone: string;
  clerkEmail?: string;
  specialInstructions: string[];
}

export interface EfilingRequiredDoc {
  id: string;
  title: string;
  formCode: string;
  category: 'initiation' | 'substantive' | 'hearing' | 'service' | 'financial' | 'working_copies';
  statutoryBasis: string;
  ruleReference: string;
  isMandatory: boolean;
  isCountySpecific: boolean;
  description: string;
  gr14Requirements: string[];
  gr22RedactionNeeded: boolean;
  requiresPerjurySignature: boolean;
  packetAvailable: boolean;
  sampleTip: string;
  price?: number;
}

export type ReadinessResultType = 'green' | 'yellow' | 'red' | 'dv_screen';

export interface ReadinessOption {
  id: string;
  label: string;
  subtext?: string;
  scoreImpact: number;
  flagId?: string;
  isDVTrigger?: boolean;
}

export interface ReadinessQuestion {
  id: string;
  question: string;
  statutoryBasis: string;
  explanation: string;
  options: ReadinessOption[];
}

export interface DynamicFlag {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  statutoryRef: string;
  remedy?: string;
}

export interface ReadinessEvaluation {
  resultType: ReadinessResultType;
  headline: string;
  description: string;
  flags: DynamicFlag[];
  statutoryPathway: 'major' | 'minor' | 'ineligible' | 'safety_hold';
  suggestedAction: string;
}

export interface FactEntry {
  id: string;
  date: string;
  description: string;
  hasExhibit: boolean;
  exhibitLabel: string;
  exhibitDescription: string;
  statutoryCategory?: string;
}

export interface CourtDeadlineItem {
  name: string;
  statutoryRule: string;
  cutoffDescription: string;
  fatal: boolean;
}
