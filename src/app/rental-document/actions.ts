"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRentalDocumentEmail(
  email: string,
  pdfBase64: string,
  fileName: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Invitation Homes <no-reply@invitationhomesrental.com>",
      to: email,
      subject: "🏠 Official Statement: Invitation Homes - 3257 Trafalgar Ave",
      html: `
        <div style="font-family: 'Times New Roman', serif; max-width: 600px; margin: 0 auto; color: #1f2937; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 2px solid #111827; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 24px; text-transform: uppercase; margin: 0; color: #111827;">Official Leasing Documentation</h1>
            <p style="font-size: 14px; color: #6b7280; margin: 5px 0 0 0;">3257 Trafalgar Ave, East Stroudsburg, PA 18302</p>
          </div>
          
          <div style="padding: 0 10px;">
            <p>Dear Applicant,</p>
            
            <p>Please find attached the official <strong>Statement of Account & Occupancy Intent</strong> regarding the property at 3257 Trafalgar Ave.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 25px 0;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #111827;">Summary of Status:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Verified Credits:</strong> $740.00 (Processed via Chime)</li>
                <li><strong>Next Step:</strong> Indexing Fee ($1,000.00)</li>
                <li><strong>Status:</strong> Pending Final Indexing</li>
              </ul>
            </div>
            
            <p>As detailed in the attached document, Invitation Homes is required by State Law to ensure all fees paid to date remain fully refundable until the moment of formal lease execution and the physical handover of keys.</p>
            
            <p>Please review the attached statement for the complete breakdown and next steps required to ensure immediate occupancy.</p>
            
            <p style="margin-top: 40px; border-top: 1px solid #e5e7eb; pt: 20px;">
              Kind Regards,<br>
              <strong>Brooke Kelley</strong><br>
              Senior Leasing Specialist<br>
              Invitation Homes
            </p>
          </div>
          
          <div style="margin-top: 50px; text-align: center; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
            <p>© 2026 Invitation Homes. All rights reserved.</p>
            <p>www.invitationhomes.com</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Email Service Error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
