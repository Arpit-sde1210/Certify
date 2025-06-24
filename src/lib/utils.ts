import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateCertificatePDF(name: string, workshop: string): Promise<Blob> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSizeTitle = 28;
    const fontSizeText = 18;

    // Draw certificate title
    page.drawText('Certificate of Completion', {
        x: 60,
        y: height - 80,
        size: fontSizeTitle,
        font,
        color: rgb(0.2, 0.2, 0.7),
    });

    // Draw recipient name
    page.drawText(`This is to certify that`, {
        x: 60,
        y: height - 130,
        size: fontSizeText,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(name, {
        x: 60,
        y: height - 160,
        size: fontSizeText + 4,
        font,
        color: rgb(0.1, 0.3, 0.6),
    });
    page.drawText(`has successfully completed the workshop:`, {
        x: 60,
        y: height - 200,
        size: fontSizeText,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(workshop, {
        x: 60,
        y: height - 230,
        size: fontSizeText + 2,
        font,
        color: rgb(0.1, 0.3, 0.6),
    });

    // Draw date
    const dateStr = new Date().toLocaleDateString();
    page.drawText(`Date: ${dateStr}`, {
        x: 60,
        y: height - 280,
        size: 14,
        font,
        color: rgb(0.2, 0.2, 0.2),
    });

    // Draw signature placeholder
    page.drawText('____________________', {
        x: width - 220,
        y: 60,
        size: 14,
        font,
        color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText('Signature', {
        x: width - 180,
        y: 45,
        size: 12,
        font,
        color: rgb(0.2, 0.2, 0.2),
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
}
