export interface WashingtonCountyInfo {
  id: string;
  name: string;
  shortName: string;
  countySeat: string;
  superiorCourtName: string;
  superiorCourtAddress: string;
  districtCourtName: string;
  districtCourtAddress: string;
  localRuleCitation: string;
  motionCalendarName: string;
  workingPapersDeadline: string;
  workingPapersMethod: string;
  confirmationDeadline: string;
  confirmationMethod: string;
  floRequirement: string;
  hearingDays: string;
  zoomAvailable: boolean;
  eFilingSystem: string;
  benchCopiesRule: string;
  facilitatorPhone: string;
  facilitatorOffice: string;
  proceduralNotes: string[];
  traps: {
    title: string;
    subtitle: string;
    description: string;
    severity: 'fatal' | 'warning' | 'info';
  }[];
}

export const WA_ALL_39_COUNTIES: WashingtonCountyInfo[] = [
  {
    id: 'king',
    name: 'King County',
    shortName: 'King',
    countySeat: 'Seattle',
    superiorCourtName: 'King County Superior Court (Seattle Courthouse & Kent MRJC)',
    superiorCourtAddress: '516 3rd Ave, Seattle, WA 98104',
    districtCourtName: 'King County District Court',
    districtCourtAddress: '516 3rd Ave, Seattle, WA 98104',
    localRuleCitation: 'KCLCR 4, KCLCR 7 & LFLR 6',
    motionCalendarName: 'Family Law Motions Calendar',
    workingPapersDeadline: '14 calendar days prior to hearing by 12:00 PM NOON',
    workingPapersMethod: 'King County E-Filing System / E-Working Copies',
    confirmationDeadline: '12:00 PM NOON, 3 court days prior',
    confirmationMethod: 'Mandatory Submission List',
    floRequirement: 'Mandatory Family Law Orientation (FLO) within 30 days',
    hearingDays: 'Monday through Friday at 1:30 PM (Virtual / Zoom)',
    zoomAvailable: true,
    eFilingSystem: 'King County E-Court Portal',
    benchCopiesRule: 'Must file formal Working Papers Submission List',
    facilitatorPhone: '(206) 263-8100',
    facilitatorOffice: '516 3rd Ave Room W-382 (Seattle)',
    proceduralNotes: ['Split between Seattle and Kent.'],
    traps: []
  },
  {
    id: 'pierce',
    name: 'Pierce County',
    shortName: 'Pierce',
    countySeat: 'Tacoma',
    superiorCourtName: 'Pierce County Superior Court',
    superiorCourtAddress: '930 Tacoma Ave S, Tacoma, WA 98402',
    districtCourtName: 'Pierce County District Court',
    districtCourtAddress: '930 Tacoma Ave S, Tacoma, WA 98402',
    localRuleCitation: 'PCLSPR 94.04 & PCLR 7',
    motionCalendarName: 'Commissioner Family Law Motion Docket',
    workingPapersDeadline: '6 court days prior to hearing by 12:00 PM NOON',
    workingPapersMethod: 'Pierce County LINX Electronic Working Copies tab',
    confirmationDeadline: '12:00 PM NOON, 2 court days prior to hearing',
    confirmationMethod: 'Mandatory confirmation via Pierce County LINX',
    floRequirement: 'Family Law Orientation within 60 days',
    hearingDays: 'Monday through Friday mornings',
    zoomAvailable: true,
    eFilingSystem: 'Pierce County LINX System',
    benchCopiesRule: 'Submitted electronically via LINX',
    facilitatorPhone: '(253) 798-3627',
    facilitatorOffice: '930 Tacoma Ave S, Room 108',
    proceduralNotes: ['Pierce County uses LINX for all filings.'],
    traps: []
  },
  {
    id: 'snohomish',
    name: 'Snohomish County',
    shortName: 'Snohomish',
    countySeat: 'Everett',
    superiorCourtName: 'Snohomish County Superior Court',
    superiorCourtAddress: '3000 Rockefeller Ave, Everett, WA 98201',
    districtCourtName: 'Snohomish County District Court',
    districtCourtAddress: '3000 Rockefeller Ave, Everett',
    localRuleCitation: 'SCLCR 94.04 & SCLCR 7',
    motionCalendarName: 'Family Law Commissioner Motion Docket',
    workingPapersDeadline: '14 calendar days prior',
    workingPapersMethod: 'E-Filing Working Copies System',
    confirmationDeadline: '12:00 PM NOON, 2 court days before hearing',
    confirmationMethod: 'Odyssey/Portal or Phone Confirmation',
    floRequirement: 'Mandatory seminar completion within 60 days',
    hearingDays: 'Tuesday & Thursday',
    zoomAvailable: true,
    eFilingSystem: 'Odyssey File & Serve',
    benchCopiesRule: 'Prominently labeled',
    facilitatorPhone: '(425) 388-3781',
    facilitatorOffice: '3000 Rockefeller Ave',
    proceduralNotes: [],
    traps: []
  }
];

export function getCountyInfo(countyNameOrId: string): WashingtonCountyInfo {
  const norm = (countyNameOrId || '').toLowerCase().replace(/ county/g, '').trim();
  const found = WA_ALL_39_COUNTIES.find(
    c => c.id === norm || c.shortName.toLowerCase() === norm || c.name.toLowerCase().includes(norm)
  );
  return found || WA_ALL_39_COUNTIES.find(c => c.id === 'king')!;
}
export const WA_COUNTIES = WA_ALL_39_COUNTIES;
