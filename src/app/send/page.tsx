"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { sendBulkEmails } from "@/actions";

export default function BulkEmailForm() {
  const [rawEmails, setRawEmails] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const parseAndValidateEmails = (raw: string) => {
    const emails = raw
      .split(/[\s,]+/)
      .map((email) => email.trim())
      .filter((email) => email !== "");

    const isValid = emails.every((email) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    );

    if (!isValid) {
      setError("One or more email addresses are invalid.");
      return null;
    }

    return emails;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!fromEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
      return setError("Please enter a valid 'from' email address.");
    }

    const emails = parseAndValidateEmails(rawEmails);
    if (!emails) return;

    if (!phoneNumber) {
      return setError("Please provide a phone number.");
    }

    setSubmitting(true);

    try {
      const result = await sendBulkEmails({ recipients: emails, phoneNumber });

      if (result.success) {
        setSuccess(true);
        setRawEmails("");
        setPhoneNumber("");
        setFromEmail("");
      } else {
        setError(result.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto p-6 mt-10 space-y-6">
      <CardContent className="space-y-5">
        <div>
          <Label htmlFor="fromEmail">Your Email (From)</Label>
          <Input
            id="fromEmail"
            type="email"
            placeholder="careers@invitationhomesrental.com"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="emails">Paste Recipient Emails</Label>
          <Textarea
            id="emails"
            placeholder="Paste emails separated by comma, space, or new line"
            value={rawEmails}
            onChange={(e) => setRawEmails(e.target.value)}
            rows={6}
          />
        </div>

        <div>
          <Label htmlFor="phone">Your Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Emails were submitted successfully!
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Sending..." : "Send Emails"}
        </Button>
      </CardContent>
    </Card>
  );
}
