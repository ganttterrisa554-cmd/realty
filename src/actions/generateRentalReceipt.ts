"use server";

import {
  PDFDocument,
  PageSizes,
  StandardFonts,
  rgb,
  PDFPage,
  PDFFont,
} from "pdf-lib";

const COLORS = {
  primary: rgb(0.04, 0.32, 0.58), // Deep blue
  accent: rgb(0.92, 0.58, 0.2), // Warm orange/gold
  success: rgb(0.13, 0.59, 0.45), // Professional green
  textPrimary: rgb(0.15, 0.15, 0.15),
  textSecondary: rgb(0.45, 0.45, 0.45),
  border: rgb(0.88, 0.9, 0.92),
  stampRed: rgb(0.8, 0, 0),
  stampGreen: rgb(0, 0.5, 0),
  stampBlue: rgb(0, 0, 0.6),
} as const;

const LAYOUT = {
  margin: 50,
  lineHeight: 18,
};

const LOGO_URL = "https://dokumfe7mps0i.cloudfront.net/media/logos/2022/06/283238_1655844560.7826822_InvitationHomesBoldedcmykRevLogo.png";

async function embedLogo(pdfDoc: PDFDocument, page: PDFPage) {
  try {
    const res = await fetch(LOGO_URL);
    if (!res.ok) throw new Error(`Failed to fetch logo: ${res.status}`);
    const imageBuffer = Buffer.from(await res.arrayBuffer());
    const logo = await pdfDoc.embedPng(imageBuffer);
    const logoDims = logo.scale(0.3);
    const { width, height } = page.getSize();
    
    page.drawImage(logo, {
      x: LAYOUT.margin,
      y: height - LAYOUT.margin - logoDims.height,
      width: logoDims.width,
      height: logoDims.height,
    });
    return logoDims.height;
  } catch (error) {
    console.warn("Logo could not be embedded:", error);
    return 0;
  }
}

function drawStamp(page: PDFPage, font: PDFFont, text: string, x: number, y: number, color: any, rotation: number = -15) {
  const size = 14;
  const padding = 8;
  const textWidth = font.widthOfTextAtSize(text, size);
  
  page.drawRectangle({
    x: x - padding,
    y: y - padding,
    width: textWidth + padding * 2,
    height: size + padding * 2,
    borderColor: color,
    borderWidth: 2,
    rotate: { type: 'degrees', angle: rotation } as any,
    opacity: 0.7,
  });

  page.drawText(text, {
    x: x,
    y: y,
    size: size,
    font: font,
    color: color,
    rotate: { type: 'degrees', angle: rotation } as any,
    opacity: 0.8,
  });
}

