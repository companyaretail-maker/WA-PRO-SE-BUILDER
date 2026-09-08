import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

/**
 * Case caption data supplied by the litigant. Nothing here is inferred or
 * defaulted to sample values: a pleading that goes out the door with placeholder
 * parties is worse than no pleading at all.
 */
export interface CaseCaption {
  countyName: string;
  /** "marriage" -> "In re the Marriage of"; "parentage" -> "In re the Parentage of" */
  actionType: 'marriage' | 'parentage' | 'other';
  petitionerName: string;
  respondentName: string;
  causeNumber: string;
  documentTitle: string;
  /** Name of the person signing the declaration under RCW 9A.72.085. */
  declarantName: string;
  /** City where the declaration is signed (RCW 9A.72.085 requires place). */
  signedAtCity: string;
  signedAtState: string;
}

export interface FactEntry {
  id: string;
  date: string;
  desc: string;
}

export const EMPTY_CAPTION: CaseCaption = {
  countyName: '',
  actionType: 'marriage',
  petitionerName: '',
  respondentName: '',
  causeNumber: '',
  documentTitle: 'DECLARATION IN SUPPORT OF ADEQUATE CAUSE',
  declarantName: '',
  signedAtCity: '',
  signedAtState: 'Washington',
};

export function captionErrors(caption: CaseCaption): string[] {
  const missing: string[] = [];
  if (!caption.countyName.trim()) missing.push('County');
  if (!caption.petitionerName.trim()) missing.push('Petitioner name');
  if (!caption.respondentName.trim()) missing.push('Respondent name');
  if (!caption.causeNumber.trim()) missing.push('Cause number');
  if (!caption.documentTitle.trim()) missing.push('Document title');
  if (!caption.declarantName.trim()) missing.push('Declarant name');
  if (!caption.signedAtCity.trim()) missing.push('City where signed');
  return missing;
}

/** "Spokane County" -> "SPOKANE", so the caption doesn't read "COUNTY OF SPOKANE COUNTY". */
export function captionCounty(countyName: string): string {
  return (countyName || '[COUNTY]').replace(/\s+county$/i, '').toUpperCase();
}

function actionLine(caption: CaseCaption): string {
  if (caption.actionType === 'marriage') return 'In re the Marriage of:';
  if (caption.actionType === 'parentage') return 'In re the Parentage of:';
  return 'In re:';
}

/**
 * RCW 9A.72.085 certification. An unsworn declaration is only usable in a
 * Washington proceeding if it recites the date AND place of signing and is
 * subscribed by the declarant; omitting either is the most common defect that
 * gets a pro se declaration struck.
 */
export function perjuryCertification(caption: CaseCaption, signedOn: string): string {
  const city = caption.signedAtCity.trim() || '[CITY]';
  const state = caption.signedAtState.trim() || 'Washington';
  const name = caption.declarantName.trim() || '[DECLARANT NAME]';
  return [
    'I declare under penalty of perjury under the laws of the State of Washington',
    'that the foregoing is true and correct.',
    '',
    `Signed at ${city}, ${state} on ${signedOn}.`,
    '',
    '_____________________________________',
    name,
  ].join('\n');
}

export function buildDeclarationText(
  caption: CaseCaption,
  facts: FactEntry[],
  signedOn: string,
): string {
  const county = captionCounty(caption.countyName);
  const lines = [
    `SUPERIOR COURT OF WASHINGTON, COUNTY OF ${county}`,
    '',
    actionLine(caption),
    `${caption.petitionerName || '[PETITIONER]'}, Petitioner,`,
    'and',
    `${caption.respondentName || '[RESPONDENT]'}, Respondent.`,
    '',
    `No. ${caption.causeNumber || '[CAUSE NUMBER]'}`,
    caption.documentTitle.toUpperCase(),
    '',
    'I. PRIMA FACIE SHOWING OF ADEQUATE CAUSE (RCW 26.09.270)',
    '',
    'Facts:',
    ...(facts.length
      ? facts.map((f, i) => `${i + 1}. ${f.date || '[DATE]'}: ${f.desc}`)
      : ['[No facts entered.]']),
    '',
    perjuryCertification(caption, signedOn),
  ];
  return lines.join('\n');
}

export interface PleadingOptions {
  watermark: boolean;
  /** PNG/JPEG bytes for the draft watermark. Optional; text watermark is always drawn. */
  watermarkImage?: Uint8Array | ArrayBuffer;
  signedOn?: string;
}

