"use server";

import fs from "fs";
import path from "path";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReceiptEmail(
  tenantEmail: string,
  tenantName: string,
  receiptType: string,
  pdfBase64: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate the absolute URL to your deployed app where the image is hosted
    // (e.g. from Vercel env variables, or localhost during development)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    
    // This points cleanly to C:\...\public\invitation-home.png 
    const logoUrl = `${baseUrl}/invitation-home.png`;

    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9fafb; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="${logoUrl}" alt="Invitation Homes" style="height: 48px; margin: 0 auto;" />
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Payment Receipt: ${receiptType}</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Dear ${tenantName},</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            Thank you for your recent payment for <strong>${receiptType}</strong>.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            We have attached the official electronic receipt to this email for your records. Please keep it safe.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            If you have any questions regarding this payment, please do not hesitate to reach out to us.
          </p>
        </div>
        <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 14px;">
          <p>Warm regards,<br><strong>Invitation Homes Team</strong></p>
        </div>
      </div>
    `;

    // Only attach the PDF. The logo is strictly hosted online!
    const attachments = [
      {
        filename: fileName,
        content: pdfBase64,
      },
    ];

    await resend.emails.send({
      from: "Invitation Homes <reciepts@corekeyrealty.com>",
      to: tenantEmail,
      subject: `Your Invitation Homes Receipt - ${receiptType}`,
      html,
      attachments,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending receipt email:", error);
    return { success: false, error: "Failed to send email. Check API key or domain limits." };
  }
}
