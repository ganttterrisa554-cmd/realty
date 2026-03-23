// test.js
import { Resend } from "resend";
import { Buffer } from "buffer";
import fs from "fs/promises";
import path from "path";
import { PDFDocument } from "pdf-lib";

async function fillW4EmployerFields({
  startDate,
  ein,
  companyAddress,
}: {
  startDate: string;
  ein: string;
  companyAddress: string;
}) {
  const inputPdfPath = path.join(process.cwd(), "public", "fw4.pdf");
  const pdfBytes = await fs.readFile(inputPdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // ✅ Set employer fields correctly
  form.getTextField("topmostSubform[0].Page1[0].f1_14[0]").setText(startDate); // First Date of Employment
  form.getTextField("topmostSubform[0].Page1[0].f1_15[0]").setText(ein); // EIN
  form
    .getTextField("topmostSubform[0].Page1[0].f1_13[0]")
    .setText(companyAddress); // Employer Name & Address

  const modifiedPdf = await pdfDoc.save();
  return Buffer.from(modifiedPdf).toString("base64"); // return as base64 for emailing or preview
}

async function sendTestEmail() {
  // Mock parsed applicant data
  const applicant = {
    fullName: "Ellani Walker",
    email: "rvsanchez255@gmail.com",
    phoneNumber: "123-456-7890",
    address: "123 Main St",
    state: "TX",
    dateOfBirth: "1990-01-01",
    gender: "Female",
    workingExperience: "5 years",
    ssn: "123-45-6789",
    felony: "No",
    idFront: "id-front.jpg",
    idBack: "id-back.jpg",
    bankName: "Bank of America",
    creditScore: 750,
  };

  // Get today's date
  const today = new Date();
  const startDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate W-4 PDF
  const base64 = await fillW4EmployerFields({
    startDate,
    ein: "3425647577",
    companyAddress: `Core Key Realty\n7155 Old Katy Rd Ste N210, Houston,\nTX 77024`,
  });
  const pdfBuffer = Buffer.from(base64, "base64");

  // Build HTML email
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9fafb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="https://isfj6shkii.ufs.sh/f/7lSE5lws1RB32V6uVzUalG6TwSy1CK0hYIjPdvJgz8tRqixO" alt="CoreKey Realty Logo" style="max-width: 180px;" />
      </div>
      <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin-bottom: 16px;">Welcome to CoreKey Realty!</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">Dear ${applicant.fullName},</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
          Your official start date is <strong>${startDate}</strong>.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
          We’re thrilled to welcome you to the CoreKey Realty family! Thank you for submitting your application.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
          Attached is your completed IRS Form W-4. Please review and submit it within <strong>7 days</strong> to ensure a smooth onboarding process.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Have questions? Feel free to reply to this email or contact us at <a href="mailto:support@corekeyrealty.com" style="color: #3b82f6; text-decoration: none;">support@corekeyrealty.com</a>.
        </p>
        <div style="text-align: center; margin-top: 32px;">
          <a href="https://corekeyrealty.com" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 16px; font-weight: 500; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Visit CoreKeyRealty.com</a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 14px;">
        <p>Warm regards,<br><strong>The CoreKey Realty Team</strong></p>
        <p><a href="https://corekeyrealty.com" style="color: #6b7280; text-decoration: none;">www.corekeyrealty.com</a></p>
      </div>
    </div>
  `;

  // Send email via Resend
  const resend = new Resend(
    process.env.RESEND_API_KEY || "re_ZJmwoKa2_K5MSQg6RGo9iBWf18jC5DMXg"
  );

  try {
    const response = await resend.emails.send({
      to: applicant.email,
      from: "onboarding@resend.dev",
      subject: `✅ Welcome to CoreKey Realty, ${applicant.fullName}!`,
      html,
      attachments: [
        {
          filename: `W4-${applicant.fullName}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    console.log("-----------------------------------------");
    console.log("Resend API Full Response:");
    console.dir(response, { depth: null, colors: true });
    console.log("-----------------------------------------");

    if (response.error) {
      console.error("Resend returned an error directly in response payload:", response.error);
    } else {
      console.log(`Email sent successfully to ${applicant.fullName} (${applicant.email})`);
    }
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

// Run the test
sendTestEmail();