export async function generateRentalDocument() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

  // Logo
  const logoHeight = await embedLogo(pdfDoc, page);
  let currentY = height - LAYOUT.margin - (logoHeight || 40) - 40;

  // Header
  page.drawText("PAYMENT RECEIPT & STATEMENT OF INTENT", {
    x: width - LAYOUT.margin - 300,
    y: height - LAYOUT.margin - 20,
    size: 14,
    font: boldFont,
    color: COLORS.primary,
  });

  page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
    x: width - LAYOUT.margin - 120,
    y: height - LAYOUT.margin - 40,
    size: 10,
    font: font,
    color: COLORS.textSecondary,
  });

  // Property Section
  page.drawRectangle({
    x: LAYOUT.margin,
    y: currentY - 10,
    width: width - 2 * LAYOUT.margin,
    height: 1,
    color: COLORS.border,
  });
  currentY -= 30;

  page.drawText("PROPERTY ADDRESS:", { x: LAYOUT.margin, y: currentY, size: 10, font: boldFont, color: COLORS.textSecondary });
  currentY -= 20;
  page.drawText("3257 Trafalgar Ave, East Stroudsburg, PA 18302", { x: LAYOUT.margin, y: currentY, size: 12, font: boldFont });
  currentY -= 40;

  // Tenants Section
  page.drawText("TENANT(S) / APPLICANT(S):", { x: LAYOUT.margin, y: currentY, size: 10, font: boldFont, color: COLORS.textSecondary });
  currentY -= 20;
  page.drawText("Ms McKenzien Elizabeth Cowley", { x: LAYOUT.margin, y: currentY, size: 11, font: font });
  currentY -= 15;
  page.drawText("Ms Rebecca Cathrine Bardsley", { x: LAYOUT.margin, y: currentY, size: 11, font: font });
  currentY -= 40;

  // Payment Table Header
  const tableTop = currentY;
  page.drawRectangle({ x: LAYOUT.margin, y: currentY - 5, width: width - 2 * LAYOUT.margin, height: 20, color: COLORS.primary, opacity: 0.1 });
  page.drawText("DATE", { x: LAYOUT.margin + 10, y: currentY, size: 9, font: boldFont, color: COLORS.primary });
  page.drawText("DESCRIPTION", { x: LAYOUT.margin + 100, y: currentY, size: 9, font: boldFont, color: COLORS.primary });
  page.drawText("TRANSACTION ID", { x: LAYOUT.margin + 280, y: currentY, size: 9, font: boldFont, color: COLORS.primary });
  page.drawText("AMOUNT", { x: width - LAYOUT.margin - 60, y: currentY, size: 9, font: boldFont, color: COLORS.primary });
  currentY -= 25;

  const payments = [
    { date: "2026-04-16", desc: "Application Fee - McKenzie Cowley", txn: "txn an0200", amount: "$70.00" },
    { date: "2026-04-16", desc: "Application Fee - Rebecca Bardsley", txn: "txn ye9lz6", amount: "$70.00" },
    { date: "2026-04-17", desc: "Security Deposit / Holding Fee", txn: "txn 3YNS7N", amount: "$600.00" },
  ];

  payments.forEach((p) => {
    page.drawText(p.date, { x: LAYOUT.margin + 10, y: currentY, size: 10, font: font });
    page.drawText(p.desc, { x: LAYOUT.margin + 100, y: currentY, size: 10, font: font });
    page.drawText(p.txn, { x: LAYOUT.margin + 280, y: currentY, size: 10, font: courierFont });
    page.drawText(p.amount, { x: width - LAYOUT.margin - 60, y: currentY, size: 10, font: boldFont });
    currentY -= 20;
    page.drawRectangle({ x: LAYOUT.margin, y: currentY + 5, width: width - 2 * LAYOUT.margin, height: 0.5, color: COLORS.border });
  });

  currentY -= 20;
  page.drawText("TOTAL PAID TO DATE via CHIME:", { x: LAYOUT.margin + 250, y: currentY, size: 11, font: boldFont });
  page.drawText("$740.00", { x: width - LAYOUT.margin - 60, y: currentY, size: 12, font: boldFont, color: COLORS.success });
  currentY -= 50;

  // Terms Section
  page.drawText("LEASING REQUIREMENTS & OFFICIAL DISCLOSURES", { x: LAYOUT.margin, y: currentY, size: 12, font: boldFont, color: COLORS.primary });
  currentY -= 20;

  const terms = [
    "1. TENANT INDEXING: The realty company expects a mandatory rent fee of $1,000.00 to facilitate the formal indexing of Ms McKenzien Elizabeth Cowley and Ms Rebecca Cathrine Bardsley as the primary tenants of record for the aforementioned property.",
    "2. OCCUPANCY READINESS: Management expects the execution of the lease agreement and the handing over of keys to occur as soon as possible (ASAP) to ensure immediate occupancy and possession of the home.",
    "3. REFUNDABILITY CLAUSE: It is hereby stated and confirmed that as long as the formal lease agreement remains unsigned and physical keys have not been handed over, all fees paid to date ($740.00) are fully refundable to the applicants.",
    "4. BROOKE KELLEY is the designated Realtor in charge of this file. All payments were processed and verified via Chime.",
  ];

  terms.forEach(term => {
    const lines = term.match(/.{1,90}(\s|$)/g) || [term];
    lines.forEach(line => {
      page.drawText(line.trim(), { x: LAYOUT.margin + 10, y: currentY, size: 9, font: font, maxWidth: width - 2 * LAYOUT.margin - 20 });
      currentY -= 14;
    });
    currentY -= 6;
  });

  currentY -= 30;

  // Signature area
  page.drawText("Authorized Realtor in Charge:", { x: LAYOUT.margin, y: currentY, size: 10, font: font });
  page.drawText("Brooke Kelley", { x: LAYOUT.margin + 170, y: currentY, size: 11, font: boldFont });
  page.drawRectangle({ x: LAYOUT.margin + 165, y: currentY - 5, width: 120, height: 1, color: COLORS.textPrimary });
  
  // Stamps (Variety)
  drawStamp(page, boldFont, "PAID - RECEIVED", 420, 560, COLORS.stampGreen, -12);
  drawStamp(page, boldFont, "REFUNDABLE", 450, 420, COLORS.stampRed, 8);
  drawStamp(page, boldFont, "VERIFIED CHIME", 80, 520, COLORS.stampBlue, 15);
  drawStamp(page, boldFont, "PENDING INDEX", 430, 200, COLORS.stampBlue, -5);
  drawStamp(page, boldFont, "Invitation Home Rentals", 60, 100, COLORS.textSecondary, 0);

  // Additional detail
  page.drawText("Receipt Numbers: txn an0200, txn ye9lz6, txn 3YNS7N", {
    x: LAYOUT.margin,
    y: 80,
    size: 8,
    font: courierFont,
    color: COLORS.textSecondary,
  });

  // Footer
  page.drawText("Invitation Homes - Corporate Leasing Division | www.invitationhomes.com", {
    x: width / 2 - 140,
    y: 30,
    size: 8,
    font: font,
    color: COLORS.textSecondary,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}
