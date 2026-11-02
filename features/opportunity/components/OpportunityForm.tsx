"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  opportunityFormSchema,
  OpportunityFormData,
} from "../schemas/opportunitySchema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles, Building2, MapPin, DollarSign, BookOpen, Layers } from "lucide-react";

interface OpportunityFormProps {
  initialData?: Partial<OpportunityFormData>;
  onSubmit: (data: OpportunityFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  isEdit?: boolean;
}

function TagInput({
  label,
  placeholder,
  tags,
  onChange,
  error,
  helperText,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  error?: string;
  helperText?: string;
}) {
  const [inputVal, setInputVal] = React.useState("");

  const addTag = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputVal("");
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputVal);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => addTag(inputVal)}
          className="h-10 px-3"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="text-indigo-400 hover:text-indigo-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}

export function OpportunityForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Save Opportunity",
  isEdit = false,
}: OpportunityFormProps) {
  const defaultValues: Partial<OpportunityFormData> = {
    title: initialData?.title || "",
    companyName: initialData?.companyName || "",
    companyLogo: initialData?.companyLogo || "",
    description: initialData?.description || "",
    category: initialData?.category || "internship",
    employmentType: initialData?.employmentType || "internship",
    industry: initialData?.industry || "Software & Technology",
    requiredSkills: initialData?.requiredSkills || [],
    preferredSkills: initialData?.preferredSkills || [],
    minimumExperience: initialData?.minimumExperience || "Fresher / 0 years",
    eligibilityCriteria:
      initialData?.eligibilityCriteria ||
      "Open to enrolled students and recent graduates in CS/IT or related fields",
    educationRequirements:
      initialData?.educationRequirements ||
      "Bachelor's or Master's degree in progress",
    minimumCGPA: initialData?.minimumCGPA ?? undefined,
    workMode: initialData?.workMode || "remote",
    location: initialData?.location || "Remote",
    eligibleRegions: initialData?.eligibleRegions || ["All Regions"],
    stipend: initialData?.stipend || "",
    salaryRange: initialData?.salaryRange || "",
    currency: initialData?.currency || "USD",
    isPaid: initialData?.isPaid ?? true,
    duration: initialData?.duration || "3 - 6 Months",
    applicationDeadline: initialData?.applicationDeadline
      ? new Date(initialData.applicationDeadline).toISOString().slice(0, 10)
      : "",
    externalApplicationUrl: initialData?.externalApplicationUrl || "",
    applicationInstructions:
      initialData?.applicationInstructions ||
      "Submit application through portal or send resume to hiring team.",
    benefits: initialData?.benefits || ["Certificate of Completion", "Mentorship"],
    status: initialData?.status || "draft",
    verificationNotes: initialData?.verificationNotes || "",
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunityFormSchema) as any,
    defaultValues: defaultValues as OpportunityFormData,
  });

  const selectedCategory = watch("category");
  const isPaidWatch = watch("isPaid");

  const onFormSubmit = async (data: OpportunityFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* 1. Basic Opportunity Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            <CardTitle>Basic Information</CardTitle>
          </div>
          <p className="text-xs text-slate-500">
            Define the role title, host company or institution, and general sector.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Opportunity Title *"
              placeholder="e.g. Frontend Engineering Intern"
              error={errors.title?.message}
              {...register("title")}
            />
            <Input
              label="Company / Organization Name *"
              placeholder="e.g. Acme Tech Innovations"
              error={errors.companyName?.message}
              {...register("companyName")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Category *"
              error={errors.category?.message}
              {...register("category")}
            >
              <option value="internship">Internship</option>
              <option value="job">Full-Time Job</option>
              <option value="skill-development">Skill Development</option>
            </Select>

            <Select
              label="Employment Type *"
              error={errors.employmentType?.message}
              {...register("employmentType")}
            >
              <option value="internship">Internship</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="training">Training / Bootcamp</option>
            </Select>

            <Input
              label="Industry / Domain *"
              placeholder="e.g. Fintech, Healthcare, AI/ML"
              error={errors.industry?.message}
              {...register("industry")}
            />
          </div>

          <Input
            label="Company Logo URL (optional)"
            placeholder="https://example.com/logo.png"
            error={errors.companyLogo?.message}
            {...register("companyLogo")}
          />

          <Textarea
            label="Detailed Role Description *"
            rows={5}
            placeholder="Describe the opportunity, core responsibilities, team structure, and learning outcomes..."
            error={errors.description?.message}
            {...register("description")}
          />
        </CardContent>
      </Card>

      {/* 2. Skills & Eligibility */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <CardTitle>Skills & Eligibility</CardTitle>
          </div>
          <p className="text-xs text-slate-500">
            Define requirements consistently for transparent matching and skill gap insights.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="requiredSkills"
            control={control}
            render={({ field }) => (
              <TagInput
                label="Required Skills * (Press Enter to add)"
                placeholder="e.g. React, TypeScript, Python"
                tags={field.value || []}
                onChange={field.onChange}
                error={errors.requiredSkills?.message}
                helperText="Required skills are directly matched against student profile competencies."
              />
            )}
          />

          <Controller
            name="preferredSkills"
            control={control}
            render={({ field }) => (
              <TagInput
                label="Preferred Skills (Optional)"
                placeholder="e.g. Docker, GraphQL, Tailwind CSS"
                tags={field.value || []}
                onChange={field.onChange}
                error={errors.preferredSkills?.message}
                helperText="Bonus skills that provide candidates an edge."
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Minimum Experience *"
              placeholder="e.g. Fresher / 0-1 Year"
              error={errors.minimumExperience?.message}
              {...register("minimumExperience")}
            />
            <Input
              label="Education Requirements *"
              placeholder="e.g. B.Tech / B.E. / BCA / MCA"
              error={errors.educationRequirements?.message}
              {...register("educationRequirements")}
            />
            <Input
              label="Minimum CGPA (Optional)"
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g. 7.0"
              error={errors.minimumCGPA?.message}
              {...register("minimumCGPA")}
            />
          </div>

          <Textarea
            label="Eligibility Criteria *"
            rows={3}
            placeholder="Explicit eligibility guidelines, eligible batches (e.g. 2025/2026 pass-outs), or prerequisite coursework..."
            error={errors.eligibilityCriteria?.message}
            {...register("eligibilityCriteria")}
          />
        </CardContent>
      </Card>

      {/* 3. Location & Work Arrangement */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-600" />
            <CardTitle>Work Mode & Geography</CardTitle>
          </div>
          <p className="text-xs text-slate-500">
            Work arrangements allow students with geographic constraints to discover accessible roles.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Work Mode *"
              error={errors.workMode?.message}
              {...register("workMode")}
            >
              <option value="remote">Remote (Anywhere)</option>
              <option value="onsite">On-Site</option>
              <option value="hybrid">Hybrid</option>
            </Select>

            <Input
              label="Location / Office Hub *"
              placeholder="e.g. Bengaluru, India or Global"
              error={errors.location?.message}
              {...register("location")}
            />
          </div>

          <Controller
            name="eligibleRegions"
            control={control}
            render={({ field }) => (
              <TagInput
                label="Eligible Regions"
                placeholder="e.g. India, Tier-2/3 Colleges, APAC"
                tags={field.value || []}
                onChange={field.onChange}
                helperText="Geographic or college tier tags targeted for fairness and outreach."
              />
            )}
          />
        </CardContent>
      </Card>

      {/* 4. Compensation & Benefits */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <CardTitle>Compensation & Benefits</CardTitle>
          </div>
          <p className="text-xs text-slate-500">
            Transparent pay terms ensure fair compensation for students.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 pb-2">
            <input
              type="checkbox"
              id="isPaid"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register("isPaid")}
            />
            <label htmlFor="isPaid" className="text-sm font-medium text-slate-700 cursor-pointer">
              This is a paid opportunity (provides stipend or salary)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedCategory === "internship" ? (
              <Input
                label="Monthly Stipend"
                placeholder="e.g. $1,200/month or ₹25,000/month"
                error={errors.stipend?.message}
                {...register("stipend")}
              />
            ) : (
              <Input
                label="Annual Salary Range"
                placeholder="e.g. $60,000 - $80,000 / yr"
                error={errors.salaryRange?.message}
                {...register("salaryRange")}
              />
            )}

            <Input
              label="Currency"
              placeholder="USD, INR, EUR"
              error={errors.currency?.message}
              {...register("currency")}
            />

            <Input
              label="Duration"
              placeholder="e.g. 6 Months / Permanent"
              error={errors.duration?.message}
              {...register("duration")}
            />
          </div>

          <Controller
            name="benefits"
            control={control}
            render={({ field }) => (
              <TagInput
                label="Perks & Benefits (Press Enter to add)"
                placeholder="e.g. Certificate, Mentorship, Flexible Hours, PPO Offer"
                tags={field.value || []}
                onChange={field.onChange}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* 5. Application Pipeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <CardTitle>Application Pipeline & Verification</CardTitle>
          </div>
          <p className="text-xs text-slate-500">
            Define how students submit applications and set publication status.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Application Deadline"
              type="date"
              error={errors.applicationDeadline?.message}
              {...register("applicationDeadline")}
            />
            <Input
              label="External Application Link (Optional)"
              placeholder="https://company.careers/apply/123"
              error={errors.externalApplicationUrl?.message}
              helperText="If omitted, students will be instructed to follow the application text below."
              {...register("externalApplicationUrl")}
            />
          </div>

          <Textarea
            label="Application Instructions *"
            rows={3}
            placeholder="Instructions for students on what documents to prepare and how the selection process works..."
            error={errors.applicationInstructions?.message}
            {...register("applicationInstructions")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Select
              label="Listing Status"
              error={errors.status?.message}
              {...register("status")}
            >
              <option value="draft">Draft (Saved privately)</option>
              <option value="pending">Pending Verification (Queued for admin audit)</option>
              {isEdit && (
                <>
                  <option value="published">Published (Publicly visible)</option>
                  <option value="rejected">Rejected (Needs fixes)</option>
                  <option value="expired">Expired (Closed)</option>
                </>
              )}
            </Select>

            <Input
              label="Admin / Verification Notes (Internal)"
              placeholder="Notes on company legitimacy, college outreach or sponsor..."
              error={errors.verificationNotes?.message}
              {...register("verificationNotes")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setValue("status", "draft");
          }}
          disabled={isSubmitting}
        >
          Mark as Draft
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
