"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { generateRentalApproval } from "@/actions/generatePdf";

interface ApplicantInfo {
  fullName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  currentAddress: string;
}

interface FormData {
  // Property Information
  propertyAddress: string;
  monthlyRent: string;
  securityDeposit: string;
  leaseTerm: string;
  leaseStartDate: string;
  leaseEndDate: string;

  // Applicant Info (pre-filled)
  applicant: ApplicantInfo;

  // Approval Details
  approvalStatus: "approved" | "conditionally-approved";
  approvalDate: string;
  approvedBy: string;

  // Financial Requirements
  firstMonthRent: string;
  lastMonthRent: string;
  petDeposit: string;
  totalDue: string;

  // Payment Instructions
  paymentMethod: string;
  paymentDeadline: string;
  payableTo: string;
  paymentInstructions: string;

  // Conditions
  coSignerRequired: boolean;
  additionalDocs: string;
  otherConditions: string;

  // Important Dates
  depositDueBy: string;
  moveInDate: string;
  leaseSigningDate: string;

  // Additional Notes
  additionalNotes: string;
}

export default function RentalApprovalForm() {
  const [formData, setFormData] = useState<FormData>({
    propertyAddress: "",
    monthlyRent: "",
    securityDeposit: "",
    leaseTerm: "12",
    leaseStartDate: "",
    leaseEndDate: "",
    applicant: {
      fullName: "",
      dateOfBirth: "",
      email: "",
      phone: "",
      currentAddress: "",
    },
    approvalStatus: "approved",
    approvalDate: new Date().toISOString().split("T")[0],
    approvedBy: "",
    firstMonthRent: "",
    lastMonthRent: "0",
    petDeposit: "0",
    totalDue: "",
    paymentMethod: "Zelle",
    paymentDeadline: "",
    payableTo: "Invitation Home Rentals",
    paymentInstructions: "",
    coSignerRequired: false,
    additionalDocs: "",
    otherConditions: "",
    depositDueBy: "",
    moveInDate: "",
    leaseSigningDate: "",
    additionalNotes: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-calculate total due
  const calculateTotal = () => {
    const security = parseFloat(formData.securityDeposit) || 0;
    const firstMonth = parseFloat(formData.firstMonthRent) || 0;
    const lastMonth = parseFloat(formData.lastMonthRent) || 0;
    const pet = parseFloat(formData.petDeposit) || 0;
    return (security + firstMonth + lastMonth + pet).toFixed(2);
  };

  // Update total when relevant fields change
  const updateField = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    if (
      [
        "securityDeposit",
        "firstMonthRent",
        "lastMonthRent",
        "petDeposit",
      ].includes(field)
    ) {
      const security = parseFloat(newData.securityDeposit) || 0;
      const firstMonth = parseFloat(newData.firstMonthRent) || 0;
      const lastMonth = parseFloat(newData.lastMonthRent) || 0;
      const pet = parseFloat(newData.petDeposit) || 0;
      newData.totalDue = (security + firstMonth + lastMonth + pet).toFixed(2);
    }
    setFormData(newData);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (
      !formData.propertyAddress ||
      !formData.monthlyRent ||
      !formData.applicant.fullName ||
      !formData.approvedBy
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await generateRentalApproval(formData);

      if (!result?.pdfBase64) {
        throw new Error("PDF generation failed");
      }

      // Decode base64 → binary
      const binary = atob(result.pdfBase64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Create real PDF
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto p-6 mt-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          🏠 Rental Approval Form - Invitation Home Rentals
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Application fee has been paid. Complete this form to generate the
          approval letter PDF.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Property Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            📍 Property Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="propertyAddress">
                Property Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="propertyAddress"
                placeholder="123 Main St, Dallas, TX 75001"
                value={formData.propertyAddress}
                onChange={(e) => updateField("propertyAddress", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="monthlyRent">
                Monthly Rent <span className="text-red-500">*</span>
              </Label>
              <Input
                id="monthlyRent"
                type="number"
                placeholder="1500"
                value={formData.monthlyRent}
                onChange={(e) => updateField("monthlyRent", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="securityDeposit">Security Deposit</Label>
              <Input
                id="securityDeposit"
                type="number"
                placeholder="1500"
                value={formData.securityDeposit}
                onChange={(e) => updateField("securityDeposit", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="leaseTerm">Lease Term (months)</Label>
              <Select
                value={formData.leaseTerm}
                onValueChange={(value) => updateField("leaseTerm", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="18">18 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="leaseStartDate">Lease Start Date</Label>
              <Input
                id="leaseStartDate"
                type="date"
                value={formData.leaseStartDate}
                onChange={(e) => updateField("leaseStartDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Applicant Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            👤 Applicant Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.applicant.fullName}
                onChange={(e) =>
                  updateField("applicant", {
                    ...formData.applicant,
                    fullName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.applicant.dateOfBirth}
                onChange={(e) =>
                  updateField("applicant", {
                    ...formData.applicant,
                    dateOfBirth: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.applicant.email}
                onChange={(e) =>
                  updateField("applicant", {
                    ...formData.applicant,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.applicant.phone}
                onChange={(e) =>
                  updateField("applicant", {
                    ...formData.applicant,
                    phone: e.target.value,
                  })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="currentAddress">Current Address</Label>
              <Input
                id="currentAddress"
                placeholder="456 Oak Ave, Dallas, TX 75002"
                value={formData.applicant.currentAddress}
                onChange={(e) =>
                  updateField("applicant", {
                    ...formData.applicant,
                    currentAddress: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Approval Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            ✅ Approval Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="approvalStatus">Approval Status</Label>
              <Select
                value={formData.approvalStatus}
                onValueChange={(value: any) =>
                  updateField("approvalStatus", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="conditionally-approved">
                    Conditionally Approved
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="approvalDate">Approval Date</Label>
              <Input
                id="approvalDate"
                type="date"
                value={formData.approvalDate}
                onChange={(e) => updateField("approvalDate", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="approvedBy">
                Approved By <span className="text-red-500">*</span>
              </Label>
              <Input
                id="approvedBy"
                placeholder="Agent Name"
                value={formData.approvedBy}
                onChange={(e) => updateField("approvedBy", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Financial Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            💰 Financial Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstMonthRent">First Month's Rent</Label>
              <Input
                id="firstMonthRent"
                type="number"
                placeholder="1500"
                value={formData.firstMonthRent}
                onChange={(e) => updateField("firstMonthRent", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastMonthRent">Last Month's Rent (if any)</Label>
              <Input
                id="lastMonthRent"
                type="number"
                placeholder="0"
                value={formData.lastMonthRent}
                onChange={(e) => updateField("lastMonthRent", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="petDeposit">Pet Deposit (if applicable)</Label>
              <Input
                id="petDeposit"
                type="number"
                placeholder="0"
                value={formData.petDeposit}
                onChange={(e) => updateField("petDeposit", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="totalDue">Total Due Before Move-in</Label>
              <Input
                id="totalDue"
                type="number"
                value={formData.totalDue || calculateTotal()}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            💳 Payment Instructions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => updateField("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zelle">Zelle</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Money Order">Money Order</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cashier's Check">
                    Cashier's Check
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentDeadline">Payment Deadline</Label>
              <Input
                id="paymentDeadline"
                type="date"
                value={formData.paymentDeadline}
                onChange={(e) => updateField("paymentDeadline", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="payableTo">Payable To</Label>
              <Input
                id="payableTo"
                placeholder="Invitation Home Rentals"
                value={formData.payableTo}
                onChange={(e) => updateField("payableTo", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="paymentInstructions">
                Payment Instructions (e.g., Zelle email, check mailing address)
              </Label>
              <Textarea
                id="paymentInstructions"
                placeholder="Send Zelle to: payments@invitationhomesrental.com"
                value={formData.paymentInstructions}
                onChange={(e) =>
                  updateField("paymentInstructions", e.target.value)
                }
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            📋 Conditions (if any)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="coSignerRequired"
                checked={formData.coSignerRequired}
                onCheckedChange={(checked) =>
                  updateField("coSignerRequired", checked)
                }
              />
              <Label
                htmlFor="coSignerRequired"
                className="font-normal cursor-pointer"
              >
                Co-signer Required
              </Label>
            </div>
            <div>
              <Label htmlFor="additionalDocs">
                Additional Documentation Needed
              </Label>
              <Textarea
                id="additionalDocs"
                placeholder="e.g., Proof of income, Recent pay stubs"
                value={formData.additionalDocs}
                onChange={(e) => updateField("additionalDocs", e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="otherConditions">Other Conditions</Label>
              <Textarea
                id="otherConditions"
                placeholder="Any other conditions or requirements"
                value={formData.otherConditions}
                onChange={(e) => updateField("otherConditions", e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Important Dates */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            📅 Important Dates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="depositDueBy">Deposit & First Month Due By</Label>
              <Input
                id="depositDueBy"
                type="date"
                value={formData.depositDueBy}
                onChange={(e) => updateField("depositDueBy", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="moveInDate">Move-in Date</Label>
              <Input
                id="moveInDate"
                type="date"
                value={formData.moveInDate}
                onChange={(e) => updateField("moveInDate", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="leaseSigningDate">
                Lease Signing Appointment (Date & Time)
              </Label>
              <Input
                id="leaseSigningDate"
                type="datetime-local"
                value={formData.leaseSigningDate}
                onChange={(e) =>
                  updateField("leaseSigningDate", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            📝 Additional Notes
          </h3>
          <div>
            <Label htmlFor="additionalNotes">
              Special Terms, Property Rules, or Other Information
            </Label>
            <Textarea
              id="additionalNotes"
              placeholder="Any additional information for the tenant"
              value={formData.additionalNotes}
              onChange={(e) => updateField("additionalNotes", e.target.value)}
              rows={4}
            />
          </div>
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
              PDF generated successfully! Your download should start
              automatically.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? "Generating PDF..." : "Generate Approval Letter PDF"}
        </Button>
      </CardContent>
    </Card>
  );
}
