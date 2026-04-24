"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Loader2, CheckCircle, RefreshCw, Printer, ShieldCheck, Send } from "lucide-react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendRentalDocumentEmail } from "./actions";

export default function RentalDocumentPage() {
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [tenantEmail, setTenantEmail] = useState("");
  const documentRef = useRef<HTMLDivElement>(null);

  const getPdfData = async () => {
    const element = documentRef.current;
    if (!element) return null;

    const width = element.offsetWidth;
    const height = element.offsetHeight;
    
    const dataUrl = await toJpeg(element, { 
      pixelRatio: 2, 
      quality: 1,
      width,
      height
    });
    
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [width, height],
    });

    pdf.addImage(dataUrl, "JPEG", 0, 0, width, height);
    return { pdf, width, height };
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const result = await getPdfData();
      if (!result) return;
      
      result.pdf.save(`Invitation_Homes_Statement_3257_Trafalgar.pdf`);
      
      setComplete(true);
      setTimeout(() => setComplete(false), 3000);
    } catch (error) {
      console.error("Error generating PDF", error);
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!tenantEmail) {
      toast.error("Please enter a tenant email address");
      return;
    }

    try {
      setIsSending(true);
      const result = await getPdfData();
      if (!result) return;

      const pdfBase64 = result.pdf.output("datauristring").split(",")[1];
      const fileName = `Invitation_Homes_Statement_3257_Trafalgar.pdf`;

      const response = await sendRentalDocumentEmail(tenantEmail, pdfBase64, fileName);

      if (response.success) {
        toast.success("Statement sent successfully to tenant!");
        setTenantEmail("");
      } else {
        toast.error(response.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email", error);
      toast.error("An unexpected error occurred while sending");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 shadow-xl sticky top-8">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Document Portal</CardTitle>
              </div>
              <CardDescription>
                Official Leasing & Payment Documentation System
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500 font-medium">Property</span>
                  <span className="font-bold">3257 Trafalgar Ave</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500 font-medium">Broker</span>
                  <span className="font-bold">Brooke Kelley</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Agreement</span>
                  <span className="text-blue-700 font-bold uppercase">Pending Execution</span>
                </div>
              </div>

              {/* Email Section */}
              <div className="space-y-3 pt-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500">Send to Tenant</Label>
                <div className="flex gap-2">
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="tenant@example.com" 
                    value={tenantEmail}
                    onChange={(e) => setTenantEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendEmail} 
                    disabled={isSending || !tenantEmail}
                    size="icon"
                    className="bg-slate-900 hover:bg-slate-800 shrink-0"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button 
                  onClick={handleDownload} 
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : complete ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <Download className="w-5 h-5 mr-2" />
                  )}
                  {loading ? "Capturing Document..." : complete ? "PDF Downloaded" : "Download Official PDF"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-2" />
                  Local Print (Raw)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live HTML Document Preview */}
        <div className="lg:col-span-8 flex justify-center">
          <div 
            ref={documentRef}
            className="bg-white w-[816px] shadow-2xl p-16 relative overflow-hidden"
            style={{ 
              fontFamily: "'Times New Roman', serif", // More traditional legal look
              minHeight: "1056px" // Standard 8.5x11 aspect ratio approx
            }}
          >
            {/* Red Round Stamp Overlay */}
            <div className="absolute top-[350px] right-[80px] opacity-80 pointer-events-none transform rotate-[-8deg] z-50">
              <div 
                className="w-40 h-40 border-4 border-red-700 rounded-full flex items-center justify-center relative p-2"
                style={{
                  filter: 'url(#distressed-stamp)',
                }}
              >
                {/* SVG Filter for distress effect */}
                <svg className="hidden">
                  <defs>
                    <filter id="distressed-stamp">
                      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                    </filter>
                  </defs>
                </svg>

                <div className="w-full h-full border-2 border-red-700 rounded-full flex flex-col items-center justify-center text-center p-1">
                  <img 
                    src="https://dokumfe7mps0i.cloudfront.net/media/logos/2022/06/283238_1655844560.7826822_InvitationHomesBoldedcmykRevLogo.png" 
                    className="h-4 mb-2" 
                    style={{ filter: 'invert(16%) sepia(89%) saturate(6011%) hue-rotate(357deg) brightness(97%) contrast(110%)' }} // Match red-700 approx
                  />
                  <div className="text-[9px] font-bold text-red-700 uppercase leading-none mb-1">Invitation Homes</div>
                  <div className="h-[1px] w-20 bg-red-700 mb-1" />
                  <div className="text-xl font-black text-red-700 uppercase tracking-tighter leading-none py-1">OFFICIAL</div>
                  <div className="text-xl font-black text-red-700 uppercase tracking-tighter leading-none mb-1">SEAL</div>
                  <div className="h-[1px] w-20 bg-red-700 mt-1" />
                </div>

                {/* Curved Text in Seal (Circular) */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <defs>
                    <path id="circlePath" d="M 80, 80 m -65, 0 a 65,65 0 1,1 130,0 a 65,65 0 1,1 -130,0" />
                  </defs>
                  <text className="fill-red-700 text-[10px] uppercase font-bold tracking-[0.3em]">
                    <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                      • Corporate Leasing Division • Verified Receipt •
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-8">
              <div className="space-y-1">
                <img 
                  src="https://dokumfe7mps0i.cloudfront.net/media/logos/2022/06/283238_1655844560.7826822_InvitationHomesBoldedcmykRevLogo.png" 
                  alt="Invitation Homes Official Logo" 
                  className="h-14 object-contain mb-4"
                />
                <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Statement of Account & Occupancy Intent</h1>
              </div>
              <div className="text-right text-sm">
                <p className="font-bold">Transaction ID: IH-{(Math.random() * 1000000).toFixed(0)}</p>
                <p>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p>Status: <span className="text-red-700 font-bold uppercase">Pending Indexing</span></p>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-8 text-slate-800">
              
              {/* Recipient Details */}
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h3 className="font-bold border-b border-slate-300 pb-1 uppercase text-xs">Subject Property:</h3>
                  <p className="text-md font-bold leading-tight">
                    3257 Trafalgar Ave,<br />
                    East Stroudsburg, PA 18302
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold border-b border-slate-300 pb-1 uppercase text-xs">Primary Leaseholders:</h3>
                  <p className="text-md font-bold">
                    Ms McKenzien Elizabeth Cowley<br />
                    Ms Rebecca Cathrine Bardsley
                  </p>
                </div>
              </div>

              {/* Verified Payments Table */}
              <div className="space-y-4">
                <h3 className="font-bold uppercase text-xs">Verified Funds Received (Processed via Chime):</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-800 font-bold text-xs uppercase">
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Description</th>
                      <th className="py-2 px-4 text-left">Reference Number</th>
                      <th className="py-2 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-200">
                      <td className="py-3 px-4 italic">2026-04-16</td>
                      <td className="py-3 px-4">Application/Background Screening (Cowley)</td>
                      <td className="py-3 px-4 font-mono text-xs uppercase">txn AN0200</td>
                      <td className="py-3 px-4 text-right font-bold">$70.00</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-3 px-4 italic">2026-04-16</td>
                      <td className="py-3 px-4">Application/Background Screening (Bardsley)</td>
                      <td className="py-3 px-4 font-mono text-xs uppercase">txn YE9LZ6</td>
                      <td className="py-3 px-4 text-right font-bold">$70.00</td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <td className="py-3 px-4 italic">2026-04-17</td>
                      <td className="py-3 px-4 font-bold uppercase">Initial Security Deposit & Holding Fee</td>
                      <td className="py-3 px-4 font-mono text-xs uppercase">txn 3YNS7N</td>
                      <td className="py-3 px-4 text-right font-bold">$600.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-800 text-md font-bold">
                      <td colSpan={3} className="py-4 px-4 text-right uppercase">Total Consolidated Credits:</td>
                      <td className="py-4 px-4 text-right text-lg">$740.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Legal & Processing Requirements */}
              <div className="space-y-6 pt-4">
                <h3 className="font-bold border-b border-slate-300 pb-1 uppercase text-xs">Managerial & Legal Indexing Requirements:</h3>
                
                <div className="space-y-4 text-sm leading-relaxed text-justify">
                  <p>
                    <strong>1. TENANT RECOGNITION & INDEXING:</strong> Invitation Homes requires a one-time rent fee of <strong>$1,000.00</strong> to complete the formal digital indexing process. This indexing is mandatory to register the above-named individuals as the recurring tenants of record for 3257 Trafalgar Ave within our portfolio systems.
                  </p>
                  
                  <p>
                    <strong>2. LEASE EXECUTION & POSSESSION:</strong> Management expects the formal lease agreement to be executed and physical keys to be handed over <strong>ASAP</strong> following the completion of the indexing process to ensure immediate occupancy and possession of the dwelling.
                  </p>
                  
                  <p className="bg-slate-100 p-4 border-l-4 border-slate-800 italic">
                    <strong>3. MANDATORY REFUND DISCLOSURE:</strong> Under the requirements of <strong>State Law</strong>, Invitation Homes is legally required to refund all payments made to date (currently totaling $740.00) in the event that the formal lease agreement is not signed by all parties or if physical possession (handing over of keys) has not been completed. All fees remain fully refundable until the moment of lease execution.
                  </p>
                </div>
              </div>

              {/* Signature Block */}
              <div className="pt-12 flex justify-between items-start">
                <div className="space-y-6 w-1/2">
                  <p className="text-xs uppercase font-bold text-slate-500">Authorized Realtor / Agent in Charge:</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-serif italic border-b border-slate-400 pb-1 text-slate-900 leading-none">Brooke Kelley</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ms. Brooke Kelley | Senior Leasing Specialist</p>
                    <p className="text-[10px] text-slate-400">Invitation Homes - PA District</p>
                  </div>
                </div>
                
                <div className="w-1/3 flex flex-col items-center">
                  <div className="w-full h-[1px] bg-slate-300 mb-2 mt-12" />
                  <p className="text-[10px] font-bold uppercase text-slate-400 text-center">Tenant Acknowledgment Date</p>
                </div>
              </div>
            </div>

            {/* Official Footer */}
            <div className="absolute bottom-12 left-16 right-16 border-t border-slate-200 pt-6 flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
              <span>www.invitationhomes.com</span>
              <span>Pennsylvania Division</span>
              <span>Prop ID: 3257-TRAF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
