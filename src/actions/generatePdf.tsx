"use server";

import {
  PDFDocument,
  PageSizes,
  StandardFonts,
  rgb,
  PDFPage,
  PDFFont,
} from "pdf-lib";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Enhanced color palette
const COLORS = {
  primary: rgb(0.04, 0.32, 0.58), // Deep blue
  primaryLight: rgb(0.2, 0.45, 0.7), // Lighter blue for accents
  accent: rgb(0.92, 0.58, 0.2), // Warm orange/gold accent
  success: rgb(0.13, 0.59, 0.45), // Professional green
  background: rgb(0.98, 0.98, 0.99), // Almost white
  cardBg: rgb(1, 1, 1), // Pure white for cards
  textPrimary: rgb(0.15, 0.15, 0.15), // Near black
  textSecondary: rgb(0.45, 0.45, 0.45), // Medium gray
  textLight: rgb(0.65, 0.65, 0.65), // Light gray
  border: rgb(0.88, 0.9, 0.92), // Subtle border
  highlight: rgb(0.97, 0.95, 0.87), // Subtle yellow highlight
  shadow: rgb(0.85, 0.87, 0.89), // Shadow color
} as const;

// Enhanced layout constants
const LAYOUT = {
  margin: 45,
  cardPadding: 30,
  lineHeight: 18,
  sectionSpacing: 24,
  headerHeight: 140,
  footerHeight: 50,
  iconSize: 12,
} as const;

interface ApplicantData {
  fullName: string;
  email?: string;
}

interface RentalFormData {
  applicant: ApplicantData;
  approvalStatus: "approved" | "conditionally-approved";
  propertyAddress: string;
  monthlyRent: number | string;
  securityDeposit?: number | string;
  leaseTerm: number | string;
  totalDue: number | string;
  paymentMethod: string;
  payableTo?: string;
  approvedBy: string;
}

class PDFLayoutManager {
  private currentY: number;
  private readonly startY: number;
  private readonly minY: number;

  constructor(
    private page: PDFPage,
    private font: PDFFont,
    private boldFont: PDFFont,
    startY: number,
    minY: number = LAYOUT.footerHeight + 30
  ) {
    this.currentY = startY;
    this.startY = startY;
    this.minY = minY;
  }

  drawText(
    text: string,
    options: {
      size?: number;
      bold?: boolean;
      indent?: number;
      color?: ReturnType<typeof rgb>;
      lineSpacing?: number;
    } = {}
  ) {
    const {
      size = 11,
      bold = false,
      indent = 0,
      color = COLORS.textPrimary,
      lineSpacing = 7,
    } = options;
    const { width, height } = this.page.getSize();

    if (this.currentY - size < this.minY) {
      // new page
      const newPage = this.page.doc.addPage([width, height]);
      this.page = newPage;
      this.currentY = height - LAYOUT.margin; // reset starting Y
    }

    this.page.drawText(text, {
      x: LAYOUT.margin + LAYOUT.cardPadding + indent,
      y: this.currentY,
      size,
      font: bold ? this.boldFont : this.font,
      color,
      maxWidth: width - 2 * (LAYOUT.margin + LAYOUT.cardPadding) - indent,
    });

    this.currentY -= size + lineSpacing;
  }

  addSpace(pixels: number): void {
    this.currentY -= pixels;
  }

  getCurrentY(): number {
    return this.currentY;
  }

  drawSectionHeader(title: string, icon?: string): void {
    const { width } = this.page.getSize();
    const xStart = LAYOUT.margin + LAYOUT.cardPadding;

    // Draw subtle background bar
    this.page.drawRectangle({
      x: xStart - 5,
      y: this.currentY - 5,
      width: width - 2 * (LAYOUT.margin + LAYOUT.cardPadding) + 10,
      height: 24,
      color: COLORS.highlight,
      opacity: 0.3,
    });

    // Draw accent line
    this.page.drawRectangle({
      x: xStart - 5,
      y: this.currentY - 5,
      width: 4,
      height: 24,
      color: COLORS.accent,
    });

    // Draw icon if provided (simplified checkmark or bullet)
    if (icon) {
      this.page.drawText(icon, {
        x: xStart + 5,
        y: this.currentY + 2,
        size: 12,
        font: this.boldFont,
        color: COLORS.accent,
      });
    }

    // Draw title
    this.page.drawText(title, {
      x: xStart + (icon ? 20 : 5),
      y: this.currentY + 2,
      size: 13,
      font: this.boldFont,
      color: COLORS.primary,
    });

    this.currentY -= 28;
  }

