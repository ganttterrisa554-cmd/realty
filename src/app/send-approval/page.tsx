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
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Sending..." : "Send Lease Agreement"}
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
