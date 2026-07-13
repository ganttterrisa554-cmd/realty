/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Resend } from "resend";

export async function submitLease(data: any) {
  try {
    const message = `
🏠 *Invitation Home Rentals - NEW LEASE APPLICATION*

━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *LEASE DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Move-in Date: ${data.moveInDate}
📄 Application Type: ${data.applicationType.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *PERSONAL INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${data.title} ${data.firstName} ${data.middleName || ""} ${data.lastName}
🎂 Date of Birth: ${data.dateOfBirth}
⚥ Gender: ${data.gender.replace(/_/g, " ").toUpperCase()}
💍 Marital Status: ${data.maritalStatus.charAt(0).toUpperCase() + data.maritalStatus.slice(1)}

━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *CONTACT INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: ${data.email}
📱 Phone: ${data.phone}
☎️ Preferred Contact: ${data.preferredContact.charAt(0).toUpperCase() + data.preferredContact.slice(1)}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏡 *CURRENT ADDRESS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.currentAddress}
${data.city}, ${data.state} ${data.zipCode}

━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 *EMPLOYMENT INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${data.employmentStatus.replace(/_/g, " ").toUpperCase()}
🏢 Employer: ${data.employer}
👔 Job Title: ${data.jobTitle}
📆 Years Employed: ${data.yearsEmployed}

━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *INCOME INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 Monthly Income: $${data.grossMonthlyIncome}
💼 Annual Salary: $${data.grossAnnualSalary}

━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍👩‍👧‍👦 *OCCUPANCY INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Adults (18+): ${data.adultsMovingIn}
👶 Children (Under 18): ${data.childrenMovingIn}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 *ADDITIONAL QUESTIONS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
🐾 Pets/Animals: ${data.hasAnimals.toUpperCase()}${
      data.hasAnimals === "yes" && data.animalDetails
        ? `
   Details: ${data.animalDetails}`
        : ""
    }

🚨 Background Issues: ${data.hasBackground.toUpperCase()}${
      data.hasBackground === "yes" && data.backgroundDetails
        ? `
   Details: ${data.backgroundDetails}`
        : ""
    }

━━━━━━━━━━━━━━━━━━━━━━━━━━
🆘 *EMERGENCY CONTACT*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Name: ${data.emergencyContactName}
📱 Phone: ${data.emergencyContactPhone}
💫 Relationship: ${data.emergencyContactRelationship}

━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 *PAYMENT METHOD*
━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.paymentMethod === "cashapp" ? "Cash App" : data.paymentMethod.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ *Submitted:* ${new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    })}
`;

    let targetEmails: string[] = [];
    if (data.ref === "jm") {
      targetEmails.push("rngood01@gmail.com");
    } else if (data.ref === "wy") {
      targetEmails.push("waysewest@gmail.com");
    } else if (data.ref === "sg") {
      targetEmails.push("emmanuelar35@gmail.com");
    } else if (data.ref === "dc") {
      targetEmails.push("Dcblues54@gmail.com");
    } else if (data.ref === "bl") {
      targetEmails.push("ballnogo234@outlook.com");
    } else if (data.ref === "gu") {
      targetEmails.push("Gurrieanthony@gmail.com");
    } else if (data.ref === "gy") {
      targetEmails.push("Gray50585@gmail.com");
    } else if (data.ref === "jk") {
      targetEmails.push("jemjimk2510@gmail.com");
    } else if (data.ref === "ha") {
      targetEmails.push("hall969101@gmail.com");
    } else if (data.ref === "ph") {
      targetEmails.push("perfecthousing714@gmail.com");
    }

    if (targetEmails.length > 0) {
      try {
        const cleanKey = (process.env.RESEND_API_KEY || "").replace(/['"]+/g, '').trim();
        const resend = new Resend(cleanKey);
        
        await resend.emails.send({
          from: "applications@invitationhomesrental.com",
          to: targetEmails,
          subject: `New Lease Application - ${data.firstName} ${data.lastName}`,
          text: message,
        });
      } catch (err) {
        console.error("Failed to send email notification", err);
      }
    }

    // Send to Telegram (non-blocking, log errors but don't fail the whole app)
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.CHAT_ID,
            text: message,
            parse_mode: "Markdown",
          }),
        }
      );

      const result = await response.json();
      if (!result.ok) {
        console.error("Telegram API error:", result);
      }
    } catch (telegramError) {
      console.error("Failed to send Telegram message:", telegramError);
    }

    return { success: true, message: "Application submitted successfully!" };
  } catch (error) {
    console.error("Failed to send lease application:", error);
    return {
      success: false,
      message: "Failed to submit application. Please try again.",
    };
  }
}