  drawInfoRow(label: string, value: string, highlight: boolean = false): void {
    const { width } = this.page.getSize();
    const xStart = LAYOUT.margin + LAYOUT.cardPadding;
    const indent = 20;

    // Optional highlight background
    if (highlight) {
      this.page.drawRectangle({
        x: xStart + indent - 5,
        y: this.currentY - 4,
        width: width - 2 * (LAYOUT.margin + LAYOUT.cardPadding) - indent + 10,
        height: 18,
        color: COLORS.highlight,
        opacity: 0.2,
      });
    }

    // Draw bullet point
    this.page.drawCircle({
      x: xStart + indent + 3,
      y: this.currentY + 4,
      size: 2.5,
      color: COLORS.accent,
    });

    // Draw label and value
    const text = `${label}: ${value}`;
    this.page.drawText(text, {
      x: xStart + indent + 10,
      y: this.currentY,
      size: 11,
      font: this.font,
      color: COLORS.textPrimary,
      maxWidth: width - 2 * (LAYOUT.margin + LAYOUT.cardPadding) - indent - 10,
    });

    this.currentY -= 17;
  }
}

const LOGO_URL =
  "https://dokumfe7mps0i.cloudfront.net/media/logos/2022/06/283238_1655844560.7826822_InvitationHomesBoldedcmykRevLogo.png";

async function embedLogo(pdfDoc: PDFDocument, page: PDFPage, height: number) {
  try {
    const res = await fetch(LOGO_URL);
    if (!res.ok) throw new Error(`Failed to fetch logo: ${res.status}`);

    const imageBuffer = Buffer.from(await res.arrayBuffer());

    // Detect if PNG or JPEG
    let logo;
    if (LOGO_URL.endsWith(".png")) {
      logo = await pdfDoc.embedPng(imageBuffer);
    } else {
      logo = await pdfDoc.embedJpg(imageBuffer);
    }

    const logoDims = logo.scale(0.35);

    page.drawImage(logo, {
      x: LAYOUT.margin + 5,
      y: height - LAYOUT.headerHeight + 25,
      width: logoDims.width,
      height: logoDims.height,
    });
  } catch (error) {
    console.warn("Logo could not be embedded:", error);
  }
}

