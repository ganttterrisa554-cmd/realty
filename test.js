"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// test.js
var resend_1 = require("resend");
var buffer_1 = require("buffer");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var pdf_lib_1 = require("pdf-lib");
function fillW4EmployerFields(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var inputPdfPath, pdfBytes, pdfDoc, form, modifiedPdf;
        var startDate = _b.startDate, ein = _b.ein, companyAddress = _b.companyAddress;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    inputPdfPath = path_1.default.join(process.cwd(), "public", "fw4.pdf");
                    return [4 /*yield*/, promises_1.default.readFile(inputPdfPath)];
                case 1:
                    pdfBytes = _c.sent();
                    return [4 /*yield*/, pdf_lib_1.PDFDocument.load(pdfBytes)];
                case 2:
                    pdfDoc = _c.sent();
                    form = pdfDoc.getForm();
                    // ✅ Set employer fields correctly
                    form.getTextField("topmostSubform[0].Page1[0].f1_14[0]").setText(startDate); // First Date of Employment
                    form.getTextField("topmostSubform[0].Page1[0].f1_15[0]").setText(ein); // EIN
                    form
                        .getTextField("topmostSubform[0].Page1[0].f1_13[0]")
                        .setText(companyAddress); // Employer Name & Address
                    return [4 /*yield*/, pdfDoc.save()];
                case 3:
                    modifiedPdf = _c.sent();
                    return [2 /*return*/, buffer_1.Buffer.from(modifiedPdf).toString("base64")]; // return as base64 for emailing or preview
            }
        });
    });
}
function sendTestEmail() {
    return __awaiter(this, void 0, void 0, function () {
        var applicant, today, startDate, base64, pdfBuffer, html, resend, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    applicant = {
                        fullName: "Ellani Walker",
                        email: "rvsanchez255@@gmail.com",
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
                    today = new Date();
                    startDate = today.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });
                    return [4 /*yield*/, fillW4EmployerFields({
                            startDate: startDate,
                            ein: "3425647577",
                            companyAddress: "Invitation Home Rentals\n7155 Old Katy Rd Ste N210, Houston,\nTX 77024",
                        })];
                case 1:
                    base64 = _a.sent();
                    pdfBuffer = buffer_1.Buffer.from(base64, "base64");
                    html = "\n    <div style=\"font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9fafb; border-radius: 8px;\">\n      <div style=\"text-align: center; margin-bottom: 24px;\">\n        <img src=\"https://isfj6shkii.ufs.sh/f/7lSE5lws1RB32V6uVzUalG6TwSy1CK0hYIjPdvJgz8tRqixO\" alt=\"Invitation Home Rentals Logo\" style=\"max-width: 180px;\" />\n      </div>\n      <div style=\"background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\">\n        <h2 style=\"color: #111827; font-size: 24px; font-weight: 600; margin-bottom: 16px;\">Welcome to Invitation Home Rentals!</h2>\n        <p style=\"color: #374151; font-size: 16px; line-height: 1.5;\">Dear ".concat(applicant.fullName, ",</p>\n        <p style=\"color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 16px;\">\n          Your official start date is <strong>").concat(startDate, "</strong>.\n        </p>\n        <p style=\"color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 16px;\">\n          We\u2019re thrilled to welcome you to the Invitation Home Rentals family! Thank you for submitting your application.\n        </p>\n        <p style=\"color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 16px;\">\n          Attached is your completed IRS Form W-4. Please review and submit it within <strong>7 days</strong> to ensure a smooth onboarding process.\n        </p>\n        <p style=\"color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 24px;\">\n          Have questions? Feel free to reply to this email or contact us at <a href=\"mailto:support@InvitationHomerealty.com\" style=\"color: #3b82f6; text-decoration: none;\">support@InvitationHomerealty.com</a>.\n        </p>\n        <div style=\"text-align: center; margin-top: 32px;\">\n          <a href=\"https://InvitationHomerealty.com\" style=\"display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 16px; font-weight: 500; padding: 12px 24px; border-radius: 6px; text-decoration: none;\">Visit InvitationHomeRealty.com</a>\n        </div>\n      </div>\n      <div style=\"text-align: center; margin-top: 24px; color: #6b7280; font-size: 14px;\">\n        <p>Warm regards,<br><strong>The Invitation Home Rentals Team</strong></p>\n        <p><a href=\"https://InvitationHomerealty.com\" style=\"color: #6b7280; text-decoration: none;\">www.InvitationHomerealty.com</a></p>\n      </div>\n    </div>\n  ");
                    resend = new resend_1.Resend(process.env.RESEND_API_KEY || "re_ZJmwoKa2_K5MSQg6RGo9iBWf18jC5DMXg");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, resend.emails.send({
                            to: applicant.email,
                            from: "hello@InvitationHomerealty.com",
                            subject: "\u2705 Welcome to Invitation Home Rentals, ".concat(applicant.fullName, "!"),
                            html: html,
                            attachments: [
                                {
                                    filename: "W4-".concat(applicant.fullName, ".pdf"),
                                    content: pdfBuffer.toString("base64"),
                                },
                            ],
                        })];
                case 3:
                    _a.sent();
                    console.log("Email sent to ".concat(applicant.fullName, " (").concat(applicant.email, ")"));
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("Error sending email:", err_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Run the test
sendTestEmail();