/**
 * Renders the pleading. Layout constants are deliberately named after the
 * requirement they implement so they can be re-verified against the current
 * text of the Washington court rules -- see AUDIT.md, "Formatting claims".
 */
export async function buildPleadingPdf(
  caption: CaseCaption,
  facts: FactEntry[],
  opts: PleadingOptions,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const roman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const PAGE_W = 612;
  const PAGE_H = 792;
  const LEFT = 72; // 1 inch
  const RIGHT_EDGE = PAGE_W - 72;
  const FIRST_PAGE_TOP = 216; // 3 inches
  const BOTTOM = 72; // 1 inch
  const FONT_SIZE = 12;
  const LINE_H = 18; // 12pt at 1.5 spacing

  const CONTINUATION_TOP = 72; // 1 inch on pages after the first

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - FIRST_PAGE_TOP;

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - CONTINUATION_TOP;
  };

  const write = (text: string, font = roman, x = LEFT) => {
    // Overflow continues onto a new page. Never drop text off the bottom of a
    // declaration -- a truncated one is signed under penalty of perjury too.
    if (y < BOTTOM + LINE_H) newPage();
    page.drawText(text, { x, y, size: FONT_SIZE, font, color: rgb(0, 0, 0) });
    y -= LINE_H;
  };

  const wrap = (text: string, font = roman, maxWidth = RIGHT_EDGE - LEFT): string[] => {
    const out: string[] = [];
    for (const paragraph of text.split('\n')) {
      if (!paragraph) {
        out.push('');
        continue;
      }
      let line = '';
      for (const word of paragraph.split(' ')) {
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, FONT_SIZE) > maxWidth && line) {
          out.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      out.push(line);
    }
    return out;
  };

  write('SUPERIOR COURT OF WASHINGTON', bold);
  write(`COUNTY OF ${captionCounty(caption.countyName)}`, bold);
  y -= LINE_H;

  const captionTop = y;
  write(actionLine(caption));
  write(`${caption.petitionerName || '[PETITIONER]'}, Petitioner,`);
  write('and');
  write(`${caption.respondentName || '[RESPONDENT]'}, Respondent.`);

  // Right-hand caption block: cause number and document title.
  let ry = captionTop;
  const rx = 342;
  const rightLine = (text: string, font = roman) => {
    page.drawText(text, { x: rx, y: ry, size: FONT_SIZE, font });
    ry -= LINE_H;
  };
  rightLine(`No. ${caption.causeNumber || '[CAUSE NUMBER]'}`);
  ry -= LINE_H;
  for (const line of wrap(caption.documentTitle.toUpperCase(), bold, RIGHT_EDGE - rx)) {
    rightLine(line, bold);
  }

  y = Math.min(y, ry) - LINE_H;
  write('I. PRIMA FACIE SHOWING OF ADEQUATE CAUSE (RCW 26.09.270)', bold);
  y -= LINE_H / 2;

  const body: string[] = [];
  facts.forEach((f, i) => body.push(`${i + 1}. ${f.date || '[DATE]'}: ${f.desc}`));
  if (!facts.length) body.push('[No facts entered.]');
  body.push('');
  body.push(perjuryCertification(caption, opts.signedOn || todayLongForm()));

  for (const line of wrap(body.join('\n'))) {
    write(line);
  }

  const pages = pdfDoc.getPages();

  if (opts.watermark) {
    if (opts.watermarkImage) {
      try {
        const bytes = opts.watermarkImage;
        let img;
        try {
          img = await pdfDoc.embedPng(bytes as ArrayBuffer);
        } catch {
          img = await pdfDoc.embedJpg(bytes as ArrayBuffer);
        }
        const dims = img.scale(0.4);
        for (const p of pages) {
          p.drawImage(img, {
            x: PAGE_W / 2 - dims.width / 2,
            y: PAGE_H / 2 - dims.height / 2,
            width: dims.width,
            height: dims.height,
            opacity: 0.15,
          });
        }
      } catch {
        // Watermark image is decorative; the text watermark below is the real gate.
      }
    }
    for (const p of pages) {
      p.drawText('UNPAID DRAFT - DO NOT FILE', {
        x: 60,
        y: 200,
        size: 28,
        font: bold,
        color: rgb(0.8, 0.1, 0.1),
        rotate: degrees(45),
        opacity: 0.6,
      });
    }
  }

  return await pdfDoc.save();
}

export function todayLongForm(d: Date = new Date()): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
