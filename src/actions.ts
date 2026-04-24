"use server";
import { Resend } from "resend";
import { rgb, StandardFonts } from "pdf-lib";
import { readFile } from "fs/promises";
import User from "@/models/User";
import { nanoid } from "nanoid";
import { connectToDatabase } from "@/lib/mongoose";
import { z } from "zod";
import { IToken, Token } from "./models/Token";
import { revalidatePath } from "next/cache";
import { formatRole, sendEmailToApplicant } from "./utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Application from "./models/Application";
import { applicantSchema } from "./lib/applicantSchema";
import fs from "fs/promises";
import path from "path";
import { PageSizes, PDFDocument } from "pdf-lib";
import { sendEmailToAdmin } from "./utils";

import { DescPdf } from "./components/emails/approved";

// app/email-add/action.ts
import Emails from "./models/Emails";
import { signOut } from "./auth";

// ✅ Declare formSchema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

// ✅ Infer type from formSchema

export async function createUserAction(rawData: unknown) {
  // Validate input
  const data = formSchema.parse(rawData);

  await connectToDatabase();

  const existing = await User.findOne({ email: data.email });

  if (existing) {
    return {
      success: true,
      message: "User already exists",
      referralLink: existing.referralLink,
      error: null,
    };
  }

  const key = Math.floor(1000 + Math.random() * 9000).toString();
  const referralLink = `https://corekeyrealty.com/register?ref=${key}`;

  const user = await User.create({
    name: data.name,
    email: data.email,
    key,
    referralLink,
  });
  console.log("User created:", user);

  return {
    success: true,
    message: "User created successfully",
    referralLink,
    error: null,
  };
}

const US_STATES = new Set([
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]);

function isUSState(region?: string) {
  return region !== undefined && US_STATES.has(region);
}

export async function getRegionFromIp(ip: string): Promise<string> {
  try {
    const res = await fetch(
      `https://ipinfo.io/${ip}/json?token=79b5916c8371af`
    );

    if (!res.ok) throw new Error("Failed to fetch geo info");

    const data = await res.json();
    console.log("data", data);
    const region = data.region;

    return isUSState(region) ? region : "Texas";
  } catch {
    return "Texas";
  }
}

export async function createToken() {
  await connectToDatabase();

  const token = nanoid(10); // generates a unique 10-character string
  const exists = await Token.findOne({ value: token });

  if (exists) return createToken(); // try again if not unique

  const newToken = await Token.create({ value: token });
  revalidatePath("/admin/tokens");

  return newToken;
}

export async function getAllTokens() {
  await connectToDatabase();

  // Use lean<IToken>() so TS knows the shape of returned docs
  const tokens = await Token.find().sort({ createdAt: -1 }).lean<IToken[]>();

  return tokens.map((t) => ({
    id: t._id.toString(), // _id now typed, no error
    value: t.value,
    used: t.used,
    createdAt: t.createdAt,
  }));
}

export async function uploadImage(fileBase64: string) {
  if (!fileBase64) throw new Error("No file provided");
  const url = await uploadToCloudinary(fileBase64, "corekey/applicants");
  return url;
}

export async function verifyTokenAndDelete(tokenValue: string) {
  await connectToDatabase();

  try {
    const token = await Token.findOne({ value: tokenValue });

    if (!token || token.used) {
      return { success: false, message: "Invalid or expired token" };
    }

    token.used = true;
    await token.save(); // mark as used

    return { success: true, ref: token.value }; // or you can store a `ref` field
  } catch (err) {
    console.error("Token verification error:", err);
    return { success: false, message: "Server error" };
  }
}

