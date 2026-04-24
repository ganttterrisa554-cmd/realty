"use server";

import fs from "fs";
import path from "path";
import { Resend } from "resend";

const rawKey = process.env.RESEND_API_KEY || "";
const cleanKey = rawKey.replace(/['"]+/g, '').trim();
const resend = new Resend(cleanKey);

export async function sendReceiptEmail(
  tenantEmail: string,
  tenantName: string,
  receiptType: string,
  pdfBase64: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("📨 Attempting to send receipt email:", {
      tenantEmail,
      tenantName,
      receiptType,
      fileName,
      pdfSize: pdfBase64 ? `${(pdfBase64.length * 0.75 / 1024).toFixed(2)} KB` : "0 KB"
    });

    // Generate the absolute URL to your deployed app where the image is hosted
    // (e.g. from Vercel env variables, or localhost during development)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    
    // This points cleanly to C:\...\public\invitation-home.png 
    const logoUrl = `${baseUrl}/invitation-home.png`;
    console.log("🔗 Logo URL:", logoUrl);

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

    console.log("📤 Dispatching email via Resend…");
    const response = await resend.emails.send({
      from: `Invitation Homes <${process.env.FROM_EMAIL || "noreply@corekeyrealty.com"}>`,
      to: tenantEmail,
      subject: `Your Invitation Homes Receipt - ${receiptType}`,
      html,
      attachments,
    });

    if (response.error) {
       console.error("❌ Resend API Error:", response.error);
       return { success: false, error: response.error.message };
    }

    console.log("✅ Receipt email sent successfully!", response);

    return { success: true };
  } catch (error) {
    console.error("🔥 Error sending receipt email (top-level catch):", error);
    return { success: false, error: "Failed to send email. Check API key or domain limits." };
  }
}
