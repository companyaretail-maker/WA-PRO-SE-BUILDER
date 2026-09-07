import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function generateWACourtPleading(
  isPaid: boolean,
  countyName: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([612, 792]); // Standard 8.5 x 11 inches
  const { width, height } = page.getSize();

  // Draw some basic GR 14 compliant text
  page.drawText('SUPERIOR COURT OF WASHINGTON', {
    x: 72,
    y: height - 216, // 3-inch top margin on first page per GR 14 (72 pts * 3 = 216)
    size: 12,
    font: timesBoldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`COUNTY OF ${countyName.toUpperCase()}`, {
    x: 72,
    y: height - 236,
    size: 12,
    font: timesBoldFont,
  });

  page.drawText('In Re The Marriage Of:', { x: 72, y: height - 276, size: 12, font: timesRomanFont });
  page.drawText('JANE DOE, Petitioner', { x: 72, y: height - 296, size: 12, font: timesRomanFont });
  page.drawText('and', { x: 72, y: height - 316, size: 12, font: timesRomanFont });
  page.drawText('JOHN DOE, Respondent', { x: 72, y: height - 336, size: 12, font: timesRomanFont });

  page.drawText('No. 24-3-12345-6', { x: 350, y: height - 276, size: 12, font: timesRomanFont });
  page.drawText('PETITION FOR MODIFICATION', { x: 350, y: height - 316, size: 12, font: timesBoldFont });
  page.drawText('OF PARENTING PLAN', { x: 350, y: height - 336, size: 12, font: timesBoldFont });

  // Add line numbers (GR 14 requirement)
  for (let i = 1; i <= 28; i++) {
    page.drawText(`${i}`, {
      x: 36, // Left margin line numbers
      y: height - 216 - ((i - 1) * 20), // Approx 1.5 line spacing
      size: 10,
      font: timesRomanFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
  
  // Draw vertical line for line numbers
  page.drawLine({
    start: { x: 54, y: height - 72 },
    end: { x: 54, y: 72 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });

  // Draw watermark if unpaid
  if (!isPaid) {
    try {
      // Fetch the image to embed as watermark
      const imgRes = await fetch('/download (1).png').catch(() => fetch('/download.png'));
      if (imgRes && imgRes.ok) {
        const imageBytes = await imgRes.arrayBuffer();
        let watermarkImage;
        try {
          watermarkImage = await pdfDoc.embedPng(imageBytes);
        } catch(e) {
           try {
             watermarkImage = await pdfDoc.embedJpg(imageBytes);
           } catch(err) {
             console.error("Could not embed as PNG or JPG");
           }
        }
        
        if (watermarkImage) {
          const imgDims = watermarkImage.scale(0.4);
          page.drawImage(watermarkImage, {
            x: width / 2 - imgDims.width / 2,
            y: height / 2 - imgDims.height / 2,
            width: imgDims.width,
            height: imgDims.height,
            opacity: 0.15,
          });
        }
      }
    } catch (e) {
      console.error("Could not load watermark image", e);
    }

    // Diagonal Text Watermark
    const watermarkText = 'UNPAID DRAFT - NOT GR 14 COMPLIANT';
    page.drawText(watermarkText, {
      x: 60,
      y: 200,
      size: 28,
      font: timesBoldFont,
      color: rgb(0.8, 0.1, 0.1),
      rotate: degrees(45),
      opacity: 0.6,
    });
  }

  return await pdfDoc.save();
}