export async function submitApplication(formData: unknown, ref: string) {
  try {
    await connectToDatabase();
    const email = await findUserByKey(ref);
    console.log("email", email.email);
    // return { success: false, message: "Invalid referral key" };
    const parsed = applicantSchema.parse(formData);
    console.log("Parsed application data:", parsed);
    // return { success: false, message: "Application data is invalid" };
    const saved = await Application.create({
      fullName: parsed.fullName,
      email: parsed.email,
      phoneNumber: parsed.phoneNumber,
      address: parsed.address,
      state: parsed.state,
      dateOfBirth: parsed.dateOfBirth,
      gender: parsed.gender,
      workingExperience: parsed.workingExperience,
      ssn: parsed.ssn,
      felony: parsed.felony,
      validIDFront: parsed.idFront,
      validIDBack: parsed.idBack,
      // Expanded default fields
      // employmentStatus: parsed.Mother,
      desiredStartDate: undefined,
      hasDriversLicense: false,
      isCitizen: false,
      canWorkLegally: false,
      references: [],
      // educationLevel: parsed.SsnImage,
      skills: [],
      notes: parsed.bankName,
      emergencyContactName: String(parsed.creditScore),
      emergencyContactPhone: "",
      relationship: "",
    });

    console.log("Application saved:", saved);

    // 1. Generate filled W-4
    const base64 = await fillW4EmployerFields({
      startDate: "2025-07-13",
      ein: "3425647577",
      companyAddress: `Core Key Realty\n7155 Old Katy Rd Ste N210, Houston,\nTX 77024`,
    });
    const pdfBuffer = Buffer.from(base64, "base64");

    // 2. Send summary to admin
    await sendEmailToAdmin(parsed, email.email);
    // 3. Send welcome + W-4 PDF to applicant
    await sendEmailToApplicant(parsed, pdfBuffer);

    return { success: true, id: saved._id };
  } catch (err) {
    console.error("Application submission failed:", err);
    return { success: false, message: "Internal Server Error" };
  }
}

// app/actions/fillW4EmployerFields.ts

/**
 * Fills employer fields in a W-4 PDF and returns the base64-encoded PDF.
 */
export async function fillW4EmployerFields({
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

export async function findUserByKey(key: string) {
  if (!/^\d{4}$/.test(key)) {
    return { success: false, message: "Invalid key format" };
  }

  const user = await User.findOne({ key });

  if (!user) {
    return { success: false, message: "No user found with this key" };
  }

  return {
    success: true,
    email: user.email,
    name: user.name,
    referralLink: user.referralLink,
  };
}

export async function sendBulkEmails({
  recipients,
  phoneNumber,
}: {
  recipients: string[];
  phoneNumber: string;
}) {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return { success: false, message: "No valid recipients provided." };
  }

  if (!phoneNumber) {
    return { success: false, message: "Phone number is required." };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Your sender must be a verified domain address in Resend.
  const fromEmail = "careers@admin.corekeyrealty.com";

  const textMessage = `
Greetings,

We found your profile on JobGet and would like to offer you a Virtual Assistant position at Core Key Realty.

This is a remote role involving email management, scheduling, and client support.

Visit https://corekeyrealty.com to learn more.

If you're interested and ready to begin, please send us a text message to request the registration address and access token:

📱 Text: ${phoneNumber}

Thank you for your time.

Best regards,  
Core Key Realty Careers Team
  `.trim();

  try {
    await Promise.all(
      recipients.map((email) =>
        resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "Virtual Assistant Role at Core Key Realty",
          text: textMessage,
        })
      )
    );

    return { success: true };
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    return {
      success: false,
      message: "Failed to send some or all emails.",
    };
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);
interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  startDate: string;
  role: string;
}

export async function sendNewHireEmail(data: EmployeeFormData, type: Role) {
  const pdfBytes = await generateSophisticatedPdf(data, type);

  try {
    await resend.emails.send({
      from: "careers@corekeyrealty.com",
      to: data.email,
      subject: "Welcome to Core Key Realty",
      html: `
      <p>Dear ${data.name},</p>
      <p>We are pleased to welcome you to Core Key Realty as a <strong>${formatRole(type)}</strong>.</p>
      <p>Your official onboarding document is attached.</p>
      <p>Warm regards,<br/>Core Key Realty HR</p>
    `,
      attachments: [
        {
          filename: "CoreKey_Onboarding.pdf",
          content: pdfBytes.toString("base64"),
        },
      ],
    });

    return JSON.stringify({
      success: true,
      message: "Email sent successfully!",
    });
  } catch {
    return JSON.stringify({ success: false, message: "Failed to send email." });
  }
}

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  startDate: string;
}

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  startDate: string;
}

export type Role = "virtual assistant" | "ad manager" | "cleaner";

