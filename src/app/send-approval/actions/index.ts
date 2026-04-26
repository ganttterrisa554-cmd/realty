"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailTemplate(htmlContent: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>CoreKey Realty</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  
  <!-- Preheader Text (hidden but shows in email preview) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    CoreKey Realty - Unlocking more than doors, we unlock your future.
  </div>

  <!-- Email Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Content Table -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 32px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Logo and Brand -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display: inline-block;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 16px;">
                          <img 
                            src="https://isfj6shkii.ufs.sh/f/7lSE5lws1RB32V6uVzUalG6TwSy1CK0hYIjPdvJgz8tRqixO" 
                            alt="CoreKey Realty Logo" 
                            width="64"
                            height="64"
                            style="display: block; border: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);"
                          />
                        </td>
                        <td style="vertical-align: middle;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.2;">
                            CoreKey<br/>Realty
                          </h1>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <p style="margin: 0; color: #94a3b8; font-size: 14px; font-style: italic; font-family: Georgia, 'Times New Roman', serif; line-height: 1.5;">
                      Unlocking more than doors — we unlock your future
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 48px 40px; background-color: #ffffff;">
              <div style="color: #1e293b; font-size: 16px; line-height: 1.7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                ${htmlContent}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 40px 32px; border-top: 3px solid #3b82f6;">
              
              <!-- Navigation Links -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display: inline-block;">
                      <tr>
                        <td style="padding: 0 12px;">
                          <a href="https://corekeyrealty.com" style="color: #475569; text-decoration: none; font-size: 14px; font-weight: 500; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">Home</a>
                        </td>
                        <td style="color: #cbd5e1; padding: 0 4px;">•</td>
                        <td style="padding: 0 12px;">
                          <a href="https://corekeyrealty.com/about" style="color: #475569; text-decoration: none; font-size: 14px; font-weight: 500; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">About</a>
                        </td>
                        <td style="color: #cbd5e1; padding: 0 4px;">•</td>
                        <td style="padding: 0 12px;">
                          <a href="https://corekeyrealty.com/properties" style="color: #475569; text-decoration: none; font-size: 14px; font-weight: 500; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">Properties</a>
                        </td>
                        <td style="color: #cbd5e1; padding: 0 4px;">•</td>
                        <td style="padding: 0 12px;">
                          <a href="https://corekeyrealty.com/contact" style="color: #475569; text-decoration: none; font-size: 14px; font-weight: 500; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">Contact</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="border-top: 1px solid #e2e8f0;"></td>
                </tr>
              </table>

              <!-- Contact Information -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <p style="margin: 0; color: #64748b; font-size: 14px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6;">
                      <strong style="color: #475569;">Address:</strong> 7155 Old Katy Rd Ste N210, Houston, TX 77024
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <p style="margin: 0; color: #64748b; font-size: 14px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6;">
                      <strong style="color: #475569;">Phone:</strong> <a href="tel:+13188240415" style="color: #3b82f6; text-decoration: none;">(318) 824-0415</a>
                      <span style="margin: 0 8px; color: #cbd5e1;">|</span>
                      <strong style="color: #475569;">Email:</strong> <a href="mailto:contact@corekeyrealty.com" style="color: #3b82f6; text-decoration: none;">contact@corekeyrealty.com</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="border-top: 1px solid #e2e8f0;"></td>
                </tr>
              </table>

              <!-- Copyright and Legal -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6;">
                      © ${new Date().getFullYear()} CoreKey Realty. All rights reserved.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <p style="margin: 0; color: #cbd5e1; font-size: 11px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.5;">
                      You're receiving this email because you've contacted CoreKey Realty.<br/>
                      <a href="#" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="#" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
        <!-- End Main Content Table -->

      </td>
    </tr>
  </table>
  <!-- End Email Container -->

