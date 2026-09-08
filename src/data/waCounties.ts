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
  eFilingPortalUrl?: string;
  benchCopiesRule: string;
  facilitatorPhone: string;
  facilitatorOffice: string;
  proceduralNotes: string[];
  /**
   * Every local-rule fact in this file is transcribed, not fetched. Until an
   * entry has been checked against the county's current local rules on a known
   * date, it stays 'unverified' and the UI says so. See AUDIT.md.
   */
  verification: { status: 'verified' | 'unverified'; checkedOn: string | null };
  traps: {
    title: string;
    subtitle: string;
    description: string;
    severity: 'fatal' | 'warning' | 'info';
  }[];
}

/** All 39 Washington counties, so the picker can distinguish "no data" from "not a county". */
export const WA_COUNTY_NAMES: { id: string; name: string; countySeat: string }[] = [
  { id: 'adams', name: 'Adams County', countySeat: 'Ritzville' },
  { id: 'asotin', name: 'Asotin County', countySeat: 'Asotin' },
  { id: 'benton', name: 'Benton County', countySeat: 'Prosser' },
  { id: 'chelan', name: 'Chelan County', countySeat: 'Wenatchee' },
  { id: 'clallam', name: 'Clallam County', countySeat: 'Port Angeles' },
  { id: 'clark', name: 'Clark County', countySeat: 'Vancouver' },
  { id: 'columbia', name: 'Columbia County', countySeat: 'Dayton' },
  { id: 'cowlitz', name: 'Cowlitz County', countySeat: 'Kelso' },
  { id: 'douglas', name: 'Douglas County', countySeat: 'Waterville' },
  { id: 'ferry', name: 'Ferry County', countySeat: 'Republic' },
  { id: 'franklin', name: 'Franklin County', countySeat: 'Pasco' },
  { id: 'garfield', name: 'Garfield County', countySeat: 'Pomeroy' },
  { id: 'grant', name: 'Grant County', countySeat: 'Ephrata' },
  { id: 'grays-harbor', name: 'Grays Harbor County', countySeat: 'Montesano' },
  { id: 'island', name: 'Island County', countySeat: 'Coupeville' },
  { id: 'jefferson', name: 'Jefferson County', countySeat: 'Port Townsend' },
  { id: 'king', name: 'King County', countySeat: 'Seattle' },
  { id: 'kitsap', name: 'Kitsap County', countySeat: 'Port Orchard' },
  { id: 'kittitas', name: 'Kittitas County', countySeat: 'Ellensburg' },
  { id: 'klickitat', name: 'Klickitat County', countySeat: 'Goldendale' },
  { id: 'lewis', name: 'Lewis County', countySeat: 'Chehalis' },
  { id: 'lincoln', name: 'Lincoln County', countySeat: 'Davenport' },
  { id: 'mason', name: 'Mason County', countySeat: 'Shelton' },
  { id: 'okanogan', name: 'Okanogan County', countySeat: 'Okanogan' },
  { id: 'pacific', name: 'Pacific County', countySeat: 'South Bend' },
  { id: 'pend-oreille', name: 'Pend Oreille County', countySeat: 'Newport' },
  { id: 'pierce', name: 'Pierce County', countySeat: 'Tacoma' },
  { id: 'san-juan', name: 'San Juan County', countySeat: 'Friday Harbor' },
  { id: 'skagit', name: 'Skagit County', countySeat: 'Mount Vernon' },
  { id: 'skamania', name: 'Skamania County', countySeat: 'Stevenson' },
  { id: 'snohomish', name: 'Snohomish County', countySeat: 'Everett' },
  { id: 'spokane', name: 'Spokane County', countySeat: 'Spokane' },
  { id: 'stevens', name: 'Stevens County', countySeat: 'Colville' },
  { id: 'thurston', name: 'Thurston County', countySeat: 'Olympia' },
  { id: 'wahkiakum', name: 'Wahkiakum County', countySeat: 'Cathlamet' },
  { id: 'walla-walla', name: 'Walla Walla County', countySeat: 'Walla Walla' },
  { id: 'whatcom', name: 'Whatcom County', countySeat: 'Bellingham' },
  { id: 'whitman', name: 'Whitman County', countySeat: 'Colfax' },
  { id: 'yakima', name: 'Yakima County', countySeat: 'Yakima' },
];

export const COUNTY_PROFILES: WashingtonCountyInfo[] = [
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
    eFilingPortalUrl: 'https://dja-prd-ecexap1.kingcounty.gov/',
    benchCopiesRule: 'Must file formal Working Papers Submission List',
    facilitatorPhone: '(206) 263-8100',
    facilitatorOffice: '516 3rd Ave Room W-382 (Seattle)',
    proceduralNotes: ['Split between Seattle and Kent.'],
    verification: { status: 'unverified', checkedOn: null },
    traps: [],
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
    eFilingPortalUrl: 'https://linxonline.co.pierce.wa.us/linxweb/Main.cfm',
    benchCopiesRule: 'Submitted electronically via LINX',
    facilitatorPhone: '(253) 798-3627',
    facilitatorOffice: '930 Tacoma Ave S, Room 108',
    proceduralNotes: ['Pierce County uses LINX for all filings.'],
    verification: { status: 'unverified', checkedOn: null },
    traps: [],
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
    eFilingPortalUrl: 'https://washington.tylerhost.net/ofsweb',
    benchCopiesRule: 'Prominently labeled',
    facilitatorPhone: '(425) 388-3781',
    facilitatorOffice: '3000 Rockefeller Ave',
    proceduralNotes: [],
    verification: { status: 'unverified', checkedOn: null },
    traps: [],
  },
];

function normalize(input: string): string {
  return (input || '').toLowerCase().replace(/ county/g, '').replace(/\s+/g, '-').trim();
}

/**
 * Returns the profile for a county, or null when no profile exists.
 *
 * This deliberately does NOT fall back to King County. Showing a Spokane filer
 * King County's working-copies deadline and facilitator phone number as if they
 * were their own is a missed-deadline waiting to happen.
 */
export function getCountyInfo(countyNameOrId: string): WashingtonCountyInfo | null {
  const norm = normalize(countyNameOrId);
  if (!norm) return null;
  return (
    COUNTY_PROFILES.find(
      (c) => c.id === norm || normalize(c.shortName) === norm || normalize(c.name) === norm,
    ) || null
  );
}

/** Display name for any of the 39 counties, whether or not a profile exists. */
export function getCountyName(countyNameOrId: string): string {
  const norm = normalize(countyNameOrId);
  return WA_COUNTY_NAMES.find((c) => c.id === norm)?.name || countyNameOrId;
}

export function hasCountyProfile(countyNameOrId: string): boolean {
  return getCountyInfo(countyNameOrId) !== null;
}

export const WA_COUNTIES = COUNTY_PROFILES;
/** @deprecated Only 3 of the 39 counties have profiles; the old name was a lie. */
export const WA_ALL_39_COUNTIES = COUNTY_PROFILES;
