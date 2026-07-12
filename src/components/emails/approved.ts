import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";
import { Role } from "@/actions";
import { formatRole } from "@/utils";

export async function DescPdf(email: string, role: Role): Promise<Buffer> {
    try {
        const pdfDoc = await PDFDocument.create();

        const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

        const margin = 50;
        const fontSize = 12;
        const headerFontSize = 24;
        const subHeaderFontSize = 16;
        const lineSpacing = 18;
        const primaryColor = rgb(0.13, 0.22, 0.39); // Navy blue
        const secondaryColor = rgb(0.4, 0.4, 0.4);
        const accentColor = rgb(0.8, 0.8, 0.8);

        let currentPage = pdfDoc.addPage(PageSizes.Letter);
        const { width, height } = currentPage.getSize();
        let y = height - margin;

        let isFirstPage = true;

        function addNewPage() {
            currentPage = pdfDoc.addPage(PageSizes.Letter);
            y = height - margin;
            isFirstPage = false; // no header on new pages
        }

        function drawTextWithCheck(
            text: string,
            options: { size?: number; bold?: boolean; color?: [number, number, number] } = {},
            neededSpace = lineSpacing
        ) {
            if (y - neededSpace < margin + 30) addNewPage(); // reserve footer space
            currentPage.drawText(text, {
                x: margin,
                y,
                size: options.size || fontSize,
                font: options.bold ? boldFont : font,
                color: rgb(...(options.color || [0, 0, 0])),
                maxWidth: width - 2 * margin,
            });
            y -= neededSpace;
        }

        function drawParagraph(text: string, maxLineLength = 80, bullet = false) {
            const lines = text.match(new RegExp(`.{1,${maxLineLength}}`, "g")) || [text];
            for (const line of lines) {
                drawTextWithCheck(bullet ? `• ${line}` : line, {}, lineSpacing);
            }
            y -= 8;
        }

        function drawSectionDivider() {
            if (y - 15 < margin + 30) addNewPage(); // reserve more space before new page
            currentPage.drawLine({
                start: { x: margin, y: y - 10 }, // moved line 5px down for more space
                end: { x: width - margin, y: y - 10 },
                thickness: 1,
                color: accentColor,
            });
            y -= 25; // increased spacing below divider to 25 instead of 15
        }

        function drawHeader() {
            // Only draw header on first page
            if (!isFirstPage) return;

            currentPage.drawRectangle({
                x: margin,
                y: height - margin - 40,
                width: 100,
                height: 40,
                borderWidth: 1,
                borderColor: primaryColor,
                color: rgb(1, 1, 1),
            });
            currentPage.drawText("Invitation Home Rentals", {
                x: margin + 110,
                y: height - margin - 20,
                size: headerFontSize,
                font: boldFont,
                color: primaryColor,
            });
            currentPage.drawText("Excellence in Real Estate", {
                x: margin + 110,
                y: height - margin - 35,
                size: 10,
                font,
                color: secondaryColor,
            });
            y -= 50;
        }

        // Start content
        drawHeader();
        drawSectionDivider();

        // Metadata
        drawTextWithCheck(`Date: ${new Date().toLocaleDateString()}`, { size: 10, color: [0.4, 0.4, 0.4] }, 15);
        drawTextWithCheck(`Candidate Email: ${email}`, { size: fontSize });
        drawTextWithCheck(`Role: ${formatRole(role)}`, { size: fontSize, bold: true }, 20);
        drawSectionDivider();

        // Role Overview
        drawTextWithCheck("1. Role Overview", { size: subHeaderFontSize, bold: true, color: [0.13, 0.22, 0.39] }, 25);
        const roleDescription =
            role === "ad manager"
                ? [
                    "Develop, plan, and execute comprehensive digital advertising strategies across multiple platforms including Google Ads, Facebook, Instagram, and LinkedIn to drive brand awareness and lead generation.",
                    "Manage and optimize advertising budgets effectively, continuously analyzing campaign performance metrics to ensure maximum return on investment (ROI) and cost efficiency.",
                    "Collaborate closely with marketing, sales, and creative teams to align advertising campaigns with overall business objectives and branding guidelines.",
                    "Conduct market research and competitor analysis to identify new opportunities and trends in digital advertising.",
                    "Prepare detailed performance reports and present insights and recommendations to senior management.",
                    "Implement A/B testing and conversion rate optimization techniques to improve campaign outcomes.",
                    "Stay up-to-date with the latest digital marketing trends, tools, and best practices to keep Invitation Home Rentals competitive in the marketplace."
                ]
                : [
                    "Manage internal and external communications, ensuring clear, timely, and professional interactions with clients, vendors, and team members.",
                    "Coordinate and maintain scheduling for meetings, appointments, and company events to maximize organizational efficiency.",
                    "Support day-to-day operational workflows by handling administrative tasks such as document management, correspondence, and reporting.",
                    "Facilitate smooth client onboarding processes and provide ongoing support to enhance client satisfaction and retention.",
                    "Organize and maintain calendars, track deadlines, and ensure timely follow-ups on action items and requests.",
                    "Assist in preparing presentations, reports, and other documentation needed by various departments.",
                    "Implement process improvements and workflow automation to optimize productivity and reduce operational bottlenecks.",
                    "Act as a liaison between departments to support cross-functional collaboration and communication."
                ];

        roleDescription.forEach((line) => drawParagraph(line, 80, true));
        drawSectionDivider();

        // Compensation
        drawTextWithCheck("2. Compensation", { size: subHeaderFontSize, bold: true, color: [0.13, 0.22, 0.39] }, 25);
        drawParagraph(
            "Competitive weekly compensation of $1,000, processed via direct deposit or check every Friday. The role offers flexible hours, averaging 20–30 hours per week based on project demands."
        );
        drawSectionDivider();

        // Expectations
        drawTextWithCheck("3. Expectations", { size: subHeaderFontSize, bold: true, color: [0.13, 0.22, 0.39] }, 25);
        drawParagraph(
            "Maintain clear and timely communication, meet deadlines, and uphold Invitation Home Rentals’s values. A proactive and collaborative approach is expected across all departments."
        );
        drawSectionDivider();

        // Closing
        drawTextWithCheck("4. Welcome", { size: subHeaderFontSize, bold: true, color: [0.13, 0.22, 0.39] }, 25);
        drawParagraph("We are thrilled to welcome you to Invitation Home Rentals. For inquiries, please contact hr@InvitationHomerealty.com.");
        drawTextWithCheck("Invitation Home Rentals HR Team", { bold: true }, 20);

        // Footer & border on all pages
        for (const [index, page] of pdfDoc.getPages().entries()) {
            const footerY = margin / 2 + 20;
            page.drawLine({
                start: { x: margin, y: footerY },
                end: { x: width - margin, y: footerY },
                thickness: 1,
                color: accentColor,
            });

            page.drawText("Invitation Home Rentals | 7155 Old Katy Rd Ste N210, Houston, TX 77024 | contact@InvitationHomerealty.com", {
                x: margin,
                y: footerY - 15,
                size: 10,
                font,
                color: secondaryColor,
            });

            page.drawText(`Page ${index + 1} of ${pdfDoc.getPageCount()}`, {
                x: width - margin - 50,
                y: footerY - 15,
                size: 10,
                font,
                color: secondaryColor,
            });

            // Border
            page.drawRectangle({
                x: margin / 2,
                y: margin / 2,
                width: width - margin,
                height: height - margin,
                borderWidth: 0.5,
                borderColor: primaryColor,
            });
        }

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw new Error("Failed to generate job description PDF");
    }
}
