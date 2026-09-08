/**
 * Detects personal identifiers that generally must not appear in the open
 * court record.
 *
 * Washington GR 22 restricts personal identifiers in family law and guardianship
 * filings: identifiers such as social security numbers, financial account
 * numbers and dates of birth belong on the sealed Confidential Information Form
 * rather than in a declaration that goes into the public file.
 *
 * This is a lint, not a guarantee. It catches patterns; it cannot tell that
 * "my daughter Ava" names a minor, and it does not decide what your county
 * requires. It exists so that an obvious SSN in a fact statement is caught
 * before the document is filed, not after.
 */

export type RedactionKind =
  | 'ssn'
  | 'date_of_birth'
  | 'financial_account'
  | 'drivers_license'
  | 'phone'
  | 'email';

export interface RedactionFinding {
  kind: RedactionKind;
  /** The exact text that matched, for highlighting. */
  match: string;
  index: number;
  label: string;
  guidance: string;
}

interface Detector {
  kind: RedactionKind;
  label: string;
  guidance: string;
  pattern: RegExp;
  /** Optional extra check to cut false positives. Receives the full match with `input`. */
  accept?: (match: RegExpExecArray & { input: string }) => boolean;
}

const DETECTORS: Detector[] = [
  {
    kind: 'ssn',
    label: 'Social Security number',
    guidance:
      'Do not put a social security number in a declaration. It belongs on the Confidential Information Form, and only the last four digits are typically used elsewhere.',
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
  },
  {
    kind: 'ssn',
    label: 'Possible unformatted Social Security number',
    guidance:
      'A bare nine-digit number reads as a social security number. If that is what it is, move it to the Confidential Information Form.',
    pattern: /\b\d{9}\b/g,
    // An explicitly labelled account or routing number is not an SSN; let the
    // financial detector describe it, so the user gets the right guidance.
    accept: (m) => !/(?:account|acct\.?|routing|policy|case)\s*(?:no\.?|number|#)?\s*:?\s*$/i.test(
      m.input.slice(Math.max(0, m.index - 24), m.index),
    ),
  },
  {
    kind: 'date_of_birth',
    label: 'Full date of birth',
    guidance:
      'Use the year alone, or the child’s initials and year, rather than a full date of birth in the public record.',
    // Only flags a date when the surrounding words indicate it is a birth date.
    pattern:
      /\b(?:date of birth|d\.?o\.?b\.?|born(?: on)?)\b[^.\n]{0,20}?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})/gi,
  },
  {
    kind: 'financial_account',
    label: 'Financial account or card number',
    guidance:
      'Account and card numbers belong on the Confidential Information Form. Refer to the account by the last four digits if you must identify it.',
    pattern: /\b(?:\d[ -]?){13,19}\b/g,
    accept: (m) => {
      const digits = m[0].replace(/\D/g, '');
      return digits.length >= 13 && digits.length <= 19;
    },
  },
  {
    kind: 'financial_account',
    label: 'Account number referenced in text',
    guidance:
      'Identify the account by its last four digits rather than in full.',
    pattern: /\b(?:account|acct\.?|routing)\s*(?:no\.?|number|#)?\s*:?\s*(\d{5,})\b/gi,
  },
  {
    kind: 'drivers_license',
    label: 'Possible driver’s license number',
    guidance: 'Driver’s license numbers belong on the Confidential Information Form.',
    pattern: /\b(?:driver'?s?\s*licen[sc]e|dl)\s*(?:no\.?|number|#)?\s*:?\s*([A-Z0-9*]{6,})\b/gi,
  },
  {
    kind: 'phone',
    label: 'Phone number',
    guidance:
      'Consider whether a phone number needs to be in the public record, particularly in a case involving safety concerns.',
    pattern: /\b(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/g,
  },
  {
    kind: 'email',
    label: 'Email address',
    guidance: 'Consider whether an email address needs to be in the public record.',
    pattern: /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g,
  },
];

/** Severity ordering: identifiers GR 22 names come before judgement calls. */
const SEVERITY: Record<RedactionKind, number> = {
  ssn: 0,
  financial_account: 1,
  drivers_license: 2,
  date_of_birth: 3,
  phone: 4,
  email: 5,
};

export function findPersonalIdentifiers(text: string): RedactionFinding[] {
  if (!text) return [];
  const findings: RedactionFinding[] = [];
  const claimed: { start: number; end: number }[] = [];

  for (const detector of [...DETECTORS].sort((a, b) => SEVERITY[a.kind] - SEVERITY[b.kind])) {
    const re = new RegExp(detector.pattern.source, detector.pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) {
        re.lastIndex++;
        continue;
      }
      if (detector.accept && !detector.accept(m as RegExpExecArray & { input: string })) continue;
      const start = m.index;
      const end = m.index + m[0].length;
      // A stricter detector already covering this span wins; don't double-report.
      if (claimed.some((c) => start < c.end && end > c.start)) continue;
      claimed.push({ start, end });
      findings.push({
        kind: detector.kind,
        match: m[0],
        index: start,
        label: detector.label,
        guidance: detector.guidance,
      });
    }
  }

  return findings.sort((a, b) => a.index - b.index);
}

export function isHighRisk(kind: RedactionKind): boolean {
  return SEVERITY[kind] <= 3;
}

/** Scans every fact at once, for a pre-filing check. */
export function scanFacts(
  facts: { id: string; desc: string }[],
): { factId: string; findings: RedactionFinding[] }[] {
  return facts
    .map((f) => ({ factId: f.id, findings: findPersonalIdentifiers(f.desc) }))
    .filter((r) => r.findings.length > 0);
}
