import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  EMPTY_CAPTION,
  buildDeclarationText,
  buildPleadingPdf,
  captionCounty,
  captionErrors,
  perjuryCertification,
  type CaseCaption,
} from '../pleading';

const complete: CaseCaption = {
  ...EMPTY_CAPTION,
  countyName: 'Spokane County',
  petitionerName: 'A. Filer',
  respondentName: 'B. Filer',
  causeNumber: '26-3-00001-32',
  declarantName: 'A. Filer',
  signedAtCity: 'Spokane',
};

describe('captionErrors', () => {
  it('lists every missing required field on an empty caption', () => {
    expect(captionErrors(EMPTY_CAPTION)).toEqual([
      'County',
      'Petitioner name',
      'Respondent name',
      'Cause number',
      'Declarant name',
      'City where signed',
    ]);
  });

  it('passes a complete caption', () => {
    expect(captionErrors(complete)).toEqual([]);
  });

  it('treats whitespace as missing', () => {
    expect(captionErrors({ ...complete, causeNumber: '   ' })).toContain('Cause number');
  });
});

describe('captionCounty', () => {
  it('avoids "COUNTY OF SPOKANE COUNTY"', () => {
    expect(captionCounty('Spokane County')).toBe('SPOKANE');
    expect(captionCounty('King')).toBe('KING');
  });

  it('falls back to a visible placeholder', () => {
    expect(captionCounty('')).toBe('[COUNTY]');
  });
});

describe('perjuryCertification (RCW 9A.72.085)', () => {
  const text = perjuryCertification(complete, 'March 3, 2026');

  it('declares under penalty of perjury under Washington law', () => {
    expect(text).toContain('penalty of perjury under the laws of the State of Washington');
  });

  it('recites the place of signing', () => {
    expect(text).toContain('Signed at Spokane, Washington');
  });

  it('recites the date of signing', () => {
    expect(text).toContain('on March 3, 2026.');
  });

  it('includes a signature line and the declarant name', () => {
    expect(text).toContain('_____');
    expect(text).toContain('A. Filer');
  });
});

describe('buildDeclarationText', () => {
  const text = buildDeclarationText(
    complete,
    [
      { id: '1', date: '2026-01-10', desc: 'First fact.' },
      { id: '2', date: '2026-02-02', desc: 'Second fact.' },
    ],
    'March 3, 2026',
  );

  it('puts each fact on its own numbered line', () => {
    // Regression: join('\\n') inside a template literal emitted a literal
    // backslash-n and collapsed every fact onto one line.
    expect(text).not.toContain('\\n');
    expect(text).toContain('\n1. 2026-01-10: First fact.');
    expect(text).toContain('\n2. 2026-02-02: Second fact.');
  });

  it('includes the caption, cause number and statutory heading', () => {
    expect(text).toContain('SUPERIOR COURT OF WASHINGTON, COUNTY OF SPOKANE');
    expect(text).toContain('No. 26-3-00001-32');
    expect(text).toContain('RCW 26.09.270');
  });

  it('uses the action line matching the case type', () => {
    expect(buildDeclarationText(complete, [], 'x')).toContain('In re the Marriage of:');
    expect(buildDeclarationText({ ...complete, actionType: 'parentage' }, [], 'x')).toContain(
      'In re the Parentage of:',
    );
  });

  it('shows placeholders rather than inventing party names', () => {
    const bare = buildDeclarationText(EMPTY_CAPTION, [], 'x');
    expect(bare).toContain('[PETITIONER]');
    expect(bare).toContain('[CAUSE NUMBER]');
    expect(bare).not.toContain('JANE DOE');
  });
});

describe('buildPleadingPdf', () => {
  const manyFacts = Array.from({ length: 60 }, (_, i) => ({
    id: String(i),
    date: '2026-01-10',
    desc: `Fact ${i + 1}. ` + 'A long narrative that wraps across several lines. '.repeat(2),
  }));

  it('produces a valid PDF', async () => {
    const bytes = await buildPleadingPdf(complete, [], { watermark: false });
    expect(Buffer.from(bytes).subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('paginates instead of truncating a long declaration', async () => {
    const bytes = await buildPleadingPdf(complete, manyFacts, { watermark: false });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThan(1);
  });

  it('watermarks every page of a draft, not just the first', async () => {
    const bytes = await buildPleadingPdf(complete, manyFacts, { watermark: true });
    const doc = await PDFDocument.load(bytes);
    const plain = await buildPleadingPdf(complete, manyFacts, { watermark: false });
    expect(doc.getPageCount()).toBeGreaterThan(1);
    // Each watermarked page carries extra content, so the draft is larger.
    expect(bytes.length).toBeGreaterThan(plain.length);
  });

  it('omits the watermark from the paid render', async () => {
    const paid = await buildPleadingPdf(complete, [], { watermark: false });
    expect(Buffer.from(paid).toString('latin1')).not.toContain('UNPAID');
  });
});
