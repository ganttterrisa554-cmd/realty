/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitLease } from "@/app/actions/application";

/* -------------------- SCHEMA -------------------- */

const formSchema = z
  .object({
    moveInDate: z
      .string()
      .min(1, "Move-in date is required")
      .refine((date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      }, "Move-in date must be today or in the future"),
    applicationType: z.enum(["personal", "corporate"], {
      error: "Application type is required",
    }),

    title: z.enum(["Mr", "Mrs", "Ms", "Dr"], {
      error: "Title is required",
    }),
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "First name can only contain letters, spaces, hyphens, and apostrophes"
      ),
    hasMiddleName: z.boolean().default(true),
    middleName: z.string().optional(),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "Last name can only contain letters, spaces, hyphens, and apostrophes"
      ),

    gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
      error: "Gender is required",
    }),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((date) => {
        const dob = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        return age >= 18 && age <= 120;
      }, "You must be at least 18 years old"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .toLowerCase(),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format")
      .refine((phone) => {
        const digits = phone.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      }, "Phone number must be 10-15 digits"),
    preferredContact: z.enum(["email", "phone"], {
      error: "Preferred contact method is required",
    }),
    maritalStatus: z.enum(
      ["single", "married", "divorced", "widowed", "separated"],
      {
        error: "Marital status is required",
      }
    ),

    currentAddress: z.string().min(5, "Current address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z
      .string()
      .regex(
        /^\d{5}(-\d{4})?$/,
        "Invalid ZIP code format (e.g., 12345 or 12345-6789)"
      ),

    employmentStatus: z.enum(
      ["employed", "self_employed", "unemployed", "retired", "student"],
      {
        error: "Employment status is required",
      }
    ),
    employer: z.string().min(1, "Employer name is required"),
    jobTitle: z.string().min(1, "Job title is required"),
    yearsEmployed: z
      .string()
      .min(1, "Years employed is required")
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 70;
      }, "Please enter a valid number between 0 and 70"),

    grossMonthlyIncome: z
      .string()
      .min(1, "Gross monthly income is required")
      .refine((val) => {
        const num = parseFloat(val.replace(/[$,]/g, ""));
        return !isNaN(num) && num >= 0;
      }, "Please enter a valid amount"),
    grossAnnualSalary: z
      .string()
      .min(1, "Gross annual salary is required")
      .refine((val) => {
        const num = parseFloat(val.replace(/[$,]/g, ""));
        return !isNaN(num) && num >= 0;
      }, "Please enter a valid amount"),

    adultsMovingIn: z
      .string()
      .min(1, "Number of adults is required")
      .refine((val) => {
        const num = parseInt(val);
        return !isNaN(num) && num >= 1 && num <= 20;
      }, "Please enter a number between 1 and 20"),
    childrenMovingIn: z
      .string()
      .min(1, "Number of children is required")
      .refine((val) => {
        const num = parseInt(val);
        return !isNaN(num) && num >= 0 && num <= 20;
      }, "Please enter a number between 0 and 20"),

    hasAnimals: z.enum(["yes", "no"], {
      error: "Please specify if you have animals",
    }),
    animalDetails: z.string().optional(),

    hasBackground: z.enum(["yes", "no"], {
      error: "Please answer this question",
    }),
    backgroundDetails: z.string().optional(),

    emergencyContactName: z
      .string()
      .min(2, "Emergency contact name is required"),
    emergencyContactPhone: z
      .string()
      .min(1, "Emergency contact phone is required")
      .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format"),
    emergencyContactRelationship: z.string().min(2, "Relationship is required"),

    paymentMethod: z.enum(["zelle", "chime", "apple_pay", "cashapp"], {
      error: "Payment method is required",
    }),
  })
  .refine((data) => !data.hasMiddleName || !!data.middleName, {
    path: ["middleName"],
    message: "Middle name is required",
  })
  .refine((data) => data.hasAnimals === "no" || !!data.animalDetails, {
    path: ["animalDetails"],
    message: "Please provide details about your animals",
  })
  .refine((data) => data.hasBackground === "no" || !!data.backgroundDetails, {
    path: ["backgroundDetails"],
    message: "Please provide details about your background",
  });

