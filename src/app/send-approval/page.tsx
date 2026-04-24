"use client";

import { useState, useRef, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { Download, FileText, Send, RefreshCw, User, MapPin, DollarSign, Calendar, ShieldCheck, CheckCircle2, FileCheck, Info, Briefcase, Scale } from "lucide-react";
import { toast } from "sonner";
import { sendLeaseAgreement } from "./actions";

export default function SendLeasePage() {
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    landlordName: "Ron Cummings",
    tenantName: "Ms Jeddah Noel Moon",
    tenantEmail: "",
    propertyAddress: "201 Sanders Rd, Liberty, SC 29657",
    rentAmount: "600",
    securityDeposit: "500",
    lateCharge: "50",
    maxOccupants: "8",
    leaseDate: "2026-04-05",
  });

  const leaseRef = useRef<HTMLDivElement>(null);

  // Helper to extract state for the dynamic state stamp
  const detectedState = useMemo(() => {
    const addr = formData.propertyAddress.toUpperCase();
    const match = addr.match(/,\s*([A-Z]{2})\s*\d{5}/);
    if (match && match[1]) return match[1];
    return "SC";
  }, [formData.propertyAddress]);

  const stateFullName: {[key: string]: string} = {
    "SC": "SOUTH CAROLINA",
    "TX": "TEXAS",
    "FL": "FLORIDA",
    "GA": "GEORGIA",
    "NC": "NORTH CAROLINA",
    "TN": "TENNESSEE",
    "AZ": "ARIZONA",
    "NV": "NEVADA",
    "CA": "CALIFORNIA",
  };

  const stateName = stateFullName[detectedState] || "SOUTH CAROLINA";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const downloadPDF = async () => {
    const element = leaseRef.current;
    if (!element) return;

    try {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      
      const dataUrl = await toJpeg(element, { 
        pixelRatio: 2, 
        quality: 0.98,
        width,
        height,
        backgroundColor: "#ffffff"
      });
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [width, height],
      });

      pdf.addImage(dataUrl, "JPEG", 0, 0, width, height);
      pdf.save(`CERTIFIED-LEASE-${formData.tenantName.toUpperCase().replace(/\s+/g, '-')}.pdf`);
      toast.success("Certified Document Archive Generated");
    } catch (error) {
      console.error("Error generating PDF", error);
      toast.error("Generation failed");
    }
  };

  const handleSendEmail = async () => {
    if (!formData.tenantEmail) {
      toast.error("Tenant Email is required.");
      return;
    }
    const element = leaseRef.current;
    if (!element) return;

    try {
      setIsSending(true);
      const width = element.offsetWidth;
      const height = element.offsetHeight;

      const dataUrl = await toJpeg(element, { 
        pixelRatio: 2, 
        quality: 0.9,
        width,
        height,
        backgroundColor: "#ffffff"
      });
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [width, height],
      });

      pdf.addImage(dataUrl, "JPEG", 0, 0, width, height);
      
      const pdfBase64 = pdf.output("datauristring").split(",")[1];
      const fileName = `Lease_Agreement_${formData.tenantName.replace(/\s+/g, '_')}.pdf`;

      const submissionData = new FormData();
      submissionData.append("email", formData.tenantEmail);
      submissionData.append("fullName", formData.tenantName);
      submissionData.append("propertyAddress", formData.propertyAddress);
      
      const blob = await (await fetch(`data:application/pdf;base64,${pdfBase64}`)).blob();
      const file = new File([blob], fileName, { type: "application/pdf" });
      submissionData.append("pdf", file);

      const result = await sendLeaseAgreement(submissionData);

      if (result.message && result.message.includes("successfully")) {
        toast.success("Document Finalized & Dispatched!");
      } else {
        toast.error(result.message || "Failed to dispatch.");
      }
    } catch (error) {
      toast.error("Dispatch error.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#d1d5db] overflow-hidden">
      {/* Sidebar Control Panel */}
      <div className="w-full lg:w-[420px] h-full bg-slate-50 border-r border-slate-300 overflow-y-auto z-10 flex flex-col shadow-2xl">
        <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-xl shadow-slate-300">
                <Scale className="text-white w-6 h-6" />
             </div>
             <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">LeaseForge</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Enterprise Edition v3.5</p>
             </div>
          </div>
        </div>

        <div className="p-8 space-y-8 flex-1">
          {/* Section 1: Parties */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">01. Contract Identity</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase">Landlord Name</Label>
                <Input name="landlordName" value={formData.landlordName} onChange={handleInputChange} className="h-11 bg-white border-slate-200 focus:ring-black font-bold text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase">Tenant Name</Label>
                <Input name="tenantName" value={formData.tenantName} onChange={handleInputChange} className="h-11 bg-white border-slate-200 focus:ring-black font-bold text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase">Dispatch Email</Label>
                <Input name="tenantEmail" type="email" placeholder="tenant@secure.com" value={formData.tenantEmail} onChange={handleInputChange} className="h-11 bg-white border-slate-200" />
              </div>
            </div>
          </div>

          {/* Section 2: Property & Financials */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
             <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">02. Financial & Premises</h3>
             
             <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-slate-400 uppercase">Premises Address</Label>
              <Textarea name="propertyAddress" value={formData.propertyAddress} onChange={handleInputChange} rows={2} className="bg-white border-slate-200 font-bold text-xs resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase">Monthly Rent</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 font-bold text-slate-400 text-sm">$</span>
                  <Input name="rentAmount" type="number" value={formData.rentAmount} onChange={handleInputChange} className="h-11 bg-white border-slate-200 pl-7 font-black text-blue-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase">Sec. Deposit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 font-bold text-slate-400 text-sm">$</span>
                  <Input name="securityDeposit" type="number" value={formData.securityDeposit} onChange={handleInputChange} className="h-11 bg-white border-slate-200 pl-7 font-black text-green-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase">Late Charge</Label>
                <Input name="lateCharge" type="number" value={formData.lateCharge} onChange={handleInputChange} className="h-11 bg-white border-slate-200 font-bold" />
              </div>
               <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase">Effective Date</Label>
                <Input name="leaseDate" type="date" value={formData.leaseDate} onChange={handleInputChange} className="h-11 bg-white border-slate-200 font-bold" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Tray */}
        <div className="p-8 bg-black space-y-4">
           <Button onClick={handleSendEmail} className="w-full h-14 text-xs font-black bg-white hover:bg-slate-100 text-black shadow-2xl transition-all active:scale-[0.98] group rounded-none" disabled={isSending}>
              {isSending ? (
                <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
              {isSending ? "DISPATCHING DOCUMENT..." : "FINALIZE & DISPATCH TO TENANT"}
           </Button>
           <Button 
              onClick={downloadPDF} 
              className="w-full h-11 text-[10px] font-black bg-transparent hover:bg-white/10 text-white border border-white/20 transition-all rounded-none"
            >
              DOWNLOAD CERTIFIED ARCHIVE
           </Button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-slate-400 overflow-y-auto p-4 sm:p-20 flex justify-center items-start">
        <div
          ref={leaseRef}
          className="bg-white w-[816px] min-h-[1056px] relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] flex flex-col items-center"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          {/* Ultra-Realistic Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-multiply z-[100]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />
          
          <div className="w-full h-full p-[80px] pt-[60px] pb-[40px] flex flex-col relative overflow-hidden bg-white">
            
            {/* Multi-Stamp Header */}
            <div className="flex justify-between items-start mb-10 w-full relative">
              <div className="w-3/5">
                <img src="/invitation-home.png" alt="IH" className="h-8 mb-4 grayscale brightness-0" />
                <div className="space-y-0.5">
                   <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Document Control IH-SEC-{(new Date().getTime().toString().slice(-6))}</p>
                   <h1 className="text-3xl font-black uppercase tracking-tighter text-black leading-none mb-1">RESIDENTIAL LEASE AGREEMENT</h1>
                   <h2 className="text-[12px] font-bold italic text-slate-500 uppercase tracking-widest leading-none">Binding Legal Instrument • Certified Original</h2>
                </div>
              </div>

              {/* RECORDING STAMP (Top Right) */}
              <div className="flex flex-col items-end gap-3 translate-y-[-10px]">
                 <div className="border-[3px] border-black p-1.5 text-center w-28 rotate-[2deg] shadow-sm bg-white">
                    <p className="text-[7px] font-black leading-none mb-0.5 uppercase">Filed for Record</p>
                    <p className="text-[12px] font-black leading-none mb-0.5">{new Date().toLocaleDateString()}</p>
                    <p className="text-[6px] font-black leading-none mb-0.5">Office of Unified Registry</p>
                    <div className="h-[1px] bg-black w-full my-0.5" />
                    <p className="text-[7px] font-black">VOL: 9942 | PAGE: 201</p>
                 </div>
                 
                 {/* STATE SEAL STAMP */}
                 <div className="mr-4 pointer-events-none opacity-[0.85] scale-[1.0] mix-blend-multiply transition-all">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                       <circle cx="60" cy="60" r="55" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                       <circle cx="60" cy="60" r="48" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="3 2" />
                       <path id="txtPath" d="M 15, 60 A 45,45 0 1,1 105,60" fill="none" />
                       <text className="fill-[#2563eb] font-sans font-black text-[7.5px] uppercase tracking-[0.2em]">
                          <textPath href="#txtPath" startOffset="50%" textAnchor="middle">State of {stateName} Registered</textPath>
                       </text>
                       <text x="60" y="58" textAnchor="middle" className="fill-[#2563eb] font-serif text-[16px] font-black uppercase tracking-tighter">OFFICIALLY</text>
                       <text x="60" y="75" textAnchor="middle" className="fill-[#2563eb] font-serif text-[16px] font-black uppercase tracking-tighter">VERIFIED</text>
                       <rect x="35" y="85" width="50" height="0.5" fill="#2563eb" />
                       <text x="60" y="98" textAnchor="middle" className="fill-[#2563eb] font-sans text-[6px] font-black uppercase tracking-widest leading-none">Cert: IH-{(new Date().getTime().toString().slice(-4))}</text>
                    </svg>
                 </div>
              </div>
            </div>

            {/* Content Body - FULL RESTORED TEXT */}
            <div className="space-y-4 text-[13.5px] leading-[1.55] text-justify text-[#09090b] flex-1">
               <section>
                 <p className="font-black border-b-[1.5px] border-black inline-block mb-1.5 uppercase tracking-tighter text-[11px]">ARTICLE I: EXECUTING PARTIES AND PREMISES</p>
                 <p>
                   THIS RESIDENTIAL LEASE AGREEMENT (hereinafter referred to as the "Agreement") is entered into between <span className="font-black bg-slate-100/50 border-b border-black px-1 uppercase">{formData.landlordName || "Ron Cummings"}</span> (Herein after referred to as "Landlord") and <span className="font-black bg-slate-100/50 border-b border-black px-1 uppercase">{formData.tenantName || "Ms Jeddah Noel Moon"}</span> (Herein after referred to as "Tenant"). Tenant is and severally liable for the of rent and performance of all other terms of this agreement which will be valid for a year. The property is situated at <span className="font-black italic bg-slate-50 px-1 border-b-[0.5px] border-black select-all">{formData.propertyAddress}</span>.
                 </p>
               </section>

               <section>
                 <p className="font-black border-b-[1.5px] border-black inline-block mb-1.5 uppercase tracking-tighter text-[11px]">ARTICLE II: FINANCIAL CONSIDERATIONS</p>
                 <p>
                   2.1 PAYMENT OF RENT: Tenant agrees to pay rent monthly, in advance, no later than due date of each and every month. The rent payable each month will be the amount of <span className="font-black underline underline-offset-2">${formData.rentAmount}</span> including all utilities (Gas, Electricity, & Garbage) with a deposit of <span className="font-black underline underline-offset-2">${formData.securityDeposit}</span> to be paid to landlord or the attorney.
                 </p>
                 <p className="mt-1.5">
                   2.2 LATE CHARGES: If Tenant fails to pay the rent in full before 25th of every month, Tenant will be assessed a late charge of <span className="font-black text-red-700 underline decoration-red-700 decoration-1">${formData.lateCharge}</span>. Landlord reserves and in no way waives the right to insist on payment of the rent in full on the date it is due.
                 </p>
               </section>

               <section>
                 <p className="font-black border-b-[1.5px] border-black inline-block mb-1.5 uppercase tracking-tighter text-[11px]">ARTICLE III: OCCUPANCY AND PERMITTED USE</p>
                 <p>
                   The premises are to be used only as a private residence for Tenant(s) listed as parties of this Agreement. The premises shall be occupied by no more than <span className="font-black">({formData.maxOccupants})</span> persons, including children. The premises shall not be used for any purpose other than a private residence without the prior written consent of the Landlord.
                 </p>
               </section>

               <section>
                 <p className="font-black border-b-[1.5px] border-black inline-block mb-1.5 uppercase tracking-tighter text-[11px]">ARTICLE IV: LEGAL COMPLIANCE AND CONDUCT</p>
                 <p>
                   Tenant, guests and invitees of either tenant or guests shall not use the premises for any unlawful purpose and shall comply fully with all applicable federal, state and local laws and ordinances, including laws prohibiting the use, possession or sale of illegal drugs. Nor shall Tenant, guests and invitees of either tenant or guests use the premises in a manner offensive to others. Nor shall Tenant, guests and invitees of either tenant or guests create a nuisance by annoying, disturbing, inconveniencing or interfering with the quiet enjoyment of any other tenant or nearby resident.
                 </p>
               </section>

               <section>
                 <p className="font-black border-b-[1.5px] border-black inline-block mb-1.5 uppercase tracking-tighter text-[11px]">ARTICLE V: VEHICLE PARKING REGULATION</p>
                 <p>
                   No automobile, truck, motorcycle, trailers or other such vehicles shall be parked on the property without current license plates and said vehicles must be in operating condition. Such vehicles may be parked in driveways or other designated parking area, if provided, or in the street.
                 </p>
               </section>

               <section>
                 <p className="font-black border-b-[1.5px] border-black inline-block mb-1.5 uppercase tracking-tighter text-[11px]">ARTICLE VI: LANDLORD RIGHT OF ACCESS</p>
                 <p>
                   In the event of an emergency, to make repairs or improvements or to show the premises to prospective buyers or tenants, Landlord or Landlord's duly authorized agents may enter the premises. Except in cases of emergency, Landlord shall give Tenant two (2) days notice before entering.
                 </p>
               </section>
            </div>

            {/* Signature Area with Main Approval Stamp */}
            <div className="mt-10 pt-10 border-t-2 border-slate-900 relative">
               <div className="grid grid-cols-2 gap-16 relative z-10">
                  <div className="space-y-4">
                     <div className="absolute top-[20px] left-0 pointer-events-none opacity-[0.85] scale-[1.1] z-20 mix-blend-multiply">
                        <svg viewBox="0 0 500 150" className="w-[180px] h-auto -rotate-[3deg] text-blue-900" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M46 123c-1.3-19 6.7-32 15-44 11-15 26-25 41-36 17-12 36-22 55-32 9.5-4.8 24-11 31-1.3 4.2 5.5 1.5 15-1.9 21-8 15-18 29-29 42-12 14-25 27-40 37-5.1 3.5-22 17-21 1 2.3-25 26-44 47-56 16-9 35-15 54-18 19-3 48-5.7 63 9.4 6 5.9 8.2 15 5.5 23-4 12-16 23-28 29-16 7.6-35 8-52 4.4-17-3.7-33-14-43-28-5.3-7.5-9.6-16-11-26-1.5-10 1.9-22 9.4-28 7.3-6.2 19-6.3 28-3.3 12 3.8 21 14 27 24 5.2 8.5 7.6 18 9 28 2-6.5 5.5-13 11-17 9.8-7.6 25-10 37-5 13 5.4 20 19 25 32 3 6.9 3.5 15 5.5 22-9-19-1-41 15-55 12-10 28-15 44-15 15 0 29 6 42 13 8.3 4.5 15 11 23 16 3.7-6 10-10 16-15 8.3-6.1 19-9.1 29-8.7 13 0.61 24 8.7 33 17 8 8 13 19 15 30 1.2-5.7 3.5-14 9.1-15 4.3-0.78 8.6 1.7 11 5.2 3.1 4.7 3.1 11 1.7 16-1.9 6.7-6.5 13-12 17-9 6.3-22 7.1-32 1"/>
                        </svg>
                     </div>
                     <div className="h-[2.5px] bg-black w-full" />
                     <p className="text-[9px] font-black uppercase text-slate-900 tracking-tighter">Approved Corporate Execution (Landlord)</p>
                  </div>
                  <div className="space-y-4">
                     <div className="h-[2.5px] bg-black w-full" />
                     <p className="text-[9px] font-black uppercase text-slate-400 italic tracking-tighter">Awaiting Remote Electronic Execution (Tenant)</p>
                  </div>
               </div>

               {/* MAIN APPROVAL STAMP */}
               <div className="absolute top-[-60px] left-[32%] pointer-events-none transform -rotate-[8deg] z-10 select-none drop-shadow-xl saturate-[1.2]">
                  <svg width="240" height="240" viewBox="0 0 240 240">
                     <defs>
                        <filter id="inkSplat">
                           <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" seed="120" result="noise" />
                           <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
                        </filter>
                     </defs>
                     <g filter="url(#inkSplat)" style={{ fill: '#dc2626', stroke: '#dc2626', fillOpacity: 0.82 }}>
                        <rect x="25" y="90" width="190" height="60" fill="none" strokeWidth="4" />
                        <rect x="30" y="95" width="180" height="50" fill="none" strokeWidth="1" strokeDasharray="2 1" />
                        <text x="120" y="82" textAnchor="middle" className="font-sans font-black text-[11px] uppercase tracking-[0.3em]">VALIDATION CLEARANCE</text>
                        <text x="120" y="130" textAnchor="middle" className="font-serif text-[36px] font-black uppercase tracking-tighter">APPROVED</text>
                        <text x="120" y="165" textAnchor="middle" className="font-mono text-[14px] font-bold tracking-[0.25em]">{formData.leaseDate}</text>
                        <text x="120" y="185" textAnchor="middle" className="font-sans text-[8px] font-black uppercase tracking-widest leading-none">INVITATION HOMES LEGAL COUNSEL DIVISION</text>
                     </g>
                  </svg>
               </div>
            </div>

            {/* Legal Footnote */}
            <div className="mt-auto pt-8 flex justify-between items-end border-t border-slate-200">
               <div className="flex flex-col gap-1.5 opacity-60">
                  <div className="flex gap-1">
                     <div className="w-7 h-7 border-[2px] border-black flex items-center justify-center text-[9px] font-black">ORIG</div>
                     <div className="w-7 h-7 border-[2px] border-black flex items-center justify-center text-[9px] font-black">CP</div>
                  </div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">© 2026 INVITATION HOMES • OFFICE OF COMPLIANCE</p>
               </div>
               
               <div className="text-right">
                  <p className="text-[11px] font-black uppercase tracking-widest border-b-[2px] border-black inline-block px-1 mb-1">INT: _______ / _______</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Document Authenticated via Blockchain Registry</p>
               </div>
            </div>
          </div>

          {/* BINDER EDGE (Punch Holes) */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-50 border-r border-slate-100 flex flex-col items-center pt-24 gap-36 pointer-events-none opacity-20 select-none">
             {[1, 2, 3].map(i => <div key={i} className="w-4 h-4 rounded-full border-[1.5px] border-slate-400" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