function drawModernHeader(
  page: PDFPage,
  width: number,
  height: number,
  boldFont: PDFFont,
  font: PDFFont,
  formData: RentalFormData
): void {
  // Main header background with gradient effect (simulated with multiple rectangles)
  const headerY = height - LAYOUT.headerHeight;

  // Base header
  page.drawRectangle({
    x: 0,
    y: headerY,
    width,
    height: LAYOUT.headerHeight,
    color: COLORS.primary,
  });

  // Decorative accent bar at top
  page.drawRectangle({
    x: 0,
    y: height - 8,
    width,
    height: 8,
    color: COLORS.accent,
  });

  // Decorative pattern elements (diagonal lines for visual interest)
  for (let i = 0; i < 5; i++) {
    page.drawRectangle({
      x: width - 200 + i * 40,
      y: headerY,
      width: 2,
      height: LAYOUT.headerHeight,
      color: rgb(1, 1, 1),
      opacity: 0.05,
    });
  }

  // Status badge
  const isConditional = formData.approvalStatus === "conditionally-approved";
  const statusText = isConditional ? "CONDITIONALLY APPROVED" : "APPROVED";
  const statusWidth = boldFont.widthOfTextAtSize(statusText, 10);
  const badgeX = width - LAYOUT.margin - statusWidth - 30;
  const badgeY = headerY + LAYOUT.headerHeight - 45;

  // Badge background
  page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: statusWidth + 30,
    height: 26,
    color: COLORS.success,
  });

  // Badge text
  page.drawText(statusText, {
    x: badgeX + 15,
    y: badgeY + 8,
    size: 10,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  // Main title
  page.drawText("Rental Approval Letter", {
    x: LAYOUT.margin,
    y: headerY - 35,
    size: 28,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  // Subtitle
  page.drawText("Official Approval Documentation", {
    x: LAYOUT.margin,
    y: headerY - 55,
    size: 11,
    font: font,
    color: rgb(0.9, 0.9, 0.9),
  });

  // Date with icon-like marker
  const dateText = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dateWidth = font.widthOfTextAtSize(dateText, 10);
  page.drawText(dateText, {
    x: width - LAYOUT.margin - dateWidth - 20,
    y: headerY - 35,
    size: 10,
    font: font,
    color: rgb(0.9, 0.9, 0.9),
  });
}

function drawEnhancedContentCard(
  page: PDFPage,
  width: number,
  height: number,
  startY: number
): number {
  const cardHeight = startY - LAYOUT.footerHeight - LAYOUT.margin - 10;

  // Shadow effect (multiple layers)
  for (let i = 0; i < 3; i++) {
    page.drawRectangle({
      x: LAYOUT.margin + i * 2,
      y: LAYOUT.footerHeight + LAYOUT.margin + 8 - i * 2,
      width: width - 2 * LAYOUT.margin,
      height: cardHeight,
      color: COLORS.shadow,
      opacity: 0.05 * (3 - i),
    });
  }

  // Main card
  page.drawRectangle({
    x: LAYOUT.margin,
    y: LAYOUT.footerHeight + LAYOUT.margin + 8,
    width: width - 2 * LAYOUT.margin,
    height: cardHeight,
    color: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  // Top accent border
  page.drawRectangle({
    x: LAYOUT.margin,
    y: LAYOUT.footerHeight + LAYOUT.margin + 8 + cardHeight - 3,
    width: width - 2 * LAYOUT.margin,
    height: 3,
    color: COLORS.accent,
  });

  return startY - LAYOUT.cardPadding - 10;
}

function drawModernFooter(page: PDFPage, width: number, font: PDFFont): void {
  // Footer background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: LAYOUT.footerHeight,
    color: COLORS.background,
  });

  // Top border
  page.drawRectangle({
    x: 0,
    y: LAYOUT.footerHeight - 1,
    width,
    height: 1,
    color: COLORS.border,
  });

  // Footer content
  page.drawText("CONFIDENTIAL", {
    x: LAYOUT.margin,
    y: LAYOUT.footerHeight / 2 + 8,
    size: 8,
    font: font,
    color: COLORS.textSecondary,
  });

  page.drawText("Invitation Homes • www.InvitationHomerealty.com", {
    x: LAYOUT.margin,
    y: LAYOUT.footerHeight / 2 - 5,
    size: 9,
    font: font,
    color: COLORS.textLight,
  });

  // Page indicator
  const pageText = "Page 1 of 1";
  const pageWidth = font.widthOfTextAtSize(pageText, 9);
  page.drawText(pageText, {
    x: width - LAYOUT.margin - pageWidth,
    y: LAYOUT.footerHeight / 2 - 2,
    size: 9,
    font: font,
    color: COLORS.textLight,
  });
}

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function drawEnhancedLetterContent(
  layout: PDFLayoutManager,
  formData: RentalFormData
): void {
  // Greeting with personalized styling
  layout.addSpace(5);
  layout.drawText(`Dear ${formData.applicant.fullName},`, {
    size: 13,
    bold: true,
    color: COLORS.primary,
  });
  layout.addSpace(LAYOUT.sectionSpacing);

  // Opening paragraph with emphasis
  const approvalText =
    formData.approvalStatus === "conditionally-approved"
      ? "conditionally approved"
      : "approved";

  layout.drawText(
    "We are delighted to inform you that your rental application has been",
    { size: 11, lineSpacing: 0 }
  );
  layout.drawText(`${approvalText} by Invitation Homes. Welcome home!`, {
    size: 11,
    bold: true,
    color: COLORS.success,
    lineSpacing: 10, // optional spacing after this line
  });

  layout.addSpace(LAYOUT.sectionSpacing + 5);

  // Property Details Section
  layout.drawSectionHeader("Property Information", "");
  layout.addSpace(5);
  layout.drawInfoRow("Address", formData.propertyAddress);
  layout.drawInfoRow(
    "Monthly Rent",
    `$${formatCurrency(formData.monthlyRent)}`
  );
  layout.drawInfoRow(
    "Security Deposit",
    `$${formatCurrency(formData.securityDeposit || formData.monthlyRent)}`
  );
  layout.drawInfoRow("Lease Term", `${formData.leaseTerm} months`);
  layout.addSpace(LAYOUT.sectionSpacing);

  // Financial Requirements Section
  layout.drawSectionHeader("Financial Summary");
  layout.addSpace(5);
  layout.drawInfoRow(
    "Total Due Before Move-In",
    `$${formatCurrency(formData.totalDue)}`,
    true
  );
  layout.addSpace(8);
  layout.drawText(
    "This amount includes first month's rent, security deposit, and any applicable fees.",
    { size: 9, color: COLORS.textSecondary, indent: 20 }
  );
  layout.addSpace(LAYOUT.sectionSpacing);

  // Payment Instructions Section

  // Next Steps callout
  layout.drawText("Next Steps:", {
    size: 12,
    bold: true,
    color: COLORS.primary,
  });
  layout.addSpace(8);
  layout.drawText("1. Review and sign your lease agreement", {
    size: 10,
    indent: 15,
  });
  layout.drawText("2. Submit payment as outlined above", {
    size: 10,
    indent: 15,
  });
  layout.drawText("3. Schedule your move-in inspection", {
    size: 10,
    indent: 15,
  });
  layout.addSpace(LAYOUT.sectionSpacing + 10);

  // Closing message
  layout.drawText(
    "We look forward to welcoming you to your new home and providing you with an",
    { size: 11, color: COLORS.textPrimary }
  );
  layout.drawText("exceptional living experience.", {
    size: 11,
    color: COLORS.textPrimary,
  });
  layout.addSpace(LAYOUT.sectionSpacing + 15);

  // Signature block
  layout.drawText("Warm regards,", { size: 11, color: COLORS.textSecondary });
  layout.addSpace(10);
  layout.drawText(formData.approvedBy, {
    size: 12,
    bold: true,
    color: COLORS.primary,
  });
  layout.drawText("Leasing Specialist", {
    size: 10,
    color: COLORS.textSecondary,
  });
  layout.drawText("Invitation Homes", {
    size: 10,
    bold: true,
    color: COLORS.textSecondary,
  });
}

async function sendEmail(
  formData: RentalFormData,
  pdfBuffer: Buffer
): Promise<void> {
  if (!formData.applicant?.email) {
    console.log("No email provided, skipping email send");
    return;
  }

  try {
    await resend.emails.send({
      from: "no-reply@InvitationHomerealty.com",
      to: formData.applicant.email,
      subject: "🏠 Your Rental Application Has Been Approved!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A5280 0%, #1a7bb3 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Congratulations, ${formData.applicant.fullName}!</h1>
            <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Your rental application has been approved</p>
          </div>
          
          <div style="background: white; padding: 40px 30px; border-left: 4px solid #eb9534;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              We're thrilled to welcome you to your new home at <strong>${formData.propertyAddress}</strong>.
            </p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Your official approval letter is attached to this email. Please review the details and follow the payment instructions to complete your move-in process.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 10px 0; color: #0A5280;">Quick Summary:</h3>
              <p style="margin: 5px 0; color: #333;"><strong>Monthly Rent:</strong> $${formatCurrency(formData.monthlyRent)}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Total Due:</strong> $${formatCurrency(formData.totalDue)}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Move-In:</strong> Next steps in attached document</p>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              If you have any questions, please don't hesitate to contact us.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              <strong>${formData.approvedBy}</strong><br>
              Invitation Homes
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Invitation Homes. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">www.invitationhomes.com</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Rental-Approval-${formData.applicant.fullName.replace(/\s+/g, "-")}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });
    console.log(`Email sent successfully to ${formData.applicant.email}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email delivery failed");
  }
}

export async function generateRentalApproval(formData: RentalFormData) {
  try {
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();

    // Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Set document metadata
    pdfDoc.setTitle("Rental Approval Letter");
    pdfDoc.setAuthor("Invitation Homes");
    pdfDoc.setSubject(`Rental Approval for ${formData.applicant.fullName}`);
    pdfDoc.setCreator("Invitation Homes Leasing System");
    pdfDoc.setProducer("Invitation Homes");
    pdfDoc.setKeywords(["rental", "approval", "lease", "invitation homes"]);

    // Draw modern header
    drawModernHeader(page, width, height, boldFont, font, formData);

    // Embed logo
    await embedLogo(pdfDoc, page, height);

    // Draw enhanced content card and get starting Y position
    const contentStartY = height - LAYOUT.headerHeight - 30;
    const contentY = drawEnhancedContentCard(
      page,
      width,
      height,
      contentStartY
    );

    // Create layout manager and draw content
    const layout = new PDFLayoutManager(page, font, boldFont, contentY);
    drawEnhancedLetterContent(layout, formData);

    // Draw modern footer
    drawModernFooter(page, width, font);

    // Generate PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    // Send email if applicable
    await sendEmail(formData, pdfBuffer);

    return {
      pdfBase64: pdfBuffer.toString("base64"),
      filename: `rental-approval-${formData.applicant.fullName.replace(/\s+/g, "-")}.pdf`,
    };
  } catch (error) {
    console.error("Failed to generate rental approval PDF:", error);
    throw new Error("PDF generation failed");
  }
}