type FormValues = z.input<typeof formSchema>;

/* -------------------- COMPONENT -------------------- */

export default function LeaseApplicationForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasMiddleName: true,
      childrenMovingIn: "0",
    },
  });

  const hasMiddleName = watch("hasMiddleName");
  const hasAnimals = watch("hasAnimals");
  const hasBackground = watch("hasBackground");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const ref = searchParams.get("ref");
      const payload = { ...data, ref };

      const result = await submitLease(payload);
      if (result.success) {
        toast.success("Application submitted successfully!");
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    } catch (error) {
      console.log({ error });
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (!numbers) return "";
    const num = parseInt(numbers);
    return num.toLocaleString("en-US");
  };

  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "grossMonthlyIncome" | "grossAnnualSalary"
  ) => {
    const formatted = formatCurrency(e.target.value);
    setValue(field, formatted);
  };

  return (
    <div className="min-h-screen h bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Invitation Homes
          </h1>
          <h2 className="text-2xl font-semibold text-slate-700">
            Lease Application Form
          </h2>
          <p className="text-slate-600 mt-2">
            Please complete all required fields below
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Lease Details */}
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Lease Details</FieldLegend>

              <Field>
                <FieldLabel>Preferred Move-in Date *</FieldLabel>
                <Input type="date" {...register("moveInDate")} />
                {errors.moveInDate && (
                  <FieldDescription className="text-red-600">
                    {errors.moveInDate.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel>Application Type *</FieldLabel>
                <Select
                  onValueChange={(v) => setValue("applicationType", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select application type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
                {errors.applicationType && (
                  <FieldDescription className="text-red-600">
                    {errors.applicationType.message}
                  </FieldDescription>
                )}
              </Field>
            </FieldSet>
          </FieldGroup>

          {/* Personal Information */}
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Personal Information</FieldLegend>

              <Field>
                <FieldLabel>Title *</FieldLabel>
                <Select onValueChange={(v) => setValue("title", v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
                {errors.title && (
                  <FieldDescription className="text-red-600">
                    {errors.title.message}
                  </FieldDescription>
                )}
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>First Name *</FieldLabel>
                  <Input {...register("firstName")} placeholder="John" />
                  {errors.firstName && (
                    <FieldDescription className="text-red-600">
                      {errors.firstName.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Last Name *</FieldLabel>
                  <Input {...register("lastName")} placeholder="Doe" />
                  {errors.lastName && (
                    <FieldDescription className="text-red-600">
                      {errors.lastName.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel>Middle Name {hasMiddleName && "*"}</FieldLabel>
                <Input
                  {...register("middleName")}
                  disabled={!hasMiddleName}
                  placeholder={hasMiddleName ? "Middle name" : "N/A"}
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="noMiddleName"
                    className="rounded"
                    checked={!hasMiddleName}
                    onChange={(e) => {
                      setValue("hasMiddleName", !e.target.checked);
                      if (e.target.checked) setValue("middleName", "");
                    }}
                  />
                  <label
                    htmlFor="noMiddleName"
                    className="text-sm text-slate-700"
                  >
                    I do not have a middle name
                  </label>
                </div>
                {errors.middleName && (
                  <FieldDescription className="text-red-600">
                    {errors.middleName.message}
                  </FieldDescription>
                )}
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Gender *</FieldLabel>
                  <Select onValueChange={(v) => setValue("gender", v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <FieldDescription className="text-red-600">
                      {errors.gender.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Date of Birth *</FieldLabel>
                  <Input type="date" {...register("dateOfBirth")} />
                  {errors.dateOfBirth && (
                    <FieldDescription className="text-red-600">
                      {errors.dateOfBirth.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Email Address *</FieldLabel>
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <FieldDescription className="text-red-600">
                      {errors.email.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Phone Number *</FieldLabel>
                  <Input
                    type="tel"
                    {...register("phone")}
                    placeholder="(123) 456-7890"
                  />
                  {errors.phone && (
                    <FieldDescription className="text-red-600">
                      {errors.phone.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel>Preferred Method of Contact *</FieldLabel>
                <Select
                  onValueChange={(v) => setValue("preferredContact", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
                {errors.preferredContact && (
                  <FieldDescription className="text-red-600">
                    {errors.preferredContact.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel>Marital Status *</FieldLabel>
                <Select
                  onValueChange={(v) => setValue("maritalStatus", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                    <SelectItem value="separated">Separated</SelectItem>
                  </SelectContent>
                </Select>
                {errors.maritalStatus && (
                  <FieldDescription className="text-red-600">
                    {errors.maritalStatus.message}
                  </FieldDescription>
                )}
              </Field>
            </FieldSet>
          </FieldGroup>

          {/* Current Address */}
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Current Address</FieldLegend>

              <Field>
                <FieldLabel>Street Address *</FieldLabel>
                <Input
                  {...register("currentAddress")}
                  placeholder="123 Main Street, Apt 4B"
                />
                {errors.currentAddress && (
                  <FieldDescription className="text-red-600">
                    {errors.currentAddress.message}
                  </FieldDescription>
                )}
              </Field>

              <div className="grid md:grid-cols-3 gap-4">
                <Field>
                  <FieldLabel>City *</FieldLabel>
                  <Input {...register("city")} placeholder="New York" />
                  {errors.city && (
                    <FieldDescription className="text-red-600">
                      {errors.city.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel>State *</FieldLabel>
                  <Input {...register("state")} placeholder="NY" />
                  {errors.state && (
                    <FieldDescription className="text-red-600">
                      {errors.state.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel>ZIP Code *</FieldLabel>
                  <Input {...register("zipCode")} placeholder="10001" />
                  {errors.zipCode && (
                    <FieldDescription className="text-red-600">
                      {errors.zipCode.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>
            </FieldSet>
          </FieldGroup>

          {/* Employment Information */}
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Employment Information</FieldLegend>

              <Field>
                <FieldLabel>Employment Status *</FieldLabel>
                <Select
                  onValueChange={(v) => setValue("employmentStatus", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self_employed">Self-Employed</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employmentStatus && (
                  <FieldDescription className="text-red-600">
                    {errors.employmentStatus.message}
                  </FieldDescription>
                )}
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Employer Name *</FieldLabel>
                  <Input {...register("employer")} placeholder="Company Name" />
                  {errors.employer && (
                    <FieldDescription className="text-red-600">
                      {errors.employer.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Job Title *</FieldLabel>
                  <Input
                    {...register("jobTitle")}
                    placeholder="Software Engineer"
                  />
                  {errors.jobTitle && (
                    <FieldDescription className="text-red-600">
                      {errors.jobTitle.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel>Years Employed *</FieldLabel>
                <Input
                  type="number"
                  step="0.5"
                  {...register("yearsEmployed")}
                  placeholder="2.5"
                />
                {errors.yearsEmployed && (
                  <FieldDescription className="text-red-600">
                    {errors.yearsEmployed.message}
                  </FieldDescription>
                )}
              </Field>
            </FieldSet>
          </FieldGroup>

          {/* Income */}
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Income Information</FieldLegend>

              <Field>
                <FieldLabel>Gross Monthly Income *</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                    $
                  </span>
                  <Input
                    {...register("grossMonthlyIncome")}
                    onChange={(e) =>
                      handleCurrencyChange(e, "grossMonthlyIncome")
                    }
                    placeholder="5,000"
                    className="pl-7"
                  />
                </div>
                {errors.grossMonthlyIncome && (
                  <FieldDescription className="text-red-600">
                    {errors.grossMonthlyIncome.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel>Gross Annual Salary *</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                    $
                  </span>
                  <Input
                    {...register("grossAnnualSalary")}
                    onChange={(e) =>
                      handleCurrencyChange(e, "grossAnnualSalary")
                    }
                    placeholder="60,000"
                    className="pl-7"
                  />
                </div>
                {errors.grossAnnualSalary && (
                  <FieldDescription className="text-red-600">
                    {errors.grossAnnualSalary.message}
                  </FieldDescription>
                )}
              </Field>
            </FieldSet>
          </FieldGroup>

          {/* Occupancy */}
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Occupancy Information</FieldLegend>

              <div className="grid md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Adults Moving In (18+) *</FieldLabel>
                  <Input
                    type="number"
                    min="1"
                    {...register("adultsMovingIn")}
                    placeholder="2"
                  />
                  {errors.adultsMovingIn && (
                    <FieldDescription className="text-red-600">
                      {errors.adultsMovingIn.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Children Moving In (Under 18) *</FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    {...register("childrenMovingIn")}
                    placeholder="0"
                  />
                  {errors.childrenMovingIn && (
                    <FieldDescription className="text-red-600">
                      {errors.childrenMovingIn.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>
            </FieldSet>
          </FieldGroup>

          {/* Animals & Background */}
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Additional Questions</FieldLegend>

              <Field>
                <FieldLabel>Do you have any pets or animals? *</FieldLabel>
                <Select onValueChange={(v) => setValue("hasAnimals", v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.hasAnimals && (
                  <FieldDescription className="text-red-600">
                    {errors.hasAnimals.message}
                  </FieldDescription>
                )}
              </Field>

              {hasAnimals === "yes" && (
                <Field>
                  <FieldLabel>Pet/Animal Details *</FieldLabel>
                  <Input
                    {...register("animalDetails")}
                    placeholder="e.g., 1 dog (Golden Retriever, 3 years old)"
                  />
                  <FieldDescription>
                    Please specify type, breed, size, and age
                  </FieldDescription>
                  {errors.animalDetails && (
                    <FieldDescription className="text-red-600">
                      {errors.animalDetails.message}
                    </FieldDescription>
                  )}
                </Field>
              )}

              <Field>
                <FieldLabel>
                  Any felonies, evictions, bankruptcies, or pending charges? *
                </FieldLabel>
                <Select
                  onValueChange={(v) => setValue("hasBackground", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.hasBackground && (
                  <FieldDescription className="text-red-600">
                    {errors.hasBackground.message}
                  </FieldDescription>
                )}
              </Field>

              {hasBackground === "yes" && (
                <Field>
                  <FieldLabel>Background Details *</FieldLabel>
                  <Input
                    {...register("backgroundDetails")}
                    placeholder="Please provide details"
                  />
                  {errors.backgroundDetails && (
                    <FieldDescription className="text-red-600">
                      {errors.backgroundDetails.message}
                    </FieldDescription>
                  )}
                </Field>
              )}
            </FieldSet>
          </FieldGroup>

          {/* Emergency Contact */}
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Emergency Contact</FieldLegend>

              <Field>
                <FieldLabel>Emergency Contact Name *</FieldLabel>
                <Input
                  {...register("emergencyContactName")}
                  placeholder="Jane Smith"
                />
                {errors.emergencyContactName && (
                  <FieldDescription className="text-red-600">
                    {errors.emergencyContactName.message}
                  </FieldDescription>
                )}
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Emergency Contact Phone *</FieldLabel>
                  <Input
                    type="tel"
                    {...register("emergencyContactPhone")}
                    placeholder="(123) 456-7890"
                  />
                  {errors.emergencyContactPhone && (
                    <FieldDescription className="text-red-600">
                      {errors.emergencyContactPhone.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Relationship *</FieldLabel>
                  <Input
                    {...register("emergencyContactRelationship")}
                    placeholder="Mother, Friend, etc."
                  />
                  {errors.emergencyContactRelationship && (
                    <FieldDescription className="text-red-600">
                      {errors.emergencyContactRelationship.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>
            </FieldSet>
          </FieldGroup>

          {/* Payment */}
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Application Fee Payment Method</FieldLegend>

              <Field>
                <FieldLabel>Select Payment Method *</FieldLabel>
                <Select
                  onValueChange={(v) => setValue("paymentMethod", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zelle">Zelle</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="apple_pay">Apple Pay</SelectItem>
                    <SelectItem value="cashapp">Cash App</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <FieldDescription className="text-red-600">
                    {errors.paymentMethod.message}
                  </FieldDescription>
                )}
              </Field>
            </FieldSet>
          </FieldGroup>

          <div className="pt-6 border-t">
            <Button
              disabled={isSubmitting}
              type="submit"
              className="w-full h-12 text-lg font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  Submitting Application...
                </span>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