</body>
</html>
  `;
}

// Example usage with sample content

// Generate the final email

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  propertyAddress: z.string().min(5),
});

const schema2 = z.object({
  destination: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  htmlContent: z.string().min(1, "Message content is required"),
  sourcePrefix: z.string().min(1, "Source prefix is required"),
});

export async function sendMessage(formData: FormData) {
  try {
    console.log("📨 sendMessage called");

    const destination = formData.get("destination");
    const subject = formData.get("subject");
    const htmlContent = formData.get("htmlContent");
    const sourcePrefix = formData.get("sourcePrefix");

    console.log("📥 Raw form data:", {
      destination,
      subject,
      sourcePrefix,
      contentLength: htmlContent?.toString().length,
    });

    const parsed = schema2.safeParse({
      destination,
      subject,
      htmlContent,
      sourcePrefix,
    });

    if (!parsed.success) {
      console.error("❌ Validation failed:", parsed.error.flatten());

      return { message: "Invalid form data", error: parsed.error.flatten() };
    }

    const fromEmail = `${parsed.data.sourcePrefix}@corekeyrealty.com`;

    console.log("📤 Sending email via Resend…");
    console.log("From:", fromEmail);
    console.log("To:", parsed.data.destination);
    console.log("Subject:", parsed.data.subject);
    console.log(
      "HTML Content Preview:",
      parsed.data.htmlContent.substring(0, 200)
    );

    const finalHtml = buildEmailTemplate(parsed.data.htmlContent);

    const response = await resend.emails.send({
      from: fromEmail,
      to: parsed.data.destination,
      subject: parsed.data.subject,
      html: finalHtml,
    });

    console.log("✅ Email sent successfully");
    console.log("✅ Resend response:", response);

    return { message: "Message sent successfully", data: response };
  } catch (error) {
    console.error("🔥 Email send failed:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("🔥 Error name:", error.name);
      console.error("🔥 Error message:", error.message);
      console.error("🔥 Error stack:", error.stack);
    }

    // Log if it's a Resend API error
    if (typeof error === "object" && error !== null) {
      console.error("🔥 Full error object:", JSON.stringify(error, null, 2));
    }

    return {
      message: "Failed to send message",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendLeaseAgreement(formData: FormData) {
  try {
    console.log("📨 sendLeaseAgreement called");

    const email = formData.get("email");
    const fullName = formData.get("fullName");
    const propertyAddress = formData.get("propertyAddress");
    const file = formData.get("pdf") as File | null;

    console.log("📥 Raw form data:", {
      email,
      fullName,
      propertyAddress,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    });

    const parsed = schema.safeParse({
      email,
      fullName,
      propertyAddress,
    });

    if (!parsed.success) {
      console.error("❌ Zod validation failed:", parsed.error.flatten());
      return { message: "Invalid form data" };
    }

    if (!file) {
      console.error("❌ Invalid or missing DOCX");
      return { message: "Please upload a valid DOCX file" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    console.log("📎 Attachment ready:", buffer.length, "bytes");

    const html = buildLeaseAgreementEmail({
      fullName: parsed.data.fullName,
      propertyAddress: parsed.data.propertyAddress,
    });

    console.log("📤 Sending email via Resend…");

    const sanitizedAddress = parsed.data.propertyAddress
      .replace(/[\r\n]+/g, " ")
      .trim();

    await resend.emails.send({
      from: "approval@corekeyrealty.com", // make sure domain verified
      to: parsed.data.email,
      subject: `Lease Agreement – ${sanitizedAddress}`,
      html,
      attachments: [
        {
          filename: file.name,
          content: buffer.toString("base64"),
        },
      ],
    });

    return { message: "Lease agreement sent successfully" };
  } catch (error) {
    console.error("🔥 Email send failed:", error);
    return { message: "Failed to send lease agreement" };
  }
}

function buildLeaseAgreementEmail({
  fullName,
  propertyAddress,
}: {
  fullName: string;
  propertyAddress: string;
}) {
  // sanitize line breaks
  const sanitizedAddress = propertyAddress.replace(/[\r\n]+/g, " ").trim();

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb; font-family: Arial, Helvetica, sans-serif;">
        <!-- Logo -->
        <tr>
          <td align="center" style="padding-bottom: 24px;">
            <img
              src="https://dokumfe7mps0i.cloudfront.net/media/logos/2022/06/283238_1655844560.7826822_InvitationHomesBoldedcmykRevLogo.png"
              alt="Invitation Homes"
              width="220"
              style="display: block; max-width: 220px; height: auto;"
            />
          </td>
        </tr>

        <!-- Heading -->
        <tr>
          <td style="color: #111827; font-size: 20px; font-weight: bold; padding-bottom: 16px;">
            Lease Agreement – Invitation Homes
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="color: #374151; font-size: 15px; line-height: 1.6; padding-bottom: 12px;">
            Dear ${fullName},
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="color: #374151; font-size: 15px; line-height: 1.6; padding-bottom: 12px;">
            We are pleased to provide the lease agreement for the following property:
          </td>
        </tr>

        <!-- Property Address -->
        <tr>
          <td style="color: #111827; font-size: 15px; font-weight: bold; padding-bottom: 16px;">
            ${sanitizedAddress}
          </td>
        </tr>

        <!-- Instructions -->
        <tr>
          <td style="color: #374151; font-size: 15px; line-height: 1.6; padding-bottom: 12px;">
            Please find the <strong>Invitation Homes Lease Agreement</strong> attached to this email in DOCX format.
            Kindly review the document carefully and follow the instructions outlined within to proceed.
          </td>
        </tr>

        <tr>
          <td style="color: #374151; font-size: 15px; line-height: 1.6; padding-bottom: 12px;">
            If you have any questions or require further assistance, please contact our leasing team.
          </td>
        </tr>

        <!-- Closing -->
        <tr>
          <td style="color: #374151; font-size: 15px; line-height: 1.6; padding-top: 24px;">
            Sincerely,<br />
            <strong>Invitation Homes Leasing Team</strong>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top: 1px solid #e5e7eb; padding-top: 24px; color: #6b7280; font-size: 12px; line-height: 1.4;">
            This email and any attachments may contain confidential information intended solely for the recipient.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
}
