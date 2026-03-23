"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { Download, FileText, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { sendReceiptEmail } from "./actions";

export default function ReceiptsPage() {
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    tenantEmail: "",
    attorneyName: "",
    realtorName: "",
    tenantName: "",
    paymentType: "Bank Transfer",
    referenceNumber: "",
    paymentId: "",
    receiptType: "Rent",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    propertyAddress: "",
  });

  const receiptRef = useRef<HTMLDivElement>(null);

  const generateRandomId = (field: "referenceNumber" | "paymentId", prefix: string) => {
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, [field]: `${prefix}-${randomChars}` }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const downloadPDF = async () => {
    const element = receiptRef.current;
    if (!element) return;

    try {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      
      const dataUrl = await toJpeg(element, { 
        pixelRatio: 1.5, 
        quality: 0.85,
        width,
        height
      });
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [width, height],
      });

      pdf.addImage(dataUrl, "JPEG", 0, 0, width, height);
      pdf.save(`receipt-${formData.receiptType.toLowerCase().replace(/\s+/g, '-')}-${formData.date}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    }
  };

  const handleSendEmail = async () => {
    if (!formData.tenantEmail) {
      toast.error("Please enter a tenant email address.");
      return;
    }
    const element = receiptRef.current;
    if (!element) return;

    try {
      setIsSending(true);
      const width = element.offsetWidth;
      const height = element.offsetHeight;

      const dataUrl = await toJpeg(element, { 
        pixelRatio: 1.5, 
        quality: 0.85,
        width,
        height
      });
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [width, height],
      });

      pdf.addImage(dataUrl, "JPEG", 0, 0, width, height);
      
      const pdfBase64 = pdf.output("datauristring").split(",")[1];
      const fileName = `receipt-${formData.receiptType.toLowerCase().replace(/\s+/g, '-')}-${formData.date}.pdf`;

      const result = await sendReceiptEmail(
        formData.tenantEmail,
        formData.tenantName,
        formData.receiptType,
        pdfBase64,
        fileName
      );

      if (result.success) {
        toast.success("Receipt emailed successfully!");
      } else {
        toast.error(result.error || "Failed to send receipt.");
      }
    } catch (error) {
      console.error("Error emailing PDF", error);
      toast.error("An error occurred while sending the email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 lg:space-y-0 lg:flex lg:gap-8">
      {/* Form Section */}
      <div className="w-full lg:w-1/2 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight flex items-center gap-2">
          <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
          Receipt Generator
        </h1>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
            <CardDescription>Fill in the details to generate a secure, real-looking receipt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Receipt Type</Label>
                <Select
                  value={formData.receiptType}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, receiptType: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rent">Rent</SelectItem>
                    <SelectItem value="Application Fee">Application Fee</SelectItem>
                    <SelectItem value="Security Deposit">Security Deposit</SelectItem>
                    <SelectItem value="Late Fee">Late Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input type="number" name="amount" placeholder="e.g. 1500.00" value={formData.amount} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Input type="text" name="paymentType" placeholder="e.g. Bank Transfer, Cash" value={formData.paymentType} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Tenant Name</Label>
                <Input type="text" name="tenantName" placeholder="John Doe" value={formData.tenantName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Realtor Name</Label>
                <Input type="text" name="realtorName" placeholder="Jane Smith" value={formData.realtorName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Attorney Name</Label>
                <Input type="text" name="attorneyName" placeholder="Law Firm LLC" value={formData.attorneyName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Reference Number</Label>
                <div className="flex space-x-2">
                  <Input type="text" name="referenceNumber" placeholder="REF-12345" value={formData.referenceNumber} onChange={handleInputChange} />
                  <Button type="button" variant="outline" size="icon" onClick={() => generateRandomId("referenceNumber", "REF")}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment ID</Label>
                <div className="flex space-x-2">
                  <Input type="text" name="paymentId" placeholder="TXN-98765" value={formData.paymentId} onChange={handleInputChange} />
                  <Button type="button" variant="outline" size="icon" onClick={() => generateRandomId("paymentId", "TXN")}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Property Address</Label>
                <Input type="text" name="propertyAddress" placeholder="123 Main St, Apt 4B" value={formData.propertyAddress} onChange={handleInputChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Tenant Email</Label>
                <Input type="email" name="tenantEmail" placeholder="tenant@example.com" value={formData.tenantEmail} onChange={handleInputChange} />
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={handleSendEmail} className="w-full h-12 text-md font-semibold" disabled={!formData.amount || !formData.tenantName || !formData.tenantEmail || isSending}>
                {isSending ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                {isSending ? "Sending Receipt..." : "Send Receipt to Tenant"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <div className="w-full lg:w-1/2 flex items-start sm:items-center justify-start sm:justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 lg:p-8 overflow-x-auto relative min-h-[400px]">
        <div
          ref={receiptRef}
          className="bg-[#ffffff] w-[500px] sm:w-[600px] max-w-none shrink-0 p-6 sm:p-10 relative overflow-hidden text-[#1f2937] mx-auto"
          style={{
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            fontFamily: "'Courier New', Courier, monospace", // classic receipt vibe
          }}
        >
          {/* Subtle background texture array */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '15px 15px' }} />

          {/* Date Stamp */}
          {(formData.amount && formData.tenantName) ? (
            <div 
              className="absolute top-[30%] left-[50%] sm:left-[60%] -translate-x-1/2 -translate-y-1/2 pointer-events-none transform -rotate-[15deg] flex flex-col items-center justify-center border-[6px] border-double border-[#dc2626] rounded-full w-48 h-48 sm:w-56 sm:h-56 z-10 mix-blend-multiply opacity-50"
            >
              <div className="text-[#dc2626] font-serif text-2xl tracking-widest uppercase mt-4">
                RECEIVED
              </div>
              <div className="text-[#dc2626] font-mono font-bold text-lg tracking-[0.2em] mt-3 border-t-2 border-b-2 border-[#dc2626] py-1 px-4 relative">
                {formData.date ? new Date(formData.date).toLocaleDateString() : "____/____/____"}
              </div>
              <div className="text-[#dc2626] font-sans text-xs font-bold tracking-widest uppercase mt-3">
                INVITATION HOMES
              </div>
            </div>
          ) : null}

          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-[#1f2937] pb-6 mb-6 relative z-0">
            <div>
              {/* Logo on Top */}
              <img src="/invitation-home.png" alt="Invitation Homes Logo" className="h-16 mb-4 object-contain max-w-[200px]" />
              <h2 className="text-3xl font-bold tracking-tight uppercase">OFFICIAL RECEIPT</h2>
              <p className="text-sm mt-1 text-[#6b7280] font-sans">Payment Confirmation Document</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">No. {(formData.paymentId || "000000").substring(0,6).toUpperCase()}</p>
              <p className="text-sm">Date: {formData.date || "____/____/____"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 relative z-0">
            <div>
              <p className="text-sm text-[#6b7280] font-sans uppercase font-bold mb-1">Received From:</p>
              <p className="text-xl font-bold border-b border-dotted border-[#9ca3af] pb-1 break-words">{formData.tenantName || "____________________"}</p>
            </div>
            <div>
              <p className="text-sm text-[#6b7280] font-sans uppercase font-bold mb-1">Amount:</p>
              <p className="text-2xl font-bold text-[#1e40af] border-b border-dotted border-[#9ca3af] pb-1">
                ${formData.amount ? parseFloat(formData.amount).toFixed(2) : "0.00"}
              </p>
            </div>
          </div>

          {/* Itemized Info */}
          <table className="w-full mb-8 border-collapse relative z-0">
            <thead>
              <tr className="border-b-[1.5px] border-[#4b5563]">
                <th className="py-2 text-left font-sans uppercase text-sm w-1/2">Description</th>
                <th className="py-2 text-left font-sans uppercase text-sm w-1/2 pl-4 border-l border-[#e5e7eb]">Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e5e7eb] group hover:bg-[#f9fafb]">
                <td className="py-3 font-semibold">Payment For</td>
                <td className="py-3 pl-4 border-l border-[#e5e7eb] font-bold">{formData.receiptType}</td>
              </tr>
              <tr className="border-b border-[#e5e7eb] group hover:bg-[#f9fafb]">
                <td className="py-3 font-semibold">Payment Method</td>
                <td className="py-3 pl-4 border-l border-[#e5e7eb]">{formData.paymentType || "-"}</td>
              </tr>
              <tr className="border-b border-[#e5e7eb] group hover:bg-[#f9fafb]">
                <td className="py-3 font-semibold">Reference Number</td>
                <td className="py-3 pl-4 border-l border-[#e5e7eb] text-sm">{formData.referenceNumber || "-"}</td>
              </tr>
              <tr className="border-b border-[#e5e7eb] group hover:bg-[#f9fafb]">
                <td className="py-3 font-semibold">Payment ID</td>
                <td className="py-3 pl-4 border-l border-[#e5e7eb] text-sm">{formData.paymentId || "-"}</td>
              </tr>
              <tr className="border-b border-[#e5e7eb] group hover:bg-[#f9fafb]">
                <td className="py-3 font-semibold">Attorney Name</td>
                <td className="py-3 pl-4 border-l border-[#e5e7eb]">{formData.attorneyName || "-"}</td>
              </tr>
              <tr className="border-b border-[#e5e7eb] group hover:bg-[#f9fafb]">
                <td className="py-3 font-semibold">Realtor Name</td>
                <td className="py-3 pl-4 border-l border-[#e5e7eb]">{formData.realtorName || "-"}</td>
              </tr>
              <tr className="border-b border-[#e5e7eb] group hover:bg-[#f9fafb]">
                <td className="py-3 font-semibold">Property Address</td>
                <td className="py-3 pl-4 border-l border-[#e5e7eb]">{formData.propertyAddress || "-"}</td>
              </tr>
            </tbody>
          </table>

          {/* Footer Signatures */}
          <div className="flex justify-between mt-12 pt-8 relative z-0">
            <div className="w-[45%] text-center relative">
              {/* Realistic SVG Signature */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-12 pointer-events-none opacity-80 mix-blend-multiply flex justify-center items-center">
                <svg viewBox="0 0 500 150" className="w-full h-full -rotate-[6deg] text-[#1e3a8a]" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M46 123c-1.3-19 6.7-32 15-44 11-15 26-25 41-36 17-12 36-22 55-32 9.5-4.8 24-11 31-1.3 4.2 5.5 1.5 15-1.9 21-8 15-18 29-29 42-12 14-25 27-40 37-5.1 3.5-22 17-21 1 2.3-25 26-44 47-56 16-9 35-15 54-18 19-3 48-5.7 63 9.4 6 5.9 8.2 15 5.5 23-4 12-16 23-28 29-16 7.6-35 8-52 4.4-17-3.7-33-14-43-28-5.3-7.5-9.6-16-11-26-1.5-10 1.9-22 9.4-28 7.3-6.2 19-6.3 28-3.3 12 3.8 21 14 27 24 5.2 8.5 7.6 18 9 28 2-6.5 5.5-13 11-17 9.8-7.6 25-10 37-5 13 5.4 20 19 25 32 3 6.9 3.5 15 5.5 22-9-19-1-41 15-55 12-10 28-15 44-15 15 0 29 6 42 13 8.3 4.5 15 11 23 16 3.7-6 10-10 16-15 8.3-6.1 19-9.1 29-8.7 13 0.61 24 8.7 33 17 8 8 13 19 15 30 1.2-5.7 3.5-14 9.1-15 4.3-0.78 8.6 1.7 11 5.2 3.1 4.7 3.1 11 1.7 16-1.9 6.7-6.5 13-12 17-9 6.3-22 7.1-32 1"/>
                </svg>
              </div>
              <div className="border-t border-[#000000] mb-2"></div>
              <p className="text-sm font-sans uppercase text-[#4b5563]">Authorized Signature</p>
            </div>
            <div className="w-[45%] text-center">
              <div className="border-t border-[#000000] mb-2"></div>
              <p className="text-sm font-sans uppercase text-[#4b5563]">Tenant Acknowledgment</p>
            </div>
          </div>
          
          {/* Footer Area */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-[#d1d5db] relative z-0 flex flex-col items-center">
            
            <p className="font-bold text-[#1f2937] uppercase tracking-[0.1em] text-sm mb-2">
              Invitation Homes
            </p>
            
            {/* Contact Info */}
            <div className="flex gap-3 text-[11px] text-[#4b5563] font-sans mb-4 uppercase font-semibold">
              <span>contact@invitationhomes.com</span>
              <span>•</span>
              <span>invitationhomes.com</span>
            </div>
            
            <p className="text-[10px] text-[#6b7280] font-sans text-center max-w-sm mb-6 uppercase tracking-wider">
              This receipt is electronically generated and serves as ultimate proof of payment. Please retain for your records. Thank you for your business.
            </p>
            
            {/* Barcode representation */}
            <div className="flex flex-col items-center opacity-80">
              <svg className="h-10 w-64 text-[#111827] mix-blend-multiply" preserveAspectRatio="none" viewBox="0 0 100 20">
                 <rect x="0" y="0" width="2" height="20" fill="currentColor"/>
                 <rect x="4" y="0" width="1" height="20" fill="currentColor"/>
                 <rect x="6" y="0" width="3" height="20" fill="currentColor"/>
                 <rect x="12" y="0" width="2" height="20" fill="currentColor"/>
                 <rect x="15" y="0" width="1" height="20" fill="currentColor"/>
                 <rect x="18" y="0" width="4" height="20" fill="currentColor"/>
                 <rect x="24" y="0" width="1" height="20" fill="currentColor"/>
                 <rect x="28" y="0" width="3" height="20" fill="currentColor"/>
                 <rect x="33" y="0" width="2" height="20" fill="currentColor"/>
                 <rect x="36" y="0" width="5" height="20" fill="currentColor"/>
                 <rect x="43" y="0" width="1" height="20" fill="currentColor"/>
                 <rect x="46" y="0" width="2" height="20" fill="currentColor"/>
                 <rect x="50" y="0" width="4" height="20" fill="currentColor"/>
                 <rect x="56" y="0" width="2" height="20" fill="currentColor"/>
                 <rect x="60" y="0" width="1" height="20" fill="currentColor"/>
                 <rect x="62" y="0" width="3" height="20" fill="currentColor"/>
                 <rect x="67" y="0" width="2" height="20" fill="currentColor"/>
                 <rect x="71" y="0" width="4" height="20" fill="currentColor"/>
                 <rect x="77" y="0" width="1" height="20" fill="currentColor"/>
                 <rect x="80" y="0" width="3" height="20" fill="currentColor"/>
                 <rect x="85" y="0" width="2" height="20" fill="currentColor"/>
                 <rect x="89" y="0" width="5" height="20" fill="currentColor"/>
                 <rect x="96" y="0" width="1" height="20" fill="currentColor"/>
                 <rect x="98" y="0" width="2" height="20" fill="currentColor"/>
              </svg>
              <p className="text-[10px] tracking-[0.4em] font-mono mt-2 text-[#374151] font-bold">
                *{(formData.paymentId || "000000").toUpperCase()}*
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