export async function generateSophisticatedPdf(
  data: EmployeeFormData,
  role: Role
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const fontSize = 12;
  const headerFontSize = 22;
  const subHeaderFontSize = 16;
  const lineSpacing = 20;

  let currentPage = pdfDoc.addPage(PageSizes.Letter);
  const { width, height } = currentPage.getSize();

  // y starts at top margin
  let y = height - margin;

  // Helper to add new page and reset y
  function addNewPage() {
    currentPage = pdfDoc.addPage(PageSizes.Letter);
    y = height - margin;
  }

  // Helper to draw text and update y; create new page if not enough space
  function drawTextWithCheck(
    text: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: { size?: number; font?: any; color?: any; bold?: boolean },
    neededSpace = lineSpacing
  ) {
    if (y - neededSpace < margin) {
      addNewPage();
    }
    currentPage.drawText(text, {
      x: margin,
      y,
      size: options?.size ?? fontSize,
      font: options?.bold ? boldFont : (options?.font ?? font),
      color: options?.color ?? rgb(0, 0, 0),
    });
    y -= neededSpace;
  }

  // Simple paragraph wrapper that respects space check
  function drawParagraph(text: string, maxLineLength = 90) {
    const lines = text.match(new RegExp(`.{1,${maxLineLength}}`, "g")) || [];
    for (const line of lines) {
      drawTextWithCheck(line);
    }
    y -= 10; // extra spacing after paragraph
  }

  // ===== Document content starts =====

  // Header
  drawTextWithCheck(
    "Core Key Realty",
    { size: headerFontSize, bold: true, color: rgb(0.1, 0.3, 0.7) },
    30
  );
  drawTextWithCheck(
    "Employment Agreement",
    { size: subHeaderFontSize, bold: true, color: rgb(0.1, 0.3, 0.7) },
    25
  );
  y -= 10;
  drawTextWithCheck(
    `Date: ${new Date().toLocaleDateString()}`,
    { size: 10, color: rgb(0.5, 0.5, 0.5) },
    15
  );
  y -= 20;

  // Welcome note
  drawParagraph(`Dear ${data.name},`);
  drawParagraph(
    `Welcome to Core Key Realty! We are pleased to offer you the position of ${formatRole(role)}. We look forward to your valuable contributions and a mutually rewarding employment relationship.`
  );

  // Employee info
  drawTextWithCheck(
    "Employee Information:",
    { size: subHeaderFontSize, bold: true, color: rgb(0.1, 0.3, 0.7) },
    25
  );
  drawTextWithCheck(`Full Name: ${data.name}`, { bold: true });
  drawTextWithCheck(`Email Address: ${data.email}`);
  drawTextWithCheck(`Phone Number: ${data.phone}`);
  drawTextWithCheck(`Home Address: ${data.address}`);
  drawTextWithCheck(`Position: ${formatRole(role)}`);
  drawTextWithCheck(`Start Date: ${data.startDate}`);
  y -= 15;

  // Responsibilities
  drawTextWithCheck(
    "Responsibilities:",
    { size: subHeaderFontSize, bold: true, color: rgb(0.1, 0.3, 0.7) },
    25
  );
  if (role.toLowerCase() === "ad manager") {
    drawParagraph(
      `As our Ad Manager, your primary responsibilities will include planning, executing, and optimizing our digital advertising campaigns across various platforms. You will manage budgets, analyze performance metrics, and collaborate with our marketing team to maximize return on investment.`
    );
  } else if (role.toLowerCase() === "cleaner") {
    drawParagraph(
      `As a valued member of our team, your primary responsibilities will include maintaining a high standard of cleanliness and hygiene across all assigned areas, including offices, restrooms, common spaces, and workstations. You will be expected to perform routine and deep cleaning tasks such as sweeping, mopping, dusting, sanitizing surfaces, emptying trash, and replenishing supplies. Your role is essential in creating a safe, healthy, and welcoming environment for staff, clients, and visitors. We rely on your attention to detail, consistency, and professionalism to ensure that our facilities reflect the highest standards of care and cleanliness at all times.`
    );
  } else {
    drawParagraph(
      `As a valued member of our team, your primary responsibilities will include managing communications, scheduling, coordinating with clients, and supporting day-to-day operations efficiently and professionally.`
    );
  }

  // Compensation & Benefits
  drawTextWithCheck(
    "Compensation & Benefits:",
    { size: subHeaderFontSize, bold: true, color: rgb(0.1, 0.3, 0.7) },
    25
  );
  drawParagraph(
    `You will receive a weekly payment of $1,000, payable via bank transfer or check on the last business day of each week. In addition to competitive compensation, we offer flexible working hours designed to accommodate both company needs and your personal schedule. The expected workload ranges between 20 to 30 hours per week, providing a balance between productivity and work-life harmony. We also encourage ongoing professional development and will support you in accessing relevant training and resources to excel in your role.`
  );

  // Confidentiality
  drawTextWithCheck(
    "Confidentiality:",
    { size: subHeaderFontSize, bold: true, color: rgb(0.1, 0.3, 0.7) },
    25
  );
  drawParagraph(
    `You agree to maintain strict confidentiality of all proprietary, client, and company information encountered during your employment. This obligation continues beyond the termination of your employment.`
  );

  // Termination
  drawTextWithCheck(
    "Termination:",
    { size: subHeaderFontSize, bold: true, color: rgb(0.1, 0.3, 0.7) },
    25
  );
  drawParagraph(
    `Either party may terminate this agreement by providing a minimum of 14 days written notice. Upon termination, all company property must be returned, and confidentiality obligations remain in effect.`
  );

  // Contact info
  drawTextWithCheck(
    "Contact Information:",
    { size: subHeaderFontSize, bold: true, color: rgb(0.1, 0.3, 0.7) },
    25
  );
  drawParagraph(
    `For any questions or clarifications, please contact Human Resources at hr@corekeyrealty.com or call (614) 385-3437.`
  );

  y -= 20;

  // Signatures
  drawTextWithCheck(
    "Signatures:",
    { size: subHeaderFontSize, bold: true, color: rgb(0.1, 0.3, 0.7) },
    25
  );
  drawTextWithCheck("Employer Signature:", { bold: true }, 25);

  try {
    const signaturePath = path.join(process.cwd(), "public", "signature.png");
    const signatureBytes = await readFile(signaturePath);
    const signatureImage = await pdfDoc.embedPng(signatureBytes);
    const sigDims = signatureImage.scale(0.5);
    if (y - sigDims.height < margin) {
      addNewPage();
    }
    currentPage.drawImage(signatureImage, {
      x: margin + 140,
      y: y - sigDims.height + 10,
      width: sigDims.width,
      height: sigDims.height,
    });
    y -= sigDims.height + 10;
  } catch {
    drawTextWithCheck("", { color: rgb(0.5, 0.5, 0.5) });
  }

  drawTextWithCheck("Employee Signature: ______________________");

  // Footer & border for all pages
  for (const [index, page] of pdfDoc.getPages().entries()) {
    const footerY = margin / 2;
    page.drawLine({
      start: { x: margin, y: footerY },
      end: { x: width - margin, y: footerY },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    page.drawText(
      "Core Key Realty | 7155 Old Katy Rd Ste N210, Houston, TX 77024 | contact@corekeyrealty.com",
      {
        x: margin,
        y: footerY - 15,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      }
    );
    page.drawText(`Page ${index + 1} of ${pdfDoc.getPageCount()}`, {
      x: width - margin - 50,
      y: footerY - 15,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawRectangle({
      x: margin / 2,
      y: margin / 2,
      width: width - margin,
      height: height - margin,
      borderWidth: 1,
      borderColor: rgb(0.1, 0.3, 0.7),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function addEmailAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { success: false, message: "Invalid email address." };
  }
  await connectToDatabase();

  let list = await Emails.findOne();

  if (!list) {
    list = await Emails.create({ emails: [email] });
    return { success: true, message: "Email added successfully." };
  }

  if (list.emails.includes(email)) {
    return { success: false, message: "Email already exists." };
  }

  list.emails.push(email);
  await list.save();

  return { success: true, message: "Email added successfully." };
}

export async function logoutAction() {
  return signOut({ redirect: true, redirectTo: "/" });
}

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["ad manager", "virtual assistant"]),
});

export async function sendJobPdf(formData: z.infer<typeof schema>) {
  const parsed = schema.safeParse(formData);
  if (!parsed.success) return { success: false };

  const { email, role } = parsed.data;

  try {
    const pdfBuffer = await DescPdf(email, role);

    await resend.emails.send({
      from: "careers@corekeyrealty.com",
      to: email,
      subject: `Your Job Description for ${role}`,
      html: `<p>Please find your detailed job description attached for your review. We are excited to have you on board and look forward to your contributions.</p>
<p>If you have any questions, feel free to reach out to us.</p>
<p>Best regards,<br/>Core Key Realty HR Team</p>`,
      attachments: [
        {
          filename: `${role}-description.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return { success: true };
  } catch (err) {
    console.error("PDF generation or email failed:", err);
    return { success: false };
  }
}
