// app/(admin)/send-lease/page.tsx
"use client";

import { useState } from "react";
import { sendLeaseAgreement } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function SendLeasePage() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);

    const res = await sendLeaseAgreement(formData);

    setPending(false);
    setMessage(res?.message ?? "Something went wrong");
  }

  return (
    <div className="flex justify-center py-16 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Send Lease Agreement (PDF)</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="fullName">Tenant Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tenant@email.com"
                required
              />
            </div>

            {/* Property Address */}
            <div className="space-y-1">
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Textarea
                id="propertyAddress"
                name="propertyAddress"
                placeholder="123 Main Street, Dallas, TX 75201"
                rows={3}
                required
              />
            </div>

            {/* PDF Upload */}
            <div className="space-y-1">
              <Label htmlFor="pdf">Lease Agreement (PDF)</Label>
              <Input
                id="pdf"
                name="pdf"
                type="file"
                accept="application/pdf"
                required
              />
              <p className="text-xs text-muted-foreground">
                Upload the Invitation Homes lease agreement in PDF format.
              </p>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={pending} className="w-full h-10 font-medium">
              {pending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Lease Agreement"
              )}
            </Button>

            {message && (
              <p className="text-sm text-center text-muted-foreground">
                {message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
